import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Job, JobStatus } from '../types';
import { getJobStatus, downloadResults } from '../api';
import FileStatusList from './FileStatusList';

interface JobStatusCardProps {
  job: Job;
  onUpdate: (updatedJob: Job) => void;
}

const JobStatusCard: React.FC<JobStatusCardProps> = ({ job, onUpdate }) => {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) return;

    const poll = setInterval(async () => {
      setRefreshing(true);
      try {
        const data = await getJobStatus(job.id);
        onUpdate({ ...data, file_count: data.files.length });
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshing(false);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [job.id, job.status, onUpdate]);

  const icons = {
    [JobStatus.COMPLETED]: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    [JobStatus.FAILED]: <XCircle className="w-6 h-6 text-red-500" />,
    [JobStatus.IN_PROGRESS]: <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />,
    [JobStatus.PENDING]: <Clock className="w-6 h-6 text-gray-400" />,
  };

  const colors = {
    [JobStatus.COMPLETED]: 'border-green-500',
    [JobStatus.FAILED]: 'border-red-500',
    [JobStatus.IN_PROGRESS]: 'border-blue-500',
    [JobStatus.PENDING]: 'border-gray-400',
  };

  const progress = Math.round(job.files.filter(f => f.status === 'COMPLETED').length / job.file_count * 100);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${colors[job.status] || 'border-gray-300'} shadow-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icons[job.status]}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Job {job.id.slice(0, 8)}...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {job.file_count} {job.file_count === 1 ? 'file' : 'files'} � {job.status}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          {job.status === JobStatus.COMPLETED && (
            <button
              onClick={() => window.open(downloadResults(job.id), '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {job.status === JobStatus.IN_PROGRESS && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 dark:bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Files</h4>
        <FileStatusList files={job.files} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(job.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default JobStatusCard;
