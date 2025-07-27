'use client';

import * as Progress from '@radix-ui/react-progress';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import type {
  AnimationConfig,
  ContentAnalysis,
  FileFormat,
  SmartUploadProps,
  UploadError,
  UploadProgress,
  UploadResult,
} from './types';

/**
 * Smart Upload Component with Multi-Modal Input System
 *
 * Features:
 * - Drag & drop with animated zones and visual feedback
 * - Multi-file support (resume + cover letter)
 * - Real-time file validation with helpful error messages
 * - Progress animations during upload
 * - Smart content detection and auto-section recognition
 * - Missing content alerts and proactive suggestions
 * - Real-time ATS compatibility checking
 * - Content quality indicators with visual health bars
 *
 * DaisyUI Components Used:
 * - card, progress, alert, badge, btn, file-input
 *
 * Tailwind Classes:
 * - transition-all duration-300 ease-in-out
 * - transform hover:scale-105
 * - bg-gradient-to-r from-blue-500 to-purple-600
 * - shadow-lg hover:shadow-xl
 * - animate-pulse for loading states
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Screen reader announcements
 * - High contrast mode support
 */

interface UploadState {
  readonly isDragActive: boolean;
  readonly files: File[];
  readonly uploadProgress: Record<string, UploadProgress>;
  readonly errors: UploadError[];
  readonly isProcessing: boolean;
}

const animationConfig: AnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  stagger: 100,
};

const defaultFileFormats: readonly FileFormat[] = [
  { extension: '.pdf', mimeType: 'application/pdf', maxSize: 10 * 1024 * 1024 },
  {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    maxSize: 10 * 1024 * 1024,
  },
  { extension: '.doc', mimeType: 'application/msword', maxSize: 10 * 1024 * 1024 },
  { extension: '.txt', mimeType: 'text/plain', maxSize: 5 * 1024 * 1024 },
] as const;

