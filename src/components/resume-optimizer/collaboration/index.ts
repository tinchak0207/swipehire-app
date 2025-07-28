/**
 * Real-Time Collaboration Components Export
 *
 * This module exports all the Phase 3 (Advanced Features) components
 * for the Resume Optimizer's real-time collaboration system.
 */

export * from './CollaborationPanel';
export * from './Comments';
export * from './LivePreviewIntegration';
export * from './MentorMatching';
export * from './VersionHistory';
export * from './PeerReview';

// Selective exports to avoid type conflicts
export { AIWritingAssistant } from './AIWritingAssistant';
export { SmartSuggestionsEngine } from './SmartSuggestionsEngine';
export { EnhancedLivePreviewSystem } from './EnhancedLivePreviewSystem';
export { LivePreviewSystem } from './LivePreviewSystem';
