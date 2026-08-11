import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, CurrentUser
from app.models.resume import Resume, ResumeStatus
from app.schemas.resume import (
    ResumeUploadResponse,
    ResumeStatusResponse,
    StudentSkillResponse,
    StudentSkillUpdateRequest,
)
from app.services.resume import ResumeService, process_resume_background

router = APIRouter(prefix="", tags=["Resumes & Skills"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit


@router.post("/resumes/upload", response_model=ResumeUploadResponse, summary="Upload PDF Resume")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ["application/pdf", "application/x-pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_FILE_TYPE", "message": "Only PDF files are supported for resume extraction"},
        )

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "FILE_TOO_LARGE", "message": "File size exceeds maximum limit of 5MB"},
        )

    if len(pdf_bytes) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "FILE_CORRUPTED", "message": "Uploaded file is empty or corrupted"},
        )

    # Deactivate prior active resumes
    db.query(Resume).filter(
        Resume.profile_id == current_user.profile_id,
        Resume.is_active == True,
    ).update({"is_active": False})
    db.commit()

    resume_id = uuid.uuid4()
    resume = Resume(
        id=resume_id,
        profile_id=current_user.profile_id,
        file_name=file.filename or "resume.pdf",
        file_url=f"resumes/{current_user.profile_id}/{resume_id}.pdf",
        status=ResumeStatus.PROCESSING,
        is_active=True,
    )
    db.add(resume)
    db.commit()

    # Trigger background task for AI structured extraction & skill normalization
    background_tasks.add_task(
        process_resume_background,
        resume_id=resume_id,
        profile_id=current_user.profile_id,
        pdf_bytes=pdf_bytes,
        db=db,
    )

    return ResumeUploadResponse(
        resume_id=resume_id,
        file_name=resume.file_name,
        status=ResumeStatus.PROCESSING,
        message="Resume uploaded successfully. Extraction task started in background.",
    )


@router.get("/resumes/status", response_model=ResumeStatusResponse | None, summary="Get Active Resume Status")
def get_resume_status(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    resume = service.get_active_resume(current_user.profile_id)
    if not resume:
        return None
    return ResumeStatusResponse(
        resume_id=resume.id,
        status=resume.status,
        file_name=resume.file_name,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


@router.get("/profile/skills", response_model=list[StudentSkillResponse], summary="Get Normalized Student Skills")
def get_student_skills(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    return service.get_student_skills(current_user.profile_id)


@router.put("/profile/skills", response_model=StudentSkillResponse, summary="Add or Update Self-Reported Skill")
def update_student_skill(
    skill_update: StudentSkillUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ResumeService(db)
    return service.update_student_skill(
        profile_id=current_user.profile_id,
        skill_id=skill_update.skill_id,
        proficiency=skill_update.proficiency,
    )
