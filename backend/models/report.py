from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ActivityReportGenerateRequest(BaseModel):
    activity_id: str

class AnnualReportGenerateRequest(BaseModel):
    year: int

class ReportResponse(BaseModel):
    id: str
    report_type: str = Field(..., description="'activity' | 'annual'")
    activity_id: Optional[str] = None
    generated_by: str
    generated_by_name: Optional[str] = None
    ai_narrative: str
    pdf_url: str
    cloudinary_public_id: Optional[str] = None
    year: Optional[int] = None
    generated_at: datetime
