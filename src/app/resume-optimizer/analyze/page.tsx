'use client';

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useResumeAnalysis } from '@/hooks/useResumeAnalysis';
import type { TargetJobInfo, UserProfileData } from '@/lib/types/resume-optimizer';

interface AnalyzePageData {
  resumeText: string;
  targetJob: TargetJobInfo;
  source: 'upload' | 'profile' | 'template';
  templateId?: string;
  templateName?: string;
  profileData?: UserProfileData;
}

/**
 * Resume analysis page component
 * Handles the AI analysis process and displays progress using enhanced backend integration
 */
const ResumeAnalyzePage: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyzePageData | null>(null);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  // Use the enhanced resume analysis hook
  const {
    analysisResult,
    loadingState,
    error,
    isBackendAvailable,
    startAnalysis: startAnalysisFn,
    clearError,
    checkBackend,
  } = useResumeAnalysis();

  // Extract loading state info
  const isLoading = loadingState.isLoading;
  const progress = loadingState.progress;
  const stage = loadingState.stage;
  const message = loadingState.message;

  // Loading state visual elements
  const stageIcon = isLoading ? '⏳' : '✅';
  const progressColor = isLoading ? 'progress-primary' : 'progress-success';
  const stageDescription = stage
    ? `Current stage: ${stage.replace('_', ' ')}`
    : 'Starting analysis...';

  // Simple error handling
  const getErrorMessage = (error: any) => error?.message || 'An unknown error occurred';
  const shouldRetry = (error: any) => error?.retryable !== false;

  useEffect(() => {
    // Check backend availability on mount
    checkBackend();

    // Load data from sessionStorage
    const storedData = sessionStorage.getItem('resumeOptimizerData');
    if (storedData) {
      try {
        const parsedData: AnalyzePageData = JSON.parse(storedData);
        setData(parsedData);
        // Start analysis automatically
        if (!hasStartedAnalysis) {
          setHasStartedAnalysis(true);
          startAnalysisFn({
            resumeText: parsedData.resumeText,
            targetJob: parsedData.targetJob,
            ...(parsedData.templateId && { templateId: parsedData.templateId }),
          });
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, [checkBackend, hasStartedAnalysis, startAnalysisFn]);

  // Handle successful analysis completion
  useEffect(() => {
    if (analysisResult && data) {
      // Store result and navigate to report page
      sessionStorage.setItem(
        'resumeAnalysisResult',
        JSON.stringify({
          ...data,
          analysisResult,
        })
      );

      // Navigate to report page after a short delay
      setTimeout(() => {
        router.push('/resume-optimizer/report');
      }, 1500);
    }
  }, [analysisResult, data, router]);

  const handleRetry = useCallback((): void => {
    if (data) {
      clearError();
      startAnalysisFn({
        resumeText: data.resumeText,
        targetJob: data.targetJob,
        ...(data.templateId && { templateId: data.templateId }),
      });
    }
  }, [data, startAnalysisFn, clearError]);

  const getSourceDescription = (source: string): string => {
    switch (source) {
      case 'upload':
        return 'Uploaded Resume';
      case 'profile':
        return 'Profile Import';
      case 'template':
        return 'Template';
      default:
        return 'Resume';
    }
  };

  // Show loading state while waiting for data
  if (!data && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg mb-4 text-primary" />
              <p className="text-lg text-gray-600">Loading analysis data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <Link href="/resume-optimizer" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Link>
          <h1 className="font-bold text-3xl text-gray-800">Resume Analysis</h1>
          {isBackendAvailable !== null && (
            <div className={`badge ml-4 ${isBackendAvailable ? 'badge-success' : 'badge-warning'}`}>
              {isBackendAvailable ? 'AI Enhanced' : 'Local Mode'}
            </div>
          )}
        </div>

        {error ? (
          <div className="card bg-white shadow-lg">
            <div className="card-body text-center">
              <ExclamationTriangleIcon className="mx-auto mb-4 h-16 w-16 text-error" />
              <h2 className="mb-2 font-bold text-2xl text-gray-800">Analysis Failed</h2>
              <p className="mb-6 text-gray-600">{getErrorMessage(error)}</p>
              <div className="flex justify-center gap-4">
                {shouldRetry(error) && (
                  <button onClick={handleRetry} className="btn btn-primary">
                    Try Again
                  </button>
                )}
                <Link href="/resume-optimizer" className="btn btn-outline">
                  Go Back
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Progress Card */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800 text-xl">
                    {isLoading ? 'Analyzing Your Resume...' : 'Analysis Complete!'}
                  </h2>
                  <div className="text-2xl">{stageIcon}</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-gray-600 text-sm">
                    <span>{stageDescription}</span>
                    <span>{progress}%</span>
                  </div>
                  <progress
                    className={`progress ${progressColor} w-full`}
                    value={progress}
                    max="100"
                  />
                </div>

                {/* Current Message */}
                {message && <div className="mb-4 text-gray-600 text-sm">{message}</div>}

                {/* Analysis Details */}
                {data && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium text-gray-800">Analysis Details</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-gray-600">Source:</span>
                        <span className="ml-2 font-medium">
                          {getSourceDescription(data.source)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target Job:</span>
                        <span className="ml-2 font-medium">{data.targetJob.title}</span>
                      </div>
                      {data.targetJob.company && (
                        <div>
                          <span className="text-gray-600">Company:</span>
                          <span className="ml-2 font-medium">{data.targetJob.company}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Resume Length:</span>
                        <span className="ml-2 font-medium">
                          {data.resumeText.split(' ').length} words
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {isLoading && (
              <div className="card border border-blue-200 bg-blue-50">
                <div className="card-body">
                  <div className="flex items-start">
                    <div className="loading loading-spinner loading-sm mr-3 mt-1 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-800">AI Analysis in Progress</h3>
                      <p className="mt-1 text-blue-700 text-sm">
                        Our AI is carefully analyzing your resume against the target job
                        requirements. This process typically takes 30-60 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="card border border-green-200 bg-green-50">
                <div className="card-body">
                  <div className="flex items-start">
                    <CheckCircleIcon className="mt-1 mr-3 h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Analysis Complete!</h3>
                      <p className="mt-1 text-green-700 text-sm">
                        Your resume has been successfully analyzed. Redirecting to the results
                        page...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips While Waiting */}
            {isLoading && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h3 className="mb-3 font-medium text-gray-800">💡 While You Wait...</h3>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p>• Our AI analyzes over 50 different aspects of your resume</p>
                    <p>• We compare your skills against job requirements</p>
                    <p>• We check for ATS (Applicant Tracking System) compatibility</p>
                    <p>• We provide specific, actionable improvement suggestions</p>
                    <p>• Results include a detailed score breakdown and optimization tips</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzePage;
