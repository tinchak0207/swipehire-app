/**
 * Real-Time Collaboration Components Export
 *
 * This module exports all the Phase 3 (Advanced Features) components
 * for the Resume Optimizer's real-time collaboration system.
 */

export type {
  AIWritingAssistantProps,
  GrammarCheck,
  GrammarError,
  ToneAnalysis,
  WritingCategory,
  WritingImpact,
  WritingMetrics,
  WritingSuggestion,
  WritingSuggestionType,
  WritingTone,
} from './AIWritingAssistant';
export { AIWritingAssistant } from './AIWritingAssistant';
export type {
  Attachment,
  ChangeImpact,
  CollaborationEvent as EnhancedCollaborationEvent,
  CollaborationUser as EnhancedCollaborationUser,
  CursorPosition as EnhancedCursorPosition,
  EnhancedLivePreviewProps,
  LiveChange as EnhancedLiveChange,
  PreviewMode as EnhancedPreviewMode,
  Suggestion,
  SuggestionVote,
  TextPosition,
  TextSelection as EnhancedTextSelection,
  UserPermissions as EnhancedUserPermissions,
  VersionSnapshot,
} from './EnhancedLivePreviewSystem';
export { EnhancedLivePreviewSystem } from './EnhancedLivePreviewSystem';
export type { LivePreviewIntegrationProps } from './LivePreviewIntegration';
export { LivePreviewIntegration } from './LivePreviewIntegration';
export type {
  CollaborationEvent,
  CollaborationUser,
  CursorPosition,
  LiveChange,
  LivePreviewProps,
  PreviewMode,
  TextSelection,
  UserPermissions,
} from './LivePreviewSystem';
export { LivePreviewSystem } from './LivePreviewSystem';
export type {
  ContextAnalysis,
  ImpactMetrics,
  IndustryKeywords,
  RealTimeFeedback,
  SmartSuggestion,
  SmartSuggestionsProps,
  SuggestionCategory,
} from './SmartSuggestionsEngine';
export { SmartSuggestionsEngine } from './SmartSuggestionsEngine';
export type {
  ChangeDetail,
  DiffChunk,
  DiffResult,
  DiffSummary,
  VersionBranch,
  VersionEntry,
  VersionFilter,
  VersionHistoryProps,
} from './VersionHistory';
export { VersionHistory } from './VersionHistory';
