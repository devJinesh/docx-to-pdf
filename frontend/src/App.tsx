import { useState, useEffect } from 'react';
import { FileText, Github, Moon, Sun } from 'lucide-react';
import FileUploader from './components/FileUploader';
import JobStatusCard from './components/JobStatusCard';
import Features from './components/Features';
import { submitConversionJob } from './api';
import { Job, JobStatus, FileStatus } from './types';
import './index.css';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(() => localStorage.darkMode === 'true');

  useEffect(() => {
    localStorage.darkMode = dark;
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const onSubmit = async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      const res = await submitConversionJob(files);
      setJobs(prev => [{
        id: res.job_id,
        status: JobStatus.PENDING,
        created_at: new Date().toISOString(),
        file_count: res.file_count,
        files: files.map(f => ({ original_filename: f.name, status: FileStatus.PENDING })),
      }, ...prev]);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onUpdate = (updated: Job) => {
    setJobs(prev => prev.map(job => job.id === updated.id ? updated : job));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  DOCX to PDF Converter
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Fast, secure, and reliable conversion
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              <a
                href="https://github.com/devJinesh/docx-to-pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <FileUploader onFilesSelected={onSubmit} isUploading={uploading} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <Features />
        {jobs.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Conversion Jobs</h2>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {jobs.map(job => (
                <JobStatusCard key={job.id} job={job} onUpdate={onUpdate} />
              ))}
            </div>
          </div>
        )}

        {jobs.length === 0 && (
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">How It Works</h2>
            <ol className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </span>
                <div>
                  <strong className="block mb-1 dark:text-gray-100">Upload Your Files</strong>
                  <span className="text-gray-600 dark:text-gray-400">
                    Drag and drop or select one or more DOCX files from your computer
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </span>
                <div>
                  <strong className="block mb-1 dark:text-gray-100">Automatic Conversion</strong>
                  <span className="text-gray-600 dark:text-gray-400">
                    Our servers process your files using LibreOffice and convert them to PDF
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  3
                </span>
                <div>
                  <strong className="block mb-1 dark:text-gray-100">Download Results</strong>
                  <span className="text-gray-600 dark:text-gray-400">
                    Once complete, download all converted PDFs in a single ZIP file
                  </span>
                </div>
              </li>
            </ol>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">Built with FastAPI, Celery, RabbitMQ, PostgreSQL, and LibreOffice</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">© 2025 DOCX to PDF Converter</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
