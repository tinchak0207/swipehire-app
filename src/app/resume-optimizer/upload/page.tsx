'use client';

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  BeakerIcon,
  VideoCameraIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FileValidationResult,
  ResumeParsingProgress,
  ResumeUploadState,
  TargetJobInfo,
} from '@/lib/resume-types';
import { type AnalysisLoadingState } from '@/services/resumeOptimizerService';
import type { ResumeIntelligence } from '@/services/resumeIntelligenceService';
import { AIEnhancedResumeOptimizer } from '@/components/resume-optimizer/AIEnhancedResumeOptimizer';
import { RealTimeATSScanner } from '@/components/resume-optimizer/ats/RealTimeATSScanner';
import { EnhancedAnalysisProgress } from '@/components/resume-optimizer/EnhancedAnalysisProgress';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

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

  // Removed showAdvanced since we simplified the form
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // Auto-detection state
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [autoDetectionResult, setAutoDetectionResult] = useState<ResumeIntelligence | null>(null);
  const [autoAnalysisTriggered, setAutoAnalysisTriggered] = useState(false);

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
    async (file: File): Promise<void> => {
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

      // File is ready for processing
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

  // Auto-analyze function for high-confidence detections - moved here to resolve dependencies  
  const handleAutoAnalyze = useCallback(async (resumeText: string, detectedTargetJob: TargetJobInfo): Promise<void> => {
    // Set analysis state to show loading
    setAnalysisState({
      isLoading: true,
      progress: 0,
      stage: 'parsing',
      message: 'Starting AI analysis with auto-detected job information...',
    });

    try {
      // Call the existing analysis API with auto-detected information
      const response = await fetch('/api/resume-optimizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetJob: detectedTargetJob,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store the result for the AI component
        sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(data.data));
        sessionStorage.setItem('targetJobInfo', JSON.stringify(detectedTargetJob));
        
        // Show the AI analysis component with the result
        setShowAIAnalysis(true);
        setAnalysisState({
          isLoading: false,
          progress: 100,
          stage: 'finalizing' as any,
          message: 'Analysis complete!',
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Auto-analysis error:', error);
      setAnalysisState({
        isLoading: false,
        progress: 0,
        stage: 'finalizing' as any,
        message: 'Auto-analysis failed. You can still manually start analysis.',
      });
      // Don't show alert for auto-analysis failures, just log them
    }
  }, []);

  // Auto-detection function - moved here to resolve dependency order
  const handleAutoDetection = useCallback(async (resumeText: string): Promise<void> => {
    setIsAutoDetecting(true);
    
    try {
      // Call the auto-detection API
      const response = await fetch('/api/resume-optimizer/auto-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();

      if (data.success) {
        const intelligence: ResumeIntelligence = data.data;
        setAutoDetectionResult(intelligence);

        // Auto-populate target job fields
        setTargetJob({
          title: intelligence.targetJobTitle,
          keywords: intelligence.inferredKeywords.join(', '),
          company: '', // Keep empty as it's hard to predict
          description: intelligence.suggestedJobDescription,
        });

        // Show detection notification
        console.log('Auto-detected job information:', {
          title: intelligence.targetJobTitle,
          confidence: intelligence.confidence,
          industry: intelligence.industryDomain,
          seniority: intelligence.seniorityLevel
        });

        // Auto-start analysis for high-confidence detections (lowered threshold for better UX)
        if (intelligence.confidence >= 0.6 && !autoAnalysisTriggered) {
          setAutoAnalysisTriggered(true);
          
          console.log(`🚀 Auto-starting analysis (confidence: ${intelligence.confidence})`);
          
          // Start analysis immediately after detection
          setTimeout(async () => {
            await handleAutoAnalyze(resumeText, {
              title: intelligence.targetJobTitle,
              keywords: intelligence.inferredKeywords.join(', '),
              company: '',
              description: intelligence.suggestedJobDescription,
            });
          }, 1500); // Reduced delay for better UX
        } else if (intelligence.confidence < 0.6) {
          console.log(`ℹ️ Confidence too low for auto-analysis: ${intelligence.confidence}`);
        }

      } else {
        console.warn('Auto-detection failed:', data.error);
        // Silently fail auto-detection, user can still manually fill fields
      }
    } catch (error) {
      console.error('Auto-detection error:', error);
      // Silently fail auto-detection, user can still manually fill fields
    } finally {
      setIsAutoDetecting(false);
    }
  }, [autoAnalysisTriggered, handleAutoAnalyze]);

  const handleUpload = useCallback(async (fileToProcess?: File): Promise<void> => {
    const file = fileToProcess || uploadState.file;
    if (!file) {
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
      const result = await parseFile(file, {
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

      // AUTO-START: Auto-detect job information and potentially start analysis
      await handleAutoDetection(result.text);

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
  }, [uploadState.file, handleAutoDetection]);

  // Auto-start processing when a file is selected
  useEffect(() => {
    if (uploadState.file && !uploadState.isUploading && uploadState.stage === 'uploading') {
      handleUpload();
    }
  }, [uploadState.file, uploadState.isUploading, uploadState.stage, handleUpload]);

  // Auto-start analysis when target job is populated (fallback mechanism)
  useEffect(() => {
    const shouldAutoStart = 
      uploadState.extractedText && 
      targetJob.title.trim() && 
      !analysisState.isLoading && 
      !autoAnalysisTriggered &&
      !showAIAnalysis;

    if (shouldAutoStart) {
      console.log('🎯 Auto-starting analysis with populated target job');
      setAutoAnalysisTriggered(true);
      
      setTimeout(async () => {
        if (uploadState.extractedText) {
          await handleAutoAnalyze(uploadState.extractedText, targetJob);
        }
      }, 500); // Quick start when fields are ready
    }
  }, [targetJob.title, uploadState.extractedText, analysisState.isLoading, autoAnalysisTriggered, showAIAnalysis, handleAutoAnalyze]);

  
  const handleAnalysisComplete = useCallback((result: ResumeAnalysisResponse) => {
    console.log('Analysis completed:', result);
    // Store the result in sessionStorage for potential use in other pages
    sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(result));
    sessionStorage.setItem('targetJobInfo', JSON.stringify(targetJob));
  }, [targetJob]);

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
            <h1 className="font-bold text-3xl text-gray-800">
              {showAIAnalysis ? 'AI Resume Analysis' : 'Smart Resume Optimizer'}
            </h1>
            <p className="mt-1 text-gray-600">
              {showAIAnalysis 
                ? 'AI-powered analysis and optimization recommendations'
                : 'Just drag & drop your resume - AI will handle the rest automatically!'
              }
            </p>
          </div>
        </div>

        {/* Conditional Rendering: Upload Interface or AI Analysis */}
        {showAIAnalysis ? (
          <>
            {/* AI Enhanced Resume Optimizer */}
            <AIEnhancedResumeOptimizer
              initialResumeText={uploadState.extractedText || ''}
              initialTargetJob={targetJob}
              onAnalysisComplete={handleAnalysisComplete}
              className="mb-8"
            />
          </>
        ) : (
          <>
            {/* Upload Interface */}
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
                              ? 'Drop your file here to start automatic processing'
                              : 'Click to upload or drag & drop'}
                          </p>
                          <p className="text-gray-500 text-sm">PDF, DOC, or DOCX (max 10MB)</p>
                          <p className="text-blue-600 text-xs font-medium mt-1">✨ Automatic processing & AI analysis</p>
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

                  {/* Automatic Processing Status */}
                  {uploadState.file && !uploadState.extractedText && !uploadState.error && (
                    <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <div className="flex items-center">
                        <span className="loading loading-spinner loading-sm mr-3 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-800 text-sm">🚀 Processing automatically...</span>
                            <span className="text-blue-600 text-sm">{uploadState.progress}%</span>
                          </div>
                          <div className="mb-2">
                            <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${uploadState.progress}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-blue-700 text-xs">{getStageMessage()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-Detection Progress */}
                  {isAutoDetecting && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center">
                        <span className="loading loading-spinner loading-sm mr-2 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800 text-sm">🧠 AI Auto-Detection</p>
                          <p className="text-blue-700 text-xs">Analyzing your resume to detect target job information...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-Detection Results */}
                  {autoDetectionResult && !isAutoDetecting && (
                    <div className="mt-4 rounded-lg bg-green-50 p-3 border border-green-200">
                      <div className="flex items-start">
                        <CheckCircleIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800 text-sm">✨ Auto-Detected Job Information</p>
                          <div className="mt-1 text-green-700 text-xs">
                            <p><strong>Target Role:</strong> {autoDetectionResult.targetJobTitle}</p>
                            <p><strong>Industry:</strong> {autoDetectionResult.industryDomain}</p>
                            <p><strong>Confidence:</strong> {Math.round(autoDetectionResult.confidence * 100)}%</p>
                            {autoDetectionResult.confidence >= 0.8 && autoAnalysisTriggered && (
                              <p className="mt-1 font-medium text-green-800">🚀 Starting automatic analysis...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                  <h2 className="card-title mb-4 flex items-center">
                    Target Job Information
                    {autoDetectionResult && (
                      <div className="ml-2 badge badge-success badge-sm">
                        <span className="mr-1">✨</span>
                        Auto-detected
                      </div>
                    )}
                  </h2>

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

                  {/* Advanced Options removed for simplified auto-flow */}

                  {/* Analyze Button - Hidden since we have auto-analysis */}
                  {/* Manual analyze button removed - auto-analysis handles everything */}

                  {/* Auto-Analysis Status Display */}
                  {(autoAnalysisTriggered || analysisState.isLoading) && (
                    <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4 border border-green-200">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {analysisState.isLoading ? (
                              <span className="loading loading-spinner loading-md text-blue-600" />
                            ) : (
                              <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-green-800">
                              {analysisState.isLoading ? '🧠 AI Analysis in Progress...' : '✅ Analysis Complete!'}
                            </p>
                            <p className="text-green-700 text-sm">
                              {autoDetectionResult 
                                ? `Auto-detected with ${Math.round((autoDetectionResult?.confidence || 0) * 100)}% confidence`
                                : 'Using your job information'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Progress Display - Now handled by EnhancedAnalysisProgress modal */}

                  {/* Simplified Instructions */}
                  <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-4 border border-blue-200">
                    <h4 className="mb-3 font-semibold text-blue-800 flex items-center">
                      <span className="mr-2">✨</span>
                      Fully Automatic Experience
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span className="text-blue-700"><strong>Upload</strong> your resume</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-green-700"><strong>AI analyzes</strong> automatically</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-purple-700"><strong>Get insights</strong> instantly</span>
                      </div>
                    </div>
                    <p className="mt-3 text-blue-600 text-xs font-medium">
                      🎯 No manual steps required - just upload and we handle everything!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Features Section */}
            <div className="card mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
              <div className="card-body">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="card-title flex items-center">
                    <BeakerIcon className="mr-2 h-6 w-6 text-orange-600" />
                    Try Our Advanced Demo Features
                  </h3>
                  <Link href="/resume-optimizer/demos" className="btn btn-outline btn-sm">
                    View All Demos
                  </Link>
                </div>

                <p className="mb-6 text-gray-600">
                  While your resume uploads, explore our cutting-edge AI features that showcase the future of resume optimization.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Link href="/demo/ai-video-generator" className="group">
                    <div className="card border-2 border-purple-200 bg-white shadow-sm transition-all hover:border-purple-300 hover:shadow-md group-hover:scale-105">
                      <div className="card-body p-4 text-center">
                        <VideoCameraIcon className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                        <h4 className="font-semibold text-sm">Video Generator</h4>
                        <p className="text-gray-600 text-xs">AI-powered video creation</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/demo/analytics-dashboard" className="group">
                    <div className="card border-2 border-green-200 bg-white shadow-sm transition-all hover:border-green-300 hover:shadow-md group-hover:scale-105">
                      <div className="card-body p-4 text-center">
                        <ChartBarIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
                        <h4 className="font-semibold text-sm">Analytics</h4>
                        <p className="text-gray-600 text-xs">Performance insights</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/demo/ats-scanner" className="group">
                    <div className="card border-2 border-indigo-200 bg-white shadow-sm transition-all hover:border-indigo-300 hover:shadow-md group-hover:scale-105">
                      <div className="card-body p-4 text-center">
                        <MagnifyingGlassIcon className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
                        <h4 className="font-semibold text-sm">ATS Scanner</h4>
                        <p className="text-gray-600 text-xs">Real-time compatibility</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/demo/smart-suggestions" className="group">
                    <div className="card border-2 border-orange-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md group-hover:scale-105">
                      <div className="card-body p-4 text-center">
                        <LightBulbIcon className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                        <h4 className="font-semibold text-sm">Smart Suggestions</h4>
                        <p className="text-gray-600 text-xs">ML-powered recommendations</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Extracted Text Preview */}
            {uploadState.extractedText && (
              <>
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
                          Make sure all important information was captured correctly. Click "Start AI Analysis" above to begin optimization.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time ATS Scanner */}
                <div className="card mt-8 bg-white shadow-lg">
                  <div className="card-body">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="card-title flex items-center">
                        <MagnifyingGlassIcon className="mr-2 h-6 w-6 text-indigo-600" />
                        Real-time ATS Compatibility Check
                      </h3>
                      <div className="badge badge-info">
                        <span className="mr-1">⚡</span>
                        Live Scanning
                      </div>
                    </div>
                    
                    <div className="mb-4 rounded-lg bg-indigo-50 p-3">
                      <div className="flex items-start">
                        <InformationCircleIcon className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-indigo-600" />
                        <div className="text-indigo-800 text-sm">
                          <p className="font-medium">Instant ATS Feedback</p>
                          <p>
                            Get real-time compatibility analysis as your resume is processed. This helps identify potential issues before full optimization.
                          </p>
                        </div>
                      </div>
                    </div>

                    <RealTimeATSScanner
                      resumeText={uploadState.extractedText}
                      targetRole={targetJob.title}
                      targetIndustry="Technology" // Default industry, could be made configurable
                      jobDescription={targetJob.description || ''}
                      experienceLevel="mid" // Default level, could be made configurable
                      onSuggestionApplied={(suggestion) => {
                        console.log('ATS suggestion applied:', suggestion);
                        // Could implement text updating logic here if needed
                      }}
                      className="mt-4"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Enhanced Analysis Progress Modal */}
      <EnhancedAnalysisProgress 
        isAnalyzing={analysisState.isLoading}
        onComplete={() => {
          // setActualAnalysisTime(actualTime);
        }}
      />
    </div>
  );
};

export default ResumeUploadPage;
