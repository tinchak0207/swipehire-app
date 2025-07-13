/**
 * Resume Analysis Request Component
 * Demonstrates the integration with backend AI analysis module
 * Includes loading states, error handling, and progress tracking
 */

'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  useAnalysisErrorHandler,
  useAnalysisLoadingState,
  useResumeAnalysis,
} from '@/hooks/useResumeAnalysis';
import type { ResumeAnalysisRequest, TargetJobInfo } from '@/lib/types/resume-optimizer';

interface AnalysisRequestComponentProps {
  resumeText: string;
  targetJob: TargetJobInfo;
  onAnalysisComplete?: (analysisId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const AnalysisRequestComponent: React.FC<AnalysisRequestComponentProps> = ({
  resumeText,
  targetJob,
  onAnalysisComplete,
  onError,
  className = '',
}) => {
  const {
    analysisResult,
    isAnalyzing,
    loadingState,
    error,
    isBackendAvailable,
    clearError,
    checkBackend,
    startAnalysis: performAnalysis,
    startReanalysis: performReanalysis,
  } = useResumeAnalysis();

  const { isLoading, progress, stage, message } = useAnalysisLoadingState(loadingState);

  const [retryCount, setRetryCount] = useState(0);
  const { errorMessage } = useAnalysisErrorHandler(error, () => setRetryCount((prev) => prev + 1));
  const errorSeverity = (error as any)?.severity || (error ? 'error' : undefined);
  const shouldRetry = (err: typeof error): boolean =>
    !!err && ((err as any).statusCode ? (err as any).statusCode >= 500 : false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Check backend availability on mount
  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Handle analysis completion
  useEffect(() => {
    if (analysisResult && onAnalysisComplete) {
      onAnalysisComplete(analysisResult.id);
    }
  }, [analysisResult, onAnalysisComplete]);

  // Handle errors
  useEffect(() => {
    if (error && onError && errorMessage) {
      onError(errorMessage);
    }
  }, [error, onError, errorMessage]);

  /**
   * Start initial analysis
   */
  const handleStartAnalysis = async () => {
    if (!resumeText.trim()) {
      onError?.('Please provide resume text for analysis.');
      return;
    }

    if (!targetJob.title.trim()) {
      onError?.('Please specify a target job title.');
      return;
    }

    const request: ResumeAnalysisRequest = {
      resumeText: resumeText.trim(),
      targetJob: {
        title: targetJob.title.trim(),
        keywords: targetJob.keywords?.trim() || '',
        description: targetJob.description?.trim() || '',
        company: targetJob.company?.trim() || '',
      },
    };

    const result = await performAnalysis(request);
    if (result) {
      setRetryCount(0);
    }
  };

  /**
   * Retry analysis with exponential backoff
   */
  const handleRetryAnalysis = async () => {
    if (retryCount >= 3) {
      onError?.('Maximum retry attempts reached. Please try again later.');
      return;
    }

    // Exponential backoff delay
    const delay = 2 ** retryCount * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    setRetryCount((prev) => prev + 1);
    await handleStartAnalysis();
  };

  /**
   * Perform re-analysis with updated content
   */
  const handleReanalysis = async (updatedResumeText: string) => {
    if (!analysisResult) {
      onError?.('No previous analysis found for re-analysis.');
      return;
    }

    const result = await performReanalysis(updatedResumeText, analysisResult.id, targetJob);

    if (result) {
      setRetryCount(0);
    }
  };

  /**
   * Clear error and reset state
   */
  const handleClearError = () => {
    clearError();
    setRetryCount(0);
  };

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Resume Analysis
          {isBackendAvailable === false && <div className="badge badge-warning">Local Mode</div>}
          {isBackendAvailable === true && <div className="badge badge-success">AI Enhanced</div>}
        </h2>

        {/* Backend Status */}
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {isBackendAvailable === null ? '⏳' : isBackendAvailable ? '🚀' : '🔧'}
            </span>
            <div>
              <div className="font-semibold">
                {isBackendAvailable === null && 'Checking AI Service...'}
                {isBackendAvailable === true && 'AI-Powered Analysis Available'}
                {isBackendAvailable === false && 'Using Local Analysis'}
              </div>
              <div className="text-sm opacity-75">
                {isBackendAvailable === null && 'Verifying connection to backend AI service'}
                {isBackendAvailable === true && 'Connected to advanced AI analysis engine'}
                {isBackendAvailable === false && 'Backend unavailable, using local processing'}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        {isLoading && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold">{message}</span>
                  <span className="text-sm opacity-75">{progress}%</span>
                </div>
                <progress className={'progress w-full'} value={progress} max="100" />
              </div>
            </div>
            <p className="text-sm opacity-75 ml-11" />

            {/* Stage-specific information */}
            {stage === 'analyzing' && (
              <div className="mt-2 ml-11">
                <div className="text-xs opacity-60">
                  {isBackendAvailable
                    ? 'Using advanced AI models for comprehensive analysis...'
                    : 'Processing with local analysis engine...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            className={`alert ${
              errorSeverity === 'error'
                ? 'alert-error'
                : errorSeverity === 'warning'
                  ? 'alert-warning'
                  : 'alert-info'
            } mb-4`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {errorSeverity === 'error' ? '❌' : errorSeverity === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <div className="font-semibold">Analysis Error</div>
                <div className="text-sm">{errorMessage}</div>
                {error.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs opacity-75">
                      Technical Details
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap text-xs opacity-60">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-sm btn-outline" onClick={handleClearError}>
                Dismiss
              </button>
              {shouldRetry(error) && retryCount < 3 && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleRetryAnalysis}
                  disabled={isLoading}
                >
                  Retry {retryCount > 0 && `(${retryCount}/3)`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results Summary */}
        {analysisResult && !isLoading && (
          <div className="mb-4 rounded-lg bg-base-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <span className="text-lg">📊</span>
              Analysis Results
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="font-bold text-2xl text-primary">{analysisResult.overallScore}</div>
                <div className="text-xs opacity-75">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-secondary">{analysisResult.atsScore}</div>
                <div className="text-xs opacity-75">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-accent">
                  {analysisResult.keywordAnalysis.score}
                </div>
                <div className="text-xs opacity-75">Keyword Match</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-info">
                  {analysisResult.suggestions.length}
                </div>
                <div className="text-xs opacity-75">Suggestions</div>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-60">
              Analysis completed in {analysisResult.processingTime}ms
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="collapse-arrow collapse bg-base-200">
          <input
            type="checkbox"
            checked={showAdvancedOptions}
            onChange={(e) => setShowAdvancedOptions(e.target.checked)}
          />
          <div className="collapse-title font-medium text-sm">Advanced Options</div>
          <div className="collapse-content">
            <div className="space-y-3">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Include ATS Analysis</span>
                  <input type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Include Grammar Check</span>
                  <input type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Include Quantitative Analysis</span>
                  <input type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Include Format Analysis</span>
                  <input type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions mt-6 justify-end">
          {!analysisResult && (
            <button
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              onClick={handleStartAnalysis}
              disabled={isLoading || !resumeText.trim() || !targetJob.title.trim()}
            >
              {isLoading ? 'Analyzing...' : 'Start Analysis'}
            </button>
          )}

          {analysisResult && !isLoading && (
            <>
              <button
                className="btn btn-outline"
                onClick={() => handleReanalysis(resumeText)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onAnalysisComplete?.(analysisResult.id)}
              >
                View Full Report
              </button>
            </>
          )}
        </div>

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs opacity-50">Debug Information</summary>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-base-300 p-2 text-xs opacity-40">
              {JSON.stringify(
                {
                  isBackendAvailable,
                  isAnalyzing,
                  loadingState,
                  error: error
                    ? {
                        message: error.message,
                        code: error.code,
                        statusCode: error.statusCode,
                      }
                    : null,
                  retryCount,
                  resumeTextLength: resumeText.length,
                  targetJob,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default AnalysisRequestComponent;
