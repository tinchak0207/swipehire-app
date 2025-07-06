/**
 * Custom hook for managing resume analysis with backend API integration
 * Provides comprehensive state management and error handling for resume analysis
 */

import { useCallback, useRef, useState } from 'react';
import type { ResumeAnalysisRequest, ResumeAnalysisResponse } from '../lib/types/resume-optimizer';

export interface AnalysisLoadingState {
  isLoading: boolean;
  progress: number;
  stage?: string;
  message?: string;
}

import {
  analyzeResume,
  checkBackendAvailability,
  ResumeAnalysisError,
  reanalyzeResume,
} from '../services/resumeOptimizerService';

export interface UseResumeAnalysisState {
  // Analysis state
  isAnalyzing: boolean;
  analysisResult: ResumeAnalysisResponse | null;
  error: ResumeAnalysisError | null;

  // Loading state details
  loadingState: AnalysisLoadingState;

  // Backend availability
  isBackendAvailable: boolean | null;

  // Request tracking
  currentRequestId: string | null;
}

export interface UseResumeAnalysisActions {
  // Main analysis function
  startAnalysis: (request: ResumeAnalysisRequest) => Promise<ResumeAnalysisResponse | null>;

  // Re-analysis function
  startReanalysis: (
    resumeText: string,
    originalAnalysisId: string,
    targetJob: ResumeAnalysisRequest['targetJob']
  ) => Promise<ResumeAnalysisResponse | null>;

  // Utility functions
  cancelAnalysis: () => void;
  clearError: () => void;
  clearResults: () => void;
  checkBackend: () => Promise<boolean>;

  // State reset
  reset: () => void;
}

export interface UseResumeAnalysisReturn extends UseResumeAnalysisState, UseResumeAnalysisActions {}

/**
 * Custom hook for resume analysis with comprehensive error handling and state management
 */
