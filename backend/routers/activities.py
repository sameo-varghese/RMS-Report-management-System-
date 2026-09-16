from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from models.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from core.database import get_database
from core.deps import get_current_user
from services.cloudinary_service import delete_media_from_cloudinary

router = APIRouter(prefix="/activities", tags=["Activities"])

async def parse_activity_doc(db, act: dict) -> ActivityResponse:
    act_id = str(act["_id"])
    
    # Media count
    media_col = db.get_collection("media")
    media_count = await media_col.count_documents({"activity_id": act_id})
    
    # Check if report exists
    reports_col = db.get_collection("reports")
    report = await reports_col.find_one({"activity_id": act_id})
    has_report = bool(report)

    return ActivityResponse(
        id=act_id,
        proposal_id=str(act.get("proposal_id", "")),
        faculty_id=str(act.get("faculty_id", "")),
        faculty_name=act.get("faculty_name", "Faculty Member"),
        title=act.get("title", ""),
        description=act.get("description", ""),
        category=act.get("category", "Other"),
        activity_date=str(act.get("activity_date", "")),
        venue=act.get("venue", ""),
        participants_count=act.get("participants_count", 0),
        resource_person=act.get("resource_person"),
        outcomes=act.get("outcomes"),
        created_at=act.get("created_at", datetime.now(timezone.utc)),
        updated_at=act.get("updated_at", datetime.now(timezone.utc)),
        media_count=media_count,
        has_report=has_report
    )

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(activity_data: ActivityCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    # Rule #1: Proposal must be Approved before activity creation
    prop_query = {"_id": ObjectId(activity_data.proposal_id)} if ObjectId.is_valid(activity_data.proposal_id) else {"_id": activity_data.proposal_id}
    proposal = await proposals_col.find_one(prop_query)
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Linked proposal not found")
        
    if proposal.get("status") != "Approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create activity. Proposal status must be 'Approved'."
        )
        
    activities_col = db.get_collection("activities")
    now = datetime.now(timezone.utc)
    
    doc = {
        "proposal_id": str(proposal["_id"]),
        "faculty_id": str(current_user["_id"]),
        "faculty_name": current_user.get("name", "Faculty Member"),
        "title": activity_data.title,
        "description": activity_data.description,
        "category": activity_data.category,
        "activity_date": activity_data.activity_date,
        "venue": activity_data.venue,
        "participants_count": activity_data.participants_count,
        "resource_person": activity_data.resource_person,
        "outcomes": activity_data.outcomes,
        "created_at": now,
        "updated_at": now
    }
    
    res = await activities_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return await parse_activity_doc(db, doc)

@router.get("", response_model=List[ActivityResponse])
async def list_activities(
    search: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    cursor: Optional[str] = None, # Rule #9: Cursor-based pagination
    limit: int = Query(20, le=50),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    activities_col = db.get_collection("activities")
    
    query = {}
    
    # Rule #8: Keyword search using text index
    if search:
        query["$text"] = {"$search": search}
        
    if category and category != "All":
        query["category"] = category
        
    if start_date and end_date:
        query["activity_date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["activity_date"] = {"$gte": start_date}
    elif end_date:
        query["activity_date"] = {"$lte": end_date}
        
    if cursor and ObjectId.is_valid(cursor):
        query["_id"] = {"$lt": ObjectId(cursor)}

    cursor_obj = activities_col.find(query).sort("_id", -1).limit(limit)
    items = await cursor_obj.to_list(limit)
    
    results = []
    for item in items:
        results.append(await parse_activity_doc(db, item))
    return results

@router.get("/{id}", response_model=ActivityResponse)
async def get_activity(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    activities_col = db.get_collection("activities")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    act = await activities_col.find_one(query)
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    return await parse_activity_doc(db, act)

@router.put("/{id}", response_model=ActivityResponse)
async def update_activity(id: str, activity_data: ActivityUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    activities_col = db.get_collection("activities")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    act = await activities_col.find_one(query)
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    # Rule #2 & #3: Faculty can only edit own, Admin can edit any
    if current_user.get("role") != "admin" and str(act.get("faculty_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this activity")
        
    update_fields = {k: v for k, v in activity_data.model_dump().items() if v is not None}
    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    await activities_col.update_one(query, {"$set": update_fields})
    updated_act = await activities_col.find_one(query)
    return await parse_activity_doc(db, updated_act)

@router.delete("/{id}")
async def delete_activity(id: str, current_user: dict = Depends(get_current_user)):
    """Rule #4: Deleting an activity must cascade-delete all linked media from Cloudinary and MongoDB, and the linked report."""
    db = get_database()
    activities_col = db.get_collection("activities")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    act = await activities_col.find_one(query)
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    # Rule #2 & #3 permissions
    if current_user.get("role") != "admin" and str(act.get("faculty_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this activity")
        
    act_id = str(act["_id"])
    
    # 1. Cascade delete media from Cloudinary & DB
    media_col = db.get_collection("media")
    cursor = media_col.find({"activity_id": act_id})
    media_items = await cursor.to_list(500)
    for item in media_items:
        pub_id = item.get("cloudinary_public_id")
        m_type = item.get("media_type", "image")
        await delete_media_from_cloudinary(pub_id, m_type)
    await media_col.delete_many({"activity_id": act_id})

    # 2. Cascade delete report from Cloudinary & DB
    reports_col = db.get_collection("reports")
    report = await reports_col.find_one({"activity_id": act_id})
    if report:
        pub_id = report.get("cloudinary_public_id")
        await delete_media_from_cloudinary(pub_id, "raw")
        await reports_col.delete_one({"_id": report["_id"]})

    # 3. Delete activity document
    await activities_col.delete_one(query)
    
    return {"message": "Activity and linked media/reports deleted successfully."}
