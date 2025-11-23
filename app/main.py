import os
import uuid
import shutil
from typing import List

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import event, text
from fastapi.middleware.cors import CORSMiddleware

from app import crud, models, schemas, tasks
from app.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DOCX to PDF Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80", "http://127.0.0.1", "http://127.0.0.1:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/code/uploads"
DOWNLOAD_DIR = "/code/downloads"

@app.post("/api/v1/jobs", response_model=schemas.JobCreateResponse, status_code=202)
async def submit_job(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    job = crud.create_job(db, [f.filename for f in files])
    job_dir = os.path.join(UPLOAD_DIR, str(job.id))
    os.makedirs(job_dir, exist_ok=True)

    for file in files:
        path = os.path.join(job_dir, file.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        tasks.convert_file.delay(str(job.id), file.filename)

    return {"job_id": job.id, "file_count": len(files)}


@app.get("/api/v1/jobs/{job_id}", response_model=schemas.JobStatusResponse)
def get_job(job_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = schemas.JobStatusResponse.from_orm(job)
    if response.status == models.JobStatus.COMPLETED:
        response.download_url = str(request.url_for('download_job', job_id=str(job_id)))
    response.files = [schemas.FileStatusDetail.from_orm(f) for f in job.files]
    return response


@app.get("/api/v1/jobs/{job_id}/download", response_class=FileResponse, name="download_job")
def download_job(job_id: uuid.UUID, db: Session = Depends(get_db)):
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != models.JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not complete")

    zip_path = os.path.join(DOWNLOAD_DIR, f"{job_id}.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="Archive not found")

    return FileResponse(zip_path, filename=f"converted_{job_id}.zip", media_type="application/zip")