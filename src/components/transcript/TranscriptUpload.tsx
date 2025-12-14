'use client';

import { useState } from 'react';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import styles from '@/styles/modules/components/transcript-upload.module.scss';

interface TranscriptUploadProps {
  onImportComplete: () => void;
}

interface ImportResult {
  institution?: {
    name: string;
    short_code: string;
  };
  terms: Array<{
    name: string;
    courses: number;
  }>;
  totalCourses: number;
  totalCredits: number;
}

export default function TranscriptUpload({ onImportComplete }: TranscriptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setProgress('Uploading transcript...');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload and process
      setProgress('Analyzing document with AI...');
      const response = await axios.post('/api/transcripts/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setProgress('Importing data to your account...');
        setResult(response.data.result);
        setProgress('Import complete!');
        
        // Refresh the page after a delay
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to process transcript');
        setProgress('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to upload transcript');
      } else {
        setError('An unexpected error occurred');
      }
      setProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setProgress('');
    setResult(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Upload size={24} strokeWidth={2} />
        </div>
        <div>
          <h3 className={styles.title}>Import Transcript</h3>
          <p className={styles.subtitle}>
            Upload your official or unofficial transcript PDF and we'll automatically extract your courses
          </p>
        </div>
      </div>

      {!file && !result && (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileText size={48} strokeWidth={1.5} />
          <p className={styles.dropzoneText}>
            Drag and drop your transcript PDF here
          </p>
          <p className={styles.dropzoneOr}>or</p>
          <label className={styles.uploadButton}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            Browse Files
          </label>
          <p className={styles.hint}>Supports PDF files up to 10MB</p>
        </div>
      )}

      {file && !result && (
        <div className={styles.filePreview}>
          <div className={styles.fileInfo}>
            <FileText size={32} strokeWidth={2} />
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={handleReset}
                className={styles.removeButton}
                aria-label="Remove file"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>

          {isProcessing && (
            <div className={styles.processing}>
              <Loader size={20} strokeWidth={2} className={styles.spinner} />
              <span>{progress}</span>
            </div>
          )}

          {!isProcessing && !error && (
            <button onClick={handleUpload} className={styles.processButton}>
              Process Transcript
            </button>
          )}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className={styles.success}>
          <div className={styles.successHeader}>
            <CheckCircle size={32} strokeWidth={2} />
            <div>
              <h4 className={styles.successTitle}>Import Successful!</h4>
              <p className={styles.successSubtitle}>
                Your transcript has been processed and imported
              </p>
            </div>
          </div>

          <div className={styles.resultStats}>
            {result.institution && (
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Institution:</span>
                <span className={styles.resultValue}>
                  {result.institution.name} ({result.institution.short_code})
                </span>
              </div>
            )}
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Terms Imported:</span>
              <span className={styles.resultValue}>{result.terms.length}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Courses Imported:</span>
              <span className={styles.resultValue}>{result.totalCourses}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Total Credits:</span>
              <span className={styles.resultValue}>{result.totalCredits.toFixed(1)}</span>
            </div>
          </div>

          <button onClick={handleReset} className={styles.importAnotherButton}>
            Import Another Transcript
          </button>
        </div>
      )}
    </div>
  );
}
