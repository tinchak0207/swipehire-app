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
import type {
  TargetJobInfo,
  UserProfileData,
} from '@/lib/types/resume-optimizer';
import { useResumeAnalysis } from '@/hooks/useResumeAnalysis';

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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
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
        <div className="flex items-center mb-8">
          <Link href="/resume-optimizer" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Resume Analysis</h1>
          {isBackendAvailable !== null && (
            <div className={`badge ml-4 ${isBackendAvailable ? 'badge-success' : 'badge-warning'}`}>
              {isBackendAvailable ? 'AI Enhanced' : 'Local Mode'}
            </div>
          )}
        </div>

        {error ? (
          <div className="card bg-white shadow-lg">
            <div className="card-body text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-error mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
              <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>
              <div className="flex gap-4 justify-center">
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {isLoading ? 'Analyzing Your Resume...' : 'Analysis Complete!'}
                  </h2>
                  <div className="text-2xl">{stageIcon}</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
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
                {message && (
                  <div className="text-sm text-gray-600 mb-4">
                    {message}
                  </div>
                )}

                {/* Analysis Details */}
                {data && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Analysis Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Source:</span>
                        <span className="ml-2 font-medium">{getSourceDescription(data.source)}</span>
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
              <div className="card bg-blue-50 border border-blue-200">
                <div className="card-body">
                  <div className="flex items-start">
                    <div className="loading loading-spinner loading-sm text-blue-600 mr-3 mt-1"></div>
                    <div>
                      <h3 className="font-medium text-blue-800">AI Analysis in Progress</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Our AI is carefully analyzing your resume against the target job requirements. 
                        This process typically takes 30-60 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="card bg-green-50 border border-green-200">
                <div className="card-body">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-green-800">Analysis Complete!</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Your resume has been successfully analyzed. Redirecting to the results page...
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
                  <h3 className="font-medium text-gray-800 mb-3">💡 While You Wait...</h3>
                  <div className="space-y-2 text-sm text-gray-600">
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