export const useResumeAnalysis = (): UseResumeAnalysisReturn => {
  // State management
  const [state, setState] = useState<UseResumeAnalysisState>({
    isAnalyzing: false,
    analysisResult: null,
    error: null,
    loadingState: {
      isLoading: false,
      progress: 0,
    },
    isBackendAvailable: null,
    currentRequestId: null,
  });

  // Ref to track current request for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Update loading state during analysis
   */
  const updateLoadingState = useCallback((loadingState: AnalysisLoadingState) => {
    setState((prev) => ({
      ...prev,
      loadingState,
      isAnalyzing: loadingState.isLoading,
    }));
  }, []);

  /**
   * Check backend availability
   */
  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await checkBackendAvailability();
      setState((prev) => ({
        ...prev,
        isBackendAvailable: isAvailable,
      }));
      return isAvailable;
    } catch (error) {
      console.error('Error checking backend availability:', error);
      setState((prev) => ({
        ...prev,
        isBackendAvailable: false,
      }));
      return false;
    }
  }, []);

  /**
   * Start resume analysis
   */
  const startAnalysis = useCallback(
    async (request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse | null> => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const requestId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Reset state
      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        analysisResult: null,
        error: null,
        currentRequestId: requestId,
        loadingState: {
          isLoading: true,
          progress: 0,
          stage: 'parsing',
          message: 'Starting analysis...',
        },
      }));

      try {
        // Perform analysis with progress tracking
        const result = await analyzeResume(request, (state) =>
          updateLoadingState(state as AnalysisLoadingState)
        );

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        // Update state with successful result
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result,
          error: null,
          currentRequestId: null,
          loadingState: {
            isLoading: false,
            progress: 100,
            message: 'Analysis complete!',
          },
        }));

        return result;
      } catch (error) {
        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const analysisError =
          error instanceof ResumeAnalysisError
            ? error
            : new ResumeAnalysisError(
                'An unexpected error occurred during analysis.',
                'UNEXPECTED_ERROR',
                500,
                { originalError: error }
              );

        // Update state with error
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: analysisError,
          currentRequestId: null,
          loadingState: {
            isLoading: false,
            progress: 0,
            message: 'Analysis failed',
          },
        }));

        console.error('Resume analysis failed:', analysisError);
        return null;
      }
    },
    [updateLoadingState]
  );

  /**
   * Start resume re-analysis
   */
  const startReanalysis = useCallback(
    async (
      resumeText: string,
      originalAnalysisId: string,
      targetJob: ResumeAnalysisRequest['targetJob']
    ): Promise<ResumeAnalysisResponse | null> => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const requestId = `reanalysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Reset state
      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        currentRequestId: requestId,
        loadingState: {
          isLoading: true,
          progress: 0,
          stage: 'parsing',
          message: 'Starting re-analysis...',
        },
      }));

      try {
        // Perform re-analysis with progress tracking
        const result = await reanalyzeResume(resumeText, originalAnalysisId, targetJob, (state) =>
          updateLoadingState(state as AnalysisLoadingState)
        );

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        // Update state with successful result
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: result,
          error: null,
          currentRequestId: null,
          loadingState: {
            isLoading: false,
            progress: 100,
            message: 'Re-analysis complete!',
          },
        }));

        return result;
      } catch (error) {
        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const analysisError =
          error instanceof ResumeAnalysisError
            ? error
            : new ResumeAnalysisError(
                'An unexpected error occurred during re-analysis.',
                'UNEXPECTED_ERROR',
                500,
                { originalError: error }
              );

        // Update state with error
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: analysisError,
          currentRequestId: null,
          loadingState: {
            isLoading: false,
            progress: 0,
            message: 'Re-analysis failed',
          },
        }));

        console.error('Resume re-analysis failed:', analysisError);
        return null;
      }
    },
    [updateLoadingState]
  );

  /**
   * Cancel current analysis
   */
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isAnalyzing: false,
      currentRequestId: null,
      loadingState: {
        isLoading: false,
        progress: 0,
        message: 'Analysis cancelled',
      },
    }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Clear analysis results
   */
  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      analysisResult: null,
      error: null,
    }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      isAnalyzing: false,
      analysisResult: null,
      error: null,
      loadingState: {
        isLoading: false,
        progress: 0,
      },
      isBackendAvailable: null,
      currentRequestId: null,
    });
  }, []);

  return {
    // State
    ...state,

    // Actions
    startAnalysis,
    startReanalysis,
    cancelAnalysis,
    clearError,
    clearResults,
    checkBackend,
    reset,
  };
};

/**
 * Utility hook for simplified resume analysis
 * Provides a simpler interface for basic analysis needs
 */
export const useSimpleResumeAnalysis = () => {
  const { isAnalyzing, analysisResult, error, loadingState, startAnalysis, clearError, reset } =
    useResumeAnalysis();

  const analyze = useCallback(
    async (
      resumeText: string,
      targetJobTitle: string,
      targetJobKeywords?: string,
      options?: {
        targetJobDescription?: string;
        targetJobCompany?: string;
        userId?: string;
        templateId?: string;
      }
    ): Promise<ResumeAnalysisResponse | null> => {
      const request: ResumeAnalysisRequest = {
        resumeText,
        targetJob: {
          title: targetJobTitle,
          keywords: targetJobKeywords || '',
          description: options?.targetJobDescription || '',
          company: options?.targetJobCompany || '',
        },
        userId: options?.userId || '',
        templateId: options?.templateId || '',
      };

      return await startAnalysis(request);
    },
    [startAnalysis]
  );

  return {
    isAnalyzing,
    analysisResult,
    error,
    loadingState,
    analyze,
    clearError,
    reset,
  };
};

/**
 * Hook to manage and display loading state from useResumeAnalysis
 */
export const useAnalysisLoadingState = (loadingState: AnalysisLoadingState) => {
  // This hook can be expanded to include more complex logic for displaying loading states
  return {
    isLoading: loadingState.isLoading,
    progress: loadingState.progress,
    stage: loadingState.stage,
    message: loadingState.message,
  };
};

/**
 * Hook to manage and display error state from useResumeAnalysis
 */
export const useAnalysisErrorHandler = (
  error: ResumeAnalysisError | null,
  clearError: () => void
) => {
  // This hook can be expanded to include more complex error handling, e.g., logging to a service
  return {
    error,
    clearError,
    hasError: error !== null,
    errorMessage: error?.message,
    errorDetails: error?.details,
  };
};

export default useResumeAnalysis;
