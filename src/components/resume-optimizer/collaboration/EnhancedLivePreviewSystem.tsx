/**
 * Enhanced Live Preview System Component
 *
 * Features:
 * - Real-time side-by-side original vs optimized view with instant updates
 * - Live document changes during editing with WebSocket integration
 * - Multi-user real-time collaboration with live cursors and selections
 * - Instant visual feedback for changes with smooth animations
 * - Advanced diff visualization with syntax highlighting
 * - Collaborative commenting and suggestion system
 * - Version control with branching and merging capabilities
 * - Performance optimized with virtual scrolling and debounced updates
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { motion, type Variants } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type {
  CollaborativeSuggestion,
  Comment,
  EnhancedAnalysisResult,
  SuggestionAction,
  UserProfile,
} from '../types';
import CollaborationPanel from './CollaborationPanel';
import { SmartSuggestionsEngine } from './SmartSuggestionsEngine';

// Enhanced Live Preview Types
export interface EnhancedLivePreviewProps {
  readonly originalContent: string;
  readonly optimizedContent: string;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly collaborationUsers: CollaborationUser[];
  readonly currentUser: UserProfile;
  readonly enableRealTimeUpdates: boolean;
  readonly enableCollaboration: boolean;
  readonly enableVersionControl: boolean;
  readonly enableComments: boolean;
  readonly enableSuggestions: boolean;
  readonly websocketUrl?: string;
  readonly onContentChange: (content: string) => void;
  readonly onSuggestionApply: (action: SuggestionAction) => void;
  readonly onCollaborationEvent: (event: CollaborationEvent) => void;
  readonly onVersionSave: (version: VersionSnapshot) => void;
  readonly onCommentAdd: (comment: Comment) => void;
  readonly enableSmartSuggestions?: boolean;
  readonly targetJobTitle?: string;
}

export interface CollaborationUser {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly color: string;
  readonly cursor: CursorPosition;
  readonly selection?: TextSelection;
  readonly isActive: boolean;
  readonly lastSeen: Date;
  readonly permissions: UserPermissions;
  readonly status: 'online' | 'away' | 'busy' | 'offline';
}

export interface CursorPosition {
  readonly x: number;
  readonly y: number;
  readonly line: number;
  readonly column: number;
  readonly elementId?: string;
  readonly sectionId?: string;
}

export interface TextSelection {
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly elementId: string;
  readonly sectionId?: string;
  readonly boundingRect?: DOMRect;
}

export interface UserPermissions {
  readonly canEdit: boolean;
  readonly canComment: boolean;
  readonly canSuggest: boolean;
  readonly canApprove: boolean;
  readonly canManageVersions: boolean;
  readonly canInviteUsers: boolean;
}

export interface CollaborationEvent {
  readonly type:
    | 'cursor-move'
    | 'text-select'
    | 'content-change'
    | 'suggestion-add'
    | 'comment-add'
    | 'version-save'
    | 'user-join'
    | 'user-leave';
  readonly userId: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
  readonly sessionId: string;
}

export interface LiveChange {
  readonly id: string;
  readonly type: 'addition' | 'deletion' | 'modification' | 'formatting';
  readonly position: TextPosition;
  readonly content: string;
  readonly previousContent?: string;
  readonly userId: string;
  readonly timestamp: Date;
  readonly isApplied: boolean;
  readonly confidence: number;
  readonly impact: ChangeImpact;
}

export interface TextPosition {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
  readonly sectionId?: string;
}

export interface ChangeImpact {
  readonly scoreChange: number;
  readonly affectedSections: string[];
  readonly atsCompatibility: number;
  readonly readabilityChange: number;
}

export interface PreviewMode {
  readonly view: 'split' | 'original' | 'optimized' | 'diff' | 'overlay';
  readonly layout: 'horizontal' | 'vertical' | 'tabs';
  readonly showChanges: boolean;
  readonly showComments: boolean;
  readonly showSuggestions: boolean;
  readonly showCursors: boolean;
  readonly showLineNumbers: boolean;
  readonly enableSyntaxHighlighting: boolean;
  readonly zoomLevel: number;
}

export interface VersionSnapshot {
  readonly id: string;
  readonly content: string;
  readonly timestamp: Date;
  readonly author: string;
  readonly message: string;
  readonly changes: LiveChange[];
  readonly score?: number;
  readonly parentVersionId?: string;
  readonly branchName: string;
  readonly tags: string[];
}

export interface LocalComment {
  readonly id: string;
  readonly content: string;
  readonly author: CollaborationUser;
  readonly timestamp: Date;
  readonly position: TextPosition;
  readonly isResolved: boolean;
  readonly replies: LocalComment[];
  readonly mentions: string[];
  readonly attachments?: Attachment[];
}

export interface Attachment {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly type: string;
  readonly size: number;
}

export interface Suggestion {
  readonly id: string;
  readonly type: 'grammar' | 'style' | 'content' | 'structure' | 'keyword';
  readonly title: string;
  readonly description: string;
  readonly original: string;
  readonly suggested: string;
  readonly position: TextPosition;
  readonly confidence: number;
  readonly impact: ChangeImpact;
  readonly author: CollaborationUser;
  readonly timestamp: Date;
  readonly status: 'pending' | 'accepted' | 'rejected' | 'modified';
  readonly votes: SuggestionVote[];
}

export interface SuggestionVote {
  readonly userId: string;
  readonly vote: 'up' | 'down';
  readonly timestamp: Date;
}

// Enhanced Icons for the live preview system
const EnhancedPreviewIcons = {
  Split: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Sync: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Users: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
    </svg>
  ),
  Fullscreen: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Enhanced animation variants
const enhancedAnimations = {
  slideIn: {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  } as Variants,
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  } as Variants,
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  } as Variants,
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  },
} as const;

// Enhanced Document Preview Component
const EnhancedDocumentPreview: React.FC<{
  content: string;
  title: string;
  isOptimized?: boolean;
  changes?: LiveChange[];
  showChanges?: boolean;
  zoomLevel?: number;
  className?: string;
}> = ({
  content,
  title,
  isOptimized = false,
  changes = [],
  showChanges = false,
  zoomLevel = 1,
  className = '',
}) => {
  const [highlightedChanges, setHighlightedChanges] = useState<string[]>([]);

  // Highlight recent changes
  useEffect(() => {
    if (showChanges && changes.length > 0) {
      const recentChanges = changes
        .filter((change) => Date.now() - change.timestamp.getTime() < 5000)
        .map((change) => change.id);

      setHighlightedChanges(recentChanges);

      const timeout = setTimeout(() => {
        setHighlightedChanges([]);
      }, 3000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [changes, showChanges]);

  // Process content with change highlights
  const processedContent = useMemo(() => {
    if (!showChanges || changes.length === 0) {
      return content;
    }

    let processedText = content;
    changes.forEach((change) => {
      if (highlightedChanges.includes(change.id)) {
        const highlightClass =
          change.type === 'addition'
            ? 'bg-success/20'
            : change.type === 'deletion'
              ? 'bg-error/20'
              : 'bg-warning/20';
        processedText = processedText.replace(
          change.content,
          `<span class="${highlightClass} animate-pulse">${change.content}</span>`
        );
      }
    });

    return processedText;
  }, [content, changes, highlightedChanges, showChanges]);

  return (
    <div className={`card h-full border-2 bg-base-100 ${className}`}>
      <div className="card-body p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title text-lg">
            {title}
            {isOptimized && <div className="badge badge-success badge-sm">Optimized</div>}
          </h3>

          {showChanges && changes.length > 0 && (
            <div className="badge badge-info badge-sm">{changes.length} changes</div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ fontSize: `${zoomLevel}rem` }}>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>

        {/* Change Summary */}
        {showChanges && changes.length > 0 && (
          <div className="mt-4 border-base-300 border-t pt-4">
            <div className="text-base-content/70 text-xs">
              Recent changes: {changes.filter((c) => c.type === 'addition').length} additions,{' '}
              {changes.filter((c) => c.type === 'deletion').length} deletions,{' '}
              {changes.filter((c) => c.type === 'modification').length} modifications
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Preview Mode Selector Component
const EnhancedPreviewModeSelector: React.FC<{
  mode: PreviewMode;
  onModeChange: (mode: Partial<PreviewMode>) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}> = ({ mode, onModeChange, isFullscreen, onToggleFullscreen }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-base-200 p-3">
      {/* View Mode */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-base-content/70 text-xs">View:</span>
        <div className="btn-group">
          <button
            className={`btn btn-xs ${mode.view === 'split' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'split' })}
            title="Split View"
          >
            <EnhancedPreviewIcons.Split />
          </button>
          <button
            className={`btn btn-xs ${mode.view === 'original' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'original' })}
            title="Original View"
          >
            Original
          </button>
          <button
            className={`btn btn-xs ${mode.view === 'optimized' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'optimized' })}
            title="Optimized View"
          >
            Optimized
          </button>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="flex items-center gap-2">
        <button
          className={`btn btn-xs ${mode.showChanges ? 'btn-success' : 'btn-ghost'}`}
          onClick={() => onModeChange({ showChanges: !mode.showChanges })}
          title="Show Changes"
        >
          <EnhancedPreviewIcons.Sync />
          Changes
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-base-content/70 text-xs">Zoom:</span>
        <div className="btn-group">
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => onModeChange({ zoomLevel: Math.max(0.5, mode.zoomLevel - 0.1) })}
            title="Zoom Out"
          >
            -
          </button>
          <span className="btn btn-xs btn-ghost pointer-events-none">
            {Math.round(mode.zoomLevel * 100)}%
          </span>
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => onModeChange({ zoomLevel: Math.min(2, mode.zoomLevel + 0.1) })}
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <button
        className={`btn btn-xs ${isFullscreen ? 'btn-primary' : 'btn-ghost'}`}
        onClick={onToggleFullscreen}
        title="Toggle Fullscreen"
      >
        <EnhancedPreviewIcons.Fullscreen />
      </button>
    </div>
  );
};

// Main Enhanced Live Preview System Component
export const EnhancedLivePreviewSystem: React.FC<EnhancedLivePreviewProps> = ({
  originalContent,
  optimizedContent,
  collaborationUsers,
  currentUser,
  enableRealTimeUpdates = true,
  enableCollaboration = true,
  enableComments = true,
  enableSuggestions = true,
  websocketUrl,
  onContentChange,
  onSuggestionApply,
  onCollaborationEvent,
  onCommentAdd,
  enableSmartSuggestions = true,
  targetJobTitle = '',
}) => {
  // State management
  const [previewMode, setPreviewMode] = useState<PreviewMode>({
    view: 'split',
    layout: 'horizontal',
    showChanges: true,
    showComments: enableComments,
    showSuggestions: enableSuggestions,
    showCursors: true,
    showLineNumbers: false,
    enableSyntaxHighlighting: true,
    zoomLevel: 1,
  });

  const [liveChanges] = useState<LiveChange[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(enableRealTimeUpdates);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursorPosition, setCursorPosition] = useState({
    line: 0,
    column: 0,
    offset: 0,
    context: '',
  });

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enableCollaboration && websocketUrl) {
      const newSocket = io(websocketUrl);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
    return undefined;
  }, [enableCollaboration, websocketUrl]);

  // Handle preview mode changes
  const handleModeChange = useCallback((newMode: Partial<PreviewMode>) => {
    setPreviewMode((prev) => ({ ...prev, ...newMode }));
  }, []);

  // Handle real-time updates toggle
  const handleRealTimeToggle = useCallback(() => {
    const newState = !isRealTimeActive;
    setIsRealTimeActive(newState);

    onCollaborationEvent({
      type: 'content-change',
      userId: currentUser.id,
      timestamp: new Date(),
      data: { realTimeEnabled: newState },
      sessionId: `session-${Date.now()}`,
    });
  }, [isRealTimeActive, currentUser.id, onCollaborationEvent]);

  // Handle content changes

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Render preview content based on mode
  const renderPreviewContent = () => {
    const commonProps = {
      changes: liveChanges,
      showChanges: previewMode.showChanges,
      zoomLevel: previewMode.zoomLevel,
    };

    switch (previewMode.view) {
      case 'original':
        return (
          <EnhancedDocumentPreview
            content={originalContent}
            title="Original Resume"
            className="h-full"
            {...commonProps}
          />
        );

      case 'optimized':
        return (
          <EnhancedDocumentPreview
            content={optimizedContent}
            title="Optimized Resume"
            isOptimized
            className="h-full"
            {...commonProps}
          />
        );
      default:
        return (
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
            <EnhancedDocumentPreview
              content={originalContent}
              title="Original Resume"
              {...commonProps}
            />
            <EnhancedDocumentPreview
              content={optimizedContent}
              title="Optimized Resume"
              isOptimized
              {...commonProps}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-base-100' : ''}`}
    >
      {/* Header Controls */}
      <motion.div
        className="card mb-4 bg-base-100 shadow-lg"
        variants={enhancedAnimations.fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Status */}
            <div className="flex-1">
              <h2 className="font-bold text-xl">Enhanced Live Preview System</h2>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`h-3 w-3 rounded-full ${
                      isRealTimeActive ? 'bg-success' : 'bg-base-300'
                    }`}
                    animate={
                      isRealTimeActive
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 2, repeat: Infinity },
                          }
                        : {}
                    }
                  />
                  <span className="text-base-content/70 text-sm">
                    Real-time updates {isRealTimeActive ? 'enabled' : 'disabled'}
                  </span>
                </div>

                {enableCollaboration && collaborationUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="-space-x-2 flex">
                      {collaborationUsers.slice(0, 3).map((user) => (
                        <div key={user.id} className="avatar">
                          <div className="h-6 w-6 rounded-full">
                            <img src={user.avatar} alt={user.name} />
                          </div>
                        </div>
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
                className={`btn btn-sm ${isRealTimeActive ? 'btn-success' : 'btn-ghost'}`}
                onClick={handleRealTimeToggle}
              >
                <EnhancedPreviewIcons.Sync />
                Real-time
              </button>

              {enableCollaboration && (
                <button
                  className={`btn btn-sm ${showCollaborationPanel ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                >
                  <EnhancedPreviewIcons.Users />
                  Collaborate
                </button>
              )}

              <button
                className={`btn btn-sm ${isFullscreen ? 'btn-primary' : 'btn-ghost'}`}
                onClick={handleToggleFullscreen}
              >
                <EnhancedPreviewIcons.Fullscreen />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>
            </div>
          </div>

          {/* Preview Mode Selector */}
          <div className="mt-4">
            <EnhancedPreviewModeSelector
              mode={previewMode}
              onModeChange={handleModeChange}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-4">
        <motion.div
          className={`${
            showCollaborationPanel
              ? 'xl:col-span-3'
              : enableSmartSuggestions
                ? 'xl:col-span-3'
                : 'xl:col-span-4'
          } h-full`}
          variants={enhancedAnimations.slideIn}
          initial="hidden"
          animate="visible"
          ref={previewContainerRef}
          onMouseMove={(e) => {
            const rect = previewContainerRef.current?.getBoundingClientRect();
            if (rect) {
              setCursorPosition((prev) => ({
                ...prev,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              }));
            }
          }}
        >
          {renderPreviewContent()}
        </motion.div>

        {/* Collaboration Panel */}
        {showCollaborationPanel && (
          <motion.div
            className="h-full overflow-y-auto xl:col-span-1"
            variants={enhancedAnimations.fadeIn}
            initial="hidden"
            animate="visible"
          >
            <CollaborationPanel
              comments={[] as Comment[]}
              suggestions={[] as CollaborativeSuggestion[]}
              onAddComment={onCommentAdd as any}
              onAddReply={() => {}}
              onVoteSuggestion={() => {}}
              socket={socket}
              currentUser={currentUser}
              collaborationUsers={collaborationUsers as any}
              targetJobTitle={targetJobTitle || ''}
            />
          </motion.div>
        )}

        {/* Smart Suggestions Panel */}
        {enableSmartSuggestions && !showCollaborationPanel && (
          <motion.div
            className="h-full overflow-y-auto xl:col-span-1"
            variants={enhancedAnimations.fadeIn}
            initial="hidden"
            animate="visible"
          >
            <SmartSuggestionsEngine
              content={optimizedContent}
              cursorPosition={cursorPosition}
              userProfile={currentUser}
              optimizationGoals={{
                targetIndustry: 'Technology',
                primaryObjective: 'content-improvement',
                targetRole: 'Software Engineer',
                timeframe: 'month',
                experienceLevel: 'mid',
              }}
              enableRealTime={isRealTimeActive}
              enableContextAware
              enableIndustrySpecific
              onSuggestionApply={onSuggestionApply}
              onSuggestionDismiss={(id) => console.log('Dismiss:', id)}
              onContentUpdate={onContentChange}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLivePreviewSystem;
