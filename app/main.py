import os
import uuid
import shutil
from typing import List

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app import crud, models, schemas, tasks
from app.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DOCX to PDF Conversion Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

UPLOAD_DIRECTORY = "/code/uploads"
DOWNLOAD_DIRECTORY = "/code/downloads"

@app.post("/api/v1/jobs", response_model=schemas.JobCreateResponse, status_code=202)
async def submit_conversion_job(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    filenames = [f.filename for f in files]
    job = crud.create_job(db, filenames=filenames)
    job_id_str = str(job.id)

    job_upload_dir = os.path.join(UPLOAD_DIRECTORY, job_id_str)
    os.makedirs(job_upload_dir, exist_ok=True)

    for upload_file in files:
        file_location = os.path.join(job_upload_dir, upload_file.filename)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(upload_file.file, file_object)

        tasks.convert_file.delay(job_id_str, upload_file.filename)

    return {"job_id": job.id, "file_count": len(files)}


@app.get("/api/v1/jobs/{job_id}", response_model=schemas.JobStatusResponse)
def get_job_status(
    job_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response_data = schemas.JobStatusResponse.from_orm(job)

    if response_data.status == models.JobStatus.COMPLETED:
        response_data.download_url = str(request.url_for('download_results', job_id=str(job_id)))

    response_data.files = [schemas.FileStatusDetail.from_orm(f) for f in job.files]

    return response_data


@app.get("/api/v1/jobs/{job_id}/download", response_class=FileResponse, name="download_results")
def download_results(job_id: uuid.UUID, db: Session = Depends(get_db)):
    job = crud.get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != models.JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job is not yet complete.")

    zip_filename = f"{str(job_id)}.zip"
    zip_filepath = os.path.join(DOWNLOAD_DIRECTORY, zip_filename)

    if not os.path.exists(zip_filepath):
        raise HTTPException(status_code=404, detail="Result archive not found.")

    return FileResponse(
        path=zip_filepath,
        filename=f"conversion_results_{job_id}.zip",
        media_type='application/zip'
    )