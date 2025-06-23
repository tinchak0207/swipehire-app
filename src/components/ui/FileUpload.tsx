/**
 * Reusable FileUpload component
 * Provides drag & drop file upload functionality with validation and progress tracking
 * Supports PDF, DOC, and DOCX files with real-time text extraction
 */

import React, { useRef } from 'react';
import {
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
    subtitle: 'PDF, DOC, or DOCX (max 10MB)'
  }
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
    onError,
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            : uploadState.dragActive
            ? 'border-primary bg-primary/5 scale-105'
            : uploadState.file
            ? 'border-success bg-success/5'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer'
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
        role={disabled ? undefined : "button"}
        tabIndex={disabled ? -1 : 0}
        aria-label={disabled ? "File upload disabled" : "Click to upload file or drag and drop"}
        onKeyDown={disabled ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          disabled={disabled}
        />
        
        {uploadState.file ? (
          <div className="space-y-3">
            <CheckCircleIcon className="w-12 h-12 text-success mx-auto" />
            <div>
              <p className="font-medium text-gray-800">{uploadState.file.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(uploadState.file.size)}
              </p>
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
                <XMarkIcon className="w-4 h-4 mr-1" />
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="font-medium text-gray-700">
                {uploadState.dragActive ? 'Drop your file here' : placeholder.title}
              </p>
              <p className="text-sm text-gray-500">{placeholder.subtitle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="alert alert-error" role="alert">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{uploadState.error}</span>
        </div>
      )}

      {/* Progress Display */}
      {uploadState.isUploading && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{getStageMessage()}</span>
            <span className="text-sm text-gray-500">{uploadState.progress}%</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{uploadState.metadata.wordCount.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{uploadState.metadata.characterCount.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Characters</div>
          </div>
          {uploadState.metadata.pageCount && (
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{uploadState.metadata.pageCount}</div>
              <div className="text-xs text-gray-600">Pages</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-info">{(uploadState.metadata.extractionTime / 1000).toFixed(1)}s</div>
            <div className="text-xs text-gray-600">Processing Time</div>
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {uploadState.extractedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Extracted Text</h4>
            <div className="badge badge-success">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Ready
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto border">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {uploadState.extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
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