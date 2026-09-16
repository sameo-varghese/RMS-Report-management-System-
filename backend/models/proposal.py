from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

CATEGORY_TYPES = [
    "Workshop", "Seminar", "Guest Lecture", "FDP", 
    "Industrial Visit", "Cultural", "Technical Competition", "Other"
]

class ProposalCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    category: str
    proposed_date: str # YYYY-MM-DD
    venue: str
    expected_participants: Optional[int] = 0
    resource_person: Optional[str] = None

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    proposed_date: Optional[str] = None
    venue: Optional[str] = None
    expected_participants: Optional[int] = None
    resource_person: Optional[str] = None

class ProposalAdminAction(BaseModel):
    admin_remarks: Optional[str] = None

class ProposalResponse(BaseModel):
    id: str
    faculty_id: str
    faculty_name: Optional[str] = None
    title: str
    description: str
    category: str
    proposed_date: str
    venue: str
    expected_participants: Optional[int] = 0
    resource_person: Optional[str] = None
    status: str = Field(default="Pending", description="'Pending' | 'Approved' | 'Rejected'")
    admin_remarks: Optional[str] = None
    created_at: datetime
