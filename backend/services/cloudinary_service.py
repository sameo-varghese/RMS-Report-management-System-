import io
import logging
import base64
import uuid
import cloudinary
import cloudinary.uploader
from core.config import settings

logger = logging.getLogger("uvicorn.error")

def configure_cloudinary():
    """Ensure Cloudinary is configured with latest settings."""
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET and "your_" not in settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        return True
    return False

def check_cloudinary_status() -> dict:
    """Returns Cloudinary credentials and readiness status."""
    is_configured = configure_cloudinary()
    if is_configured:
        return {
            "status": "configured",
            "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
            "api_key_configured": bool(settings.CLOUDINARY_API_KEY),
            "message": f"Cloudinary configured for cloud '{settings.CLOUDINARY_CLOUD_NAME}'."
        }
    return {
        "status": "mock",
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME or "Not Configured",
        "api_key_configured": False,
        "message": "Cloudinary credentials missing or placeholders (falling back to mock media URLs)."
    }

async def upload_media_to_cloudinary(file_bytes: bytes, filename: str, content_type: str) -> dict:
    """Uploads an image/video, PDF, or HTML document to Cloudinary."""
    c_type = (content_type or "").lower()
    if "video" in c_type:
        resource_type = "video"
    elif "image" in c_type:
        resource_type = "image"
    else:
        resource_type = "raw"
    
    if configure_cloudinary():
        try:
            result = cloudinary.uploader.upload(
                io.BytesIO(file_bytes),
                folder="ucc_rms_archive",
                resource_type=resource_type
            )
            return {
                "secure_url": result.get("secure_url"),
                "public_id": result.get("public_id")
            }
        except Exception as e:
            logger.error(f"Cloudinary upload error: {e}. Falling back to mock URL generator.")
            
    # Mock fallback url for offline development / test demo mode
    unique_id = f"ucc_media_{uuid.uuid4().hex[:10]}"
    if "image" in c_type:
        mock_url = f"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"
    elif "video" in c_type:
        mock_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    else:
        mock_url = f"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        
    return {
        "secure_url": mock_url,
        "public_id": unique_id
    }


async def delete_media_from_cloudinary(public_id: str, media_type: str = "image") -> bool:
    """Deletes media from Cloudinary given its public_id."""
    if not public_id:
        return True
        
    if configure_cloudinary():
        try:
            resource_type = "video" if media_type == "video" else ("raw" if media_type == "raw" else "image")
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            return result.get("result") in ["ok", "not_found"]
        except Exception as e:
            logger.error(f"Cloudinary delete error: {e}")
            return False
    return True

