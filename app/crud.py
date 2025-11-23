from sqlalchemy.orm import Session
import uuid
from typing import List
from app import models


def create_job(db: Session, filenames: List[str]) -> models.Job:
    job = models.Job(status=models.JobStatus.PENDING)
    db.add(job)
    db.commit()
    db.refresh(job)

    for name in filenames:
        file = models.File(
            job_id=job.id,
            original_filename=name,
            status=models.FileStatus.PENDING
        )
        db.add(file)
    
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: uuid.UUID) -> models.Job:
    return db.query(models.Job).filter(models.Job.id == job_id).first()


def update_file_status(db: Session, job_id: uuid.UUID, filename: str, status: models.FileStatus, error: str = None):
    file = db.query(models.File).filter(
        models.File.job_id == job_id,
        models.File.original_filename == filename
    ).first()

    if file:
        file.status = status
        if error:
            file.error_message = error
        db.commit()


def update_job_status(db: Session, job_id: uuid.UUID):
    job = get_job(db, job_id)
    if not job:
        return

    if any(f.status in [models.FileStatus.PENDING, models.FileStatus.PROCESSING] for f in job.files):
        job.status = models.JobStatus.IN_PROGRESS
    elif any(f.status == models.FileStatus.COMPLETED for f in job.files):
        job.status = models.JobStatus.COMPLETED
    else:
        job.status = models.JobStatus.FAILED
    
    db.commit()