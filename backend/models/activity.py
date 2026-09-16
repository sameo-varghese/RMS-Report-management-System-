from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ActivityCreate(BaseModel):
    proposal_id: str
    title: str
    description: str
    category: str
    activity_date: str # YYYY-MM-DD
    venue: str
    participants_count: Optional[int] = 0
    resource_person: Optional[str] = None
    outcomes: Optional[str] = None

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    activity_date: Optional[str] = None
    venue: Optional[str] = None
    participants_count: Optional[int] = None
    resource_person: Optional[str] = None
    outcomes: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    proposal_id: str
    faculty_id: str
    faculty_name: Optional[str] = None
    title: str
    description: str
    category: str
    activity_date: str
    venue: str
    participants_count: Optional[int] = 0
    resource_person: Optional[str] = None
    outcomes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    media_count: Optional[int] = 0
    has_report: Optional[bool] = False
