/**
 * Resume Analysis Demo Component
 * Demonstrates the backend API integration for resume analysis requests
 * Showcases comprehensive error handling, loading states, and user feedback
 */

'use client';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { useResumeAnalysis, useSimpleResumeAnalysis } from '@/hooks/useResumeAnalysis';
import type {
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  TargetJobInfo,
} from '@/lib/types/resume-optimizer';
import { ResumeAnalysisError } from '@/services/resumeOptimizerService';

// Component Props Interface
interface ResumeAnalysisDemoProps {
  /** Initial resume text for demo purposes */
  initialResumeText?: string;
  /** Initial target job information */
  initialTargetJob?: TargetJobInfo;
  /** Whether to show advanced features */
  showAdvancedFeatures?: boolean;
  /** Callback when analysis is complete */
  onAnalysisComplete?: (result: ResumeAnalysisResponse) => void;
  /** Custom CSS classes */
  className?: string;
}

// Demo data for testing
const DEMO_RESUME_TEXT = `John Smith
john.smith@email.com | (555) 123-4567 | San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience developing scalable web applications. 
Proficient in React, Node.js, and cloud technologies with a strong focus on user experience and performance optimization.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, FastAPI
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jest, Webpack, VS Code

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Solutions Inc. | 2021 - Present
• Developed and maintained web applications serving 100,000+ users
• Led technical architecture decisions for microservices platform
• Improved application performance by 40% through optimization
• Mentored 3 junior developers and conducted code reviews
• Collaborated with cross-functional teams to deliver features on time

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web interfaces using React and modern JavaScript
• Implemented RESTful APIs and database integration
• Wrote comprehensive unit and integration tests
• Participated in agile development processes

EDUCATION
Bachelor of Science in Computer Science | University of California | 2019

PROJECTS
E-commerce Platform | React, Node.js, PostgreSQL
• Built full-stack e-commerce application with payment integration
• Implemented real-time inventory management system`;

const DEMO_TARGET_JOB: TargetJobInfo = {
  title: 'Senior Full Stack Developer',
  keywords: 'React, Node.js, TypeScript, AWS, PostgreSQL, REST API, Agile, Microservices',
  description:
    'We are looking for a Senior Full Stack Developer to join our team and help build scalable web applications.',
  company: 'Tech Innovations Corp',
};

/**
 * Main Resume Analysis Demo Component
 */
