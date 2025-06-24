/**
 * Resume Optimizer Components
 * Centralized exports for all resume optimizer related components
 */

// Re-export types for convenience
export type {
  ScoreDisplayProps,
  SuggestionCardProps,
  TemplateCardProps,
} from '@/lib/types/resume-optimizer';
export { default as ScoreDisplay } from './ScoreDisplay';
export { default as SuggestionCard } from './SuggestionCard';
export { default as TemplateCard } from './TemplateCard';
export { default as ReportDisplay } from './ReportDisplay';
