/**
 * Smart Suggestions Engine Component
 *
 * Features:
 * - Context-aware recommendations while typing
 * - Real-time content analysis and suggestions
 * - Industry-specific keyword recommendations
 * - Grammar, tone, and style improvements
 * - ATS optimization suggestions
 * - Performance impact predictions
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SuggestionCard from '../SuggestionCard';
import type {
  EnhancedAnalysisResult,
  OptimizationGoals,
  SuggestionAction,
  SuggestionType,
  UserProfile,
} from '../types';

// Smart Suggestions Types
export interface SmartSuggestionsProps {
  readonly content: string;
  readonly cursorPosition: CursorPosition;
  readonly userProfile: UserProfile;
  readonly optimizationGoals: OptimizationGoals;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly enableRealTime: boolean;
  readonly enableContextAware: boolean;
  readonly enableIndustrySpecific: boolean;
  readonly onSuggestionApply: (action: SuggestionAction) => void;
  readonly onSuggestionDismiss: (suggestionId: string) => void;
  readonly onContentUpdate: (content: string) => void;
}

export interface CursorPosition {
  readonly line: number;
  readonly column: number;
  readonly offset: number;
  readonly context: string;
  readonly selectedText?: string;
}

export interface SmartSuggestion {
  readonly id: string;
  readonly type: SuggestionType;
  readonly category: SuggestionCategory;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly title: string;
  readonly description: string;
  readonly originalText: string;
  readonly suggestedText: string;
  readonly reason: string;
  readonly confidence: number;
  readonly impact: ImpactMetrics;
  readonly position: TextPosition;
  readonly context: SuggestionContext;
  readonly isRealTime: boolean;
  readonly canAutoApply: boolean;
  readonly requiresUserInput: boolean;
}

export type SuggestionCategory =
  | 'grammar'
  | 'style'
  | 'tone'
  | 'keyword'
  | 'structure'
  | 'ats'
  | 'industry'
  | 'impact'
  | 'clarity'
  | 'conciseness';

export interface ImpactMetrics {
  readonly scoreIncrease: number;
  readonly atsImprovement: number;
  readonly readabilityGain: number;
  readonly keywordDensityChange: number;
  readonly industryRelevance: number;
}

export interface TextPosition {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
}

export interface SuggestionContext {
  readonly section: string;
  readonly surroundingText: string;
  readonly documentStructure: string[];
  readonly userIntent: string;
  readonly industryContext: string;
}

export interface ContextAnalysis {
  readonly currentSection: string;
  readonly writingStyle: 'formal' | 'casual' | 'technical' | 'creative';
  readonly tone: 'professional' | 'enthusiastic' | 'confident' | 'neutral';
  readonly complexity: 'simple' | 'moderate' | 'complex';
  readonly audience: 'recruiter' | 'hiring-manager' | 'technical' | 'executive';
  readonly intent: 'describe' | 'highlight' | 'quantify' | 'demonstrate';
}

export interface IndustryKeywords {
  readonly primary: string[];
  readonly secondary: string[];
  readonly trending: string[];
  readonly technical: string[];
  readonly soft: string[];
  readonly actionVerbs: string[];
}

export interface RealTimeFeedback {
  readonly isTyping: boolean;
  readonly lastKeystroke: Date;
  readonly typingSpeed: number;
  readonly pauseDuration: number;
  readonly suggestionTrigger: 'pause' | 'word-complete' | 'sentence-complete' | 'manual';
}

// Icons for the suggestions engine
const SuggestionIcons = {
  Grammar: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Style: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Tone: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Keyword: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Structure: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ATS: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Industry: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zm7-13a1 1 0 011-1h3a1 1 0 011 1v8a1 1 0 01-1 1h-3a1 1 0 01-1-1V2zm6 6a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Impact: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Clarity: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Conciseness: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
      <path
        fillRule="evenodd"
        d="M4 5a2 2 0 012-2v6h8V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM1.5 5.5a3 3 0 01.5-1.5v6a3 3 0 01-.5-1.5h-1a.5.5 0 010-1h1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Auto: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
    </svg>
  ),
  Magic: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 1a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Animation variants
const suggestionAnimations = {
  slideIn: {
    hidden: { x: 300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  },
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  },
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Adapter component for SmartSuggestion format
const SmartSuggestionCardAdapter: React.FC<{
  suggestion: SmartSuggestion;
  onApply: (suggestionId: string) => void;
  onDismiss: () => void;
  onPreview: () => void;
  index: number;
}> = ({ suggestion, onApply, onDismiss, index }) => {
  // Convert SmartSuggestion format to shared SuggestionCard format
  const convertedSuggestion = useMemo(() => {
    const priorityMap: Record<SmartSuggestion['priority'], number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return {
      id: suggestion.id,
      type: suggestion.category as any,
      title: suggestion.title,
      description: suggestion.description,
      impact: suggestion.priority as any,
      suggestion: suggestion.reason,
      beforeText: suggestion.originalText,
      afterText: suggestion.suggestedText,
      section: suggestion.category,
      priority: priorityMap[suggestion.priority],
      estimatedScoreImprovement: suggestion.impact.scoreIncrease,
    };
  }, [suggestion]);

  const handleApplyToEditor = (suggestionId: string, _suggestion: any) => {
    onApply(suggestionId);
  };

  return (
    <motion.div
      variants={suggestionAnimations.fadeIn}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
    >
      <SuggestionCard
        suggestion={convertedSuggestion}
        isAdopted={false}
        isIgnored={false}
        onAdopt={() => onApply(suggestion.id)}
        onIgnore={onDismiss}
        onApplyToEditor={suggestion.canAutoApply ? handleApplyToEditor : undefined}
      />
    </motion.div>
  );
};

// Context Analysis Display Component
const ContextAnalysisDisplay: React.FC<{
  analysis: ContextAnalysis;
  keywords: IndustryKeywords;
}> = ({ analysis, keywords }) => {
  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <SuggestionIcons.Lightbulb />
          Context Analysis
        </h3>

        <div className="space-y-3">
          {/* Current Context */}
          <div>
            <div className="mb-1 font-medium text-base-content/70 text-xs">Current Section</div>
            <div className="badge badge-primary badge-sm">{analysis.currentSection}</div>
          </div>

          {/* Writing Characteristics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 font-medium text-base-content/70 text-xs">Style</div>
              <div className="badge badge-outline badge-sm">{analysis.writingStyle}</div>
            </div>
            <div>
              <div className="mb-1 font-medium text-base-content/70 text-xs">Tone</div>
              <div className="badge badge-outline badge-sm">{analysis.tone}</div>
            </div>
            <div>
              <div className="mb-1 font-medium text-base-content/70 text-xs">Complexity</div>
              <div className="badge badge-outline badge-sm">{analysis.complexity}</div>
            </div>
            <div>
              <div className="mb-1 font-medium text-base-content/70 text-xs">Audience</div>
              <div className="badge badge-outline badge-sm">{analysis.audience}</div>
            </div>
          </div>

          {/* Recommended Keywords */}
          <div>
            <div className="mb-2 font-medium text-base-content/70 text-xs">
              Recommended Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {keywords.primary.slice(0, 3).map((keyword) => (
                <div key={keyword} className="badge badge-success badge-xs">
                  {keyword}
                </div>
              ))}
              {keywords.trending.slice(0, 2).map((keyword) => (
                <div key={keyword} className="badge badge-warning badge-xs">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Real-Time Feedback Component
const RealTimeFeedback: React.FC<{
  feedback: RealTimeFeedback;
  isActive: boolean;
}> = ({ feedback, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <SuggestionIcons.Magic />
          Real-Time Feedback
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <div
              className={`badge badge-sm ${feedback.isTyping ? 'badge-success' : 'badge-ghost'}`}
            >
              {feedback.isTyping ? 'Typing...' : 'Idle'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Typing Speed</span>
            <span className="font-medium text-sm">{feedback.typingSpeed} WPM</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Last Suggestion</span>
            <span className="font-medium text-sm">{feedback.suggestionTrigger}</span>
          </div>

          {feedback.pauseDuration > 2000 && (
            <div className="alert alert-info">
              <SuggestionIcons.Lightbulb />
              <span className="text-sm">
                You've paused for a while. Would you like suggestions for this section?
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Smart Suggestions Engine Component
export const SmartSuggestionsEngine: React.FC<SmartSuggestionsProps> = ({
  enableRealTime,
  onSuggestionApply,
  onSuggestionDismiss,
  enableContextAware,
}) => {
  // State management
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [contextAnalysis, setContextAnalysis] = useState<ContextAnalysis | null>(null);
  const [industryKeywords, setIndustryKeywords] = useState<IndustryKeywords | null>(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState<RealTimeFeedback>({
    isTyping: false,
    lastKeystroke: new Date(),
    typingSpeed: 0,
    pauseDuration: 0,
    suggestionTrigger: 'manual',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'impact'>('priority');

  // Refs

  // Mock data for demonstration
  const mockSuggestions: SmartSuggestion[] = [
    {
      id: 'suggestion-1',
      type: 'keyword-optimization',
      category: 'keyword',
      priority: 'high',
      title: 'Add Industry Keywords',
      description: 'Include relevant keywords to improve ATS compatibility',
      originalText: 'Managed team projects',
      suggestedText: 'Led cross-functional team projects using Agile methodologies',
      reason: 'Adding specific methodologies and leadership terms improves keyword density',
      confidence: 0.92,
      impact: {
        scoreIncrease: 8,
        atsImprovement: 15,
        readabilityGain: 5,
        keywordDensityChange: 12,
        industryRelevance: 18,
      },
      position: { start: 150, end: 170, line: 5, column: 10 },
      context: {
        section: 'experience',
        surroundingText:
          'Software Engineer at TechCorp. Managed team projects and delivered solutions.',
        documentStructure: ['contact', 'summary', 'experience', 'education'],
        userIntent: 'highlight',
        industryContext: 'technology',
      },
      isRealTime: true,
      canAutoApply: true,
      requiresUserInput: false,
    },
    {
      id: 'suggestion-2',
      type: 'grammar-correction',
      category: 'grammar',
      priority: 'medium',
      title: 'Fix Grammar Error',
      description: 'Correct grammatical inconsistency',
      originalText: 'Responsible for manage the team',
      suggestedText: 'Responsible for managing the team',
      reason: 'Verb form should be gerund after "for"',
      confidence: 0.98,
      impact: {
        scoreIncrease: 3,
        atsImprovement: 2,
        readabilityGain: 8,
        keywordDensityChange: 0,
        industryRelevance: 0,
      },
      position: { start: 200, end: 230, line: 7, column: 5 },
      context: {
        section: 'experience',
        surroundingText:
          'Team Lead position. Responsible for manage the team and coordinate projects.',
        documentStructure: ['contact', 'summary', 'experience', 'education'],
        userIntent: 'describe',
        industryContext: 'technology',
      },
      isRealTime: false,
      canAutoApply: true,
      requiresUserInput: false,
    },
    {
      id: 'suggestion-3',
      type: 'content-enhancement',
      category: 'impact',
      priority: 'critical',
      title: 'Quantify Achievement',
      description: 'Add specific metrics to demonstrate impact',
      originalText: 'Improved system performance',
      suggestedText: 'Improved system performance by 40%, reducing load times from 3s to 1.8s',
      reason: 'Quantified results are more compelling and demonstrate concrete value',
      confidence: 0.85,
      impact: {
        scoreIncrease: 12,
        atsImprovement: 8,
        readabilityGain: 10,
        keywordDensityChange: 5,
        industryRelevance: 15,
      },
      position: { start: 300, end: 325, line: 10, column: 8 },
      context: {
        section: 'experience',
        surroundingText:
          'Senior Developer role. Improved system performance and optimized database queries.',
        documentStructure: ['contact', 'summary', 'experience', 'education'],
        userIntent: 'quantify',
        industryContext: 'technology',
      },
      isRealTime: false,
      canAutoApply: false,
      requiresUserInput: true,
    },
  ];

  const mockContextAnalysis: ContextAnalysis = {
    currentSection: 'Work Experience',
    writingStyle: 'formal',
    tone: 'confident',
    complexity: 'moderate',
    audience: 'hiring-manager',
    intent: 'highlight',
  };

  const mockIndustryKeywords: IndustryKeywords = {
    primary: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
    secondary: ['MongoDB', 'Express', 'Docker', 'Kubernetes', 'CI/CD'],
    trending: ['Next.js', 'GraphQL', 'Microservices', 'Serverless', 'AI/ML'],
    technical: ['API', 'Database', 'Frontend', 'Backend', 'Full-stack'],
    soft: ['Leadership', 'Communication', 'Problem-solving', 'Teamwork', 'Adaptability'],
    actionVerbs: ['Developed', 'Implemented', 'Optimized', 'Led', 'Architected'],
  };

  // Initialize mock data
  useEffect(() => {
    setSuggestions(mockSuggestions);
    setContextAnalysis(mockContextAnalysis);
    setIndustryKeywords(mockIndustryKeywords);
  }, []);

  // Analyze content for suggestions
  const analyzeContent = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Simulate API call for content analysis
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update suggestions based on current content and context
      const newSuggestions = mockSuggestions.map((suggestion) => ({
        ...suggestion,
        isRealTime: enableRealTime,
      }));

      setSuggestions(newSuggestions);

      setRealTimeFeedback((prev) => ({
        ...prev,
        suggestionTrigger: 'pause',
      }));
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [enableRealTime]);

  // Handle suggestion application
  const handleSuggestionApply = useCallback(
    (suggestion: SmartSuggestion) => {
      onSuggestionApply({
        type: 'apply',
        suggestionId: suggestion.id,
        customization: {
          originalText: suggestion.originalText,
          suggestedText: suggestion.suggestedText,
          position: suggestion.position,
        },
      });

      // Remove applied suggestion
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    },
    [onSuggestionApply]
  );

  // Handle suggestion dismissal
  const handleSuggestionDismiss = useCallback(
    (suggestionId: string) => {
      onSuggestionDismiss(suggestionId);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    },
    [onSuggestionDismiss]
  );

  // Handle suggestion preview
  const handleSuggestionPreview = useCallback((suggestion: SmartSuggestion) => {
    // Implement preview functionality
    console.log('Preview suggestion:', suggestion);
  }, []);

  // Filter and sort suggestions
  const filteredAndSortedSuggestions = useMemo(() => {
    let filtered = suggestions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'confidence':
          return b.confidence - a.confidence;
        case 'impact':
          return b.impact.scoreIncrease - a.impact.scoreIncrease;
        default:
          return 0;
      }
    });
  }, [suggestions, selectedCategory, sortBy]);

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header */}
      <motion.div
        className="card bg-base-100 shadow-lg"
        variants={suggestionAnimations.fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-lg">
              Smart Suggestions
              {isAnalyzing && <span className="loading loading-spinner loading-sm" />}
            </h2>
            <div className="badge badge-primary badge-sm">{suggestions.length}</div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              className="select select-bordered select-xs"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SuggestionCategory | 'all')}
            >
              <option value="all">All Categories</option>
              <option value="grammar">Grammar</option>
              <option value="style">Style</option>
              <option value="tone">Tone</option>
              <option value="keyword">Keywords</option>
              <option value="structure">Structure</option>
              <option value="ats">ATS</option>
              <option value="industry">Industry</option>
              <option value="impact">Impact</option>
              <option value="clarity">Clarity</option>
              <option value="conciseness">Conciseness</option>
            </select>

            <select
              className="select select-bordered select-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'confidence' | 'impact')}
            >
              <option value="priority">Priority</option>
              <option value="confidence">Confidence</option>
              <option value="impact">Impact</option>
            </select>

            <button
              className="btn btn-primary btn-xs"
              onClick={analyzeContent}
              disabled={isAnalyzing}
            >
              <SuggestionIcons.Magic />
              Analyze
            </button>
          </div>
        </div>
      </motion.div>

      {/* Context Analysis */}
      {enableContextAware && contextAnalysis && industryKeywords && (
        <motion.div variants={suggestionAnimations.fadeIn} initial="hidden" animate="visible">
          <ContextAnalysisDisplay analysis={contextAnalysis} keywords={industryKeywords} />
        </motion.div>
      )}

      {/* Real-Time Feedback */}
      {enableRealTime && (
        <motion.div variants={suggestionAnimations.fadeIn} initial="hidden" animate="visible">
          <RealTimeFeedback feedback={realTimeFeedback} isActive={enableRealTime} />
        </motion.div>
      )}

      {/* Suggestions List */}
      <motion.div
        className="space-y-3"
        variants={suggestionAnimations.stagger}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredAndSortedSuggestions.map((suggestion, index) => (
            <SmartSuggestionCardAdapter
              key={suggestion.id}
              suggestion={suggestion}
              onApply={() => handleSuggestionApply(suggestion)}
              onDismiss={() => handleSuggestionDismiss(suggestion.id)}
              onPreview={() => handleSuggestionPreview(suggestion)}
              index={index}
            />
          ))}
        </AnimatePresence>

        {filteredAndSortedSuggestions.length === 0 && !isAnalyzing && (
          <div className="card border-2 border-dashed bg-base-100">
            <div className="card-body p-8 text-center">
              <SuggestionIcons.Lightbulb />
              <p className="mt-2 text-base-content/70 text-sm">
                {selectedCategory === 'all'
                  ? 'No suggestions available. Keep writing for AI-powered recommendations!'
                  : `No ${selectedCategory} suggestions found. Try a different category.`}
              </p>
              <button className="btn btn-primary btn-sm mt-4" onClick={analyzeContent}>
                Get Suggestions
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SmartSuggestionsEngine;
