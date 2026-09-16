from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from models.report import ActivityReportGenerateRequest, AnnualReportGenerateRequest, ReportResponse
from core.database import get_database
from core.deps import get_current_user, get_current_admin
from services.gemini_service import generate_activity_report_narrative, generate_annual_report_narrative
from services.pdf_service import generate_pdf_and_upload
from services.cloudinary_service import delete_media_from_cloudinary

router = APIRouter(prefix="/reports", tags=["AI PDF Reports"])

def parse_report_doc(r: dict) -> ReportResponse:
    return ReportResponse(
        id=str(r["_id"]),
        report_type=r.get("report_type", "activity"),
        activity_id=str(r.get("activity_id")) if r.get("activity_id") else None,
        generated_by=str(r.get("generated_by", "")),
        generated_by_name=r.get("generated_by_name", "Faculty Member"),
        ai_narrative=r.get("ai_narrative", ""),
        pdf_url=r.get("pdf_url", ""),
        cloudinary_public_id=r.get("cloudinary_public_id"),
        year=r.get("year"),
        generated_at=r.get("generated_at", datetime.now(timezone.utc))
    )

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_activity_report(req: ActivityReportGenerateRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    activities_col = db.get_collection("activities")
    reports_col = db.get_collection("reports")
    media_col = db.get_collection("media")

    act_query = {"_id": ObjectId(req.activity_id)} if ObjectId.is_valid(req.activity_id) else {"_id": req.activity_id}
    activity = await activities_col.find_one(act_query)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity record not found")

    act_id_str = str(activity["_id"])

    # Rule #5: On report regeneration, delete old PDF from Cloudinary first
    existing_report = await reports_col.find_one({"activity_id": act_id_str})
    if existing_report:
        old_pub_id = existing_report.get("cloudinary_public_id")
        if old_pub_id:
            await delete_media_from_cloudinary(old_pub_id, "raw")
        await reports_col.delete_one({"_id": existing_report["_id"]})

    # Fetch media for PDF layout
    media_items = await media_col.find({"activity_id": act_id_str}).to_list(20)
    media_urls = [m.get("cloudinary_url") for m in media_items if m.get("cloudinary_url")]

    # 1. Generate structured narrative with Gemini 1.5 Flash
    narrative = await generate_activity_report_narrative(activity, media_items)

    # 2. Build PDF metadata & compile HTML template to PDF
    meta = {
        "Activity Title": activity.get("title"),
        "Category": activity.get("category"),
        "Date of Event": activity.get("activity_date"),
        "Venue": activity.get("venue"),
        "Resource Person": activity.get("resource_person", "N/A"),
        "Participants": str(activity.get("participants_count", 0)),
        "Faculty Coordinator": current_user.get("name", "Faculty Coordinator")
    }

    pdf_res = await generate_pdf_and_upload(
        title=activity.get("title", "Activity Report"),
        subtitle=f"ACTIVITY REPORT — {activity.get('category', 'EVENT').upper()}",
        metadata=meta,
        ai_narrative_markdown=narrative,
        media_urls=media_urls
    )

    doc = {
        "report_type": "activity",
        "activity_id": act_id_str,
        "generated_by": str(current_user["_id"]),
        "generated_by_name": current_user.get("name", "Faculty Member"),
        "ai_narrative": narrative,
        "pdf_url": pdf_res["secure_url"],
        "cloudinary_public_id": pdf_res["public_id"],
        "year": None,
        "generated_at": datetime.now(timezone.utc)
    }

    res = await reports_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return parse_report_doc(doc)


@router.post("/annual", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_annual_report(req: AnnualReportGenerateRequest, admin: dict = Depends(get_current_admin)):
    """Rule #10: Check if activities exist for selected year before calling Gemini — return error if none found."""
    db = get_database()
    activities_col = db.get_collection("activities")
    reports_col = db.get_collection("reports")

    # Find activities in year
    year_str = str(req.year)
    cursor = activities_col.find({
        "activity_date": {"$regex": f"^{year_str}"}
    })
    activities = await cursor.to_list(500)

    if not activities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No activities recorded for the academic year {req.year}. Cannot generate annual report."
        )

    # 1. Generate summary narrative
    narrative = await generate_annual_report_narrative(req.year, activities)

    # 2. Compile to PDF
    meta = {
        "Academic Year": str(req.year),
        "Total Activities Completed": str(len(activities)),
        "Generated By": f"{admin.get('name')} (HOD / Admin)",
        "Generated Date": datetime.now().strftime("%d %B %Y")
    }

    pdf_res = await generate_pdf_and_upload(
        title=f"Annual Report {req.year}",
        subtitle=f"ANNUAL DEPARTMENTAL SUMMARY REPORT — {req.year}",
        metadata=meta,
        ai_narrative_markdown=narrative
    )

    doc = {
        "report_type": "annual",
        "activity_id": None,
        "generated_by": str(admin["_id"]),
        "generated_by_name": admin.get("name", "Department Admin"),
        "ai_narrative": narrative,
        "pdf_url": pdf_res["secure_url"],
        "cloudinary_public_id": pdf_res["public_id"],
        "year": req.year,
        "generated_at": datetime.now(timezone.utc)
    }

    res = await reports_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return parse_report_doc(doc)


@router.get("/{identifier}", response_model=ReportResponse)
async def get_report_by_id_or_activity(identifier: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    reports_col = db.get_collection("reports")

    # 1. First try matching by report _id (e.g. from ReportView page / annual reports)
    query = {"_id": ObjectId(identifier)} if ObjectId.is_valid(identifier) else {"_id": identifier}
    report = await reports_col.find_one(query)

    # 2. If not found by report _id, fallback to searching by activity_id
    if not report:
        report = await reports_col.find_one({"activity_id": identifier})

    if not report:
        raise HTTPException(status_code=404, detail="Report document not found.")
        
    return parse_report_doc(report)



@router.delete("/{id}")
async def delete_report(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    reports_col = db.get_collection("reports")

    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    report = await reports_col.find_one(query)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pub_id = report.get("cloudinary_public_id")
    if pub_id:
        await delete_media_from_cloudinary(pub_id, "raw")

    await reports_col.delete_one(query)
    return {"message": "Report deleted successfully from Cloudinary and database."}