export const ResumeAnalysisDemo: React.FC<ResumeAnalysisDemoProps> = ({
  initialResumeText = DEMO_RESUME_TEXT,
  initialTargetJob = DEMO_TARGET_JOB,
  showAdvancedFeatures = true,
  onAnalysisComplete,
  className = '',
}) => {
  // State management
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [targetJob, setTargetJob] = useState<TargetJobInfo>(initialTargetJob);
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  // Hook usage - demonstrate both advanced and simple modes
  const advancedAnalysis = useResumeAnalysis();
  const simpleAnalysis = useSimpleResumeAnalysis();

  // Choose which analysis hook to use based on mode
  const currentAnalysis = useSimpleMode ? simpleAnalysis : advancedAnalysis;

  // Check backend availability on mount
  useEffect(() => {
    if ('checkBackend' in advancedAnalysis) {
      advancedAnalysis.checkBackend();
    }
  }, [advancedAnalysis]);

  // Handle analysis completion
  useEffect(() => {
    if (currentAnalysis.analysisResult && onAnalysisComplete) {
      onAnalysisComplete(currentAnalysis.analysisResult);
    }
  }, [currentAnalysis.analysisResult, onAnalysisComplete]);

  /**
   * Start analysis with comprehensive error handling
   */
  const handleStartAnalysis = useCallback(async () => {
    if (!resumeText.trim()) {
      alert('Please enter resume text');
      return;
    }

    if (!targetJob.title.trim()) {
      alert('Please enter target job title');
      return;
    }

    try {
      if (useSimpleMode && 'analyze' in simpleAnalysis) {
        // Simple mode analysis
        await simpleAnalysis.analyze(resumeText, targetJob.title, targetJob.keywords, {
          targetJobDescription: targetJob.description,
          targetJobCompany: targetJob.company,
          userId: 'demo-user',
        });
      } else if ('startAnalysis' in advancedAnalysis) {
        // Advanced mode analysis
        const request: ResumeAnalysisRequest = {
          resumeText,
          targetJob,
          userId: 'demo-user',
          templateId: 'demo-template',
        };
        await advancedAnalysis.startAnalysis(request);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  }, [resumeText, targetJob, useSimpleMode, simpleAnalysis, advancedAnalysis]);

  /**
   * Handle re-analysis (advanced mode only)
   */
  const handleReanalysis = useCallback(async () => {
    if (!currentAnalysis.analysisResult || !('startReanalysis' in advancedAnalysis)) {
      return;
    }

    try {
      await advancedAnalysis.startReanalysis(
        resumeText,
        currentAnalysis.analysisResult.id,
        targetJob
      );
    } catch (error) {
      console.error('Re-analysis failed:', error);
    }
  }, [resumeText, targetJob, currentAnalysis.analysisResult, advancedAnalysis]);

  /**
   * Render error message with appropriate styling
   */
  const renderError = (error: ResumeAnalysisError) => {
    const getErrorIcon = () => {
      switch (error.code) {
        case 'NETWORK_ERROR':
        case 'REQUEST_TIMEOUT':
          return <ExclamationTriangleIcon className="w-5 h-5" />;
        case 'UNAUTHORIZED':
        case 'RATE_LIMITED':
          return <XCircleIcon className="w-5 h-5" />;
        default:
          return <InformationCircleIcon className="w-5 h-5" />;
      }
    };

    const getErrorClass = () => {
      switch (error.code) {
        case 'NETWORK_ERROR':
        case 'REQUEST_TIMEOUT':
          return 'alert-warning';
        case 'UNAUTHORIZED':
        case 'RATE_LIMITED':
          return 'alert-error';
        default:
          return 'alert-info';
      }
    };

    return (
      <div className={`alert ${getErrorClass()} mb-4`}>
        <div className="flex items-start space-x-3">
          {getErrorIcon()}
          <div className="flex-1">
            <h4 className="font-semibold">{error.message}</h4>
            {error.details && (
              <p className="text-sm opacity-80 mt-1">
                Code: {error.code} | Status: {error.statusCode}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render loading progress with detailed stages
   */
  const renderLoadingProgress = () => {
    const { loadingState } = currentAnalysis;

    if (!loadingState.isLoading) return null;

    const getStageIcon = () => {
      switch (loadingState.stage) {
        case 'parsing':
          return '📄';
        case 'analyzing':
          return '🤖';
        case 'generating_suggestions':
          return '💡';
        case 'finalizing':
          return '✨';
        default:
          return '⏳';
      }
    };

    return (
      <div className="card bg-base-200 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{getStageIcon()}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Analyzing Resume</h3>
              <p className="text-sm opacity-70">{loadingState.message}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-base-300 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingState.progress || 0}%` }}
            />
          </div>

          <div className="flex justify-between text-xs opacity-60">
            <span>Stage: {loadingState.stage || 'Starting'}</span>
            <span>{loadingState.progress || 0}%</span>
          </div>

          {/* Cancel button */}
          {'cancelAnalysis' in advancedAnalysis && (
            <div className="card-actions justify-end mt-4">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={advancedAnalysis.cancelAnalysis}
              >
                Cancel Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render analysis results summary
   */
  const renderResults = (result: ResumeAnalysisResponse) => {
    return (
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircleIcon className="w-8 h-8 text-success" />
            <div>
              <h3 className="font-bold text-xl">Analysis Complete!</h3>
              <p className="text-sm opacity-70">Processed in {result.processingTime}ms</p>
            </div>
          </div>

          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Overall Score</div>
              <div className="stat-value text-primary">{result.overallScore}</div>
              <div className="stat-desc">out of 100</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">ATS Score</div>
              <div className="stat-value text-secondary">{result.atsScore}</div>
              <div className="stat-desc">Compatibility</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Keywords</div>
              <div className="stat-value text-accent">
                {result.keywordAnalysis.matchedKeywords.length}
              </div>
              <div className="stat-desc">of {result.keywordAnalysis.totalKeywords} matched</div>
            </div>
          </div>

          {/* Suggestions preview */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Top Suggestions</h4>
            <div className="space-y-2">
              {result.suggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="alert alert-info">
                  <InformationCircleIcon className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="font-medium">{suggestion.title}</span>
                    <p className="text-sm opacity-80">{suggestion.description}</p>
                  </div>
                  <div className="badge badge-primary">+{suggestion.estimatedScoreImprovement}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="card-actions justify-end">
            {showAdvancedFeatures && 'startReanalysis' in advancedAnalysis && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReanalysis}
                disabled={currentAnalysis.isAnalyzing}
              >
                Re-analyze
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // In a real app, this would navigate to the full report
                console.log('View full report:', result);
              }}
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center space-x-2">
          <SparklesIcon className="w-8 h-8 text-primary" />
          <span>Resume Analysis Demo</span>
        </h1>
        <p className="text-lg opacity-70">
          Demonstrates backend API integration for resume analysis
        </p>
      </div>

      {/* Backend status indicator */}
      {'isBackendAvailable' in advancedAnalysis && (
        <div className="mb-6">
          <div
            className={`alert ${
              advancedAnalysis.isBackendAvailable === true
                ? 'alert-success'
                : advancedAnalysis.isBackendAvailable === false
                  ? 'alert-warning'
                  : 'alert-info'
            }`}
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span>
              Backend Status:{' '}
              {advancedAnalysis.isBackendAvailable === true
                ? 'Available (AI-powered analysis)'
                : advancedAnalysis.isBackendAvailable === false
                  ? 'Unavailable (Fallback to local analysis)'
                  : 'Checking...'}
            </span>
          </div>
        </div>
      )}

      {/* Mode selector */}
      {showAdvancedFeatures && (
        <div className="form-control mb-6">
          <label className="label cursor-pointer justify-start space-x-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={useSimpleMode}
              onChange={(e) => setUseSimpleMode(e.target.checked)}
            />
            <span className="label-text">Use Simple Mode (simplified API interface)</span>
          </label>
        </div>
      )}

      {/* Input form */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Resume & Job Information</h2>

          {/* Resume text input */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">Resume Text</span>
              <span className="label-text-alt">{resumeText.length} characters</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-40 font-mono text-sm"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={currentAnalysis.isAnalyzing}
            />
          </div>

          {/* Target job inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Job Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Senior Software Engineer"
                value={targetJob.title}
                onChange={(e) => setTargetJob((prev) => ({ ...prev, title: e.target.value }))}
                disabled={currentAnalysis.isAnalyzing}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Company</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Tech Corp"
                value={targetJob.company || ''}
                onChange={(e) => setTargetJob((prev) => ({ ...prev, company: e.target.value }))}
                disabled={currentAnalysis.isAnalyzing}
              />
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">Keywords</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="e.g., React, Node.js, TypeScript, AWS"
              value={targetJob.keywords || ''}
              onChange={(e) => setTargetJob((prev) => ({ ...prev, keywords: e.target.value }))}
              disabled={currentAnalysis.isAnalyzing}
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold">Job Description (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Paste job description here for better analysis..."
              value={targetJob.description || ''}
              onChange={(e) => setTargetJob((prev) => ({ ...prev, description: e.target.value }))}
              disabled={currentAnalysis.isAnalyzing}
            />
          </div>

          {/* Action buttons */}
          <div className="card-actions justify-end">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                if ('reset' in currentAnalysis) {
                  currentAnalysis.reset();
                }
              }}
              disabled={currentAnalysis.isAnalyzing}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStartAnalysis}
              disabled={
                currentAnalysis.isAnalyzing || !resumeText.trim() || !targetJob.title.trim()
              }
            >
              {currentAnalysis.isAnalyzing ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading progress */}
      {renderLoadingProgress()}

      {/* Error display */}
      {currentAnalysis.error && renderError(currentAnalysis.error)}

      {/* Results display */}
      {currentAnalysis.analysisResult && renderResults(currentAnalysis.analysisResult)}

      {/* Debug information (development only) */}
      {process.env.NODE_ENV === 'development' && showAdvancedFeatures && (
        <div className="card bg-base-200 shadow-lg mt-6">
          <div className="card-body">
            <h3 className="card-title text-sm">Debug Information</h3>
            <div className="text-xs font-mono bg-base-300 p-4 rounded overflow-auto max-h-40">
              <pre>
                {JSON.stringify(
                  {
                    mode: useSimpleMode ? 'simple' : 'advanced',
                    isAnalyzing: currentAnalysis.isAnalyzing,
                    hasResult: !!currentAnalysis.analysisResult,
                    hasError: !!currentAnalysis.error,
                    loadingState: currentAnalysis.loadingState,
                    ...('isBackendAvailable' in advancedAnalysis && {
                      backendAvailable: advancedAnalysis.isBackendAvailable,
                      currentRequestId: advancedAnalysis.currentRequestId,
                    }),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisDemo;
