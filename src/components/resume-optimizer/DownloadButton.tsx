/**
 * Download Button Component for Resume Optimizer
 * Provides download functionality for PDF and DOCX formats
 */

'use client';

import { ArrowDownTrayIcon, DocumentIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useResumeDownload } from '@/hooks/useResumeDownload';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

export interface DownloadButtonProps {
  resumeContent: string;
  analysisResult?: ResumeAnalysisResponse | null;
  format: 'pdf' | 'docx';
  includeAnalysis?: boolean;
  adoptedSuggestions?: string[];
  fileName?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onDownloadStart?: () => void;
  onDownloadSuccess?: (fileName: string) => void;
  onDownloadError?: (error: string) => void;
  children?: React.ReactNode;
}

/**
 * Individual download button for a specific format
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  resumeContent,
  analysisResult,
  format,
  includeAnalysis = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onDownloadStart,
  onDownloadSuccess,
  onDownloadError,
  children,
}) => {
  const { isDownloading, downloadResume, clearError } = useResumeDownload({
    onDownloadStart: onDownloadStart || (() => {}),
    onDownloadSuccess: (result) => {
      if (result.fileName) {
        onDownloadSuccess?.(result.fileName);
      }
    },
    onDownloadError: onDownloadError || (() => {}),
  });

  const handleDownload = async (): Promise<void> => {
    clearError();

    await downloadResume(resumeContent, analysisResult || null, {
      format,
      includeAnalysis,
      includeSuggestions: includeAnalysis,
    });
  };

  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'ghost':
        return 'btn-ghost';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      default:
        return '';
    }
  };

  const getIcon = (): React.ReactNode => {
    if (format === 'pdf') {
      return <DocumentIcon className="w-4 h-4" />;
    }
    return <DocumentTextIcon className="w-4 h-4" />;
  };

  const getDefaultText = (): string => {
    return format === 'pdf' ? 'Download PDF' : 'Download DOCX';
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isDownloading || !resumeContent.trim()}
      className={`btn ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      title={`Download resume as ${format.toUpperCase()}`}
    >
      {isDownloading ? (
        <>
          <span className="loading loading-spinner loading-sm" />
          Generating...
        </>
      ) : (
        <>
          {getIcon()}
          {children || getDefaultText()}
        </>
      )}
    </button>
  );
};

export interface DownloadDropdownProps {
  resumeContent: string;
  analysisResult?: ResumeAnalysisResponse | null;
  includeAnalysis?: boolean;
  adoptedSuggestions?: string[];
  fileName?: string;
  disabled?: boolean;
  className?: string;
  onDownloadStart?: () => void;
  onDownloadSuccess?: (fileName: string) => void;
  onDownloadError?: (error: string) => void;
}

/**
 * Dropdown component with both PDF and DOCX download options
 */
