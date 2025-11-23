import os
import subprocess
import zipfile
from celery import Celery
from celery.schedules import crontab
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database import SessionLocal
from app import crud, models

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    task_default_queue='docx_conversion'
)

celery_app.conf.beat_schedule = {
    'cleanup-old-files': {
        'task': 'app.tasks.cleanup_old_files',
        'schedule': crontab(hour=2, minute=0),
    },
}
celery_app.conf.timezone = 'UTC'

UPLOAD_DIR = "/code/uploads"
DOWNLOAD_DIR = "/code/downloads"


@celery_app.task(name="app.tasks.convert_file", queue='docx_conversion')
def convert_file(job_id: str, filename: str):
    db: Session = SessionLocal()
    try:
        upload_dir = os.path.join(UPLOAD_DIR, job_id)
        download_dir = os.path.join(DOWNLOAD_DIR, job_id)
        os.makedirs(download_dir, exist_ok=True)

        input_path = os.path.join(upload_dir, filename)
        
        crud.update_file_status(db, job_id, filename, models.FileStatus.PROCESSING)
        crud.update_job_status(db, job_id)

        env = os.environ.copy()
        env.update({
            'HOME': '/tmp/libreoffice',
            'SAL_USE_VCLPLUGIN': 'svp',
            'UNO_PATH': '/usr/lib/libreoffice/program',
            'PATH': '/usr/lib/libreoffice/program:' + env.get('PATH', ''),
        })

        result = subprocess.run(
            [
                "soffice", "--headless", "--invisible", "--nocrashreport",
                "--nodefault", "--nofirststartwizard", "--nologo", "--norestore",
                "--convert-to", "pdf:writer_pdf_Export", "--outdir", download_dir, input_path
            ],
            check=True,
            capture_output=True,
            timeout=300,
            env=env,
            cwd='/tmp'
        )

        pdf_name = os.path.splitext(filename)[0] + ".pdf"
        pdf_path = os.path.join(download_dir, pdf_name)
        
        if not os.path.exists(pdf_path):
            raise RuntimeError(f"PDF not created: {os.listdir(download_dir)}")

        crud.update_file_status(db, job_id, filename, models.FileStatus.COMPLETED)
        crud.update_file_status(db, job_id, filename, models.FileStatus.COMPLETED)

    except Exception as e:
        crud.update_file_status(db, job_id, filename, models.FileStatus.FAILED, error=str(e))
    finally:
        job = crud.get_job(db, job_id)
        if all(f.status in [models.FileStatus.COMPLETED, models.FileStatus.FAILED] for f in job.files):
            crud.update_job_status(db, job_id)
            if crud.get_job(db, job_id).status == models.JobStatus.COMPLETED:
                create_zip.delay(job_id)
        db.close()


@celery_app.task(name="app.tasks.create_zip", queue='docx_conversion')
def create_zip(job_id: str):
    download_dir = os.path.join(DOWNLOAD_DIR, job_id)
    zip_path = os.path.join(DOWNLOAD_DIR, f"{job_id}.zip")

    with zipfile.ZipFile(zip_path, 'w') as zf:
        for root, _, files in os.walk(download_dir):
            for file in files:
                if file.endswith(".pdf"):
                    zf.write(os.path.join(root, file), arcname=file)

    return zip_path


@celery_app.task(name="app.tasks.cleanup_old_files", queue='docx_conversion')
def cleanup_old_files():
    from app.cleanup import cleanup_old_files as cleanup
    try:
        count = cleanup()
        return {"status": "success", "deleted": count}
    except Exception as e:
        return {"status": "failed", "error": str(e)}