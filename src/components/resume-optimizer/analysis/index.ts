/**
 * Analysis Module Exports
 *
 * Centralized exports for all analysis-related components
 * Following barrel export pattern for clean imports
 */

// Re-export types for convenience
export type {
  Achievement,
  AnalysisDashboardProps,
  BenchmarkData,
  CategoryScores,
  EnhancedAnalysisResult,
  Milestone,
  Suggestion,
  SuggestionAction,
} from '../types';
export { AnalysisDashboard as default, AnalysisDashboard } from './AnalysisDashboard';
