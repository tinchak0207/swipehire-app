'use client';

import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useState } from 'react';
import type { ProcessingETA, QualityAssessment, UploadProgress } from '../types';

/**
 * Enhanced File Upload Card Component
 *
 * Features:
 * - Real-time upload progress with ETA
 * - Quality assessment indicators
 * - File preview and metadata
 * - Error recovery mechanisms
 * - Batch operation support
 * - Accessibility optimized
 *
 * DaisyUI Components:
 * - card, progress, badge, btn, tooltip, popover
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation
 * - Screen reader support
 * - High contrast mode
 */

interface EnhancedFileUploadCardProps {
  readonly file: File;
  readonly progress?: UploadProgress;
  readonly qualityAssessment?: QualityAssessment;
  readonly processingETA?: ProcessingETA;
  readonly onRemove: () => void;
  readonly onRetry?: () => void;
  readonly onPreview?: () => void;
  readonly canRemove: boolean;
  readonly showDetails?: boolean;
}

interface FileCardState {
  readonly isExpanded: boolean;
  readonly showPreview: boolean;
  readonly previewUrl: string | null;
}

export const EnhancedFileUploadCard: React.FC<EnhancedFileUploadCardProps> = ({
  file,
  progress,
  qualityAssessment,
  processingETA,
  onRemove,
  onRetry,
  onPreview,
  canRemove,
  showDetails = true,
}) => {
  const [state, setState] = useState<FileCardState>({
    isExpanded: false,
    showPreview: false,
    previewUrl: null,
  });

  // Get status styling
  const getStatusColor = useCallback((status?: UploadProgress['status']) => {
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
  }, []);

  const getStatusIcon = useCallback((status?: UploadProgress['status']) => {
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
  }, []);

  const getFileTypeIcon = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📕';
      case 'docx':
      case 'doc':
        return '📘';
      case 'txt':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📄';
    }
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }, []);

  // Format time remaining
  const formatTimeRemaining = useCallback((ms?: number): string => {
    if (!ms) return '';
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  // Generate file preview
  const generatePreview = useCallback(async () => {
    if (state.previewUrl) return;

    try {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setState((prev) => ({ ...prev, previewUrl: url }));
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'd typically use a PDF.js preview
        // For now, we'll show a placeholder
        setState((prev) => ({ ...prev, previewUrl: '/api/placeholder/pdf-preview' }));
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }, [file, state.previewUrl]);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
    if (!state.isExpanded && !state.previewUrl) {
      generatePreview();
    }
  }, [state.isExpanded, state.previewUrl, generatePreview]);

  // Get quality score color
  const getQualityColor = useCallback((score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  }, []);

  // Get progress bar color
  const getProgressColor = useCallback((status?: UploadProgress['status']) => {
    switch (status) {
      case 'complete':
        return 'progress-success';
      case 'error':
        return 'progress-error';
      case 'analyzing':
        return 'progress-info';
      default:
        return 'progress-primary';
    }
  }, []);

  const isProcessing = progress && progress.status !== 'complete' && progress.status !== 'error';
  const hasError = progress?.status === 'error';
  const isComplete = progress?.status === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`card border bg-base-100 shadow-lg transition-all duration-200 hover:shadow-xl ${
        hasError
          ? 'border-error'
          : isComplete
            ? 'border-success'
            : isProcessing
              ? 'border-primary'
              : 'border-base-300'
      }`}
    >
      <div className="card-body p-4">
        {/* Main File Info Row */}
        <div className="flex items-center gap-4">
          {/* Enhanced File Icon */}
          <div className="relative">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl border text-2xl transition-all ${
                hasError
                  ? 'border-error/20 bg-error/10'
                  : isComplete
                    ? 'border-success/20 bg-success/10'
                    : isProcessing
                      ? 'border-primary/20 bg-primary/10'
                      : 'border-base-300 bg-base-200'
              }`}
            >
              {getFileTypeIcon(file.name)}
            </div>

            {/* Status Badge */}
            <div className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full border border-base-300 bg-base-100">
              <span className="text-sm">{getStatusIcon(progress?.status)}</span>
            </div>

            {/* Processing Animation */}
            {isProcessing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-xl border-2 border-transparent border-t-primary"
              />
            )}
          </div>

          {/* File Details */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <h5 className="truncate pr-2 font-semibold text-base-content">{file.name}</h5>
              <div className="flex items-center gap-2">
                <span className="rounded bg-base-200 px-2 py-1 text-base-content/60 text-xs">
                  {formatFileSize(file.size)}
                </span>
                {showDetails && (
                  <button
                    onClick={toggleExpanded}
                    className="btn btn-ghost btn-xs"
                    aria-label={state.isExpanded ? 'Collapse details' : 'Expand details'}
                  >
                    {state.isExpanded ? '▼' : '▶'}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Section */}
            {progress && (
              <div className="space-y-2">
                {/* Progress Bar */}
                {progress.status !== 'complete' && (
                  <div className="space-y-1">
                    <div className={`progress h-3 ${getProgressColor(progress.status)}`}>
                      <div className="progress-bar" style={{ width: `${progress.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${getStatusColor(progress.status)}`}>
                        {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base-content/60">
                          {Math.round(progress.progress)}%
                        </span>
                        {progress.estimatedTimeRemaining && (
                          <span className="text-base-content/50">
                            ~{formatTimeRemaining(progress.estimatedTimeRemaining)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {isComplete && (
                  <div className="flex items-center gap-2 text-success text-xs">
                    <span>✅</span>
                    <span>Upload complete - Ready for analysis</span>
                    {qualityAssessment && (
                      <span
                        className={`badge badge-sm ${getQualityColor(qualityAssessment.overallScore)}`}
                      >
                        {qualityAssessment.overallScore}% Quality
                      </span>
                    )}
                  </div>
                )}

                {hasError && (
                  <div className="rounded bg-error/10 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-error">{progress.error}</span>
                      {onRetry && (
                        <button onClick={onRetry} className="btn btn-error btn-xs">
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Preview Button */}
            {(onPreview || state.previewUrl) && (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={
                        onPreview || (() => setState((prev) => ({ ...prev, showPreview: true })))
                      }
                      className="btn btn-ghost btn-sm btn-circle"
                      aria-label={`Preview ${file.name}`}
                    >
                      👁️
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="rounded-lg bg-base-content px-3 py-2 text-base-100 text-xs shadow-lg"
                      sideOffset={5}
                    >
                      Preview file
                      <Tooltip.Arrow className="fill-base-content" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}

            {/* Quality Assessment Popover */}
            {qualityAssessment && (
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="btn btn-ghost btn-sm btn-circle">📊</button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="z-50 w-80 rounded-lg border border-base-300 bg-base-100 p-4 shadow-lg"
                    sideOffset={5}
                  >
                    <div className="space-y-3">
                      <h6 className="font-semibold">Quality Assessment</h6>

                      {/* Overall Score */}
                      <div className="flex items-center justify-between">
                        <span>Overall Score</span>
                        <span
                          className={`font-bold ${getQualityColor(qualityAssessment.overallScore)}`}
                        >
                          {qualityAssessment.overallScore}%
                        </span>
                      </div>

                      {/* Category Scores */}
                      <div className="space-y-2">
                        {qualityAssessment.categories.map((category, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{category.name}</span>
                              <span>{Math.round(category.score)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-base-300">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${category.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Top Recommendations */}
                      {qualityAssessment.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="font-medium text-sm">Top Recommendations</h6>
                          <ul className="space-y-1 text-xs">
                            {qualityAssessment.recommendations.slice(0, 3).map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-warning">•</span>
                                <span>{rec.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Popover.Arrow className="fill-base-100" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            )}

            {/* Remove Button */}
            {canRemove && (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={onRemove}
                      className="btn btn-ghost btn-sm btn-circle hover:btn-error transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="rounded-lg bg-base-content px-3 py-2 text-base-100 text-xs shadow-lg"
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

        {/* Expanded Details */}
        <AnimatePresence>
          {state.isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-base-300 border-t pt-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* File Metadata */}
                <div className="space-y-2">
                  <h6 className="font-medium text-sm">File Details</h6>
                  <div className="space-y-1 text-base-content/70 text-xs">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{file.type || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified:</span>
                      <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                    </div>
                    {processingETA && (
                      <div className="flex justify-between">
                        <span>ETA:</span>
                        <span>{formatTimeRemaining(processingETA.estimatedSeconds * 1000)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {state.previewUrl && (
                  <div className="space-y-2">
                    <h6 className="font-medium text-sm">Preview</h6>
                    <div className="h-24 w-full overflow-hidden rounded border bg-base-200">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={state.previewUrl}
                          alt={`Preview of ${file.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base-content/50">
                          <span className="text-2xl">{getFileTypeIcon(file.name)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Processing ETA Details */}
              {processingETA && (
                <div className="mt-4 rounded-lg bg-info/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-info">
                    <span>⏱️</span>
                    <span className="font-medium text-sm">Processing Estimate</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span>{formatTimeRemaining(processingETA.estimatedSeconds * 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span>{Math.round(processingETA.confidence * 100)}%</span>
                    </div>
                  </div>
                  {processingETA.factors.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-xs">Factors:</span>
                      <ul className="mt-1 space-y-1 text-xs">
                        {processingETA.factors.map((factor, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-info" />
                            <span>{factor.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {state.showPreview && state.previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setState((prev) => ({ ...prev, showPreview: false }))}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-base-100 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{file.name}</h3>
                <button
                  onClick={() => setState((prev) => ({ ...prev, showPreview: false }))}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>

              {file.type.startsWith('image/') ? (
                <img
                  src={state.previewUrl}
                  alt={`Preview of ${file.name}`}
                  className="mx-auto max-h-[70vh] max-w-full object-contain"
                />
              ) : (
                <div className="flex h-96 w-full items-center justify-center rounded bg-base-200">
                  <div className="text-center">
                    <span className="text-6xl">{getFileTypeIcon(file.name)}</span>
                    <p className="mt-2 text-base-content/60">Preview not available</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedFileUploadCard;
