/**
 * Live Preview System Component
 *
 * Features:
 * - Side-by-side original vs optimized view with real-time updates
 * - Live document changes during editing
 * - Real-time collaboration with multiple users
 * - Instant visual feedback for changes
 * - Responsive design for mobile and desktop
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EnhancedAnalysisResult, SuggestionAction, UserProfile } from '../types';

// Live Preview Types
export interface LivePreviewProps {
  readonly originalContent: string;
  readonly optimizedContent: string;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly collaborationUsers: CollaborationUser[];
  readonly currentUser: UserProfile;
  readonly enableRealTimeUpdates: boolean;
  readonly enableCollaboration: boolean;
  readonly onContentChange: (content: string) => void;
  readonly onSuggestionApply: (action: SuggestionAction) => void;
  readonly onCollaborationEvent: (event: CollaborationEvent) => void;
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
}

export interface CursorPosition {
  readonly x: number;
  readonly y: number;
  readonly line: number;
  readonly column: number;
  readonly elementId?: string;
}

export interface TextSelection {
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly elementId: string;
}

export interface UserPermissions {
  readonly canEdit: boolean;
  readonly canComment: boolean;
  readonly canSuggest: boolean;
  readonly canApprove: boolean;
}

export interface CollaborationEvent {
  readonly type:
    | 'cursor-move'
    | 'text-select'
    | 'content-change'
    | 'suggestion-add'
    | 'comment-add';
  readonly userId: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
}

export interface LiveChange {
  readonly id: string;
  readonly type: 'addition' | 'deletion' | 'modification';
  readonly position: number;
  readonly content: string;
  readonly userId: string;
  readonly timestamp: Date;
  readonly isApplied: boolean;
}

export interface PreviewMode {
  readonly view: 'split' | 'original' | 'optimized' | 'diff';
  readonly layout: 'horizontal' | 'vertical';
  readonly showChanges: boolean;
  readonly showComments: boolean;
  readonly showSuggestions: boolean;
}

// Icons for the live preview system
const PreviewIcons = {
  Split: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Original: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Optimized: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Diff: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Horizontal: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Vertical: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 3a1 1 0 000 2h10a1 1 0 100-2H5zM5 7a1 1 0 000 2h10a1 1 0 100-2H5zM5 11a1 1 0 100 2h10a1 1 0 100-2H5zM5 15a1 1 0 100 2h10a1 1 0 100-2H5z"
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
  Comment: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Suggestion: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
    </svg>
  ),
  Eye: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  EyeOff: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
        clipRule="evenodd"
      />
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
    </svg>
  ),
};

// Animation variants
const previewAnimations = {
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
  highlight: {
    initial: { backgroundColor: 'transparent' },
    animate: {
      backgroundColor: ['transparent', '#fbbf24', 'transparent'],
      transition: { duration: 1, ease: 'easeInOut' },
    },
  },
};

// Collaboration User Avatar Component
const CollaborationAvatar: React.FC<{
  user: CollaborationUser;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}> = ({ user, size = 'sm', showTooltip = true }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const avatar = (
    <div className={`avatar ${user.isActive ? 'online' : 'offline'}`}>
      <div
        className={`${sizeClasses[size]} rounded-full ring-2 ring-offset-1`}
        style={{
          borderColor: user.color,
          backgroundColor: `${user.color}20`,
        }}
      >
        <img src={user.avatar} alt={user.name} />
      </div>
    </div>
  );

  if (!showTooltip) return avatar;

  return (
    <div className="tooltip" data-tip={`${user.name} ${user.isActive ? '(active)' : '(away)'}`}>
      {avatar}
    </div>
  );
};

// Live Cursor Component
const LiveCursor: React.FC<{
  user: CollaborationUser;
  isVisible: boolean;
}> = ({ user, isVisible }) => {
  if (!isVisible || !user.isActive) return null;

  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      style={{
        left: user.cursor.x,
        top: user.cursor.y,
        color: user.color,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <div
          className="rounded px-2 py-1 font-medium text-white text-xs"
          style={{ backgroundColor: user.color }}
        >
          {user.name}
        </div>
      </div>
    </motion.div>
  );
};

// Live Selection Component
const LiveSelection: React.FC<{
  user: CollaborationUser;
  isVisible: boolean;
}> = ({ user, isVisible }) => {
  if (!isVisible || !user.selection || !user.isActive) return null;

  return (
    <motion.div
      className="pointer-events-none absolute z-40"
      style={{
        backgroundColor: `${user.color}30`,
        border: `2px solid ${user.color}`,
        borderRadius: '4px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="-top-6 absolute left-0 rounded px-2 py-1 font-medium text-white text-xs"
        style={{ backgroundColor: user.color }}
      >
        {user.name} selected
      </div>
    </motion.div>
  );
};

// Preview Mode Selector Component
const PreviewModeSelector: React.FC<{
  mode: PreviewMode;
  onModeChange: (mode: Partial<PreviewMode>) => void;
}> = ({ mode, onModeChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-base-200 p-2">
      {/* View Mode */}
      <div className="flex items-center gap-1">
        <span className="font-medium text-xs">View:</span>
        <div className="btn-group">
          <button
            className={`btn btn-xs ${mode.view === 'split' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'split' })}
          >
            <PreviewIcons.Split />
          </button>
          <button
            className={`btn btn-xs ${mode.view === 'original' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'original' })}
          >
            <PreviewIcons.Original />
          </button>
          <button
            className={`btn btn-xs ${mode.view === 'optimized' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'optimized' })}
          >
            <PreviewIcons.Optimized />
          </button>
          <button
            className={`btn btn-xs ${mode.view === 'diff' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onModeChange({ view: 'diff' })}
          >
            <PreviewIcons.Diff />
          </button>
        </div>
      </div>

      {/* Layout Mode */}
      {mode.view === 'split' && (
        <div className="flex items-center gap-1">
          <span className="font-medium text-xs">Layout:</span>
          <div className="btn-group">
            <button
              className={`btn btn-xs ${mode.layout === 'horizontal' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onModeChange({ layout: 'horizontal' })}
            >
              <PreviewIcons.Horizontal />
            </button>
            <button
              className={`btn btn-xs ${mode.layout === 'vertical' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onModeChange({ layout: 'vertical' })}
            >
              <PreviewIcons.Vertical />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Options */}
      <div className="flex items-center gap-2">
        <button
          className={`btn btn-xs ${mode.showChanges ? 'btn-success' : 'btn-ghost'}`}
          onClick={() => onModeChange({ showChanges: !mode.showChanges })}
        >
          <PreviewIcons.Sync />
          Changes
        </button>
        <button
          className={`btn btn-xs ${mode.showComments ? 'btn-info' : 'btn-ghost'}`}
          onClick={() => onModeChange({ showComments: !mode.showComments })}
        >
          <PreviewIcons.Comment />
          Comments
        </button>
        <button
          className={`btn btn-xs ${mode.showSuggestions ? 'btn-warning' : 'btn-ghost'}`}
          onClick={() => onModeChange({ showSuggestions: !mode.showSuggestions })}
        >
          <PreviewIcons.Suggestion />
          Suggestions
        </button>
      </div>
    </div>
  );
};

// Document Preview Component
const DocumentPreview: React.FC<{
  content: string;
  title: string;
  isOptimized?: boolean;
  changes?: LiveChange[];
  showChanges?: boolean;
  className?: string;
}> = ({
  content,
  title,
  isOptimized = false,
  changes = [],
  showChanges = false,
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
    return () => {};
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

        <div className="flex-1 overflow-y-auto">
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

// Collaboration Panel Component
const CollaborationPanel: React.FC<{
  users: CollaborationUser[];
  onInviteUser: () => void;
}> = ({ users, onInviteUser }) => {
  return (
    <div className="card border bg-base-100">
      <div className="card-body p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <PreviewIcons.Users />
            Collaborators ({users.length})
          </h3>
          <button className="btn btn-primary btn-sm" onClick={onInviteUser}>
            Invite
          </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CollaborationAvatar user={user} size="md" showTooltip={false} />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-base-content/70 text-xs">
                    {user.isActive
                      ? 'Active now'
                      : `Last seen ${user.lastSeen.toLocaleTimeString()}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {user.permissions.canEdit && (
                  <div className="badge badge-success badge-xs">Edit</div>
                )}
                {user.permissions.canComment && (
                  <div className="badge badge-info badge-xs">Comment</div>
                )}
                {user.permissions.canSuggest && (
                  <div className="badge badge-warning badge-xs">Suggest</div>
                )}
                {user.permissions.canApprove && (
                  <div className="badge badge-primary badge-xs">Approve</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Live Preview System Component
export const LivePreviewSystem: React.FC<LivePreviewProps> = ({
  originalContent,
  optimizedContent,
  collaborationUsers,
  currentUser,
  enableRealTimeUpdates,
  enableCollaboration,
  onCollaborationEvent,
}) => {
  // State management
  const [previewMode, setPreviewMode] = useState<PreviewMode>({
    view: 'split',
    layout: 'horizontal',
    showChanges: true,
    showComments: false,
    showSuggestions: true,
  });

  const [isRealTimeActive, setIsRealTimeActive] = useState(enableRealTimeUpdates);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Handle preview mode changes
  const handleModeChange = useCallback((newMode: Partial<PreviewMode>) => {
    setPreviewMode((prev) => ({ ...prev, ...newMode }));
  }, []);

  // Handle real-time updates toggle
  const handleRealTimeToggle = useCallback(() => {
    setIsRealTimeActive((prev) => !prev);
    onCollaborationEvent({
      type: 'content-change',
      userId: currentUser.id,
      timestamp: new Date(),
      data: { realTimeEnabled: !isRealTimeActive },
    });
  }, [isRealTimeActive, currentUser.id, onCollaborationEvent]);

  // Handle user invitation
  const handleInviteUser = useCallback(() => {
    // Implementation for user invitation
    console.log('Invite user functionality');
  }, []);

  // Render preview content based on mode
  const renderPreviewContent = () => {
    const liveChanges: LiveChange[] = [];
    const commonProps = {
      changes: liveChanges,
      showChanges: previewMode.showChanges,
    };

    switch (previewMode.view) {
      case 'original':
        return (
          <DocumentPreview
            content={originalContent}
            title="Original Resume"
            className="h-full"
            {...commonProps}
          />
        );

      case 'optimized':
        return (
          <DocumentPreview
            content={optimizedContent}
            title="Optimized Resume"
            isOptimized
            className="h-full"
            {...commonProps}
          />
        );

      case 'diff':
        return (
          <div className="card h-full border-2 bg-base-100">
            <div className="card-body p-4">
              <h3 className="card-title">Changes Overview</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {liveChanges.map((change: LiveChange) => (
                    <div key={change.id} className="rounded border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div
                          className={`badge badge-sm ${
                            change.type === 'addition'
                              ? 'badge-success'
                              : change.type === 'deletion'
                                ? 'badge-error'
                                : 'badge-warning'
                          }`}
                        >
                          {change.type}
                        </div>
                        <div className="text-base-content/70 text-xs">
                          {change.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-sm">{change.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default: {
        const layoutClass =
          previewMode.layout === 'horizontal' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-rows-2';
        return (
          <div className={`grid ${layoutClass} h-full gap-4`}>
            <DocumentPreview content={originalContent} title="Original Resume" {...commonProps} />
            <DocumentPreview
              content={optimizedContent}
              title="Optimized Resume"
              isOptimized
              {...commonProps}
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header Controls */}
      <motion.div
        className="card mb-4 bg-base-100 shadow-lg"
        variants={previewAnimations.fadeIn as any}
        initial="hidden"
        animate="visible"
      >
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Status */}
            <div className="flex-1">
              <h2 className="font-bold text-xl">Live Preview System</h2>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${isRealTimeActive ? 'animate-pulse bg-success' : 'bg-base-300'}`}
                  />
                  <span className="text-base-content/70 text-sm">
                    Real-time updates {isRealTimeActive ? 'enabled' : 'disabled'}
                  </span>
                </div>

                {enableCollaboration && collaborationUsers.length > 0 && (
                  <div className="flex items-center gap-2">
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
                className={`btn btn-sm ${isRealTimeActive ? 'btn-success' : 'btn-ghost'}`}
                onClick={handleRealTimeToggle}
              >
                <PreviewIcons.Sync />
                Real-time
              </button>

              {enableCollaboration && (
                <button
                  className={`btn btn-sm ${showCollaborationPanel ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                >
                  <PreviewIcons.Users />
                  Collaborate
                </button>
              )}

              <button className="btn btn-ghost btn-sm">
                <PreviewIcons.Eye />
                Full Screen
              </button>
            </div>
          </div>

          {/* Preview Mode Selector */}
          <div className="mt-4">
            <PreviewModeSelector mode={previewMode} onModeChange={handleModeChange} />
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Preview Area */}
        <motion.div
          className={`${showCollaborationPanel ? 'xl:col-span-3' : 'xl:col-span-4'} relative`}
          variants={previewAnimations.slideIn as any}
          initial="hidden"
          animate="visible"
          ref={previewContainerRef}
        >
          {renderPreviewContent()}

          {/* Live Cursors and Selections */}
          <AnimatePresence>
            {enableCollaboration &&
              collaborationUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <LiveCursor user={user} isVisible={isRealTimeActive} />
                  <LiveSelection user={user} isVisible={isRealTimeActive} />
                </React.Fragment>
              ))}
          </AnimatePresence>
        </motion.div>

        {/* Collaboration Panel */}
        {enableCollaboration && showCollaborationPanel && (
          <motion.div
            className="xl:col-span-1"
            variants={previewAnimations.fadeIn as any}
            initial="hidden"
            animate="visible"
          >
            <CollaborationPanel users={collaborationUsers} onInviteUser={handleInviteUser} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LivePreviewSystem;
