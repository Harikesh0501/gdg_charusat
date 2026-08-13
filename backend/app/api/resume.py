import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.services.resume import ResumeService
from app.schemas.resume import ResumeUploadResponse, ResumeResponse, ResumeLatestResponse

router = APIRouter(prefix="/resume", tags=["Resume Processing"])


@router.post("/upload", response_model=ResumeUploadResponse, summary="Upload Resume (In-Memory Processing)")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    file_bytes = await file.read()
    filename = file.filename or "resume.pdf"

    try:
        service.validate_file(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": "INVALID_FILE", "message": str(e)})

    # Create initial resume DB record with status=uploaded
    resume = service.create_initial_resume(current_user.profile_id, filename)

    # Schedule background processing task (in-memory parse + Groq AI extraction + fuzzy taxonomy match)
    background_tasks.add_task(
        service.process_resume_in_background,
        resume_id=resume.id,
        profile_id=current_user.profile_id,
        file_bytes=file_bytes,
        filename=filename,
    )

    return ResumeUploadResponse(
        message="Resume uploaded successfully. Processing started in background.",
        resume_id=resume.id,
        status=resume.status,
    )


@router.get("/latest", response_model=ResumeLatestResponse, summary="Get Current Active Resume Status")
def get_latest_resume(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    resume = service.repo.get_latest_resume(current_user.profile_id)

    if not resume:
        return ResumeLatestResponse(resume=None, extraction=None)

    extraction_data = None
    if resume.extractions:
        extraction = resume.extractions[-1]
        extraction_data = extraction.extracted_json

    return ResumeLatestResponse(
        resume=ResumeResponse.model_validate(resume),
        extraction=extraction_data,
    )


@router.get("/{resume_id}/status", response_model=ResumeResponse, summary="Poll Resume Processing Status")
def get_resume_status(
    resume_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    resume = service.repo.get_by_id(resume_id)

    if not resume or resume.profile_id != current_user.profile_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": "NOT_FOUND", "message": "Resume not found"})

    return resume
