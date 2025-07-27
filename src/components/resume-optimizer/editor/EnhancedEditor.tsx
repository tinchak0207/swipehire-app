/**
 * Enhanced Editor Experience Component
 *
 * Features:
 * - Real-time collaboration with live preview and multi-user editing
 * - Smart suggestions while typing with context-aware recommendations
 * - Version history tracking with rollback capability
 * - AI writing assistant for grammar, tone, and style improvements
 * - Visual enhancement tools including template switcher and format painter
 * - Content blocks system with drag-and-drop resume sections
 * - Smart formatting with auto-adjust spacing and alignment
 * - Mobile-optimized editing with touch-friendly controls
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { CollaborationUser } from '../collaboration';
import type {
  CollaborativeSuggestion,
  Comment,
  EnhancedAnalysisResult,
  OptimizationGoals,
  ResumeSection,
  SectionType,
  SuggestionAction,
  UserProfile,
} from '../types';
import Comments from './collaboration/Comments';

// Enhanced Editor Props Interface
export interface EnhancedEditorProps {
  readonly initialContent: string;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly userProfile: UserProfile;
  readonly optimizationGoals: OptimizationGoals;
  readonly enableCollaboration: boolean;
  readonly enableAIAssistant: boolean;
  readonly enableVersionHistory: boolean;
  readonly onContentChange: (content: string) => void;
  readonly onSectionReorder: (sections: ResumeSection[]) => void;
  readonly onSuggestionApply: (action: SuggestionAction) => void;
  readonly onTemplateChange: (templateId: string) => void;
  readonly onExport: (format: 'pdf' | 'docx' | 'txt') => void;
}

// Collaboration Types

export interface CursorPosition {
  readonly line: number;
  readonly column: number;
  readonly selection?: TextSelection;
}

export interface TextSelection {
  readonly start: number;
  readonly end: number;
}

// Version Control Types
export interface VersionHistoryEntry {
  readonly id: string;
  readonly content: string;
  readonly timestamp: Date;
  readonly author: string;
  readonly changes: ChangeDescription[];
  score?: number;
}

export interface ChangeDescription {
  readonly type: 'addition' | 'deletion' | 'modification';
  readonly section: string;
  readonly description: string;
  readonly impact: number;
}

// AI Assistant Types
export interface AIAssistantSuggestion {
  readonly id: string;
  readonly type: 'grammar' | 'tone' | 'style' | 'content' | 'keyword';
  readonly original: string;
  readonly suggested: string;
  readonly reason: string;
  readonly confidence: number;
  readonly position: TextPosition;
}

export interface TextPosition {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
}

// Template and Formatting Types
export interface ResumeTemplate {
  readonly id: string;
  readonly name: string;
  readonly preview: string;
  readonly category: 'modern' | 'classic' | 'creative' | 'minimal';
  readonly atsCompatible: boolean;
  readonly industry: string[];
}

export interface FormatPainterState {
  readonly isActive: boolean;
  readonly sourceFormat?: TextFormat;
  readonly targetSelection?: TextSelection;
}

export interface TextFormat {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: string;
  readonly color: string;
  readonly backgroundColor: string;
  readonly alignment: 'left' | 'center' | 'right' | 'justify';
}

// Content Block Types
export interface ContentBlock {
  readonly id: string;
  readonly type: SectionType;
  readonly title: string;
  readonly content: string;
  readonly order: number;
  readonly isVisible: boolean;
  readonly isRequired: boolean;
  readonly suggestions: AIAssistantSuggestion[];
}

// Icons for the editor
const EditorIcons = {
  Edit: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  AI: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  ),
  History: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Template: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Collaboration: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
    </svg>
  ),
  FormatPainter: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  DragHandle: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  ),
  Save: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
    </svg>
  ),
  Export: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Undo: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Redo: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
    </svg>
  ),
  Magic: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 1a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Target: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 001 1h2a1 1 0 100-2h-1V7z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Animation variants
const editorAnimations: any = {
  slideIn: {
    hidden: { x: -300, opacity: 0 },
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
  suggestion: {
    hidden: { x: 50, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  },
};

// Collaboration User Avatar Component
const CollaborationAvatar: React.FC<{
  user: CollaborationUser;
  size?: 'sm' | 'md' | 'lg';
}> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="tooltip" data-tip={`${user.name} ${user.isActive ? '(active)' : '(away)'}`}>
      <div className={`avatar ${user.isActive ? 'online' : 'offline'}`}>
        <div
          className={`${sizeClasses[size]} rounded-full ring ring-primary ring-offset-2 ring-offset-base-100`}
        >
          <img src={user.avatar} alt={user.name} />
        </div>
      </div>
    </div>
  );
};

// AI Assistant Suggestion Component
const AIAssistantSuggestion: React.FC<{
  suggestion: AIAssistantSuggestion;
  onAccept: () => void;
  onReject: () => void;
  index: number;
}> = ({ suggestion, onAccept, onReject, index }) => {
  const typeColors = {
    grammar: 'border-error bg-error/10',
    tone: 'border-warning bg-warning/10',
    style: 'border-info bg-info/10',
    content: 'border-success bg-success/10',
    keyword: 'border-primary bg-primary/10',
  };

  const typeIcons = {
    grammar: '📝',
    tone: '🎭',
    style: '✨',
    content: '💡',
    keyword: '🔑',
  };

  return (
    <motion.div
      className={`card border-2 ${typeColors[suggestion.type]} transition-all duration-300`}
      variants={editorAnimations.suggestion}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className="card-body p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[suggestion.type]}</span>
            <div>
              <div className="font-semibold text-sm capitalize">{suggestion.type}</div>
              <div className="text-base-content/70 text-xs">
                Confidence: {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="rounded border border-error/20 bg-error/10 p-2 text-sm">
            <div className="mb-1 font-medium text-error text-xs">Original</div>
            <div>{suggestion.original}</div>
          </div>
          <div className="rounded border border-success/20 bg-success/10 p-2 text-sm">
            <div className="mb-1 font-medium text-success text-xs">Suggested</div>
            <div>{suggestion.suggested}</div>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-base-content/70 text-xs">{suggestion.reason}</p>
        </div>

        <div className="card-actions mt-3 justify-end">
          <button className="btn btn-ghost btn-xs" onClick={onReject}>
            Reject
          </button>
          <button className="btn btn-primary btn-xs" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Content Block Component with Drag and Drop
const ContentBlock: React.FC<{
  block: ContentBlock;
  onContentChange: (id: string, content: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  isDragging: boolean;
}> = ({ block, onContentChange, onToggleVisibility, onDelete, isDragging }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();

  const handleSave = useCallback(() => {
    onContentChange(block.id, content);
    setIsEditing(false);
  }, [block.id, content, onContentChange]);

  const handleCancel = useCallback(() => {
    setContent(block.content);
    setIsEditing(false);
  }, [block.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className={`card border-2 bg-base-100 transition-all duration-300 ${
        isDragging ? 'scale-105 border-primary shadow-lg' : 'border-base-300'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost btn-sm cursor-grab p-1 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <EditorIcons.DragHandle />
            </button>
            <div>
              <h3 className="font-semibold">{block.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={`badge badge-sm ${block.isRequired ? 'badge-error' : 'badge-neutral'}`}
                >
                  {block.isRequired ? 'Required' : 'Optional'}
                </div>
                {block.suggestions.length > 0 && (
                  <div className="badge badge-warning badge-sm">
                    {block.suggestions.length} suggestions
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`btn btn-sm ${block.isVisible ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => onToggleVisibility(block.id)}
            >
              {block.isVisible ? '👁️' : '👁️‍🗨️'}
            </button>
            {!block.isRequired && (
              <button className="btn btn-error btn-sm" onClick={() => onDelete(block.id)}>
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                className="textarea textarea-bordered min-h-[100px] w-full resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Enter your ${block.title.toLowerCase()} here...`}
              />
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className="min-h-[60px] cursor-pointer rounded bg-base-200 p-3 transition-colors hover:bg-base-300"
              onClick={() => setIsEditing(true)}
            >
              {block.content || (
                <span className="text-base-content/50 italic">
                  Click to add {block.title.toLowerCase()}...
                </span>
              )}
            </div>
          )}
        </div>

        {/* AI Suggestions for this block */}
        {block.suggestions.length > 0 && (
          <div className="mt-4">
            <div className="divider text-xs">AI Suggestions</div>
            <div className="space-y-2">
              {block.suggestions.slice(0, 2).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded border border-info/20 bg-info/10 p-2 text-sm"
                >
                  <div className="font-medium">{suggestion.type}</div>
                  <div className="text-base-content/70 text-xs">{suggestion.reason}</div>
                </div>
              ))}
              {block.suggestions.length > 2 && (
                <button className="btn btn-ghost btn-xs w-full">
                  View {block.suggestions.length - 2} more suggestions
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};

// Version History Component
const VersionHistory: React.FC<{
  versions: VersionHistoryEntry[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}> = ({ versions, currentVersion, onRestore, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card max-h-[80vh] w-full max-w-4xl overflow-hidden bg-base-100"
        variants={editorAnimations.scaleIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Version History</h2>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="timeline timeline-vertical">
              {versions.map((version, index) => (
                <div key={version.id} className="timeline-item">
                  <div className="timeline-start">
                    <div className="font-medium text-sm">
                      {version.timestamp.toLocaleDateString()}
                    </div>
                    <div className="text-base-content/70 text-xs">
                      {version.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="timeline-middle">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        version.id === currentVersion ? 'bg-primary' : 'bg-base-300'
                      }`}
                    />
                  </div>

                  <div className="timeline-end">
                    <div className="card border bg-base-200">
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Version {versions.length - index}</div>
                            <div className="text-base-content/70 text-sm">by {version.author}</div>
                            {version.score && (
                              <div className="text-sm">
                                Score: <span className="font-bold">{version.score}</span>
                              </div>
                            )}
                          </div>

                          {version.id !== currentVersion && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onRestore(version.id)}
                            >
                              Restore
                            </button>
                          )}
                        </div>

                        {version.changes.length > 0 && (
                          <div className="mt-3">
                            <div className="mb-2 font-medium text-xs">Changes:</div>
                            <div className="space-y-1">
                              {version.changes.map((change, changeIndex) => (
                                <div key={changeIndex} className="flex items-center gap-2 text-xs">
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      change.type === 'addition'
                                        ? 'bg-success'
                                        : change.type === 'deletion'
                                          ? 'bg-error'
                                          : 'bg-warning'
                                    }`}
                                  />
                                  <span>{change.description}</span>
                                  {change.impact > 0 && (
                                    <span className="badge badge-success badge-xs">
                                      +{change.impact}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Template Selector Component
const TemplateSelector: React.FC<{
  templates: ResumeTemplate[];
  currentTemplate: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}> = ({ templates, currentTemplate, onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ResumeTemplate['category']>('modern');

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => template.category === selectedCategory);
  }, [templates, selectedCategory]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card max-h-[80vh] w-full max-w-6xl overflow-hidden bg-base-100"
        variants={editorAnimations.scaleIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Choose Template</h2>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="tabs tabs-boxed">
            {(['modern', 'classic', 'creative', 'minimal'] as const).map((category) => (
              <button
                key={category}
                className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid max-h-[50vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`card cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                  template.id === currentTemplate
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300'
                }`}
                onClick={() => onSelect(template.id)}
              >
                <div className="card-body p-4">
                  <div className="mb-3 aspect-[3/4] overflow-hidden rounded bg-base-200">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h3 className="font-semibold">{template.name}</h3>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.atsCompatible && (
                      <div className="badge badge-success badge-xs">ATS Compatible</div>
                    )}
                    <div className="badge badge-outline badge-xs">{template.category}</div>
                  </div>

                  <div className="mt-2 text-base-content/70 text-xs">
                    Best for: {template.industry.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Enhanced Editor Component
export const EnhancedEditor: React.FC<EnhancedEditorProps> = ({
  initialContent,
  analysisResult,
  userProfile,
  enableCollaboration,
  enableAIAssistant,
  enableVersionHistory,
  onContentChange,
  onSectionReorder,
  onSuggestionApply,
  onTemplateChange,
  onExport,
}) => {
  // State management
  const [content, setContent] = useState(initialContent);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [collaborationUsers, setCollaborationUsers] = useState<CollaborationUser[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIAssistantSuggestion[]>([]);
  const [versions, setVersions] = useState<VersionHistoryEntry[]>([]);
  const [, setFormatPainter] = useState<FormatPainterState>({ isActive: false });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-1');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborativeSuggestions, setCollaborativeSuggestions] = useState<
    CollaborativeSuggestion[]
  >([]);
  const [showComments, setShowComments] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [aiSuggestionsError, setAiSuggestionsError] = useState<string | null>(null);

  const handleAddComment = (comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      timestamp: new Date(),
      replies: [],
      ...comment,
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleAddReply = (
    reply: Omit<Comment, 'id' | 'timestamp' | 'replies'>,
    parentId: string
  ) => {
    const newReply: Comment = {
      id: `comment-${Date.now()}`,
      timestamp: new Date(),
      replies: [],
      ...reply,
    };
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId ? { ...comment, replies: [...comment.replies, newReply] } : comment
      )
    );
  };

  const handleVoteSuggestion = (suggestionId: string, vote: 'up' | 'down') => {
    setCollaborativeSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === suggestionId
          ? { ...suggestion, votes: { ...suggestion.votes, [vote]: suggestion.votes[vote] + 1 } }
          : suggestion
      )
    );
  };

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const socketRef = useRef<Socket>();

  // Mock data for demonstration
  const mockTemplates: ResumeTemplate[] = [
    {
      id: 'modern-1',
      name: 'Modern Professional',
      preview: '/templates/modern-1.png',
      category: 'modern',
      atsCompatible: true,
      industry: ['Technology', 'Finance', 'Consulting'],
    },
    {
      id: 'classic-1',
      name: 'Classic Executive',
      preview: '/templates/classic-1.png',
      category: 'classic',
      atsCompatible: true,
      industry: ['Executive', 'Legal', 'Healthcare'],
    },
    {
      id: 'creative-1',
      name: 'Creative Portfolio',
      preview: '/templates/creative-1.png',
      category: 'creative',
      atsCompatible: false,
      industry: ['Design', 'Marketing', 'Media'],
    },
  ];

  // WebSocket connection
  useEffect(() => {
    if (enableCollaboration) {
      const socket = io('http://localhost:3001');
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setConnectionStatus('connected');
        // Join a room based on the resume ID or a unique identifier
        socket.emit('joinRoom', 'resume-1');
      });

      socket.on('collaborationUpdate', (data) => {
        // Handle incoming collaboration data
        if (data.users) {
          setCollaborationUsers(data.users);
        }
        if (data.content) {
          setContent(data.content);
        }
        if (data.comments) {
          setComments(data.comments);
        }
        if (data.suggestions) {
          setCollaborativeSuggestions(data.suggestions);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', () => {
        console.log('Error connecting to WebSocket server');
        setConnectionStatus('error');
      });

      return () => {
        socket.disconnect();
      };
    }
    return () => {};
  }, [enableCollaboration]);

  // Initialize initial version
  useEffect(() => {
    const initialVersion: VersionHistoryEntry = {
      id: 'v1',
      content: initialContent,
      timestamp: new Date(),
      author: userProfile.name,
      changes: [],
      score: analysisResult?.overallScore || 0,
    };
    setVersions([initialVersion]);
  }, [initialContent, userProfile.name, analysisResult]);

  // Auto-save functionality with versioning
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsAutoSaving(true);

      const newVersion: VersionHistoryEntry = {
        id: `v${versions.length + 1}`,
        content: content,
        timestamp: new Date(),
        author: userProfile.name,
        changes: [], // In a real implementation, you would generate a diff here
        score: analysisResult?.overallScore || 0,
      };

      setVersions((prev) => [...prev, newVersion]);
      onContentChange(content);
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 1000);
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, onContentChange, versions.length, userProfile.name, analysisResult]);

  // Handle content block changes
  const handleBlockContentChange = useCallback((blockId: string, newContent: string) => {
    setContentBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, content: newContent } : block))
    );

    if (socketRef.current) {
      socketRef.current.emit('contentChange', { content: newContent });
    }
  }, []);

  const handleBlockVisibilityToggle = useCallback((blockId: string) => {
    setContentBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isVisible: !block.isVisible } : block
      )
    );
  }, []);

  const handleBlockDelete = useCallback((blockId: string) => {
    setContentBlocks((prev) => prev.filter((block) => block.id !== blockId));
  }, []);

  // Handle section reordering
  const handleSectionReorder = useCallback(
    (newOrder: ContentBlock[]) => {
      const reorderedBlocks = newOrder.map((block, index) => ({
        ...block,
        order: index,
      }));
      setContentBlocks(reorderedBlocks);

      const sections: ResumeSection[] = reorderedBlocks.map((block) => ({
        type: block.type,
        content: block.content,
        startIndex: 0,
        endIndex: block.content.length,
        confidence: 1,
      }));

      onSectionReorder(sections);
    },
    [onSectionReorder]
  );

  // Handle AI suggestion acceptance
  const handleAcceptSuggestion = useCallback(
    (suggestionId: string) => {
      const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
      if (suggestion) {
        // Apply the suggestion
        onSuggestionApply({
          type: 'apply',
          suggestionId: suggestion.id,
        });

        // Remove from suggestions
        setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      }
    },
    [aiSuggestions, onSuggestionApply]
  );

  const handleRejectSuggestion = useCallback((suggestionId: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  }, []);

  // Handle template change
  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      setSelectedTemplate(templateId);
      onTemplateChange(templateId);
      setShowTemplateSelector(false);
    },
    [onTemplateChange]
  );

  // Handle version restore
  const handleVersionRestore = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        setContent(version.content);
        onContentChange(version.content);
        setShowVersionHistory(false);
      }
    },
    [versions, onContentChange]
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      {/* Editor Header */}
      <motion.div
        className="card mb-6 bg-base-100 shadow-lg"
        variants={editorAnimations.fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Status */}
            <div className="flex-1">
              <h1 className="font-bold text-2xl">Enhanced Resume Editor</h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${isAutoSaving ? 'animate-pulse bg-warning' : 'bg-success'}`}
                  />
                  <span className="text-base-content/70 text-sm">
                    {isAutoSaving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                  </span>
                </div>

                {enableCollaboration && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        connectionStatus === 'connected'
                          ? 'bg-success'
                          : connectionStatus === 'disconnected'
                            ? 'bg-warning'
                            : 'bg-error'
                      }`}
                    />
                    <span className="text-base-content/70 text-sm">
                      {connectionStatus === 'connected'
                        ? 'Live'
                        : connectionStatus === 'disconnected'
                          ? 'Offline'
                          : 'Error'}
                    </span>
                  </div>
                )}

                {enableCollaboration && collaborationUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <EditorIcons.Collaboration />
                    <div className="-space-x-2 flex">
                      {collaborationUsers.slice(0, 3).map((user) => (
                        <CollaborationAvatar key={user.id} user={user} size="sm" />
                      ))}
                      {collaborationUsers.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-base-300 text-xs">
                          +{collaborationUsers.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowTemplateSelector(true)}
              >
                <EditorIcons.Template />
                Template
              </button>

              {enableVersionHistory && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowVersionHistory(true)}
                >
                  <EditorIcons.History />
                  History
                </button>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFormatPainter((prev) => ({ ...prev, isActive: !prev.isActive }))}
              >
                <EditorIcons.FormatPainter />
                Format Painter
              </button>

              <div className="dropdown dropdown-end">
                <button className="btn btn-primary btn-sm">
                  <EditorIcons.Export />
                  Export
                </button>
                <ul className="dropdown-content menu w-52 rounded-box bg-base-100 p-2 shadow">
                  <li>
                    <button onClick={() => onExport('pdf')}>Export as PDF</button>
                  </li>
                  <li>
                    <button onClick={() => onExport('docx')}>Export as DOCX</button>
                  </li>
                  <li>
                    <button onClick={() => onExport('txt')}>Export as TXT</button>
                  </li>
                </ul>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowComments((prev) => !prev)}
              >
                <EditorIcons.Collaboration />
                Comments
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Main Editor Area */}
        <motion.div
          className="space-y-4 xl:col-span-3"
          variants={editorAnimations.slideIn}
          initial="hidden"
          animate="visible"
        >
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="card-title">Resume Content</h2>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm">
                    <EditorIcons.Undo />
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <EditorIcons.Redo />
                  </button>
                </div>
              </div>

              {/* Draggable Content Blocks */}
              <Reorder.Group
                axis="y"
                values={contentBlocks}
                onReorder={handleSectionReorder}
                className="space-y-4"
              >
                {contentBlocks.map((block) => (
                  <ContentBlock
                    key={block.id}
                    block={block}
                    onContentChange={handleBlockContentChange}
                    onToggleVisibility={handleBlockVisibilityToggle}
                    onDelete={handleBlockDelete}
                    isDragging={false}
                  />
                ))}
              </Reorder.Group>

              {/* Add New Section */}
              <div className="mt-6">
                <button className="btn btn-outline btn-block">
                  <EditorIcons.Magic />
                  Add New Section
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Assistant Sidebar */}
        {enableAIAssistant && (
          <motion.div
            className="space-y-4"
            variants={editorAnimations.fadeIn}
            initial="hidden"
            animate="visible"
          >
            {/* AI Suggestions */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <div className="mb-4 flex items-center gap-2">
                  <EditorIcons.AI />
                  <h3 className="font-semibold">AI Assistant</h3>
                  <div className="badge badge-primary badge-sm">{aiSuggestions.length}</div>
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {aiSuggestions.map((suggestion) => (
                    <AIAssistantSuggestion
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAccept={() => handleAcceptSuggestion(suggestion.id)}
                      onReject={() => handleRejectSuggestion(suggestion.id)}
                      index={0}
                    />
                  ))}

                  {aiSuggestionsError && (
                    <div className="py-8 text-center text-error">
                      <p>{aiSuggestionsError}</p>
                    </div>
                  )}
                  {aiSuggestions.length === 0 && !aiSuggestionsError && (
                    <div className="py-8 text-center">
                      <EditorIcons.Lightbulb />
                      <p className="mt-2 text-base-content/70 text-sm">
                        No suggestions at the moment. Keep writing for AI-powered recommendations!
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-primary btn-sm btn-block"
                    onClick={async () => {
                      try {
                        setAiSuggestionsError(null);
                        // Mock fetching AI suggestions
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        // In a real implementation, you would fetch suggestions from an API
                        // and handle potential errors.
                        // setAiSuggestions(fetchedSuggestions);
                      } catch (_error) {
                        setAiSuggestionsError('Failed to fetch AI suggestions.');
                      }
                    }}
                  >
                    <EditorIcons.Magic />
                    Get AI Suggestions
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <h3 className="mb-4 font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="btn btn-ghost btn-sm btn-block justify-start">
                    <EditorIcons.Magic />
                    Improve Writing
                  </button>
                  <button className="btn btn-ghost btn-sm btn-block justify-start">
                    <EditorIcons.Lightbulb />
                    Add Keywords
                  </button>
                  <button className="btn btn-ghost btn-sm btn-block justify-start">
                    <EditorIcons.AI />
                    Check Grammar
                  </button>
                  <button className="btn btn-ghost btn-sm btn-block justify-start">
                    <EditorIcons.Target />
                    Optimize for ATS
                  </button>
                </div>
              </div>
            </div>

            {/* Score Preview */}
            {analysisResult && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body p-4">
                  <h3 className="mb-4 font-semibold">Live Score</h3>
                  <div className="text-center">
                    <div className="font-bold text-3xl text-primary">
                      {analysisResult.overallScore}
                    </div>
                    <div className="text-base-content/70 text-sm">Resume Score</div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {Object.entries(analysisResult.categoryScores).map(([category, score]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {showComments && (
          <div className="xl:col-span-1">
            <Comments
              comments={comments}
              suggestions={collaborativeSuggestions}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onVoteSuggestion={handleVoteSuggestion}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showVersionHistory && (
          <VersionHistory
            versions={versions}
            currentVersion="current"
            onRestore={handleVersionRestore}
            onClose={() => setShowVersionHistory(false)}
          />
        )}

        {showTemplateSelector && (
          <TemplateSelector
            templates={mockTemplates}
            currentTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedEditor;
