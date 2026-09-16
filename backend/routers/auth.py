from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from models.user import UserLogin, TokenResponse, UserResponse
from core.database import get_database
from core.auth import verify_password, create_access_token
from core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    db = get_database()
    users_col = db.get_collection("users")
    
    user = await users_col.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact HOD / Admin."
        )

    # 24 hour access token
    access_token = create_access_token(data={"sub": str(user.get("email")), "role": user.get("role")})
    
    user_response = UserResponse(
        id=str(user["_id"]),
        name=user.get("name", "Faculty User"),
        email=user.get("email"),
        role=user.get("role", "faculty"),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at", datetime.now(timezone.utc))
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user.get("name", ""),
        email=current_user.get("email", ""),
        role=current_user.get("role", "faculty"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at", datetime.now(timezone.utc))
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out"}
