/**
 * Resume Analysis Request Component
 * Demonstrates the integration with backend AI analysis module
 * Includes loading states, error handling, and progress tracking
 */

'use client';

import React, { useEffect, useState } from 'react';
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
    isReanalyzing,
    loadingState,
    error,
    isBackendAvailable,
    performAnalysis,
    performReanalysis,
    clearError,
    checkBackend,
  } = useResumeAnalysis();

  const { isLoading, progress, stage, message, progressColor, stageIcon, stageDescription } =
    useAnalysisLoadingState(loadingState);

  const { getErrorMessage, getErrorSeverity, shouldRetry } = useAnalysisErrorHandler();

  const [retryCount, setRetryCount] = useState(0);
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
    if (error && onError) {
      onError(getErrorMessage(error));
    }
  }, [error, onError, getErrorMessage]);

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
        description: targetJob.description?.trim(),
        company: targetJob.company?.trim(),
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
    const delay = Math.pow(2, retryCount) * 1000;
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
              <span className="text-2xl">{stageIcon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{message}</span>
                  <span className="text-sm opacity-75">{progress}%</span>
                </div>
                <progress
                  className={`progress ${progressColor} w-full`}
                  value={progress}
                  max="100"
                />
              </div>
            </div>
            <p className="text-sm opacity-75 ml-11">{stageDescription}</p>

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
              getErrorSeverity(error) === 'error'
                ? 'alert-error'
                : getErrorSeverity(error) === 'warning'
                  ? 'alert-warning'
                  : 'alert-info'
            } mb-4`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {getErrorSeverity(error) === 'error'
                  ? '❌'
                  : getErrorSeverity(error) === 'warning'
                    ? '⚠️'
                    : 'ℹ️'}
              </span>
              <div className="flex-1">
                <div className="font-semibold">Analysis Error</div>
                <div className="text-sm">{getErrorMessage(error)}</div>
                {error.details && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer opacity-75">
                      Technical Details
                    </summary>
                    <pre className="text-xs mt-1 opacity-60 whitespace-pre-wrap">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
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
          <div className="bg-base-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">📊</span>
              Analysis Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analysisResult.overallScore}</div>
                <div className="text-xs opacity-75">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{analysisResult.atsScore}</div>
                <div className="text-xs opacity-75">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {analysisResult.keywordAnalysis.score}
                </div>
                <div className="text-xs opacity-75">Keyword Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
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
        <div className="collapse collapse-arrow bg-base-200">
          <input
            type="checkbox"
            checked={showAdvancedOptions}
            onChange={(e) => setShowAdvancedOptions(e.target.checked)}
          />
          <div className="collapse-title text-sm font-medium">Advanced Options</div>
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
        <div className="card-actions justify-end mt-6">
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
                disabled={isReanalyzing}
              >
                {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze'}
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
            <summary className="text-xs cursor-pointer opacity-50">Debug Information</summary>
            <pre className="text-xs mt-2 opacity-40 whitespace-pre-wrap bg-base-300 p-2 rounded">
              {JSON.stringify(
                {
                  isBackendAvailable,
                  isAnalyzing,
                  isReanalyzing,
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
