'use client';

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import type {
  FileValidationResult,
  ResumeParsingProgress,
  ResumeUploadState,
  TargetJobInfo,
} from '@/lib/resume-types';

interface ExtendedUploadState extends ResumeUploadState {
  progress: number;
  stage: ResumeParsingProgress['stage'];
  dragActive: boolean;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    extractionTime: number;
  };
}

/**
 * Enhanced Resume upload page component
 * Handles file upload, validation, text extraction with drag & drop support
 * Includes progress tracking, better error handling, and accessibility features
 */
const ResumeUploadPage: NextPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<ExtendedUploadState>({
    file: null,
    isUploading: false,
    error: null,
    extractedText: null,
    progress: 0,
    stage: 'uploading',
    dragActive: false,
  });

  const [targetJob, setTargetJob] = useState<TargetJobInfo>({
    title: '',
    keywords: '',
    company: '',
    description: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateFile = useCallback((file: File): FileValidationResult => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', // .doc files
    ];

    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Please upload a PDF, DOC, or DOCX file only.',
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB.',
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'The selected file appears to be empty.',
      };
    }

    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };
  }, []);

  const handleFileSelection = useCallback(
    (file: File): void => {
      const validation = validateFile(file);

      if (!validation.isValid) {
        setUploadState((prev) => ({
          ...prev,
          error: validation.error || 'Invalid file',
          file: null,
          dragActive: false,
        }));
        return;
      }

      setUploadState((prev) => ({
        ...prev,
        file,
        error: null,
        dragActive: false,
        progress: 0,
        stage: 'uploading',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          wordCount: 0,
          characterCount: 0,
          extractionTime: 0,
        },
      }));
    },
    [validateFile]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, dragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setUploadState((prev) => ({ ...prev, dragActive: false }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        handleFileSelection(files[0]);
      }
    },
    [handleFileSelection]
  );

  const clearFile = useCallback((): void => {
    setUploadState({
      file: null,
      isUploading: false,
      error: null,
      extractedText: null,
      progress: 0,
      stage: 'uploading',
      dragActive: false,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = async (): Promise<void> => {
    if (!uploadState.file) {
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      error: null,
      progress: 0,
      stage: 'uploading',
    }));

    try {
      // Import the file parsing service dynamically to avoid SSR issues
      const { parseFile } = await import('@/services/fileParsingService');

      // Parse the file with progress tracking
      const result = await parseFile(uploadState.file, {
        onProgress: (progress) => {
          setUploadState((prev) => ({
            ...prev,
            progress: progress.progress,
            stage: progress.stage,
          }));
        },
        maxFileSize: 10 * 1024 * 1024, // 10MB
        timeout: 30000, // 30 seconds
      });

      // Update state with extracted text and metadata
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        extractedText: result.text,
        metadata: result.metadata,
        progress: 100,
        stage: 'complete',
      }));

      // Log metadata for debugging (can be removed in production)
      console.log('File parsing completed:', {
        fileName: result.metadata.fileName,
        fileSize: result.metadata.fileSize,
        wordCount: result.metadata.wordCount,
        characterCount: result.metadata.characterCount,
        extractionTime: result.metadata.extractionTime,
        pageCount: result.metadata.pageCount,
      });
    } catch (error) {
      console.error('File parsing error:', error);

      let errorMessage = 'Failed to process the file. Please try again.';

      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'File processing timed out. Please try with a smaller file.';
        } else if (error.message.includes('corrupted')) {
          errorMessage = 'The file appears to be corrupted. Please try with a different file.';
        } else if (error.message.includes('password')) {
          errorMessage =
            'Password-protected files are not supported. Please remove the password and try again.';
        } else if (error.message.includes('format')) {
          errorMessage = 'This file format is not supported or the file is corrupted.';
        } else if (error.message.includes('size')) {
          errorMessage = 'File is too large. Please use a file smaller than 10MB.';
        }
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        stage: 'error',
      }));
    }
  };

  const handleAnalyze = (): void => {
    if (!uploadState.extractedText || !targetJob.title.trim()) {
      return;
    }

    // TODO: Navigate to analysis page with data
    console.log('Analyzing resume with:', {
      text: uploadState.extractedText,
      targetJob,
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/resume-optimizer"
            className="btn btn-ghost btn-sm mr-4"
            aria-label="Go back to resume optimizer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Upload Resume</h1>
            <p className="text-gray-600 mt-1">Upload your resume for AI-powered optimization</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4 flex items-center">
                <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                Upload Your Resume
              </h2>

              {/* Drag & Drop Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 mb-6 ${
                  uploadState.dragActive
                    ? 'border-primary bg-primary/5 scale-105'
                    : uploadState.file
                      ? 'border-success bg-success/5'
                      : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Click to upload file or drag and drop"
                onKeyDown={(e) => {
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
                />

                {uploadState.file ? (
                  <div className="space-y-3">
                    <CheckCircleIcon className="w-12 h-12 text-success mx-auto" />
                    <div>
                      <p className="font-medium text-gray-800">{uploadState.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
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
                  </div>
                ) : (
                  <div className="space-y-3">
                    <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-700">
                        {uploadState.dragActive
                          ? 'Drop your file here'
                          : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {uploadState.error && (
                <div className="alert alert-error mb-4" role="alert">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{uploadState.error}</span>
                </div>
              )}

              {/* Progress Display */}
              {uploadState.isUploading && (
                <div className="mb-6">
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

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!uploadState.file || uploadState.isUploading}
                className="btn btn-primary w-full"
                aria-label={uploadState.isUploading ? 'Processing file' : 'Extract text from file'}
              >
                {uploadState.isUploading && <span className="loading loading-spinner loading-sm" />}
                {uploadState.isUploading ? 'Processing...' : 'Extract Text'}
              </button>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>PDF files (.pdf)</li>
                      <li>Microsoft Word documents (.docx, .doc)</li>
                      <li>Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Job Section */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Target Job Information</h2>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Target Job Title *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  value={targetJob.title}
                  onChange={(e) => setTargetJob((prev) => ({ ...prev, title: e.target.value }))}
                  className="input input-bordered w-full bg-white text-gray-800 placeholder-gray-500"
                  required
                  aria-describedby="job-title-help"
                />
                <label className="label">
                  <span id="job-title-help" className="label-text-alt text-gray-500">
                    Enter the exact job title you're targeting
                  </span>
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Company (optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  value={targetJob.company}
                  onChange={(e) => setTargetJob((prev) => ({ ...prev, company: e.target.value }))}
                  className="input input-bordered w-full bg-white text-gray-800 placeholder-gray-500"
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Keywords (comma-separated)</span>
                </label>
                <textarea
                  placeholder="e.g., React, Node.js, TypeScript, AWS, Agile, Leadership"
                  value={targetJob.keywords}
                  onChange={(e) => setTargetJob((prev) => ({ ...prev, keywords: e.target.value }))}
                  className="textarea textarea-bordered w-full h-24 bg-white text-gray-800 placeholder-gray-500"
                  aria-describedby="keywords-help"
                />
                <label className="label">
                  <span id="keywords-help" className="label-text-alt text-gray-500">
                    Add relevant skills and technologies from the job posting
                  </span>
                </label>
              </div>

              {/* Advanced Options Toggle */}
              <div className="collapse collapse-arrow bg-gray-50 mb-6">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
                <div className="collapse-title text-sm font-medium">Advanced Options</div>
                <div className="collapse-content">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Job Description (optional)</span>
                    </label>
                    <textarea
                      placeholder="Paste the full job description here for better analysis..."
                      value={targetJob.description}
                      onChange={(e) =>
                        setTargetJob((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="textarea textarea-bordered w-full h-32 bg-white text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!uploadState.extractedText || !targetJob.title.trim()}
                className="btn btn-success w-full"
                aria-label="Analyze resume against target job"
              >
                <span className="mr-2">🎯</span>
                Analyze Resume
              </button>

              {/* Quick Tips */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">💡 Quick Tips</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Be specific with your job title</li>
                  <li>• Include both hard and soft skills</li>
                  <li>• Add industry-specific terminology</li>
                  <li>• Include the full job description for best results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Text Preview */}
        {uploadState.extractedText && (
          <div className="card bg-white shadow-lg mt-8">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Extracted Text Preview</h3>
                <div className="badge badge-success">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Ready for Analysis
                </div>
              </div>

              {/* File Metadata */}
              {uploadState.metadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {uploadState.metadata.wordCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {uploadState.metadata.characterCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Characters</div>
                  </div>
                  {uploadState.metadata.pageCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {uploadState.metadata.pageCount}
                      </div>
                      <div className="text-xs text-gray-600">Pages</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {(uploadState.metadata.extractionTime / 1000).toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">Processing Time</div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {uploadState.extractedText}
                </pre>
              </div>
              <div className="flex items-start mt-3 p-3 bg-blue-50 rounded-lg">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Review the extracted text</p>
                  <p>
                    Make sure all important information was captured correctly. The AI will analyze
                    this text to provide optimization suggestions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
