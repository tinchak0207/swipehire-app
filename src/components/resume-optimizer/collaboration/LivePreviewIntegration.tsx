/**
 * Live Preview Integration Component
 *
 * Integrates the Enhanced Live Preview System with the Enhanced Editor
 * to provide a complete real-time collaboration experience.
 *
 * Features:
 * - Seamless integration between editor and preview
 * - Real-time synchronization of content changes
 * - Collaborative editing with live cursors and selections
 * - Version control and change tracking
 * - Comment and suggestion management
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features (WCAG 2.1 AA)
 */

'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { EnhancedEditor } from '../editor/EnhancedEditor';
import type {
  EnhancedAnalysisResult,
  OptimizationGoals,
  ResumeSection,
  SuggestionAction,
  UserProfile,
} from '../types';
import {
  type CollaborationEvent as EnhancedCollaborationEvent,
  type CollaborationUser as EnhancedCollaborationUser,
  EnhancedLivePreviewSystem,
  type VersionSnapshot,
} from './EnhancedLivePreviewSystem';

// Integration Props Interface
export interface LivePreviewIntegrationProps {
  readonly initialContent: string;
  readonly analysisResult?: EnhancedAnalysisResult;
  readonly userProfile: UserProfile;
  readonly optimizationGoals: OptimizationGoals;
  readonly collaborationUsers: EnhancedCollaborationUser[];
  readonly enableRealTimeUpdates: boolean;
  readonly enableCollaboration: boolean;
  readonly enableVersionControl: boolean;
  readonly enableComments: boolean;
  readonly enableSuggestions: boolean;
  readonly enableAIAssistant: boolean;
  readonly enableVersionHistory: boolean;
  readonly websocketUrl: string;
  readonly onContentChange: (content: string) => void;
  readonly onSectionReorder: (sections: ResumeSection[]) => void;
  readonly onSuggestionApply: (action: SuggestionAction) => void;
  readonly onTemplateChange: (templateId: string) => void;
  readonly onExport: (format: 'pdf' | 'docx' | 'txt') => void;
  readonly onCollaborationEvent: (event: EnhancedCollaborationEvent) => void;
  readonly onVersionSave: (version: VersionSnapshot) => void;
  readonly onCommentAdd: (comment: any) => void;
}

// Layout Mode Type
type LayoutMode = 'editor-only' | 'preview-only' | 'split-horizontal' | 'split-vertical' | 'tabs';

// Integration Icons
const IntegrationIcons = {
  Layout: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Editor: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ),
  Preview: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
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
};

