/**
 * Custom hook for handling resume download functionality
 */

import { useCallback, useState } from 'react';
import type { ResumeAnalysisResponse } from '../lib/types/resume-optimizer';
import {
  type DownloadOptions,
  type DownloadResult,
  ResumeDownloadService,
} from '../services/resumeDownloadService';

export interface UseResumeDownloadOptions {
  onDownloadStart?: () => void;
  onDownloadSuccess?: (result: DownloadResult) => void;
  onDownloadError?: (error: string) => void;
}

export interface UseResumeDownloadReturn {
  isDownloading: boolean;
  downloadError: string | null;
  downloadResume: (
    resumeContent: string,
    analysisResult: ResumeAnalysisResponse | null,
    options: DownloadOptions
  ) => Promise<void>;
  downloadPDF: (
    resumeContent: string,
    analysisResult?: ResumeAnalysisResponse | null,
    includeAnalysis?: boolean
  ) => Promise<void>;
  downloadDOCX: (
    resumeContent: string,
    analysisResult?: ResumeAnalysisResponse | null,
    includeAnalysis?: boolean
  ) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing resume download functionality
 */
export function useResumeDownload(options: UseResumeDownloadOptions = {}): UseResumeDownloadReturn {
  const { onDownloadStart, onDownloadSuccess, onDownloadError } = options;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const downloadResume = useCallback(
    async (
      resumeContent: string,
      analysisResult: ResumeAnalysisResponse | null,
      downloadOptions: DownloadOptions
    ): Promise<void> => {
      try {
        // Clear previous errors
        setDownloadError(null);

        // Validate content
        const validation = ResumeDownloadService.validateResumeContent(resumeContent);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // Start download
        setIsDownloading(true);
        onDownloadStart?.();

        // Generate suggested filename if not provided
        if (!downloadOptions.fileName) {
          downloadOptions.fileName = ResumeDownloadService.getSuggestedFileName(
            resumeContent,
            analysisResult
          );
        }

        // Perform download
        const result = await ResumeDownloadService.downloadResume(
          resumeContent,
          analysisResult,
          downloadOptions
        );

        if (result.success) {
          onDownloadSuccess?.(result);
        } else {
          throw new Error(result.error || 'Download failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        setDownloadError(errorMessage);
        onDownloadError?.(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [onDownloadStart, onDownloadSuccess, onDownloadError]
  );

  const downloadPDF = useCallback(
    async (
      resumeContent: string,
      analysisResult: ResumeAnalysisResponse | null = null,
      includeAnalysis = false
    ): Promise<void> => {
      await downloadResume(resumeContent, analysisResult, {
        format: 'pdf',
        includeAnalysis,
        includeSuggestions: includeAnalysis,
      });
    },
    [downloadResume]
  );

  const downloadDOCX = useCallback(
    async (
      resumeContent: string,
      analysisResult: ResumeAnalysisResponse | null = null,
      includeAnalysis = false
    ): Promise<void> => {
      await downloadResume(resumeContent, analysisResult, {
        format: 'docx',
        includeAnalysis,
        includeSuggestions: includeAnalysis,
      });
    },
    [downloadResume]
  );

  const clearError = useCallback(() => {
    setDownloadError(null);
  }, []);

  return {
    isDownloading,
    downloadError,
    downloadResume,
    downloadPDF,
    downloadDOCX,
    clearError,
  };
}

export default useResumeDownload;
