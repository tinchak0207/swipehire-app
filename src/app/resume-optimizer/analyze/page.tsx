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
  ResumeAnalysisRequest, 
  ResumeAnalysisResponse, 
  TargetJobInfo,
  UserProfileData,
} from '@/lib/types/resume-optimizer';
import { analyzeResume } from '@/services/resumeOptimizerService';

interface AnalyzePageData {
  resumeText: string;
  targetJob: TargetJobInfo;
  source: 'upload' | 'profile' | 'template';
  templateId?: string;
  templateName?: string;
  profileData?: UserProfileData;
}

interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  result: ResumeAnalysisResponse | null;
}

/**
 * Resume analysis page component
 * Handles the AI analysis process and displays progress
 */
const ResumeAnalyzePage: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyzePageData | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: 'Initializing...',
    error: null,
    result: null,
  });

  useEffect(() => {
    // Load data from sessionStorage
    const storedData = sessionStorage.getItem('resumeOptimizerData');
    if (storedData) {
      try {
        const parsedData: AnalyzePageData = JSON.parse(storedData);
        setData(parsedData);
        // Start analysis automatically
        startAnalysis(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setAnalysisState(prev => ({
          ...prev,
          error: 'Invalid data format. Please try again.',
        }));
      }
    } else {
      setAnalysisState(prev => ({
        ...prev,
        error: 'No resume data found. Please start from the beginning.',
      }));
    }
  }, []);

  const startAnalysis = useCallback(async (analysisData: AnalyzePageData): Promise<void> => {
    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      currentStep: 'Preparing analysis...',
      error: null,
      result: null,
    });

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 10, step: 'Parsing resume content...' },
        { progress: 25, step: 'Analyzing keywords...' },
        { progress: 40, step: 'Checking ATS compatibility...' },
        { progress: 60, step: 'Evaluating grammar and style...' },
        { progress: 80, step: 'Generating suggestions...' },
        { progress: 95, step: 'Finalizing report...' },
      ];

      for (const { progress, step } of progressSteps) {
        setAnalysisState(prev => ({
          ...prev,
          progress,
          currentStep: step,
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const analysisRequest: ResumeAnalysisRequest = {
        resumeText: analysisData.resumeText,
        targetJob: analysisData.targetJob,
        ...(analysisData.templateId && { templateId: analysisData.templateId }),
      };

      const result = await analyzeResume(analysisRequest);

      setAnalysisState({
        isAnalyzing: false,
        progress: 100,
        currentStep: 'Analysis complete!',
        error: null,
        result,
      });

      // Store result and navigate to report page
      sessionStorage.setItem('resumeAnalysisResult', JSON.stringify({
        ...analysisData,
        analysisResult: result,
      }));

      // Navigate to report page after a short delay
      setTimeout(() => {
        router.push('/resume-optimizer/report');
      }, 1500);

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisState({
        isAnalyzing: false,
        progress: 0,
        currentStep: '',
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
        result: null,
      });
    }
  }, [router]);

  const handleRetry = useCallback((): void => {
    if (data) {
      startAnalysis(data);
    }
  }, [data, startAnalysis]);

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

  if (!data && !analysisState.error) {
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
        </div>

        {analysisState.error ? (
          <div className="card bg-white shadow-lg">
            <div className="card-body text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-error">Analysis Failed</h2>
              <p className="text-gray-600 mb-6">{analysisState.error}</p>
              <div className="flex gap-4 justify-center">
                {data && (
                  <button onClick={handleRetry} className="btn btn-primary">
                    Try Again
                  </button>
                )}
                <Link href="/resume-optimizer" className="btn btn-outline">
                  Start Over
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Analysis Info */}
            {data && (
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4">Analysis Details</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Source</h3>
                      <p className="text-gray-600">{getSourceDescription(data.source)}</p>
                      {data.templateName && (
                        <p className="text-sm text-gray-500">Template: {data.templateName}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Target Position</h3>
                      <p className="text-gray-600">{data.targetJob.title}</p>
                      {data.targetJob.company && (
                        <p className="text-sm text-gray-500">Company: {data.targetJob.company}</p>
                      )}
                    </div>
                  </div>
                  {data.targetJob.keywords && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Target Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.targetJob.keywords.split(',').map((keyword, index) => (
                          <span key={index} className="badge badge-outline">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Card */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  {analysisState.result ? (
                    <CheckCircleIcon className="w-8 h-8 text-success mr-3" />
                  ) : (
                    <span className="loading loading-spinner loading-md text-primary mr-3"></span>
                  )}
                  <h2 className="card-title">
                    {analysisState.result ? 'Analysis Complete!' : 'Analyzing Your Resume'}
                  </h2>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{analysisState.currentStep}</span>
                    <span className="text-gray-600">{analysisState.progress}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={analysisState.progress} 
                    max="100"
                  ></progress>
                </div>

                {/* Analysis Steps */}
                <div className="space-y-2">
                  {[
                    'Parsing resume content',
                    'Analyzing keywords',
                    'Checking ATS compatibility',
                    'Evaluating grammar and style',
                    'Generating suggestions',
                    'Finalizing report',
                  ].map((step, index) => {
                    const stepProgress = (index + 1) * 16.67;
                    const isCompleted = analysisState.progress >= stepProgress;
                    const isCurrent = analysisState.progress >= stepProgress - 16.67 && analysisState.progress < stepProgress;

                    return (
                      <div key={index} className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                          isCompleted ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-gray-200'
                        }`}>
                          {isCompleted && <CheckCircleIcon className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${
                          isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {analysisState.result && (
                  <div className="mt-6 p-4 bg-success/10 rounded-lg">
                    <p className="text-success font-medium">
                      🎉 Your resume has been analyzed successfully! Redirecting to the report...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">💡 While You Wait</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">What We're Analyzing</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Keyword optimization for ATS systems</li>
                      <li>• Grammar and spelling accuracy</li>
                      <li>• Professional formatting standards</li>
                      <li>• Quantifiable achievements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What You'll Get</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Overall resume score and ATS rating</li>
                      <li>• Specific improvement suggestions</li>
                      <li>• Real-time editing capabilities</li>
                      <li>• Export options (PDF, DOCX)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzePage;