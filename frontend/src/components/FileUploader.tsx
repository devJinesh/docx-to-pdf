import React, { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isUploading }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const isDocx = (f: File) => /\.docx?$/i.test(f.name);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles(prev => [...prev, ...Array.from(list).filter(isDocx)]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const remove = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (files.length) {
      onFilesSelected(files);
      setFiles([]);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-800'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-primary-500" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Drop your DOCX files here
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
        <input
          type="file"
          multiple
          accept=".docx,.doc"
          onChange={e => addFiles(e.target.files)}
          className="hidden"
          id="file-input"
          disabled={isUploading}
        />
        <label
          htmlFor="file-input"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={submit}
              disabled={isUploading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? 'Uploading...' : 'Convert to PDF'}
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => remove(i)}
                  disabled={isUploading}
                  className="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
