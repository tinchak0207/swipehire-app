'use client';

import {
  AcademicCapIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LightBulbIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { EditorState, ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';
import EmbeddedTextEditor from './EmbeddedTextEditor';
import ScoreDisplay from './ScoreDisplay';
import SuggestionCard from './SuggestionCard';

interface ReportDisplayProps {
  analysisResult: ResumeAnalysisResponse | null;
  isLoading?: boolean;
  onSuggestionAdopt?: (suggestionId: string) => void;
  onSuggestionIgnore?: (suggestionId: string) => void;
  onSuggestionModify?: (suggestionId: string, modifiedText: string) => void;
  onSuggestionApplyToEditor?: (suggestionId: string, suggestion: any) => void;
  adoptedSuggestions?: Set<string>;
  ignoredSuggestions?: Set<string>;
  className?: string;
  /** Original resume text for the editor */
  originalResumeText?: string;
  /** Callback when editor content changes */
  onEditorContentChange?: (content: string) => void;
  /** Callback when editor state changes */
  onEditorStateChange?: (state: EditorState) => void;
  /** Whether to show the embedded editor */
  showEditor?: boolean;
  /** Whether the editor should auto-save */
  enableAutoSave?: boolean;
  /** Auto-save callback */
  onAutoSave?: (content: string) => Promise<void>;
  /** Callback for reanalyzing content */
  onReanalyze?: (content: string) => Promise<void>;
  /** Whether reanalysis is in progress */
  isReanalyzing?: boolean;
  /** Target job information for reanalysis */
  targetJobInfo?: {
    title: string;
    keywords: string;
    description?: string;
    company?: string;
  };
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
}

/**
 * Collapsible section component for organizing report content
 */
const ReportSection: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
  badgeColor = 'badge-neutral',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group relative bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-stone-300 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-4">
          <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 group-hover:bg-stone-200 transition-colors duration-300">
            <div className="text-stone-600">{icon}</div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold text-stone-900">{title}</span>
            {badge && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  badgeColor === 'badge-success'
                    ? 'bg-stone-100 text-stone-700 border border-stone-200'
                    : badgeColor === 'badge-warning'
                      ? 'bg-stone-100 text-stone-700 border border-stone-200'
                      : badgeColor === 'badge-error'
                        ? 'bg-stone-100 text-stone-700 border border-stone-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-stone-100">
          <div className="animate-fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton component for report sections
 */
const ReportSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Overall Score Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-stone-200 rounded-2xl p-8 h-40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-stone-200 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-stone-200 rounded-full w-3/4" />
            <div className="h-8 bg-stone-200 rounded-full w-1/2" />
            <div className="h-3 bg-stone-200 rounded-full w-2/3" />
          </div>
        </div>
      ))}
    </div>

    {/* Sections Skeleton */}
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-stone-200 rounded-2xl p-6 h-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-stone-200 animate-pulse" />
        <div className="space-y-3">
          <div className="h-5 bg-stone-200 rounded-full w-1/3" />
          <div className="h-4 bg-stone-200 rounded-full w-full" />
          <div className="h-4 bg-stone-200 rounded-full w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Empty state component when no analysis data is available
 */
const EmptyReportState: React.FC = () => (
  <div className="text-center py-24">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-stone-100 rounded-full opacity-20" />
      <div className="relative p-6 bg-white border border-stone-200 rounded-3xl inline-block">
        <DocumentTextIcon className="w-16 h-16 text-stone-400 mx-auto" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-stone-900 mb-3">No Analysis Available</h3>
    <p className="text-stone-600 max-w-md mx-auto text-lg leading-relaxed">
      The resume analysis report is not available. Please try analyzing your resume again.
    </p>
    <div className="mt-8">
      <button className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-all duration-300 ">
        Start New Analysis
      </button>
    </div>
  </div>
);

/**
 * Main Report Display Component
 * Renders the complete resume optimization analysis report
 */