// Layout Mode Selector Component
const LayoutModeSelector: React.FC<{
  mode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
}> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-base-content/70 text-sm">Layout:</span>
      <div className="btn-group">
        <button
          className={`btn btn-sm ${mode === 'editor-only' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onModeChange('editor-only')}
          title="Editor Only"
        >
          <IntegrationIcons.Editor />
        </button>
        <button
          className={`btn btn-sm ${mode === 'preview-only' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onModeChange('preview-only')}
          title="Preview Only"
        >
          <IntegrationIcons.Preview />
        </button>
        <button
          className={`btn btn-sm ${mode === 'split-horizontal' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onModeChange('split-horizontal')}
          title="Split Horizontal"
        >
          ↔️
        </button>
        <button
          className={`btn btn-sm ${mode === 'split-vertical' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onModeChange('split-vertical')}
          title="Split Vertical"
        >
          ↕️
        </button>
        <button
          className={`btn btn-sm ${mode === 'tabs' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onModeChange('tabs')}
          title="Tabs"
        >
          📑
        </button>
      </div>
    </div>
  );
};

// Main Live Preview Integration Component
export const LivePreviewIntegration: React.FC<LivePreviewIntegrationProps> = ({
  initialContent,
  analysisResult,
  userProfile,
  optimizationGoals,
  collaborationUsers,
  enableRealTimeUpdates,
  enableCollaboration,
  enableVersionControl,
  enableComments,
  enableSuggestions,
  enableAIAssistant,
  enableVersionHistory,
  websocketUrl,
  onContentChange,
  onSectionReorder,
  onSuggestionApply,
  onTemplateChange,
  onExport,
  onCollaborationEvent,
  onVersionSave,
  onCommentAdd,
}) => {
  // State management
  const [content, setContent] = useState(initialContent);
  const [optimizedContent, setOptimizedContent] = useState(initialContent);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split-horizontal');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Handle content changes from editor
  const handleEditorContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setIsSyncing(true);

      // Simulate AI optimization process
      setTimeout(() => {
        setOptimizedContent(`${newContent} [AI Optimized]`);
        setIsSyncing(false);
        setLastSyncTime(new Date());
      }, 1000);

      onContentChange(newContent);
    },
    [onContentChange]
  );

  // Handle content changes from preview
  const handlePreviewContentChange = useCallback(
    (newContent: string) => {
      setOptimizedContent(newContent);
      onContentChange(newContent);
    },
    [onContentChange]
  );

  // Handle collaboration events
  const handleCollaborationEvent = useCallback(
    (event: EnhancedCollaborationEvent) => {
      // Handle real-time collaboration events
      if (event.type === 'content-change' && event.userId !== userProfile.id) {
        const newContent = event.data.content as string;
        if (newContent) {
          setContent(newContent);
          setOptimizedContent(`${newContent} [AI Optimized]`);
        }
      }

      onCollaborationEvent(event);
    },
    [userProfile.id, onCollaborationEvent]
  );

  // Sync content when initial content changes
  useEffect(() => {
    setContent(initialContent);
    setOptimizedContent(initialContent);
  }, [initialContent]);

  // Render content based on layout mode
  const renderContent = () => {
    switch (layoutMode) {
      case 'editor-only':
        return (
          <div className="h-full">
            <EnhancedEditor
              initialContent={content}
              analysisResult={analysisResult!}
              userProfile={userProfile}
              optimizationGoals={optimizationGoals}
              enableCollaboration={enableCollaboration}
              enableAIAssistant={enableAIAssistant}
              enableVersionHistory={enableVersionHistory}
              onContentChange={handleEditorContentChange}
              onSectionReorder={onSectionReorder}
              onSuggestionApply={onSuggestionApply}
              onTemplateChange={onTemplateChange}
              onExport={onExport}
            />
          </div>
        );

      case 'preview-only':
        return (
          <div className="h-full">
            <EnhancedLivePreviewSystem
              originalContent={content}
              optimizedContent={optimizedContent}
              analysisResult={analysisResult!}
              collaborationUsers={collaborationUsers}
              currentUser={userProfile}
              enableRealTimeUpdates={enableRealTimeUpdates}
              enableCollaboration={enableCollaboration}
              enableVersionControl={enableVersionControl}
              enableComments={enableComments}
              enableSuggestions={enableSuggestions}
              websocketUrl={websocketUrl}
              onContentChange={handlePreviewContentChange}
              onSuggestionApply={onSuggestionApply}
              onCollaborationEvent={handleCollaborationEvent}
              onVersionSave={onVersionSave}
              onCommentAdd={onCommentAdd as any}
            />
          </div>
        );

      case 'split-horizontal':
        return (
          <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="h-full">
              <EnhancedEditor
                initialContent={content}
                analysisResult={analysisResult!}
                userProfile={userProfile}
                optimizationGoals={optimizationGoals}
                enableCollaboration={enableCollaboration}
                enableAIAssistant={enableAIAssistant}
                enableVersionHistory={enableVersionHistory}
                onContentChange={handleEditorContentChange}
                onSectionReorder={onSectionReorder}
                onSuggestionApply={onSuggestionApply}
                onTemplateChange={onTemplateChange}
                onExport={onExport}
              />
            </div>
            <div className="h-full">
              <EnhancedLivePreviewSystem
                originalContent={content}
                optimizedContent={optimizedContent}
                analysisResult={analysisResult!}
                collaborationUsers={collaborationUsers}
                currentUser={userProfile}
                enableRealTimeUpdates={enableRealTimeUpdates}
                enableCollaboration={enableCollaboration}
                enableVersionControl={enableVersionControl}
                enableComments={enableComments}
                enableSuggestions={enableSuggestions}
                websocketUrl={websocketUrl}
                onContentChange={handlePreviewContentChange}
                onSuggestionApply={onSuggestionApply}
                onCollaborationEvent={handleCollaborationEvent}
                onVersionSave={onVersionSave}
                onCommentAdd={onCommentAdd as any}
              />
            </div>
          </div>
        );

      case 'split-vertical':
        return (
          <div className="grid h-full grid-rows-2 gap-4">
            <div className="h-full">
              <EnhancedEditor
                initialContent={content}
                analysisResult={analysisResult!}
                userProfile={userProfile}
                optimizationGoals={optimizationGoals}
                enableCollaboration={enableCollaboration}
                enableAIAssistant={enableAIAssistant}
                enableVersionHistory={enableVersionHistory}
                onContentChange={handleEditorContentChange}
                onSectionReorder={onSectionReorder}
                onSuggestionApply={onSuggestionApply}
                onTemplateChange={onTemplateChange}
                onExport={onExport}
              />
            </div>
            <div className="h-full">
              <EnhancedLivePreviewSystem
                originalContent={content}
                optimizedContent={optimizedContent}
                analysisResult={analysisResult!}
                collaborationUsers={collaborationUsers}
                currentUser={userProfile}
                enableRealTimeUpdates={enableRealTimeUpdates}
                enableCollaboration={enableCollaboration}
                enableVersionControl={enableVersionControl}
                enableComments={enableComments}
                enableSuggestions={enableSuggestions}
                websocketUrl={websocketUrl}
                onContentChange={handlePreviewContentChange}
                onSuggestionApply={onSuggestionApply}
                onCollaborationEvent={handleCollaborationEvent}
                onVersionSave={onVersionSave}
                onCommentAdd={onCommentAdd as any}
              />
            </div>
          </div>
        );

      case 'tabs':
        return (
          <div className="h-full">
            <div className="tabs tabs-bordered mb-4">
              <button className="tab tab-active">Editor</button>
              <button className="tab">Preview</button>
            </div>
            <div className="h-full">
              <EnhancedEditor
                initialContent={content}
                analysisResult={analysisResult!}
                userProfile={userProfile}
                optimizationGoals={optimizationGoals}
                enableCollaboration={enableCollaboration}
                enableAIAssistant={enableAIAssistant}
                enableVersionHistory={enableVersionHistory}
                onContentChange={handleEditorContentChange}
                onSectionReorder={onSectionReorder}
                onSuggestionApply={onSuggestionApply}
                onTemplateChange={onTemplateChange}
                onExport={onExport}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Integration Header */}
      <div className="card mb-4 bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Status */}
            <div className="flex-1">
              <h1 className="font-bold text-2xl">Resume Editor with Live Preview</h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSyncing ? 'animate-pulse bg-warning' : 'bg-success'
                    }`}
                  />
                  <span className="text-base-content/70 text-sm">
                    {isSyncing ? 'Syncing...' : `Last synced: ${lastSyncTime.toLocaleTimeString()}`}
                  </span>
                </div>

                {enableCollaboration && collaborationUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <IntegrationIcons.Sync />
                    <span className="text-base-content/70 text-sm">
                      {collaborationUsers.length} collaborator
                      {collaborationUsers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Layout Controls */}
            <div className="flex items-center gap-4">
              <LayoutModeSelector mode={layoutMode} onModeChange={setLayoutMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-0 flex-1">{renderContent()}</div>
    </div>
  );
};

export default LivePreviewIntegration;
