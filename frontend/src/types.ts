export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface FileStatusDetail {
  original_filename: string;
  status: FileStatus;
  error_message?: string;
}

export interface JobCreateResponse {
  job_id: string;
  file_count: number;
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  created_at: string;
  download_url?: string;
  files: FileStatusDetail[];
}

export interface Job {
  id: string;
  status: JobStatus;
  created_at: string;
  file_count: number;
  files: FileStatusDetail[];
  download_url?: string;
}