export const SmartUpload: React.FC<SmartUploadProps> = ({
  acceptedFormats = defaultFileFormats,
  maxFileSize = 10 * 1024 * 1024,
  enableMultipleFiles = true,
  enableSmartSuggestions = true,
  onUploadProgress,
  onContentAnalysis,
  onUploadComplete,
  onError,
}) => {
  const [state, setState] = useState<UploadState>({
    isDragActive: false,
    files: [],
    uploadProgress: {},
    errors: [],
    isProcessing: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Spring animations for drag states
  const dropZoneSpring = useSpring({
    scale: state.isDragActive ? 1.02 : 1,
    borderColor: state.isDragActive ? '#3b82f6' : '#e5e7eb',
    backgroundColor: state.isDragActive ? '#eff6ff' : '#ffffff',
    config: { tension: 300, friction: 30 },
  });

  // File validation
  const validateFile = useCallback(
    (file: File): UploadError | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return {
          code: 'FILE_TOO_LARGE',
          message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)})`,
          details: { fileName: file.name, fileSize: file.size, maxSize: maxFileSize },
        };
      }

      // Check file type
      const isValidType = acceptedFormats.some(
        (format) =>
          file.type === format.mimeType || file.name.toLowerCase().endsWith(format.extension)
      );

      if (!isValidType) {
        return {
          code: 'INVALID_FILE_TYPE',
          message: `File type not supported. Please upload: ${acceptedFormats.map((f) => f.extension).join(', ')}`,
          details: { fileName: file.name, fileType: file.type },
        };
      }

      return null;
    },
    [acceptedFormats, maxFileSize]
  );

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: UploadError[] = [];

      // Validate each file
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      // Check multiple files limit
      if (!enableMultipleFiles && validFiles.length > 1) {
        errors.push({
          code: 'MULTIPLE_FILES_NOT_ALLOWED',
          message: 'Only one file can be uploaded at a time',
          details: { fileCount: validFiles.length },
        });
        return;
      }

      // Update state
      setState((prev) => ({
        ...prev,
        files: enableMultipleFiles ? [...prev.files, ...validFiles] : validFiles,
        errors: [...prev.errors, ...errors],
      }));

      // Start upload process for valid files
      if (validFiles.length > 0) {
        startUpload(validFiles);
      }

      // Report errors
      errors.forEach((error) => onError(error));
    },
    [validateFile, enableMultipleFiles, onError, startUpload]
  );

  // Start upload process
  const startUpload = useCallback(
    async (files: File[]) => {
      setState((prev) => ({ ...prev, isProcessing: true }));

      for (const file of files) {
        const fileId = generateFileId(file);

        // Initialize progress
        const initialProgress: UploadProgress = {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'uploading' as const,
        };

        setState((prev) => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileId]: initialProgress,
          },
        }));

        onUploadProgress(initialProgress);

        try {
          // Simulate upload progress
          await simulateUpload(fileId, file);

          // Process file content
          const analysis = await processFileContent(file);
          onContentAnalysis(analysis);

          // Complete upload
          const result: UploadResult = {
            fileId,
            analysisId: generateAnalysisId(),
            initialScore: Math.floor(Math.random() * 40) + 60, // Simulate score
            processingTime: Date.now(),
          };

          onUploadComplete(result);

          // Update final progress
          const finalProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: 100,
            status: 'complete',
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: finalProgress,
            },
          }));

          onUploadProgress(finalProgress);
        } catch (error) {
          const uploadError: UploadError = {
            code: 'UPLOAD_FAILED',
            message: error instanceof Error ? error.message : 'Upload failed',
            details: { fileName: file.name },
          };

          const errorProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: uploadError.message,
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: errorProgress,
            },
          }));

          onError(uploadError);
        }
      }

      setState((prev) => ({ ...prev, isProcessing: false }));
    },
    [
      onUploadProgress,
      onContentAnalysis,
      onUploadComplete,
      onError,
      processFileContent,
      simulateUpload,
    ]
  );

  // Simulate upload progress
  const simulateUpload = useCallback(
    async (fileId: string, file: File) => {
      const steps = ['uploading', 'processing', 'analyzing'] as const;

      for (let i = 0; i < steps.length; i++) {
        const status = steps[i];
        const baseProgress = (i / steps.length) * 100;

        // Simulate progress within each step
        for (let progress = 0; progress <= 100; progress += 10) {
          const totalProgress = baseProgress + progress / steps.length;

          const updatedProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: Math.min(totalProgress, 95),
            status: status as any,
            estimatedTimeRemaining: Math.max(0, (100 - totalProgress) * 100),
          };

          setState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: updatedProgress,
            },
          }));

          onUploadProgress({
            fileId,
            fileName: file.name,
            progress: Math.min(totalProgress, 95),
            status: status as any,
            estimatedTimeRemaining: Math.max(0, (100 - totalProgress) * 100),
          });

          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    },
    [onUploadProgress]
  );

  // Process file content (mock implementation)
  const processFileContent = useCallback(async (file: File): Promise<ContentAnalysis> => {
    // Simulate content extraction
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      extractedText: 'Mock extracted text content...',
      detectedSections: [
        {
          type: 'contact',
          content: 'Contact information',
          startIndex: 0,
          endIndex: 100,
          confidence: 0.95,
        },
        {
          type: 'summary',
          content: 'Professional summary',
          startIndex: 100,
          endIndex: 300,
          confidence: 0.88,
        },
        {
          type: 'experience',
          content: 'Work experience',
          startIndex: 300,
          endIndex: 800,
          confidence: 0.92,
        },
      ],
      fileMetadata: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
        wordCount: Math.floor(Math.random() * 500) + 200,
      },
      qualityIndicators: {
        completeness: Math.random() * 0.3 + 0.7,
        formatting: Math.random() * 0.4 + 0.6,
        atsCompatibility: Math.random() * 0.5 + 0.5,
        readability: Math.random() * 0.3 + 0.7,
      },
    };
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setState((prev) => ({ ...prev, isDragActive: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragActive: false }));

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // File input change handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // Remove file
  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  // Clear all files
  const clearAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      files: [],
      uploadProgress: {},
      errors: [],
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement === dropZoneRef.current) {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasFiles = state.files.length > 0;
  const hasErrors = state.errors.length > 0;
  const isUploading = Object.values(state.uploadProgress).some(
    (p) => p.status !== 'complete' && p.status !== 'error'
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Main Drop Zone */}
      <animated.div
        ref={dropZoneRef}
        style={dropZoneSpring}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label="Upload resume files"
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${state.isDragActive ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'} `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={enableMultipleFiles}
          accept={acceptedFormats.map((f) => f.extension).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={animationConfig}
          className="space-y-4"
        >
          {/* Upload Icon */}
          <motion.div
            animate={{
              y: state.isDragActive ? -10 : 0,
              scale: state.isDragActive ? 1.1 : 1,
            }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl text-primary-content shadow-lg"
          >
            📄
          </motion.div>

          {/* Upload Text */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base-content text-xl">
              {state.isDragActive ? 'Drop your files here' : 'Upload your resume'}
            </h3>
            <p className="text-base-content/60">Drag & drop or click to select files</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {acceptedFormats.map((format) => (
                <span key={format.extension} className="badge badge-outline badge-sm">
                  {format.extension.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Smart Suggestions */}
          {enableSmartSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg bg-info/10 p-4 text-sm"
            >
              <div className="mb-2 flex items-center gap-2 text-info">
                <span>💡</span>
                <span className="font-medium">Smart Tips</span>
              </div>
              <ul className="space-y-1 text-left text-base-content/70">
                <li>• Upload both resume and cover letter for comprehensive analysis</li>
                <li>• PDF format provides the most accurate analysis</li>
                <li>• Ensure your file is up-to-date and error-free</li>
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {state.isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-base-100/80 backdrop-blur-sm"
            >
              <div className="space-y-4 text-center">
                <div className="loading loading-spinner loading-lg text-primary" />
                <p className="text-base-content/70">Processing your files...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </animated.div>

      {/* File List */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base-content">
                Uploaded Files ({state.files.length})
              </h4>
              <button onClick={clearAll} className="btn btn-ghost btn-sm" disabled={isUploading}>
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {state.files.map((file, index) => {
                const fileId = generateFileId(file);
                const progress = state.uploadProgress[fileId];

                return (
                  <FileUploadCard
                    key={`${file.name}-${index}`}
                    file={file}
                    progress={progress}
                    onRemove={() => removeFile(index)}
                    canRemove={!isUploading}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Messages */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {state.errors.map((error, index) => (
              <div key={index} className="alert alert-error">
                <span className="text-sm">{error.message}</span>
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      errors: prev.errors.filter((_, i) => i !== index),
                    }))
                  }
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Upload Card Component
interface FileUploadCardProps {
  readonly file: File;
  readonly progress: UploadProgress | undefined;
  readonly onRemove: () => void;
  readonly canRemove: boolean;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ file, progress, onRemove, canRemove }) => {
  const getStatusColor = (status?: UploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'uploading':
      case 'processing':
      case 'analyzing':
        return 'text-primary';
      default:
        return 'text-base-content/60';
    }
  };

  const getStatusIcon = (status?: UploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      case 'uploading':
        return '⬆️';
      case 'processing':
        return '⚙️';
      case 'analyzing':
        return '🔍';
      default:
        return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="card border border-base-300 bg-base-100 shadow-md"
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          {/* File Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl">
            {getStatusIcon(progress?.status)}
          </div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <h5 className="truncate font-medium text-base-content">{file.name}</h5>
              <span className="text-base-content/60 text-xs">{formatFileSize(file.size)}</span>
            </div>

            {/* Progress Bar */}
            {progress && progress.status !== 'complete' && (
              <div className="space-y-1">
                <Progress.Root
                  className="relative h-2 overflow-hidden rounded-full bg-base-300"
                  value={progress.progress}
                >
                  <Progress.Indicator
                    className="h-full w-full bg-primary transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${100 - progress.progress}%)` }}
                  />
                </Progress.Root>
                <div className="flex justify-between text-xs">
                  <span className={getStatusColor(progress.status)}>
                    {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                  </span>
                  <span className="text-base-content/60">{Math.round(progress.progress)}%</span>
                </div>
              </div>
            )}

            {/* Status Message */}
            {progress?.status === 'complete' && (
              <div className="text-success text-xs">Upload complete</div>
            )}

            {progress?.error && <div className="text-error text-xs">{progress.error}</div>}
          </div>

          {/* Remove Button */}
          {canRemove && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={onRemove}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded bg-base-content px-2 py-1 text-base-100 text-xs"
                    sideOffset={5}
                  >
                    Remove file
                    <Tooltip.Arrow className="fill-base-content" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Utility Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const generateFileId = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const generateAnalysisId = (): string => {
  return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default SmartUpload;
