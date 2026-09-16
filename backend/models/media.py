from pydantic import BaseModel, Field
from datetime import datetime

class MediaResponse(BaseModel):
    id: str
    activity_id: str
    media_type: str = Field(..., description="'image' or 'video'")
    cloudinary_url: str
    cloudinary_public_id: str
    uploaded_at: datetime
