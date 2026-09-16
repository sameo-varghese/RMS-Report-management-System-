from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from models.media import MediaResponse
from core.database import get_database
from core.deps import get_current_user
from services.cloudinary_service import upload_media_to_cloudinary, delete_media_from_cloudinary

router = APIRouter(prefix="/media", tags=["Media Documentation"])

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024 # 100 MB

@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    activity_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    activities_col = db.get_collection("activities")
    
    act_query = {"_id": ObjectId(activity_id)} if ObjectId.is_valid(activity_id) else {"_id": activity_id}
    activity = await activities_col.find_one(act_query)
    if not activity:
        raise HTTPException(status_code=404, detail="Target activity not found")

    content_type = file.content_type or ""
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if "image" in content_type:
        media_type = "image"
        if file_size > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 10 MB")
    elif "video" in content_type:
        media_type = "video"
        if file_size > MAX_VIDEO_SIZE:
            raise HTTPException(status_code=400, detail="Video size exceeds maximum limit of 100 MB")
    else:
        raise HTTPException(status_code=400, detail="Unsupported media format. Only JPG, PNG, WEBP images and MP4 videos allowed.")

    # Cloudinary upload
    cloud_result = await upload_media_to_cloudinary(file_bytes, file.filename, content_type)
    
    doc = {
        "activity_id": str(activity["_id"]),
        "media_type": media_type,
        "cloudinary_url": cloud_result["secure_url"],
        "cloudinary_public_id": cloud_result["public_id"],
        "uploaded_at": datetime.now(timezone.utc)
    }
    
    media_col = db.get_collection("media")
    res = await media_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    return MediaResponse(
        id=str(doc["_id"]),
        activity_id=doc["activity_id"],
        media_type=doc["media_type"],
        cloudinary_url=doc["cloudinary_url"],
        cloudinary_public_id=doc["cloudinary_public_id"],
        uploaded_at=doc["uploaded_at"]
    )

@router.get("/activity/{activity_id}", response_model=List[MediaResponse])
async def list_activity_media(activity_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    media_col = db.get_collection("media")
    
    cursor = media_col.find({"activity_id": activity_id})
    items = await cursor.to_list(100)
    
    return [
        MediaResponse(
            id=str(m["_id"]),
            activity_id=str(m["activity_id"]),
            media_type=m.get("media_type", "image"),
            cloudinary_url=m.get("cloudinary_url", ""),
            cloudinary_public_id=m.get("cloudinary_public_id", ""),
            uploaded_at=m.get("uploaded_at", datetime.now(timezone.utc))
        )
        for m in items
    ]

@router.delete("/{id}")
async def delete_media(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    media_col = db.get_collection("media")
    
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    item = await media_col.find_one(query)
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")

    # Cloudinary deletion
    pub_id = item.get("cloudinary_public_id")
    m_type = item.get("media_type", "image")
    await delete_media_from_cloudinary(pub_id, m_type)

    await media_col.delete_one(query)
    return {"message": "Media deleted successfully from Cloudinary and database."}