const ReportDisplay: React.FC<ReportDisplayProps> = ({
  analysisResult,
  isLoading = false,
  onSuggestionAdopt,
  onSuggestionIgnore,
  onSuggestionModify,
  onSuggestionApplyToEditor,
  adoptedSuggestions = new Set(),
  ignoredSuggestions = new Set(),
  className = '',
  originalResumeText = '',
  onEditorContentChange,
  onEditorStateChange,
  showEditor = true,
  enableAutoSave = false,
  onAutoSave,
  onReanalyze,
  isReanalyzing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'details' | 'editor'>(
    'overview'
  );
  const [currentEditorContent, setCurrentEditorContent] = useState<string>(originalResumeText);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-full blur-3xl opacity-40 scale-150 animate-pulse" />
            <div className="relative p-8 bg-white border border-stone-200 rounded-3xl inline-block">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-stone-900 mb-4 tracking-tight">
            Analyzing Your Resume
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed max-w-md mx-auto">
            Please wait while we generate your comprehensive optimization report...
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
        <ReportSkeleton />
      </div>
    );
  }

  // Show empty state if no analysis result
  if (!analysisResult) {
    return (
      <div className={className}>
        <EmptyReportState />
      </div>
    );
  }

  const {
    overallScore = 0,
    atsScore = 0,
    keywordAnalysis = { score: 0, matchedKeywords: [], missingKeywords: [], totalKeywords: 0 },
    suggestions = [],
    grammarCheck = { score: 0, totalIssues: 0, issues: [], overallReadability: 0 },
    formatAnalysis = { score: 0, atsCompatibility: 0, issues: [] },
    quantitativeAnalysis = {
      score: 0,
      achievementsWithNumbers: 0,
      totalAchievements: 0,
      impactWords: [],
      suggestions: [],
    },
    strengths = [],
    weaknesses = [],
    sectionAnalysis = {},
    metadata,
  } = analysisResult || {};

  // Helper functions
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-error';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const prioritizedSuggestions = suggestions
    .filter((s) => !ignoredSuggestions.has(s.id))
    .sort((a, b) => {
      // Adopted suggestions first, then by priority
      const aAdopted = adoptedSuggestions.has(a.id);
      const bAdopted = adoptedSuggestions.has(b.id);

      if (aAdopted && !bAdopted) return -1;
      if (!aAdopted && bAdopted) return 1;

      return b.priority - a.priority;
    });

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Report Header */}
      <div className="text-center mb-12">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-full blur-3xl opacity-30 scale-150" />
          <div className="relative p-6 bg-white border border-stone-200 rounded-3xl inline-block">
            <TrophyIcon className="w-12 h-12 text-amber-600 mx-auto" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">
          Resume Optimization Report
        </h1>
        <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Comprehensive analysis and actionable insights to enhance your resume's impact
        </p>

        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-stone-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-stone-600">Target Role</div>
                  <div className="font-semibold text-stone-900">{metadata.targetJobTitle}</div>
                </div>
              </div>
            </div>

            {metadata.targetCompany && (
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <SparklesIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-stone-600">Company</div>
                    <div className="font-semibold text-stone-900">{metadata.targetCompany}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <StarIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-stone-600">Analyzed</div>
                  <div className="font-semibold text-stone-900">
                    {formatDate(metadata.analysisDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-stone-600">Word Count</div>
                  <div className="font-semibold text-stone-900">{metadata.wordCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="relative bg-white border border-stone-200 rounded-2xl p-2 shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <EyeIcon className="w-5 h-5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`relative flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'suggestions'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <LightBulbIcon className="w-5 h-5" />
            <span>Suggestions</span>
            {prioritizedSuggestions.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'suggestions'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {prioritizedSuggestions.length}
              </span>
            )}
          </button>

          {showEditor && (
            <button
              onClick={() => setActiveTab('editor')}
              className={`relative flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Editor</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('details')}
            className={`relative flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <DocumentTextIcon className="w-5 h-5" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overall Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreDisplay score={overallScore} label="Overall Score" size="lg" showProgress />
            <ScoreDisplay score={atsScore} label="ATS Compatibility" size="lg" showProgress />
            <ScoreDisplay
              score={keywordAnalysis?.score || 0}
              label="Keyword Match"
              size="lg"
              showProgress
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat bg-base-100 rounded-xl border border-base-300 shadow-sm">
              <div className="stat-figure text-primary">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Matched Keywords</div>
              <div className="stat-value text-2xl text-primary">
                {keywordAnalysis.matchedKeywords.length}
              </div>
              <div className="stat-desc">of {keywordAnalysis.totalKeywords} total</div>
            </div>

            <div className="stat bg-base-100 rounded-xl border border-base-300 shadow-sm">
              <div className="stat-figure text-warning">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Grammar Issues</div>
              <div className="stat-value text-2xl text-warning">{grammarCheck.totalIssues}</div>
              <div className="stat-desc">Score: {grammarCheck.score}/100</div>
            </div>

            <div className="stat bg-base-100 rounded-xl border border-base-300 shadow-sm">
              <div className="stat-figure text-info">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Quantified Achievements</div>
              <div className="stat-value text-2xl text-info">
                {quantitativeAnalysis.achievementsWithNumbers}
              </div>
              <div className="stat-desc">of {quantitativeAnalysis.totalAchievements} total</div>
            </div>

            <div className="stat bg-base-100 rounded-xl border border-base-300 shadow-sm">
              <div className="stat-figure text-secondary">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-xs">Suggestions</div>
              <div className="stat-value text-2xl text-secondary">{suggestions.length}</div>
              <div className="stat-desc">{adoptedSuggestions.size} adopted</div>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="card bg-success/10 border border-success/20">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <StarIcon className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="card-title text-success">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base-content">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="card bg-warning/10 border border-warning/20">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-warning/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="card-title text-warning">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <XCircleIcon className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-base-content">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {/* Suggestions Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-base-content">Optimization Suggestions</h2>
            <div className="flex items-center space-x-2 text-sm text-base-content/70">
              <span>{adoptedSuggestions.size} adopted</span>
              <span>•</span>
              <span>{ignoredSuggestions.size} ignored</span>
              <span>•</span>
              <span>{prioritizedSuggestions.length} remaining</span>
            </div>
          </div>

          {/* Suggestions List */}
          {prioritizedSuggestions.length > 0 ? (
            <div className="space-y-4">
              {prioritizedSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isAdopted={adoptedSuggestions.has(suggestion.id)}
                  isIgnored={ignoredSuggestions.has(suggestion.id)}
                  onAdopt={onSuggestionAdopt || (() => {})}
                  onIgnore={onSuggestionIgnore || (() => {})}
                  onModify={onSuggestionModify ? onSuggestionModify : () => {}}
                  onApplyToEditor={onSuggestionApplyToEditor ? onSuggestionApplyToEditor : () => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content mb-2">All Set!</h3>
              <p className="text-base-content/70">
                You've addressed all available suggestions. Your resume is looking great!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'editor' && showEditor && (
        <div className="space-y-6">
          {/* Editor Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-base-content">Resume Editor</h2>
              <p className="text-base-content/70 mt-1">
                Edit your resume content directly and see changes in real-time
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Reanalyze Button */}
              {onReanalyze && (
                <button
                  onClick={() => onReanalyze(currentEditorContent)}
                  disabled={isReanalyzing}
                  className="btn btn-primary btn-sm"
                  title="Reanalyze current content"
                >
                  {isReanalyzing ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Reanalyze
                    </>
                  )}
                </button>
              )}

              {enableAutoSave && (
                <div className="badge badge-info badge-outline">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  Auto-save enabled
                </div>
              )}
            </div>
          </div>

          {/* Embedded Text Editor */}
          <EmbeddedTextEditor
            initialContent={originalResumeText}
            onContentChange={(content) => {
              setCurrentEditorContent(content);
              onEditorContentChange?.(content);
            }}
            onEditorStateChange={onEditorStateChange ? onEditorStateChange : () => {}}
            placeholder="Start editing your resume content here..."
            height="500px"
            showToolbar={true}
            showControls={true}
            autoSave={enableAutoSave}
            onAutoSave={onAutoSave || (() => Promise.resolve())}
            className="w-full"
          />

          {/* Editor Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-info/10 border border-info/20">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-info/20 rounded-lg">
                    <LightBulbIcon className="w-5 h-5 text-info" />
                  </div>
                  <h3 className="card-title text-info">Editing Tips</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <span>Use the toolbar to format your text with headers, bold, and lists</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <span>Toggle preview mode to see how your resume will look</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <span>Changes are automatically tracked and can be saved</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <span>Use the reset button to revert to the original content</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-success/10 border border-success/20">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <TrophyIcon className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="card-title text-success">Best Practices</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <StarIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Keep your content concise and relevant to the target role</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Use action verbs and quantify your achievements</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Incorporate keywords from the job description</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Review the suggestions tab for optimization ideas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Detailed Analysis Sections */}
          <ReportSection
            title="ATS Friendliness Analysis"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            badge={`${atsScore}/100`}
            badgeColor={getScoreBadgeColor(atsScore)}
            defaultOpen
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">ATS Compatibility Score</span>
                <span className={`font-bold text-lg ${getScoreColor(atsScore)}`}>
                  {atsScore}/100
                </span>
              </div>

              <progress
                className={`progress w-full ${
                  atsScore >= 80
                    ? 'progress-success'
                    : atsScore >= 60
                      ? 'progress-warning'
                      : 'progress-error'
                }`}
                value={atsScore}
                max={100}
              />

              <div className="space-y-3">
                <h4 className="font-semibold text-base-content">Format Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Format Score</span>
                      <span className={getScoreColor(formatAnalysis.score)}>
                        {formatAnalysis.score}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ATS Compatibility</span>
                      <span className={getScoreColor(formatAnalysis.atsCompatibility)}>
                        {formatAnalysis.atsCompatibility}/100
                      </span>
                    </div>
                  </div>
                </div>

                {formatAnalysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-base-content">Format Issues</h5>
                    <div className="space-y-2">
                      {formatAnalysis.issues.map((issue, index) => (
                        <div key={index} className="alert alert-warning alert-sm">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{issue.description}</div>
                            <div className="text-sm opacity-80">{issue.recommendation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ReportSection>

          <ReportSection
            title="Keyword Matching Analysis"
            icon={<SparklesIcon className="w-6 h-6" />}
            badge={`${keywordAnalysis.matchedKeywords.length}/${keywordAnalysis.totalKeywords}`}
            badgeColor={getScoreBadgeColor(keywordAnalysis.score)}
          >
            <div className="space-y-6">
              {/* Keyword Score */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Keyword Match Score</span>
                <span className={`font-bold text-lg ${getScoreColor(keywordAnalysis.score)}`}>
                  {keywordAnalysis.score}/100
                </span>
              </div>

              <progress
                className={`progress w-full ${
                  keywordAnalysis.score >= 80
                    ? 'progress-success'
                    : keywordAnalysis.score >= 60
                      ? 'progress-warning'
                      : 'progress-error'
                }`}
                value={keywordAnalysis.score}
                max={100}
              />

              {/* Matched Keywords */}
              {keywordAnalysis.matchedKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-success mb-3">Matched Keywords</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keywordAnalysis.matchedKeywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="bg-success/10 border border-success/20 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-success">{keyword.keyword}</span>
                          <div className="flex items-center space-x-2">
                            <span className="badge badge-success badge-sm">
                              {keyword.frequency}x
                            </span>
                            <span className="badge badge-outline badge-sm">
                              {keyword.relevanceScore}/10
                            </span>
                          </div>
                        </div>
                        {keyword.context.length > 0 && (
                          <div className="text-sm text-base-content/70">
                            Context: {keyword.context.slice(0, 2).join(', ')}
                            {keyword.context.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {keywordAnalysis.missingKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-warning mb-3">Missing Important Keywords</h4>
                  <div className="space-y-3">
                    {keywordAnalysis.missingKeywords
                      .filter((k) => k.importance === 'high')
                      .slice(0, 5)
                      .map((keyword, index) => (
                        <div
                          key={index}
                          className="bg-warning/10 border border-warning/20 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-warning">{keyword.keyword}</span>
                            <span
                              className={`badge badge-sm ${
                                keyword.importance === 'high'
                                  ? 'badge-error'
                                  : keyword.importance === 'medium'
                                    ? 'badge-warning'
                                    : 'badge-info'
                              }`}
                            >
                              {keyword.importance} priority
                            </span>
                          </div>
                          <div className="text-sm text-base-content/70 mb-2">
                            Suggested placement: {keyword.suggestedPlacement.join(', ')}
                          </div>
                          {keyword.relatedTerms.length > 0 && (
                            <div className="text-sm text-base-content/70">
                              Related terms: {keyword.relatedTerms.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </ReportSection>

          <ReportSection
            title="Quantitative Achievement Analysis"
            icon={<TrophyIcon className="w-6 h-6" />}
            badge={`${quantitativeAnalysis.achievementsWithNumbers}/${quantitativeAnalysis.totalAchievements}`}
            badgeColor={getScoreBadgeColor(quantitativeAnalysis.score)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantification Score</span>
                <span className={`font-bold text-lg ${getScoreColor(quantitativeAnalysis.score)}`}>
                  {quantitativeAnalysis.score}/100
                </span>
              </div>

              <progress
                className={`progress w-full ${
                  quantitativeAnalysis.score >= 80
                    ? 'progress-success'
                    : quantitativeAnalysis.score >= 60
                      ? 'progress-warning'
                      : 'progress-error'
                }`}
                value={quantitativeAnalysis.score}
                max={100}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Quantified Achievements</div>
                  <div className="stat-value text-primary">
                    {quantitativeAnalysis.achievementsWithNumbers}
                  </div>
                  <div className="stat-desc">
                    out of {quantitativeAnalysis.totalAchievements} total
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Impact Words Used</div>
                  <div className="stat-value text-secondary">
                    {quantitativeAnalysis.impactWords.length}
                  </div>
                  <div className="stat-desc">Strong action verbs</div>
                </div>
              </div>

              {quantitativeAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-base-content mb-3">
                    Quantification Suggestions
                  </h4>
                  <div className="space-y-3">
                    {quantitativeAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="bg-info/10 border border-info/20 rounded-lg p-3">
                        <div className="font-medium text-info mb-2">
                          Section: {suggestion.section}
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="font-medium text-error mb-1">Before:</div>
                            <div className="bg-error/10 p-2 rounded">{suggestion.originalText}</div>
                          </div>
                          <div>
                            <div className="font-medium text-success mb-1">Suggested:</div>
                            <div className="bg-success/10 p-2 rounded">
                              {suggestion.suggestedText}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-base-content/70 mt-2">
                          {suggestion.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ReportSection>

          <ReportSection
            title="Grammar & Spelling Check"
            icon={<AcademicCapIcon className="w-6 h-6" />}
            badge={`${grammarCheck.totalIssues} issues`}
            badgeColor={grammarCheck.totalIssues === 0 ? 'badge-success' : 'badge-warning'}
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Grammar Score</div>
                  <div className={`stat-value ${getScoreColor(grammarCheck.score)}`}>
                    {grammarCheck.score}/100
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Readability</div>
                  <div className={`stat-value ${getScoreColor(grammarCheck.overallReadability)}`}>
                    {grammarCheck.overallReadability}/100
                  </div>
                </div>
              </div>

              {grammarCheck.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-base-content mb-3">Issues Found</h4>
                  <div className="space-y-2">
                    {grammarCheck.issues.slice(0, 5).map((issue, index) => (
                      <div
                        key={index}
                        className={`alert alert-sm ${
                          issue.severity === 'error'
                            ? 'alert-error'
                            : issue.severity === 'warning'
                              ? 'alert-warning'
                              : 'alert-info'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{issue.message}</div>
                          <div className="text-sm opacity-80">Context: "{issue.context}"</div>
                          {issue.suggestions.length > 0 && (
                            <div className="text-sm opacity-80">
                              Suggestions: {issue.suggestions.join(', ')}
                            </div>
                          )}
                        </div>
                        <span className="badge badge-outline badge-xs">{issue.type}</span>
                      </div>
                    ))}
                    {grammarCheck.issues.length > 5 && (
                      <div className="text-center text-sm text-base-content/70">
                        ... and {grammarCheck.issues.length - 5} more issues
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ReportSection>

          {/* Section Analysis */}
          {sectionAnalysis && Object.keys(sectionAnalysis).length > 0 && (
            <ReportSection
              title="Section Structure Analysis"
              icon={<DocumentTextIcon className="w-6 h-6" />}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(sectionAnalysis).map(([sectionName, analysis]) => (
                  <div key={sectionName} className="bg-base-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{sectionName}</h4>
                      <div className="flex items-center space-x-2">
                        {analysis.present ? (
                          <CheckCircleIcon className="w-5 h-5 text-success" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-error" />
                        )}
                        <span className={`badge badge-sm ${getScoreBadgeColor(analysis.score)}`}>
                          {analysis.score}/100
                        </span>
                      </div>
                    </div>

                    {analysis.suggestions.length > 0 && (
                      <ul className="text-sm text-base-content/70 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-warning">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </ReportSection>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;
