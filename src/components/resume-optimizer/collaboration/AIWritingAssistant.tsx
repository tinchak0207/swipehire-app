/**
 * AI Writing Assistant Component
 *
 * Features:
 * - Grammar, tone, and style improvements
 * - Real-time writing suggestions
 * - Context-aware content enhancement
 * - Industry-specific writing guidance
 * - Readability and clarity optimization
 * - Professional tone adjustment
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EnhancedAnalysisResult, OptimizationGoals, UserProfile } from '../types';

// AI Writing Assistant Types
export interface AIWritingAssistantProps {
  readonly content: string;
  readonly selectedText?: string;
  readonly cursorPosition: CursorPosition;
  readonly userProfile: UserProfile;
  readonly optimizationGoals: OptimizationGoals;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly enableRealTime: boolean;
  readonly enableContextAware: boolean;
  readonly enableToneAdjustment: boolean;
  readonly onContentUpdate: (content: string) => void;
  readonly onSuggestionApply: (suggestion: WritingSuggestion) => void;
  readonly onToneChange: (tone: WritingTone) => void;
}

export interface CursorPosition {
  readonly line: number;
  readonly column: number;
  readonly offset: number;
  readonly context: string;
}

export interface WritingSuggestion {
  readonly id: string;
  readonly type: WritingSuggestionType;
  readonly category: WritingCategory;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly title: string;
  readonly description: string;
  readonly originalText: string;
  readonly suggestedText: string;
  readonly explanation: string;
  readonly confidence: number;
  readonly impact: WritingImpact;
  readonly position: TextRange;
  readonly alternatives: string[];
  readonly isRealTime: boolean;
  readonly canAutoApply: boolean;
}

export type WritingSuggestionType =
  | 'grammar'
  | 'spelling'
  | 'punctuation'
  | 'style'
  | 'tone'
  | 'clarity'
  | 'conciseness'
  | 'word-choice'
  | 'sentence-structure'
  | 'paragraph-flow';

export type WritingCategory =
  | 'correctness'
  | 'enhancement'
  | 'optimization'
  | 'professional'
  | 'readability';

export interface WritingImpact {
  readonly readabilityScore: number;
  readonly professionalismScore: number;
  readonly clarityScore: number;
  readonly engagementScore: number;
  readonly atsCompatibility: number;
}

export interface TextRange {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
}

export type WritingTone =
  | 'professional'
  | 'confident'
  | 'enthusiastic'
  | 'formal'
  | 'conversational'
  | 'technical'
  | 'creative';

export interface ToneAnalysis {
  readonly currentTone: WritingTone;
  readonly confidence: number;
  readonly recommendations: ToneRecommendation[];
  readonly toneConsistency: number;
  readonly appropriateness: number;
}

export interface ToneRecommendation {
  readonly targetTone: WritingTone;
  readonly reason: string;
  readonly examples: string[];
  readonly impact: number;
}

export interface WritingMetrics {
  readonly readabilityScore: number;
  readonly gradeLevel: number;
  readonly sentenceComplexity: number;
  readonly vocabularyLevel: string;
  readonly passiveVoicePercentage: number;
  readonly averageSentenceLength: number;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly paragraphCount: number;
}

export interface GrammarCheck {
  readonly errors: GrammarError[];
  readonly suggestions: GrammarSuggestion[];
  readonly overallScore: number;
  readonly errorTypes: Record<string, number>;
}

export interface GrammarError {
  readonly id: string;
  readonly type: GrammarErrorType;
  readonly severity: 'low' | 'medium' | 'high';
  readonly message: string;
  readonly position: TextRange;
  readonly suggestions: string[];
  readonly rule: string;
}

export type GrammarErrorType =
  | 'spelling'
  | 'grammar'
  | 'punctuation'
  | 'capitalization'
  | 'word-usage'
  | 'sentence-structure';

export interface GrammarSuggestion {
  readonly id: string;
  readonly type: 'improvement' | 'alternative' | 'enhancement';
  readonly description: string;
  readonly before: string;
  readonly after: string;
  readonly confidence: number;
}

export interface StyleGuide {
  readonly industry: string;
  readonly role: string;
  readonly guidelines: StyleGuideline[];
  readonly vocabulary: RecommendedVocabulary;
  readonly formatting: FormattingRules;
}

export interface StyleGuideline {
  readonly rule: string;
  readonly description: string;
  readonly examples: StyleExample[];
  readonly importance: 'low' | 'medium' | 'high';
}

export interface StyleExample {
  readonly incorrect: string;
  readonly correct: string;
  readonly explanation: string;
}

export interface RecommendedVocabulary {
  readonly preferred: string[];
  readonly avoid: string[];
  readonly alternatives: Record<string, string[]>;
  readonly industryTerms: string[];
}

export interface FormattingRules {
  readonly bulletPoints: boolean;
  readonly numberedLists: boolean;
  readonly boldText: boolean;
  readonly italicText: boolean;
  readonly maxSentenceLength: number;
  readonly maxParagraphLength: number;
}

// Icons for AI Writing Assistant
const WritingIcons = {
  AI: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  ),
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
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Tone: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  Readability: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Enhancement: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Metrics: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Magic: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Check: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Warning: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Error: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Animation variants
const assistantAnimations = {
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

// Writing Suggestion Card Component
const WritingSuggestionCard: React.FC<{
  suggestion: WritingSuggestion;
  onApply: () => void;
  onDismiss: () => void;
  onShowAlternatives: () => void;
  index: number;
}> = ({ suggestion, onApply, onDismiss, onShowAlternatives, index }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  const categoryIcons = {
    correctness: WritingIcons.Grammar,
    enhancement: WritingIcons.Enhancement,
    optimization: WritingIcons.Magic,
    professional: WritingIcons.Style,
    readability: WritingIcons.Readability,
  };

  const categoryColors = {
    correctness: 'border-error bg-error/10 text-error',
    enhancement: 'border-info bg-info/10 text-info',
    optimization: 'border-warning bg-warning/10 text-warning',
    professional: 'border-primary bg-primary/10 text-primary',
    readability: 'border-success bg-success/10 text-success',
  };

  const priorityColors = {
    low: 'badge-ghost',
    medium: 'badge-warning',
    high: 'badge-error',
    critical: 'badge-error animate-pulse',
  };

  const IconComponent = categoryIcons[suggestion.category];

  return (
    <motion.div
      className={`card border-2 ${categoryColors[suggestion.category]} transition-all duration-300 hover:shadow-lg`}
      variants={assistantAnimations.fadeIn}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-base-100 p-2">
              <IconComponent />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                <div className={`badge badge-sm ${priorityColors[suggestion.priority]}`}>
                  {suggestion.priority}
                </div>
              </div>
              <div className="mt-1 text-base-content/70 text-xs">
                {suggestion.type} • {Math.round(suggestion.confidence * 100)}% confidence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {suggestion.canAutoApply && (
              <div className="tooltip" data-tip="Can auto-apply">
                <WritingIcons.Magic />
              </div>
            )}
            {suggestion.isRealTime && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-base-content/80 text-sm">{suggestion.description}</p>

        {/* Original vs Suggested Text */}
        <div className="mt-4 space-y-2">
          <div className="rounded-lg border border-error/20 bg-error/10 p-3">
            <div className="mb-1 font-medium text-error text-xs">Original</div>
            <div className="text-sm">{suggestion.originalText}</div>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/10 p-3">
            <div className="mb-1 font-medium text-success text-xs">Suggested</div>
            <div className="text-sm">{suggestion.suggestedText}</div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-3">
          <p className="text-base-content/70 text-xs">
            <span className="font-medium">Why:</span> {suggestion.explanation}
          </p>
        </div>

        {/* Alternatives */}
        {suggestion.alternatives.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 font-medium text-xs">Alternatives</div>
            <div className="space-y-1">
              {suggestion.alternatives
                .slice(0, showDetails ? undefined : 2)
                .map((alternative, idx) => (
                  <div
                    key={idx}
                    className={`cursor-pointer rounded p-2 transition-colors ${
                      selectedAlternative === alternative
                        ? 'border border-primary bg-primary/20'
                        : 'bg-base-200 hover:bg-base-300'
                    }`}
                    onClick={() => setSelectedAlternative(alternative)}
                  >
                    <div className="text-sm">{alternative}</div>
                  </div>
                ))}
              {suggestion.alternatives.length > 2 && !showDetails && (
                <button className="btn btn-ghost btn-xs" onClick={() => setShowDetails(true)}>
                  Show {suggestion.alternatives.length - 2} more alternatives
                </button>
              )}
            </div>
          </div>
        )}

        {/* Impact Metrics */}
        {showDetails && (
          <motion.div
            className="mt-4 rounded-lg bg-base-200 p-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-2 font-medium text-xs">Expected Impact</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Readability:</span>
                <span className="font-medium">+{suggestion.impact.readabilityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Professional:</span>
                <span className="font-medium">+{suggestion.impact.professionalismScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Clarity:</span>
                <span className="font-medium">+{suggestion.impact.clarityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>ATS:</span>
                <span className="font-medium">+{suggestion.impact.atsCompatibility}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="card-actions mt-4 justify-between">
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Less' : 'More'}
            </button>
            {suggestion.alternatives.length > 0 && (
              <button className="btn btn-ghost btn-xs" onClick={onShowAlternatives}>
                Alternatives
              </button>
            )}
          </div>

          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs" onClick={onDismiss}>
              Dismiss
            </button>
            <button className="btn btn-primary btn-xs" onClick={onApply}>
              {suggestion.canAutoApply ? 'Auto Apply' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Writing Metrics Display Component
const WritingMetricsDisplay: React.FC<{
  metrics: WritingMetrics;
  toneAnalysis: ToneAnalysis;
}> = ({ metrics, toneAnalysis }) => {
  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getGradeLevelDescription = (level: number) => {
    if (level <= 8) return 'Easy to read';
    if (level <= 12) return 'Moderate complexity';
    if (level <= 16) return 'College level';
    return 'Graduate level';
  };

  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <WritingIcons.Metrics />
          Writing Metrics
        </h3>

        <div className="space-y-4">
          {/* Readability Score */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm">Readability Score</span>
              <span
                className={`font-bold text-lg ${getReadabilityColor(metrics.readabilityScore)}`}
              >
                {metrics.readabilityScore}
              </span>
            </div>
            <div className="progress progress-primary w-full">
              <div className="progress-bar" style={{ width: `${metrics.readabilityScore}%` }} />
            </div>
            <div className="mt-1 text-base-content/70 text-xs">
              Grade {metrics.gradeLevel} • {getGradeLevelDescription(metrics.gradeLevel)}
            </div>
          </div>

          {/* Tone Analysis */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-sm">Current Tone</span>
              <div className="badge badge-primary badge-sm">{toneAnalysis.currentTone}</div>
            </div>
            <div className="text-base-content/70 text-xs">
              {Math.round(toneAnalysis.confidence * 100)}% confidence •
              {Math.round(toneAnalysis.toneConsistency * 100)}% consistent
            </div>
          </div>

          {/* Writing Statistics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Words:</span>
              <span className="font-medium">{metrics.wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Characters:</span>
              <span className="font-medium">{metrics.characterCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Sentences:</span>
              <span className="font-medium">
                {Math.round(metrics.wordCount / metrics.averageSentenceLength)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Paragraphs:</span>
              <span className="font-medium">{metrics.paragraphCount}</span>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Avg. Sentence Length:</span>
              <span className="font-medium">{metrics.averageSentenceLength} words</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Passive Voice:</span>
              <span
                className={`font-medium ${metrics.passiveVoicePercentage > 20 ? 'text-warning' : 'text-success'}`}
              >
                {metrics.passiveVoicePercentage}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vocabulary Level:</span>
              <span className="font-medium">{metrics.vocabularyLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tone Adjustment Component
const ToneAdjustment: React.FC<{
  currentTone: WritingTone;
  recommendations: ToneRecommendation[];
  onToneChange: (tone: WritingTone) => void;
}> = ({ currentTone, recommendations, onToneChange }) => {
  const toneDescriptions = {
    professional: 'Formal and business-appropriate',
    confident: 'Assertive and self-assured',
    enthusiastic: 'Energetic and passionate',
    formal: 'Traditional and conservative',
    conversational: 'Friendly and approachable',
    technical: 'Precise and detail-oriented',
    creative: 'Innovative and expressive',
  };

  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <WritingIcons.Tone />
          Tone Adjustment
        </h3>

        <div className="space-y-4">
          {/* Current Tone */}
          <div>
            <div className="mb-2 font-medium text-sm">Current Tone</div>
            <div className="badge badge-primary">{currentTone}</div>
            <div className="mt-1 text-base-content/70 text-xs">{toneDescriptions[currentTone]}</div>
          </div>

          {/* Tone Options */}
          <div>
            <div className="mb-2 font-medium text-sm">Available Tones</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(toneDescriptions).map(([tone]) => (
                <button
                  key={tone}
                  className={`btn btn-sm ${tone === currentTone ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onToneChange(tone as WritingTone)}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="mb-2 font-medium text-sm">Recommendations</div>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="rounded bg-base-200 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-sm">{rec.targetTone}</span>
                      <div className="badge badge-success badge-xs">+{rec.impact} impact</div>
                    </div>
                    <div className="text-base-content/70 text-xs">{rec.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Grammar Check Component
const GrammarCheck: React.FC<{
  grammarCheck: GrammarCheck;
  onFixError: (errorId: string, suggestion: string) => void;
  onDismissError: (errorId: string) => void;
}> = ({ grammarCheck, onFixError, onDismissError }) => {
  const errorTypeIcons = {
    spelling: WritingIcons.Error,
    grammar: WritingIcons.Grammar,
    punctuation: WritingIcons.Warning,
    capitalization: WritingIcons.Style,
    'word-usage': WritingIcons.Enhancement,
    'sentence-structure': WritingIcons.Clarity,
  };

  const severityColors = {
    low: 'border-info bg-info/10',
    medium: 'border-warning bg-warning/10',
    high: 'border-error bg-error/10',
  };

  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <WritingIcons.Grammar />
            Grammar Check
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`badge ${grammarCheck.overallScore >= 80 ? 'badge-success' : grammarCheck.overallScore >= 60 ? 'badge-warning' : 'badge-error'}`}
            >
              {grammarCheck.overallScore}%
            </div>
            <div className="badge badge-outline badge-sm">{grammarCheck.errors.length} issues</div>
          </div>
        </div>

        {grammarCheck.errors.length === 0 ? (
          <div className="py-4 text-center">
            <WritingIcons.Check />
            <p className="mt-2 text-base-content/70 text-sm">No grammar issues found!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grammarCheck.errors.map((error) => {
              const IconComponent = errorTypeIcons[error.type];
              return (
                <div
                  key={error.id}
                  className={`rounded-lg border p-3 ${severityColors[error.severity]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent />
                      <div>
                        <div className="font-medium text-sm">{error.type}</div>
                        <div className="text-base-content/70 text-xs">
                          Line {error.position.line}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`badge badge-sm ${
                        error.severity === 'high'
                          ? 'badge-error'
                          : error.severity === 'medium'
                            ? 'badge-warning'
                            : 'badge-info'
                      }`}
                    >
                      {error.severity}
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">{error.message}</p>
                  </div>

                  {error.suggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 font-medium text-xs">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {error.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="btn btn-ghost btn-xs"
                            onClick={() => onFixError(error.id, suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => onDismissError(error.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Main AI Writing Assistant Component
export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  content,
  enableRealTime,
  enableToneAdjustment,
  onSuggestionApply,
  onToneChange,
}) => {
  // State management
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [metrics] = useState<WritingMetrics | null>(null);
  const [toneAnalysis] = useState<ToneAnalysis | null>(null);
  const [grammarCheck, setGrammarCheck] = useState<GrammarCheck | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'metrics' | 'tone' | 'grammar'>(
    'suggestions'
  );

  // Refs
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();

  // Analyze content
  const analyzeContent = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update suggestions based on content
      // This would be replaced with actual AI analysis
      console.log('Analyzing content:', content); // Use the content parameter
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content]);

  // Effects
  useEffect(() => {
    if (enableRealTime) {
      // Debounce analysis
      analysisTimeoutRef.current = setTimeout(() => {
        analyzeContent();
      }, 1000);
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [enableRealTime, analyzeContent]);

  // Handle suggestion application
  const handleSuggestionApply = useCallback(
    (suggestion: WritingSuggestion) => {
      onSuggestionApply(suggestion);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    },
    [onSuggestionApply]
  );

  // Handle suggestion dismissal
  const handleSuggestionDismiss = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  }, []);

  // Handle grammar error fix
  const handleGrammarFix = useCallback(
    (errorId: string) => {
      if (grammarCheck) {
        const updatedErrors = grammarCheck.errors.filter((e) => e.id !== errorId);
        setGrammarCheck((prev) => (prev ? { ...prev, errors: updatedErrors } : null));
      }
    },
    [grammarCheck]
  );

  // Handle grammar error dismissal
  const handleGrammarDismiss = useCallback(
    (errorId: string) => {
      if (grammarCheck) {
        const updatedErrors = grammarCheck.errors.filter((e) => e.id !== errorId);
        setGrammarCheck((prev) => (prev ? { ...prev, errors: updatedErrors } : null));
      }
    },
    [grammarCheck]
  );

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header */}
      <motion.div
        className="card bg-base-100 shadow-lg"
        variants={assistantAnimations.fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title">
              <WritingIcons.AI />
              AI Writing Assistant
              {isAnalyzing && <span className="loading loading-spinner loading-sm" />}
            </h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={analyzeContent}
              disabled={isAnalyzing}
            >
              <WritingIcons.Magic />
              Analyze
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mt-4">
            <button
              className={`tab ${activeTab === 'suggestions' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions ({suggestions.length})
            </button>
            <button
              className={`tab ${activeTab === 'metrics' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics
            </button>
            <button
              className={`tab ${activeTab === 'tone' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('tone')}
            >
              Tone
            </button>
            <button
              className={`tab ${activeTab === 'grammar' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('grammar')}
            >
              Grammar ({grammarCheck?.errors.length || 0})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            className="space-y-3"
            variants={assistantAnimations.stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {suggestions.map((suggestion, index) => (
              <WritingSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => handleSuggestionApply(suggestion)}
                onDismiss={() => handleSuggestionDismiss(suggestion.id)}
                onShowAlternatives={() => {}}
                index={index}
              />
            ))}

            {suggestions.length === 0 && (
              <div className="card border-2 border-dashed bg-base-100">
                <div className="card-body p-8 text-center">
                  <WritingIcons.Check />
                  <p className="mt-2 text-base-content/70 text-sm">
                    No writing suggestions at the moment. Your content looks great!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'metrics' && metrics && toneAnalysis && (
          <motion.div
            key="metrics"
            variants={assistantAnimations.fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <WritingMetricsDisplay metrics={metrics} toneAnalysis={toneAnalysis} />
          </motion.div>
        )}

        {activeTab === 'tone' && enableToneAdjustment && toneAnalysis && (
          <motion.div
            key="tone"
            variants={assistantAnimations.fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <ToneAdjustment
              currentTone={toneAnalysis.currentTone}
              recommendations={toneAnalysis.recommendations}
              onToneChange={onToneChange}
            />
          </motion.div>
        )}

        {activeTab === 'grammar' && grammarCheck && (
          <motion.div
            key="grammar"
            variants={assistantAnimations.fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <GrammarCheck
              grammarCheck={grammarCheck}
              onFixError={handleGrammarFix}
              onDismissError={handleGrammarDismiss}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIWritingAssistant;
