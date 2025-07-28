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
export { AnalysisDashboard } from './analysis/AnalysisDashboard';
// Predictive Analytics - AI-powered resume performance insights
export * from './analytics';
export { EnhancedEditor, EnhancedEditorIntegration } from './editor';
// Gamification
export * from './gamification';
// Integration components
export * from './integration';
// Mobile-first responsive design components
export * from './mobile';
export { EnhancedOnboarding } from './onboarding/EnhancedOnboarding';
// Core components
export { default as ReportDisplay } from './ReportDisplay';
export { default as ScoreDisplay } from './ScoreDisplay';
// Enhanced components
export { SmartUpload } from './SmartUpload';
export { default as SuggestionCard } from './SuggestionCard';
// Smart Suggestions Engine - Context-aware recommendations
export * from './suggestions';
export { default as TemplateCard } from './TemplateCard';
// Smart Templates - AI-powered template recommendations
export * from './templates';
// Enhanced types
export type {
  Achievement,
  AnalysisDashboardProps,
  BenchmarkData,
  CategoryScores,
  ContentAnalysis,
  EnhancedAnalysisResult,
  Milestone,
  OnboardingState,
  OptimizationGoals,
  SmartUploadProps,
  Suggestion,
  SuggestionAction,
  UploadProgress,
  UserProfile,
} from './types';
// Enhanced upload module - Multi-modal input system with advanced features
export * from './upload';
// AI-Powered Video Generation - Next-generation resume video creation
export * from './video';
