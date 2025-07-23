import os
import subprocess
import zipfile
from celery import Celery
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import SessionLocal
from app import crud, models

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

UPLOAD_DIRECTORY = "/code/uploads"
DOWNLOAD_DIRECTORY = "/code/downloads"


@celery_app.task(name="app.tasks.convert_file")
def convert_file(job_id: str, filename: str):
    db: Session = SessionLocal()
    try:
        job_upload_dir = os.path.join(UPLOAD_DIRECTORY, job_id)
        job_download_dir = os.path.join(DOWNLOAD_DIRECTORY, job_id)
        os.makedirs(job_download_dir, exist_ok=True)

        input_path = os.path.join(job_upload_dir, filename)
        
        crud.update_file_status(db, job_id, filename, models.FileStatus.PROCESSING)
        crud.check_and_update_job_status(db, job_id)

        print(f"Starting conversion for {filename} in job {job_id}")

        command = [
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", job_download_dir,
            input_path
        ]
        
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)

        pdf_filename, _ = os.path.splitext(filename)
        pdf_filename += ".pdf"
        
        if not os.path.exists(os.path.join(job_download_dir, pdf_filename)):
             raise RuntimeError("PDF file not created by LibreOffice.")

        crud.update_file_status(db, job_id, filename, models.FileStatus.COMPLETED)

    except Exception as e:
        error_msg = f"Conversion failed. Details: {str(e)}"
        crud.update_file_status(db, job_id, filename, models.FileStatus.FAILED, error_message=error_msg)
        print(f"Failed to convert {filename}: {error_msg}")
    
    finally:
        job = crud.get_job(db, job_id)
        is_job_finished = all(f.status in [models.FileStatus.COMPLETED, models.FileStatus.FAILED] for f in job.files)
        
        if is_job_finished:
            crud.check_and_update_job_status(db, job_id)
            final_job_status = crud.get_job(db, job_id).status
            if final_job_status == models.JobStatus.COMPLETED:
                create_zip_archive.delay(job_id)
        db.close()


@celery_app.task(name="app.tasks.create_zip_archive")
def create_zip_archive(job_id: str):
    job_download_dir = os.path.join(DOWNLOAD_DIRECTORY, job_id)
    zip_filename = f"{job_id}.zip"
    zip_filepath = os.path.join(DOWNLOAD_DIRECTORY, zip_filename)

    print(f"Creating zip archive for job {job_id} at {zip_filepath}")

    with zipfile.ZipFile(zip_filepath, 'w') as zipf:
        for root, _, files in os.walk(job_download_dir):
            for file in files:
                if file.endswith(".pdf"):
                    zipf.write(os.path.join(root, file), arcname=file)

    print(f"Zip archive for job {job_id} created successfully.")
    return zip_filepath