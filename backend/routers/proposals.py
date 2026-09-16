from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from models.proposal import ProposalCreate, ProposalUpdate, ProposalAdminAction, ProposalResponse
from core.database import get_database
from core.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/proposals", tags=["Proposals"])

def parse_proposal_doc(p: dict, faculty_name: str = "Faculty") -> ProposalResponse:
    return ProposalResponse(
        id=str(p["_id"]),
        faculty_id=str(p.get("faculty_id")),
        faculty_name=p.get("faculty_name", faculty_name),
        title=p.get("title", ""),
        description=p.get("description", ""),
        category=p.get("category", "Other"),
        proposed_date=str(p.get("proposed_date", "")),
        venue=p.get("venue", ""),
        expected_participants=p.get("expected_participants", 0),
        resource_person=p.get("resource_person"),
        status=p.get("status", "Pending"),
        admin_remarks=p.get("admin_remarks"),
        created_at=p.get("created_at", datetime.now(timezone.utc))
    )

@router.post("", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(proposal_data: ProposalCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    doc = {
        "faculty_id": str(current_user["_id"]),
        "faculty_name": current_user.get("name", "Faculty Member"),
        "title": proposal_data.title,
        "description": proposal_data.description,
        "category": proposal_data.category,
        "proposed_date": proposal_data.proposed_date,
        "venue": proposal_data.venue,
        "expected_participants": proposal_data.expected_participants,
        "resource_person": proposal_data.resource_person,
        "status": "Pending",
        "admin_remarks": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    res = await proposals_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return parse_proposal_doc(doc, current_user.get("name"))

@router.get("", response_model=List[ProposalResponse])
async def list_proposals(current_user: dict = Depends(get_current_user)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    # Business rule: Faculty sees own proposals, Admin sees all proposals
    if current_user.get("role") == "admin":
        query = {}
    else:
        query = {"faculty_id": str(current_user["_id"])}
        
    cursor = proposals_col.find(query).sort("created_at", -1)
    items = await cursor.to_list(200)
    return [parse_proposal_doc(p) for p in items]

@router.get("/{id}", response_model=ProposalResponse)
async def get_proposal(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    prop = await proposals_col.find_one(query)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    if current_user.get("role") != "admin" and str(prop.get("faculty_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this proposal")
        
    return parse_proposal_doc(prop)

@router.put("/{id}/approve", response_model=ProposalResponse)
async def approve_proposal(id: str, action: Optional[ProposalAdminAction] = None, admin: dict = Depends(get_current_admin)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    remarks = action.admin_remarks if action else "Approved by Admin"
    
    res = await proposals_col.update_one(query, {"$set": {"status": "Approved", "admin_remarks": remarks}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    prop = await proposals_col.find_one(query)
    return parse_proposal_doc(prop)

@router.put("/{id}/reject", response_model=ProposalResponse)
async def reject_proposal(id: str, action: ProposalAdminAction, admin: dict = Depends(get_current_admin)):
    if not action.admin_remarks or len(action.admin_remarks.strip()) == 0:
        raise HTTPException(status_code=400, detail="Remarks are required when rejecting a proposal")
        
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    res = await proposals_col.update_one(query, {"$set": {"status": "Rejected", "admin_remarks": action.admin_remarks}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    prop = await proposals_col.find_one(query)
    return parse_proposal_doc(prop)

@router.delete("/{id}")
async def delete_proposal(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    proposals_col = db.get_collection("proposals")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    prop = await proposals_col.find_one(query)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    # Faculty can only delete their own PENDING proposals
    if current_user.get("role") != "admin":
        if str(prop.get("faculty_id")) != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Cannot delete another faculty's proposal")
        if prop.get("status") != "Pending":
            raise HTTPException(status_code=400, detail="Only pending proposals can be deleted")
            
    await proposals_col.delete_one(query)
    return {"message": "Proposal deleted successfully"}
