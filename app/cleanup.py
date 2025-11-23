import os
import shutil
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

UPLOAD_DIR = "/code/uploads"
DOWNLOAD_DIR = "/code/downloads"
CLEANUP_AGE_HOURS = 24


def cleanup_old_files():
    db: Session = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=CLEANUP_AGE_HOURS)
        
        old_jobs = db.query(models.Job).filter(
            models.Job.status.in_([models.JobStatus.COMPLETED, models.JobStatus.FAILED]),
            models.Job.created_at < cutoff
        ).all()
        
        for job in old_jobs:
            job_id = str(job.id)
            
            upload_dir = os.path.join(UPLOAD_DIR, job_id)
            if os.path.exists(upload_dir):
                shutil.rmtree(upload_dir)
            
            download_dir = os.path.join(DOWNLOAD_DIR, job_id)
            if os.path.exists(download_dir):
                shutil.rmtree(download_dir)
            
            zip_file = os.path.join(DOWNLOAD_DIR, f"{job_id}.zip")
            if os.path.exists(zip_file):
                os.remove(zip_file)
            
            db.delete(job)
        
        db.commit()
        return len(old_jobs)
        
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
