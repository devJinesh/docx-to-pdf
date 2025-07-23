from sqlalchemy.orm import Session
import uuid
from typing import List

from app import models, schemas


def create_job(db: Session, filenames: List[str]) -> models.Job:
    new_job = models.Job(status=models.JobStatus.PENDING)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    for name in filenames:
        file_record = models.File(
            job_id=new_job.id,
            original_filename=name,
            status=models.FileStatus.PENDING
        )
        db.add(file_record)
    
    db.commit()
    db.refresh(new_job)
    return new_job

def get_job(db: Session, job_id: uuid.UUID) -> models.Job:
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def update_file_status(db: Session, job_id: uuid.UUID, filename: str, status: models.FileStatus, error_message: str = None):
    file_to_update = db.query(models.File).filter(
        models.File.job_id == job_id,
        models.File.original_filename == filename
    ).first()

    if file_to_update:
        file_to_update.status = status
        if error_message:
            file_to_update.error_message = error_message
        db.commit()

def check_and_update_job_status(db: Session, job_id: uuid.UUID):
    job = get_job(db, job_id)
    if not job:
        return

    if any(file.status in [models.FileStatus.PENDING, models.FileStatus.PROCESSING] for file in job.files):
        job.status = models.JobStatus.IN_PROGRESS
    else:
        if any(file.status == models.FileStatus.COMPLETED for file in job.files):
            job.status = models.JobStatus.COMPLETED
        else:
            job.status = models.JobStatus.FAILED
    
    db.commit()