export const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  resumeContent,
  analysisResult,
  includeAnalysis = false,
  disabled = false,
  className = '',
  onDownloadStart,
  onDownloadSuccess,
  onDownloadError,
}) => {
  const { isDownloading, downloadPDF, downloadDOCX, clearError } = useResumeDownload({
    onDownloadStart: onDownloadStart || (() => {}),
    onDownloadSuccess: (result) => {
      if (result.fileName) {
        onDownloadSuccess?.(result.fileName);
      }
    },
    onDownloadError: onDownloadError || (() => {}),
  });

  const handlePDFDownload = async (): Promise<void> => {
    clearError();
    await downloadPDF(resumeContent, analysisResult, includeAnalysis);
  };

  const handleDOCXDownload = async (): Promise<void> => {
    clearError();
    await downloadDOCX(resumeContent, analysisResult, includeAnalysis);
  };

  const isDisabled = disabled || isDownloading || !resumeContent.trim();

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-primary ${isDisabled ? 'btn-disabled' : ''}`}
        title="Download resume"
      >
        {isDownloading ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            Generating...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download
          </>
        )}
      </div>

      {!isDisabled && (
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button
              onClick={handlePDFDownload}
              className="flex items-center space-x-2"
              disabled={isDownloading}
            >
              <DocumentIcon className="w-4 h-4" />
              <span>Download as PDF</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleDOCXDownload}
              className="flex items-center space-x-2"
              disabled={isDownloading}
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>Download as DOCX</span>
            </button>
          </li>
          {includeAnalysis && (
            <>
              <div className="divider my-1" />
              <li className="menu-title">
                <span className="text-xs">Includes analysis report</span>
              </li>
            </>
          )}
        </ul>
      )}

      {onDownloadError && (
        <div className="alert alert-error mt-2">
          <span className="text-sm">An error occurred during download.</span>
        </div>
      )}
    </div>
  );
};

export interface DownloadOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContent: string;
  analysisResult?: ResumeAnalysisResponse | null;
  onDownloadSuccess?: (fileName: string) => void;
  onDownloadError?: (error: string) => void;
}

/**
 * Modal component for advanced download options
 */
export const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  isOpen,
  onClose,
  resumeContent,
  analysisResult,
  onDownloadSuccess,
  onDownloadError,
}) => {
  const [includeAnalysis, setIncludeAnalysis] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState<'pdf' | 'docx'>('pdf');

  const { isDownloading, downloadResume, clearError } = useResumeDownload({
    onDownloadSuccess: (result) => {
      if (result.fileName) {
        onDownloadSuccess?.(result.fileName);
        onClose();
      }
    },
    onDownloadError: onDownloadError || (() => {}),
  });

  React.useEffect(() => {
    if (isOpen && resumeContent) {
      // Set suggested filename when modal opens
      const suggested = fileName || 'resume_optimized';
      setFileName(suggested);
    }
  }, [isOpen, resumeContent, fileName]);

  const handleDownload = async (): Promise<void> => {
    clearError();

    const options: {
      format: 'pdf' | 'docx';
      includeAnalysis: boolean;
      includeSuggestions: boolean;
      fileName?: string;
    } = {
      format: selectedFormat,
      includeAnalysis,
      includeSuggestions: includeAnalysis,
    };
    if (fileName.trim()) {
      options.fileName = fileName.trim();
    }
    await downloadResume(resumeContent, analysisResult || null, options);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Download Options</h3>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Format</span>
            </label>
            <div className="flex space-x-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  className="radio radio-primary"
                  checked={selectedFormat === 'pdf'}
                  onChange={() => setSelectedFormat('pdf')}
                />
                <span className="label-text ml-2">PDF</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  className="radio radio-primary"
                  checked={selectedFormat === 'docx'}
                  onChange={() => setSelectedFormat('docx')}
                />
                <span className="label-text ml-2">DOCX</span>
              </label>
            </div>
          </div>

          {/* File Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">File Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter file name (without extension)"
              className="input input-bordered"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          {/* Include Analysis */}
          {analysisResult && (
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text font-medium">Include Analysis Report</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={includeAnalysis}
                  onChange={(e) => setIncludeAnalysis(e.target.checked)}
                />
              </label>
              <label className="label">
                <span className="label-text-alt">
                  Includes scores, strengths, weaknesses, and suggestions
                </span>
              </label>
            </div>
          )}

          {/* Adopted Suggestions Info */}
          {includeAnalysis &&
            analysisResult?.suggestions &&
            analysisResult.suggestions.length > 0 && (
              <div className="alert alert-info">
                <span className="text-sm">
                  Adopted suggestions will be highlighted in the report
                </span>
              </div>
            )}

          {/* Error Display */}
          {onDownloadError && (
            <div className="alert alert-error">
              <span className="text-sm">An error occurred during download.</span>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isDownloading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={isDownloading || !resumeContent.trim()}
          >
            {isDownloading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Generating...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadButton;
