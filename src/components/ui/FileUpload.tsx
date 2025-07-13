/**
 * Reusable FileUpload component
 * Provides drag & drop file upload functionality with validation and progress tracking
 * Supports PDF, DOC, and DOCX files with real-time text extraction
 */

import {
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { ParsedFileResult } from '@/lib/resume-types';

interface FileUploadProps {
  onFileExtracted?: (result: ParsedFileResult) => void;
  onError?: (error: Error) => void;
  maxFileSize?: number;
  timeout?: number;
  className?: string;
  disabled?: boolean;
  showMetadata?: boolean;
  acceptedFormats?: string[];
  placeholder?: {
    title?: string;
    subtitle?: string;
  };
}

/**
 * FileUpload component with drag & drop support
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileExtracted,
  onError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  timeout = 30000, // 30 seconds
  className = '',
  disabled = false,
  showMetadata = true,
  acceptedFormats = ['PDF', 'DOC', 'DOCX'],
  placeholder = {
    title: 'Click to upload or drag & drop',
    subtitle: 'PDF, DOC, or DOCX (max 10MB)',
  },
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadState,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    parseFile,
  } = useFileUpload({
    maxFileSize,
    timeout,
    onSuccess: onFileExtracted,
    onError: onError || (() => {}),
  });

  const getStageMessage = (): string => {
    switch (uploadState.stage) {
      case 'uploading':
        return 'Uploading file...';
      case 'extracting':
        return 'Extracting text content...';
      case 'processing':
        return 'Processing and analyzing...';
      case 'complete':
        return 'Processing complete!';
      case 'error':
        return 'Processing failed';
      default:
        return 'Processing...';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Upload Area */}
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
            : uploadState.dragActive
              ? 'scale-105 border-primary bg-primary/5'
              : uploadState.file
                ? 'border-success bg-success/5'
                : 'cursor-pointer border-gray-300 hover:border-primary hover:bg-primary/5'
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
        role={disabled ? undefined : 'button'}
        tabIndex={disabled ? -1 : 0}
        aria-label={disabled ? 'File upload disabled' : 'Click to upload file or drag and drop'}
        onKeyDown={
          disabled
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {uploadState.file ? (
          <div className="space-y-3">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-success" />
            <div>
              <p className="font-medium text-gray-800">{uploadState.file.name}</p>
              <p className="text-gray-500 text-sm">{formatFileSize(uploadState.file.size)}</p>
            </div>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="btn btn-sm btn-outline btn-error"
                aria-label="Remove selected file"
              >
                <XMarkIcon className="mr-1 h-4 w-4" />
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">
                {uploadState.dragActive ? 'Drop your file here' : placeholder.title}
              </p>
              <p className="text-gray-500 text-sm">{placeholder.subtitle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="alert alert-error" role="alert">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{uploadState.error}</span>
        </div>
      )}

      {/* Progress Display */}
      {uploadState.isUploading && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-gray-700 text-sm">{getStageMessage()}</span>
            <span className="text-gray-500 text-sm">{uploadState.progress}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={uploadState.progress}
            max="100"
            aria-label={`Upload progress: ${uploadState.progress}%`}
          />
        </div>
      )}

      {/* Extract Text Button */}
      {uploadState.file && !uploadState.extractedText && !uploadState.isUploading && (
        <button
          onClick={parseFile}
          disabled={disabled}
          className="btn btn-primary w-full"
          aria-label="Extract text from file"
        >
          Extract Text
        </button>
      )}

      {/* File Metadata */}
      {showMetadata && uploadState.metadata && (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
          <div className="text-center">
            <div className="font-bold text-2xl text-primary">
              {uploadState.metadata.wordCount.toLocaleString()}
            </div>
            <div className="text-gray-600 text-xs">Words</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-secondary">
              {uploadState.metadata.characterCount.toLocaleString()}
            </div>
            <div className="text-gray-600 text-xs">Characters</div>
          </div>
          {uploadState.metadata.pageCount && (
            <div className="text-center">
              <div className="font-bold text-2xl text-accent">{uploadState.metadata.pageCount}</div>
              <div className="text-gray-600 text-xs">Pages</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-bold text-2xl text-info">
              {(uploadState.metadata.extractionTime / 1000).toFixed(1)}s
            </div>
            <div className="text-gray-600 text-xs">Processing Time</div>
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {uploadState.extractedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Extracted Text</h4>
            <div className="badge badge-success">
              <CheckCircleIcon className="mr-1 h-4 w-4" />
              Ready
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-gray-700 text-sm">
              {uploadState.extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 p-3">
        <div className="flex items-start">
          <InformationCircleIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-blue-800 text-sm">
            <p className="mb-1 font-medium">Supported formats:</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {acceptedFormats.map((format) => (
                <li key={format}>{format} files</li>
              ))}
              <li>Maximum file size: {Math.round(maxFileSize / 1024 / 1024)}MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
