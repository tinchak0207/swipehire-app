/**
 * Enhanced Editor Module Exports
 *
 * Centralized exports for all Enhanced Editor components and utilities
 */

export type { CollaborationUser } from '../collaboration';
// Re-export types for convenience
export type {
  AIAssistantSuggestion,
  ChangeDescription,
  ContentBlock,
  CursorPosition,
  EnhancedEditorProps,
  FormatPainterState,
  ResumeTemplate,
  TextFormat,
  TextPosition,
  TextSelection,
  VersionHistoryEntry,
} from './EnhancedEditor';
// Main component
export { EnhancedEditor } from './EnhancedEditor';
// Integration components
export {
  EnhancedEditorExample,
  EnhancedEditorIntegration,
} from './EnhancedEditor.integration';
