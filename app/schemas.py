import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

from .models import JobStatus, FileStatus


class FileBase(BaseModel):
    original_filename: str

class FileStatusDetail(BaseModel):
    original_filename: str
    status: FileStatus
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class JobCreateResponse(BaseModel):
    job_id: uuid.UUID
    file_count: int

class JobStatusResponse(BaseModel):
    id: uuid.UUID
    status: JobStatus
    created_at: datetime
    download_url: Optional[str] = Field(None, description="Present only when status is COMPLETED")
    files: List[FileStatusDetail]

    class Config:
        from_attributes = True