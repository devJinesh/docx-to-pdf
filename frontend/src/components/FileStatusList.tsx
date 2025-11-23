import React from 'react';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { FileStatus, FileStatusDetail } from '../types';

interface FileStatusListProps {
  files: FileStatusDetail[];
}

const FileStatusList: React.FC<FileStatusListProps> = ({ files }) => {
  const icons = {
    [FileStatus.COMPLETED]: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    [FileStatus.FAILED]: <XCircle className="w-5 h-5 text-red-500" />,
    [FileStatus.PROCESSING]: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
    [FileStatus.PENDING]: <Clock className="w-5 h-5 text-gray-400" />,
  };

  const colors = {
    [FileStatus.COMPLETED]: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
    [FileStatus.FAILED]: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
    [FileStatus.PROCESSING]: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
    [FileStatus.PENDING]: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600',
  };

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div key={index} className={`p-3 border rounded-lg transition-all ${colors[file.status] || colors[FileStatus.PENDING]}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              {icons[file.status]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{file.original_filename}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{file.status}</p>
                {file.error_message && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Error: {file.error_message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileStatusList;
