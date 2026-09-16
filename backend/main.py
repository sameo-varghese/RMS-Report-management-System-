import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from core.config import settings
from core.database import connect_to_mongo, close_mongo_connection, get_database
from core.auth import get_password_hash

# Include Routers — UCC RMS API Services
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.proposals import router as proposals_router
from routers.activities import router as activities_router
from routers.media import router as media_router
from routers.reports import router as reports_router

logger = logging.getLogger("uvicorn.error")

async def seed_initial_demo_data():
    """Seeds initial Admin & Faculty accounts plus a sample proposal/activity for demo testing."""
    db = get_database()
    users_col = db.get_collection("users")
    
    # Seed Admin User if not existing
    admin = await users_col.find_one({"email": "admin@ucc.edu.in"})
    if not admin:
        admin_doc = {
            "name": "Dr. Binu Thomas (HOD)",
            "email": "admin@ucc.edu.in",
            "password_hash": get_password_hash("admin123"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        res = await users_col.insert_one(admin_doc)
        admin_id = str(res.inserted_id)
        logger.info("Created initial Admin user: admin@ucc.edu.in / admin123")
    else:
        admin_id = str(admin["_id"])

    # Seed Faculty User if not existing
    faculty = await users_col.find_one({"email": "faculty@ucc.edu.in"})
    if not faculty:
        faculty_doc = {
            "name": "Prof. Anitha Mary",
            "email": "faculty@ucc.edu.in",
            "password_hash": get_password_hash("faculty123"),
            "role": "faculty",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        res = await users_col.insert_one(faculty_doc)
        faculty_id = str(res.inserted_id)
        logger.info("Created initial Faculty user: faculty@ucc.edu.in / faculty123")
    else:
        faculty_id = str(faculty["_id"])

    # Seed sample proposal and activity if empty
    proposals_col = db.get_collection("proposals")
    activities_col = db.get_collection("activities")
    
    prop_count = await proposals_col.count_documents({})
    if prop_count == 0:
        sample_prop = {
            "faculty_id": faculty_id,
            "faculty_name": "Prof. Anitha Mary",
            "title": "National Workshop on Generative AI & LLM Architecture",
            "description": "A comprehensive hands-on national workshop focusing on modern Transformer architectures, prompt engineering, and deploying AI models.",
            "category": "Workshop",
            "proposed_date": "2026-08-15",
            "venue": "UCC Computer Applications Seminar Hall",
            "expected_participants": 120,
            "resource_person": "Dr. Sreejith V, Principal Scientist at AI Research Labs",
            "status": "Approved",
            "admin_remarks": "Approved by HOD. Excellent initiative.",
            "created_at": datetime.now(timezone.utc)
        }
        res_p = await proposals_col.insert_one(sample_prop)
        prop_id = str(res_p.inserted_id)

        sample_act = {
            "proposal_id": prop_id,
            "faculty_id": faculty_id,
            "faculty_name": "Prof. Anitha Mary",
            "title": "National Workshop on Generative AI & LLM Architecture",
            "description": "The School of Computer Applications conducted a 2-day hands-on workshop covering PyTorch, Hugging Face transformers, and Retrieval Augmented Generation (RAG). Students built autonomous web agents and PDF Q&A bots.",
            "category": "Workshop",
            "activity_date": "2026-08-15",
            "venue": "UCC Computer Applications Seminar Hall",
            "participants_count": 115,
            "resource_person": "Dr. Sreejith V, Principal Scientist at AI Research Labs",
            "outcomes": "115 MCA students successfully deployed custom RAG pipelines and gained practical AI development skills.",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await activities_col.insert_one(sample_act)
        logger.info("Seeded initial approved proposal and activity record.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await seed_initial_demo_data()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Union Christian College, Aluva — School of Computer Applications RMS",
    lifespan=lifespan
)

# CORS Configuration — allow localhost and any local network IP (192.168.x.x)
import re

class LocalNetworkCORSMiddleware(CORSMiddleware):
    pass

LOCAL_ORIGIN_PATTERN = re.compile(
    r"^http://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$"
)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
from core.database import connect_to_mongo, close_mongo_connection, get_database, check_mongo_status
from services.cloudinary_service import check_cloudinary_status
from services.gemini_service import check_gemini_status

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(proposals_router)
app.include_router(activities_router)
app.include_router(media_router)
app.include_router(reports_router)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "institution": "School of Computer Applications, Union Christian College, Aluva (Autonomous)",
        "status": "Online",
        "docs": "/docs",
        "status_endpoint": "/system/status"
    }

@app.get("/system/status")
@app.get("/health")
async def system_status():
    mongo_stat = await check_mongo_status()
    cloud_stat = check_cloudinary_status()
    gemini_stat = check_gemini_status()
    
    return {
        "system": settings.PROJECT_NAME,
        "environment": "Production / Development",
        "services": {
            "mongodb": mongo_stat,
            "cloudinary": cloud_stat,
            "gemini": gemini_stat
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

