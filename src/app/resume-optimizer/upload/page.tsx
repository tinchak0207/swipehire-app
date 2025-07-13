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
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import type {
  FileValidationResult,
  ResumeParsingProgress,
  ResumeUploadState,
  TargetJobInfo,
} from '@/lib/resume-types';
import { type AnalysisLoadingState, analyzeResume } from '@/services/resumeOptimizerService';

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
  const router = useRouter();

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

  // Analysis state
  const [analysisState, setAnalysisState] = useState<AnalysisLoadingState>({
    isLoading: false,
    progress: 0,
    stage: 'parsing',
    message: '',
  });

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

  const handleAnalyze = async (): Promise<void> => {
    console.log('handleAnalyze called with:', {
      extractedText: uploadState.extractedText ? 'present' : 'missing',
      targetJobTitle: targetJob.title,
      targetJobTitleTrimmed: targetJob.title.trim(),
      fullTargetJob: targetJob,
    });

    if (!uploadState.extractedText || !targetJob.title.trim()) {
      console.log('Early return due to validation failure');
      return;
    }

    try {
      // Call the analysis service with progress tracking
      const analysisResult = await analyzeResume(
        {
          resumeText: uploadState.extractedText,
          targetJob: targetJob,
        },
        (progress) => {
          setAnalysisState(progress);
        }
      );

      // Store the result in sessionStorage so the analyze page can access it
      sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(analysisResult));
      sessionStorage.setItem('targetJobInfo', JSON.stringify(targetJob));

      // Navigate to the analysis results page
      router.push('/resume-optimizer/analyze');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState({
        isLoading: false,
        progress: 0,
        stage: 'parsing',
        message: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
      });
    }
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
        <div className="mb-8 flex items-center">
          <Link
            href="/resume-optimizer"
            className="btn btn-ghost btn-sm mr-4"
            aria-label="Go back to resume optimizer"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="font-bold text-3xl text-gray-800">Upload Resume</h1>
            <p className="mt-1 text-gray-600">Upload your resume for AI-powered optimization</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4 flex items-center">
                <DocumentArrowUpIcon className="mr-2 h-5 w-5" />
                Upload Your Resume
              </h2>

              {/* Drag & Drop Upload Area */}
              <div
                className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  uploadState.dragActive
                    ? 'scale-105 border-primary bg-primary/5'
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
                />

                {uploadState.file ? (
                  <div className="space-y-3">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-success" />
                    <div>
                      <p className="font-medium text-gray-800">{uploadState.file.name}</p>
                      <p className="text-gray-500 text-sm">
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
                      <XMarkIcon className="mr-1 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">
                        {uploadState.dragActive
                          ? 'Drop your file here'
                          : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-gray-500 text-sm">PDF, DOC, or DOCX (max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {uploadState.error && (
                <div className="alert alert-error mb-4" role="alert">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>{uploadState.error}</span>
                </div>
              )}

              {/* Progress Display */}
              {uploadState.isUploading && (
                <div className="mb-6">
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
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <div className="flex items-start">
                  <InformationCircleIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="text-blue-800 text-sm">
                    <p className="mb-1 font-medium">Supported formats:</p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
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
                  className="textarea textarea-bordered h-24 w-full bg-white text-gray-800 placeholder-gray-500"
                  aria-describedby="keywords-help"
                />
                <label className="label">
                  <span id="keywords-help" className="label-text-alt text-gray-500">
                    Add relevant skills and technologies from the job posting
                  </span>
                </label>
              </div>

              {/* Advanced Options Toggle */}
              <div className="collapse-arrow collapse mb-6 bg-gray-50">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
                <div className="collapse-title font-medium text-sm">Advanced Options</div>
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
                      className="textarea textarea-bordered h-32 w-full bg-white text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={
                  !uploadState.extractedText || !targetJob.title.trim() || analysisState.isLoading
                }
                className="btn btn-success w-full"
                aria-label="Analyze resume against target job"
              >
                {analysisState.isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    <span>{analysisState.message || 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎯</span>
                    Analyze Resume
                  </>
                )}
              </button>

              {/* Analysis Progress */}
              {analysisState.isLoading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      {analysisState.message || 'Processing...'}
                    </span>
                    <span className="text-sm text-blue-600">{analysisState.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisState.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {!analysisState.isLoading && analysisState.message && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">{analysisState.message}</span>
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <h4 className="mb-2 font-medium text-green-800">💡 Quick Tips</h4>
                <ul className="space-y-1 text-green-700 text-sm">
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
          <div className="card mt-8 bg-white shadow-lg">
            <div className="card-body">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="card-title">Extracted Text Preview</h3>
                <div className="badge badge-success">
                  <CheckCircleIcon className="mr-1 h-4 w-4" />
                  Ready for Analysis
                </div>
              </div>

              {/* File Metadata */}
              {uploadState.metadata && (
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-gray-800">
                      {uploadState.metadata.wordCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600 text-xs">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-gray-800">
                      {uploadState.metadata.characterCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600 text-xs">Characters</div>
                  </div>
                  {uploadState.metadata.pageCount && (
                    <div className="text-center">
                      <div className="font-bold text-2xl text-gray-800">
                        {uploadState.metadata.pageCount}
                      </div>
                      <div className="text-gray-600 text-xs">Pages</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold text-2xl text-gray-800">
                      {(uploadState.metadata.extractionTime / 1000).toFixed(1)}s
                    </div>
                    <div className="text-gray-600 text-xs">Processing Time</div>
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-gray-700 text-sm">
                  {uploadState.extractedText}
                </pre>
              </div>
              <div className="mt-3 flex items-start rounded-lg bg-blue-50 p-3">
                <InformationCircleIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-blue-800 text-sm">
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
