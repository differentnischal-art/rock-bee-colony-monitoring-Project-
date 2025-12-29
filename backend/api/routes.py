from fastapi import APIRouter, UploadFile, File,Form
from ai.model import predict
from rules.guidance import get_guidance
from db.database import save_detection, get_all_detections

router = APIRouter()


@router.post("/predict")
async def predict_bee(
    user_role: str = Form(...),
    location_type: str = Form(...),
    latitude: float = Form(0.0), # Default to 0 if not provided
    longitude: float = Form(0.0),
    file: UploadFile = File(...)
):
    label, confidence, status = predict(file)
    
    # Save to database for tracking
    save_detection(label, confidence, latitude, longitude, user_role)

    is_rock_bee = True if confidence >= 0.7 else False

    risk = "High" if confidence >= 0.7 else "Low"

    guidance = get_guidance(user_role, risk, latitude, longitude)

    return {
        "prediction": label,
        "is_rock_bee": is_rock_bee,
        "confidence": confidence,
        "risk": risk,
        "guidance": guidance,
        "location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "context": {
            "user_role": user_role,
            "location_type": location_type
        }
    }

@router.get("/detections")
def list_detections():
    """
    Returns history of all bee detections with GPS location.
    """
    return get_all_detections()
@router.get("/guidance")
def fetch_guidance(
    user_role: str,
    risk: str
):
    """
    Returns Do & Don't guidance based on role and risk.
    Useful for dashboards, testing, and UI previews.
    """

    guidance = get_guidance(user_role, risk)

    return {
        "user_role": user_role,
        "risk": risk,
        "guidance": guidance
    }
