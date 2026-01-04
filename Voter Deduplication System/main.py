from fastapi import FastAPI, UploadFile, File, Form
from db.database import SessionLocal, engine
from db.models import VoterApplication, Voter, ManualReview, Base
import preprocessing.normalization as norm
from services.dedup_service import run_deduplication
import os

# Create tables if they don't exist
# Base.metadata.drop_all(bind=engine) # Schema fix done
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Ensure uploads directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

@app.post("/register-voter")
async def register_voter(
    name: str = Form(...),
    father_name: str = Form(...),
    dob: str = Form(...),
    mobile: str = Form(...),
    address: str = Form(...),
    photo: UploadFile = File(...)
):
    db = SessionLocal()

    photo_path = f"uploads/{photo.filename}"
    with open(photo_path, "wb") as f:
        f.write(await photo.read())

    application = VoterApplication(
        name_raw=name,
        father_name_raw=father_name,
        dob=norm.normalize_dob(dob),
        mobile=mobile,
        address_raw=address,
        name_norm=norm.normalize_name(name),
        father_norm=norm.normalize_name(father_name),
        mobile_norm=norm.normalize_mobile(mobile),
        address_norm=norm.normalize_address(address),
        photo_path=photo_path
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    decision, score = run_deduplication(application, db)

    if decision == "NOT_DUPLICATE":
        voter = Voter(
            name_raw=application.name_raw,
            father_name_raw=application.father_name_raw,
            dob=application.dob,
            mobile=application.mobile,
            address_raw=application.address_raw,
            name_norm=application.name_norm,
            father_norm=application.father_norm,
            mobile_norm=application.mobile_norm,
            address_norm=application.address_norm,
            photo_path=application.photo_path
        )
        db.add(voter)
        application.application_status = "APPROVED"

    elif decision == "MANUAL_REVIEW":
        db.add(ManualReview(
            application_id=application.application_id,
            reviewer_name=None,
            reviewer_decision=None,
            reviewer_notes=None,
            reviewed_at=None
        ))
        application.application_status = "MANUAL_REVIEW"

    else:
        application.application_status = "DUPLICATE"

    db.commit()

    return {
        "application_id": str(application.application_id),
        "decision": decision,
        "confidence": round(score, 2)
    }
