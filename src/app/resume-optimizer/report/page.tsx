'use client';

import {
  ArrowLeftIcon,
  CogIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  DownloadDropdown,
  DownloadOptionsModal,
} from '@/components/resume-optimizer/DownloadButton';
import ReportDisplay from '@/components/resume-optimizer/ReportDisplay';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import type {
  EditorState,
  OptimizationSuggestion,
  ResumeAnalysisResponse,
} from '@/lib/types/resume-optimizer';
import { applySuggestionToContent } from '@/utils/editorUtils';

interface ReportPageState {
  analysisResult: ResumeAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  adoptedSuggestions: Set<string>;
  ignoredSuggestions: Set<string>;
  originalResumeText: string;
  currentResumeText: string;
  editorState: EditorState;
  isReanalyzing: boolean;
  targetJobInfo: {
    title: string;
    keywords: string;
    description?: string;
    company?: string;
  } | null;
  showDownloadModal: boolean;
}

/**
 * Resume Optimizer Report Page
 * Displays the detailed analysis results and allows users to interact with suggestions
 */
const ResumeOptimizerReportPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const [state, setState] = useState<ReportPageState>({
    analysisResult: null,
    isLoading: true,
    error: null,
    adoptedSuggestions: new Set(),
    ignoredSuggestions: new Set(),
    originalResumeText: '',
    currentResumeText: '',
    editorState: {
      content: '',
      isDirty: false,
    },
    isReanalyzing: false,
    targetJobInfo: null,
    showDownloadModal: false,
  });

  // Load analysis result from various sources
  useEffect(() => {
    const loadAnalysisResult = async (): Promise<void> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Try to get analysis ID from URL params
        const analysisId = searchParams?.get('id') || null;

        if (analysisId && analysisId.trim() !== '') {
          // Load from API using analysis ID
          const response = await fetch(`/api/resume-optimizer/analysis/${analysisId}`);
          if (!response.ok) {
            throw new Error('Failed to load analysis result');
          }
          const data = await response.json();

          if (data.success && data.data) {
            setState((prev) => ({
              ...prev,
              analysisResult: data.data,
              isLoading: false,
            }));
            return;
          }
        }

        // Try to get from sessionStorage (from analysis flow)
        const sessionData = sessionStorage.getItem('resumeAnalysisResult');
        if (sessionData) {
          const analysisResult = JSON.parse(sessionData) as ResumeAnalysisResponse;

          // Load original resume text
          const originalText = sessionStorage.getItem('originalResumeText') || '';
          const currentText = sessionStorage.getItem('currentResumeText') || originalText;

          // Load target job info
          const targetJobData = sessionStorage.getItem('resumeOptimizerData');
          let targetJob = null;
          if (targetJobData) {
            try {
              const data = JSON.parse(targetJobData);
              targetJob = data.targetJob;
            } catch (e) {
              console.warn('Failed to parse target job data:', e);
            }
          }

          setState((prev) => ({
            ...prev,
            analysisResult,
            originalResumeText: originalText,
            currentResumeText: currentText,
            editorState: {
              content: currentText,
              isDirty: currentText !== originalText,
            },
            targetJobInfo: targetJob,
            isLoading: false,
          }));

          // Load saved suggestion states
          const savedAdopted = sessionStorage.getItem('adoptedSuggestions');
          const savedIgnored = sessionStorage.getItem('ignoredSuggestions');

          if (savedAdopted) {
            setState((prev) => ({
              ...prev,
              adoptedSuggestions: new Set(JSON.parse(savedAdopted)),
            }));
          }

          if (savedIgnored) {
            setState((prev) => ({
              ...prev,
              ignoredSuggestions: new Set(JSON.parse(savedIgnored)),
            }));
          }

          return;
        }

        // No analysis result found
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'No analysis result found. Please analyze a resume first.',
        }));
      } catch (error) {
        console.error('Error loading analysis result:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load analysis result',
        }));
      }
    };

    loadAnalysisResult();
  }, [searchParams]);

  // Save suggestion states to sessionStorage
  const saveSuggestionStates = useCallback((adopted: Set<string>, ignored: Set<string>): void => {
    sessionStorage.setItem('adoptedSuggestions', JSON.stringify([...adopted]));
    sessionStorage.setItem('ignoredSuggestions', JSON.stringify([...ignored]));
  }, []);

  // Handle suggestion adoption
  const handleSuggestionAdopt = useCallback(
    (suggestionId: string): void => {
      setState((prev) => {
        const newAdopted = new Set(prev.adoptedSuggestions);
        const newIgnored = new Set(prev.ignoredSuggestions);

        newAdopted.add(suggestionId);
        newIgnored.delete(suggestionId); // Remove from ignored if it was there

        saveSuggestionStates(newAdopted, newIgnored);

        return {
          ...prev,
          adoptedSuggestions: newAdopted,
          ignoredSuggestions: newIgnored,
        };
      });
    },
    [saveSuggestionStates]
  );

  // Handle suggestion ignore
  const handleSuggestionIgnore = useCallback(
    (suggestionId: string): void => {
      setState((prev) => {
        const newAdopted = new Set(prev.adoptedSuggestions);
        const newIgnored = new Set(prev.ignoredSuggestions);

        newIgnored.add(suggestionId);
        newAdopted.delete(suggestionId); // Remove from adopted if it was there

        saveSuggestionStates(newAdopted, newIgnored);

        return {
          ...prev,
          adoptedSuggestions: newAdopted,
          ignoredSuggestions: newIgnored,
        };
      });
    },
    [saveSuggestionStates]
  );

  // Handle suggestion modification
  const handleSuggestionModify = useCallback(
    (suggestionId: string, modifiedText: string): void => {
      // For now, just adopt the suggestion when modified
      // In a full implementation, you might want to save the modified text
      handleSuggestionAdopt(suggestionId);

      // You could also save the modified text to sessionStorage or send to API
      const modifiedSuggestions = JSON.parse(sessionStorage.getItem('modifiedSuggestions') || '{}');
      modifiedSuggestions[suggestionId] = modifiedText;
      sessionStorage.setItem('modifiedSuggestions', JSON.stringify(modifiedSuggestions));
    },
    [handleSuggestionAdopt]
  );

  // Handle editor content changes
  const handleEditorContentChange = useCallback((content: string): void => {
    setState((prev) => ({
      ...prev,
      currentResumeText: content,
      editorState: {
        ...prev.editorState,
        content,
        isDirty: content !== prev.originalResumeText,
      },
    }));

    // Save to sessionStorage
    sessionStorage.setItem('currentResumeText', content);
  }, []);

  // Handle editor state changes
  const handleEditorStateChange = useCallback((editorState: EditorState): void => {
    setState((prev) => ({
      ...prev,
      editorState,
    }));
  }, []);

  // Handle auto-save
  const handleAutoSave = useCallback(async (content: string): Promise<void> => {
    // Save to sessionStorage
    sessionStorage.setItem('currentResumeText', content);

    // In a full implementation, you might want to save to a backend API
    // await fetch('/api/resume-optimizer/save-draft', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content, analysisId: state.analysisResult?.id }),
    // });
  }, []);

  // Handle reanalyze
  const handleReanalyze = useCallback(
    async (content: string): Promise<void> => {
      if (!state.targetJobInfo) {
        console.error('No target job information available for reanalysis');
        return;
      }

      setState((prev) => ({ ...prev, isReanalyzing: true }));

      try {
        const response = await fetch('/api/resume-optimizer/reanalyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: content,
            targetJob: state.targetJobInfo,
            originalAnalysisId: state.analysisResult?.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to reanalyze resume');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setState((prev) => ({
            ...prev,
            analysisResult: data.data,
            currentResumeText: content,
            isReanalyzing: false,
            // Reset suggestion states for new analysis
            adoptedSuggestions: new Set(),
            ignoredSuggestions: new Set(),
          }));

          // Update sessionStorage with new analysis
          sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(data.data));
          sessionStorage.setItem('currentResumeText', content);
          sessionStorage.removeItem('adoptedSuggestions');
          sessionStorage.removeItem('ignoredSuggestions');

          // Show success notification
          addToast({
            type: 'success',
            title: 'Reanalysis Complete',
            description: `New analysis generated with score: ${data.data.overallScore}/100`,
            duration: 5000,
          });
        } else {
          throw new Error(data.error || 'Reanalysis failed');
        }
      } catch (error) {
        console.error('Reanalysis error:', error);
        setState((prev) => ({ ...prev, isReanalyzing: false }));

        // Show error notification
        addToast({
          type: 'error',
          title: 'Reanalysis Failed',
          description: error instanceof Error ? error.message : 'Failed to reanalyze resume',
          duration: 7000,
        });
      }
    },
    [state.targetJobInfo, state.analysisResult?.id, addToast]
  );

  // Handle apply suggestion to editor
  const handleApplySuggestionToEditor = useCallback(
    (suggestionId: string, suggestion: OptimizationSuggestion): void => {
      try {
        // Use the utility function to intelligently apply the suggestion
        const newContent = applySuggestionToContent(state.currentResumeText, suggestion);

        setState((prev) => ({
          ...prev,
          currentResumeText: newContent,
          editorState: {
            ...prev.editorState,
            content: newContent,
            isDirty: true,
          },
        }));

        sessionStorage.setItem('currentResumeText', newContent);

        // Automatically adopt the suggestion
        handleSuggestionAdopt(suggestionId);

        // Show success notification
        addToast({
          type: 'success',
          title: 'Suggestion Applied',
          description: `"${suggestion.title}" has been applied to your resume`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error applying suggestion to editor:', error);

        // Fallback to simple append
        const newContent = `${state.currentResumeText}\n\n[Applied]: ${suggestion.suggestion}`;
        setState((prev) => ({
          ...prev,
          currentResumeText: newContent,
          editorState: {
            ...prev.editorState,
            content: newContent,
            isDirty: true,
          },
        }));
        sessionStorage.setItem('currentResumeText', newContent);
        handleSuggestionAdopt(suggestionId);

        // Show warning notification
        addToast({
          type: 'warning',
          title: 'Suggestion Applied (Basic)',
          description: 'Suggestion was applied using basic formatting',
          duration: 4000,
        });
      }
    },
    [state.currentResumeText, handleSuggestionAdopt, addToast]
  );

  // Handle download success
  const handleDownloadSuccess = useCallback(
    (fileName: string): void => {
      addToast({
        type: 'success',
        title: 'Download Complete',
        description: `${fileName} has been downloaded successfully`,
        duration: 4000,
      });
    },
    [addToast]
  );

  // Handle download error
  const handleDownloadError = useCallback(
    (error: string): void => {
      addToast({
        type: 'error',
        title: 'Download Failed',
        description: error,
        duration: 6000,
      });
    },
    [addToast]
  );

  // Handle download modal toggle
  const handleToggleDownloadModal = useCallback((): void => {
    setState((prev) => ({ ...prev, showDownloadModal: !prev.showDownloadModal }));
  }, []);

  // Handle share functionality
  const handleShare = useCallback(async (): Promise<void> => {
    if (!state.analysisResult) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Resume Analysis Report',
          text: `Check out my resume analysis report with an overall score of ${state.analysisResult.overallScore}/100`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        addToast({
          type: 'success',
          title: 'Link Copied',
          description: 'Report link has been copied to clipboard',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      addToast({
        type: 'error',
        title: 'Share Failed',
        description: 'Failed to share the report',
        duration: 4000,
      });
    }
  }, [state.analysisResult, addToast]);

  // Handle edit resume
  const handleEditResume = useCallback((): void => {
    if (!state.analysisResult) return;

    // Store current analysis result and suggestion states for the editor
    sessionStorage.setItem('resumeAnalysisResult', JSON.stringify(state.analysisResult));
    sessionStorage.setItem('adoptedSuggestions', JSON.stringify([...state.adoptedSuggestions]));
    sessionStorage.setItem('ignoredSuggestions', JSON.stringify([...state.ignoredSuggestions]));

    // Navigate to editor
    router.push('/resume-optimizer/editor');
  }, [state.analysisResult, state.adoptedSuggestions, state.ignoredSuggestions, router]);

  // Error state
  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <DocumentDuplicateIcon className="h-8 w-8 text-stone-600" />
          </div>
          <h2 className="mb-2 font-bold text-2xl text-stone-900">Report Not Found</h2>
          <p className="mb-6 text-stone-700">{state.error}</p>
          <div className="space-y-3">
            <Link href="/resume-optimizer" className="btn btn-primary btn-block">
              Start New Analysis
            </Link>
            <Link href="/resume-optimizer/analyze" className="btn btn-outline btn-block">
              Upload Resume
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="relative sticky top-0 z-40 border-stone-200 border-b bg-white">
        <div className="container mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link
                href="/resume-optimizer"
                className="group flex items-center space-x-3 text-stone-600 transition-all duration-300 hover:scale-105 hover:text-stone-900"
              >
                <div className="rounded-full bg-stone-100 p-2 transition-colors duration-300 group-hover:bg-stone-200">
                  <ArrowLeftIcon className="group-hover:-translate-x-0.5 h-4 w-4 transition-transform duration-300" />
                </div>
                <span className="font-semibold">Back to Optimizer</span>
              </Link>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-stone-300 to-transparent" />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-stone-300 to-transparent" />
              <div className="flex items-center space-x-3">
                <div className="rounded-xl border border-stone-200 bg-stone-100 p-2">
                  <DocumentDuplicateIcon className="h-6 w-6 text-stone-600" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-stone-900 tracking-tight">
                    Analysis Report
                  </h1>
                  <p className="text-sm text-stone-600">
                    Comprehensive resume optimization insights
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {state.analysisResult && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="group relative rounded-xl border border-stone-200 bg-white px-4 py-2 text-stone-700 transition-all duration-300 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
                  title="Share report"
                >
                  <ShareIcon className="mr-2 inline h-4 w-4" />
                  Share
                </button>

                <DownloadDropdown
                  resumeContent={state.currentResumeText}
                  analysisResult={state.analysisResult}
                  includeAnalysis={true}
                  adoptedSuggestions={[...state.adoptedSuggestions]}
                  onDownloadSuccess={handleDownloadSuccess}
                  onDownloadError={handleDownloadError}
                />

                <button
                  onClick={handleToggleDownloadModal}
                  className="group relative rounded-xl border border-stone-200 bg-white px-4 py-2 text-stone-700 transition-all duration-300 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
                  title="Advanced download options"
                >
                  <CogIcon className="mr-2 inline h-4 w-4" />
                  Options
                </button>

                <button
                  onClick={handleEditResume}
                  className="group relative rounded-xl bg-stone-900 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-stone-800"
                >
                  <PencilSquareIcon className="mr-2 inline h-4 w-4" />
                  Edit Resume
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto max-w-7xl px-6 py-12">
        <ReportDisplay
          analysisResult={state.analysisResult}
          isLoading={state.isLoading}
          onSuggestionAdopt={handleSuggestionAdopt}
          onSuggestionIgnore={handleSuggestionIgnore}
          onSuggestionModify={handleSuggestionModify}
          onSuggestionApplyToEditor={handleApplySuggestionToEditor}
          adoptedSuggestions={state.adoptedSuggestions}
          ignoredSuggestions={state.ignoredSuggestions}
          originalResumeText={state.originalResumeText}
          onEditorContentChange={handleEditorContentChange}
          onEditorStateChange={handleEditorStateChange}
          showEditor={true}
          enableAutoSave={true}
          onAutoSave={handleAutoSave}
          onReanalyze={handleReanalyze}
          isReanalyzing={state.isReanalyzing}
          targetJobInfo={
            state.targetJobInfo || {
              title: 'General Position',
              keywords: '',
              description: '',
              company: '',
            }
          }
          className="animate-fade-in"
        />
      </div>

      {/* Footer Actions */}
      {state.analysisResult && (
        <div className="relative sticky bottom-0 z-40 border-stone-200 border-t bg-white">
          <div className="container mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-stone-600">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-stone-400" />
                  <span>
                    Analysis completed on{' '}
                    {new Date(state.analysisResult.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {state.analysisResult.metadata?.processingTime && (
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-stone-400" />
                    <span>Processed in {state.analysisResult.metadata.processingTime}ms</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-stone-600">
                  <div className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1">
                    <span className="font-semibold text-stone-700">
                      {state.adoptedSuggestions.size}
                    </span>
                    <span className="ml-1 text-stone-600">suggestions adopted</span>
                  </div>
                </div>
                <button
                  onClick={handleEditResume}
                  className="group relative rounded-xl bg-stone-900 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-stone-800"
                >
                  <PencilSquareIcon className="mr-2 inline h-4 w-4" />
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      <DownloadOptionsModal
        isOpen={state.showDownloadModal}
        onClose={handleToggleDownloadModal}
        resumeContent={state.currentResumeText}
        analysisResult={state.analysisResult}
        onDownloadSuccess={handleDownloadSuccess}
        onDownloadError={handleDownloadError}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default ResumeOptimizerReportPage;
