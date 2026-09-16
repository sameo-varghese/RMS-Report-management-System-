from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from models.user import UserCreate, UserResponse
from core.database import get_database
from core.auth import get_password_hash
from core.deps import get_current_admin

router = APIRouter(prefix="/users", tags=["Users (Admin Only)"])

@router.get("", response_model=List[UserResponse])
async def list_users(admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_col = db.get_collection("users")
    
    cursor = users_col.find({})
    users = await cursor.to_list(100)
    
    result = []
    for u in users:
        result.append(UserResponse(
            id=str(u["_id"]),
            name=u.get("name", ""),
            email=u.get("email", ""),
            role=u.get("role", "faculty"),
            is_active=u.get("is_active", True),
            created_at=u.get("created_at", datetime.now(timezone.utc))
        ))
    return result

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_col = db.get_collection("users")
    
    existing = await users_col.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
        
    doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role,
        "is_active": user_data.is_active,
        "created_at": datetime.now(timezone.utc)
    }
    
    res = await users_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return UserResponse(
        id=doc["id"],
        name=doc["name"],
        email=doc["email"],
        role=doc["role"],
        is_active=doc["is_active"],
        created_at=doc["created_at"]
    )

@router.put("/{user_id}/deactivate")
async def deactivate_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_col = db.get_collection("users")
    
    query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"id": user_id}
    res = await users_col.update_one(query, {"$set": {"is_active": False}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Faculty user deactivated successfully"}

@router.put("/{user_id}/activate")
async def activate_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_col = db.get_collection("users")
    
    query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"id": user_id}
    res = await users_col.update_one(query, {"$set": {"is_active": True}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Faculty user activated successfully"}
