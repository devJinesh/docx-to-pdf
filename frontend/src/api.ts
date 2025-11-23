import axios from 'axios';
import { JobCreateResponse, JobStatusResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const submitConversionJob = async (files: File[]): Promise<JobCreateResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<JobCreateResponse>('/jobs', formData);
  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await api.get<JobStatusResponse>(`/jobs/${jobId}`);
  return response.data;
};

export const downloadResults = (jobId: string): string => {
  return `${API_BASE_URL}/jobs/${jobId}/download`;
};
