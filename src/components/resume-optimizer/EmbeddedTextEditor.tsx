'use client';

import {
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorState } from '@/lib/types/resume-optimizer';

// Import our custom ReactQuill wrapper that fixes React 18 compatibility
import ReactQuillWrapper from './ReactQuillWrapper';

interface EmbeddedTextEditorProps {
  /** Initial content to load in the editor */
  initialContent: string;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Callback when content changes */
  onContentChange?: (content: string, delta?: unknown, source?: string) => void;
  /** Callback when editor state changes */
  onEditorStateChange?: (state: EditorState) => void;
  /** Custom placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Whether to show editor controls */
  showControls?: boolean;
  /** Height of the editor */
  height?: string;
  /** Whether to auto-save changes */
  autoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Callback for auto-save */
  onAutoSave?: (content: string) => Promise<void>;
}

interface EditorControls {
  isPreviewMode: boolean;
  wordCount: number;
  characterCount: number;
  isDirty: boolean;
  lastSaved?: string;
}

/**
 * Embedded Real-time Text Editor Component
 *
 * Features:
 * - Rich text editing with Quill.js
 * - Real-time content updates
 * - Preview mode toggle
 * - Word/character count
 * - Auto-save functionality
 * - Responsive design with Tailwind/DaisyUI
 * - Accessibility support
 */
const EmbeddedTextEditor = React.forwardRef<any, EmbeddedTextEditorProps>(
  (
    {
      initialContent,
      readOnly = false,
      onContentChange,
      onEditorStateChange,
      placeholder = 'Start editing your resume content...',
      className = '',
      showToolbar = true,
      showControls = true,
      height = '400px',
      autoSave = false,
      autoSaveInterval = 30000, // 30 seconds
      onAutoSave,
    },
    ref
  ) => {
    // State management
    const [content, setContent] = useState<string>(initialContent);
    const [editorState, setEditorState] = useState<EditorState>({
      content: initialContent,
      isDirty: false,
      cursorPosition: 0,
    });
    const [controls, setControls] = useState<EditorControls>({
      isPreviewMode: false,
      wordCount: 0,
      characterCount: 0,
      isDirty: false,
    });
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Refs
    const quillRef = useRef<any>(ref);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        if (readOnly) {
          editor.enable(false);
        }
      }
    }, [readOnly]);

    // Quill configuration
    const quillModules = {
      toolbar: showToolbar
        ? [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link'],
            [{ align: [] }],
            ['clean'],
          ]
        : false,
      clipboard: {
        matchVisual: false,
      },
    };

    const quillFormats = [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'indent',
      'link',
      'align',
    ];

    // Calculate word and character counts
    const calculateCounts = useCallback((text: string) => {
      const plainText = text.replace(/<[^>]*>/g, '').trim();
      const wordCount = plainText ? plainText.split(/\s+/).length : 0;
      const characterCount = plainText.length;
      return { wordCount, characterCount };
    }, []);

    // Handle content changes
    const handleAutoSave = useCallback(
      async (contentToSave: string) => {
        if (!onAutoSave) return;

        setIsAutoSaving(true);
        setAutoSaveError(null);
        setShowSaveSuccess(false);

        try {
          await onAutoSave(contentToSave);
          const now = new Date().toLocaleTimeString();
          setEditorState((prev) => ({
            ...prev,
            lastSaved: now,
            isDirty: false,
          }));
          setControls((prev) => ({
            ...prev,
            isDirty: false,
            lastSaved: now,
          }));

          // Show success notification briefly
          setShowSaveSuccess(true);
          setTimeout(() => setShowSaveSuccess(false), 2000);
        } catch (error) {
          setAutoSaveError(error instanceof Error ? error.message : 'Auto-save failed');
        } finally {
          setIsAutoSaving(false);
        }
      },
      [onAutoSave]
    );

    // Handle content changes
    const handleContentChange = useCallback(
      (value: string, delta?: unknown, source?: string) => {
        setContent(value);

        const counts = calculateCounts(value);
        const newEditorState: EditorState = {
          content: value,
          isDirty: value !== initialContent,
          cursorPosition: quillRef.current?.getEditor()?.getSelection()?.index || 0,
        };

        setEditorState(newEditorState);
        setControls((prev) => ({
          ...prev,
          ...counts,
          isDirty: newEditorState.isDirty,
        }));

        // Clear auto-save error when user makes changes
        if (autoSaveError) {
          setAutoSaveError(null);
        }

        // Trigger callbacks
        onContentChange?.(value, delta, source);
        onEditorStateChange?.(newEditorState);

        // Setup auto-save
        if (autoSave && onAutoSave && newEditorState.isDirty) {
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }

          autoSaveTimeoutRef.current = setTimeout(() => {
            handleAutoSave(value);
          }, autoSaveInterval);
        }
      },
      [
        initialContent,
        calculateCounts,
        onContentChange,
        onEditorStateChange,
        autoSave,
        onAutoSave,
        autoSaveInterval,
        autoSaveError,
        handleAutoSave,
      ]
    );

    // Manual save function
    const handleManualSave = useCallback(() => {
      if (onAutoSave && editorState.isDirty) {
        handleAutoSave(content);
      }
    }, [onAutoSave, editorState.isDirty, content, handleAutoSave]);

    // Toggle preview mode
    const togglePreviewMode = useCallback(() => {
      setControls((prev) => ({
        ...prev,
        isPreviewMode: !prev.isPreviewMode,
      }));
    }, []);

    // Reset content to initial
    const resetContent = useCallback(() => {
      setContent(initialContent);
      handleContentChange(initialContent);
    }, [initialContent, handleContentChange]);

    // Initialize content and counts
    useEffect(() => {
      const counts = calculateCounts(initialContent);
      setControls((prev) => ({
        ...prev,
        ...counts,
      }));
    }, [initialContent, calculateCounts]);

    // Handle preview mode toggle - ensure editor refreshes when switching back to edit mode
    useEffect(() => {
      if (!controls.isPreviewMode && quillRef.current) {
        // Small delay to ensure the editor is visible before refreshing
        const timer = setTimeout(() => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            // Force a refresh of the editor to ensure it displays correctly
            editor.update();
            // Optionally focus the editor when switching back to edit mode
            editor.focus();
          }
        }, 50);

        return () => clearTimeout(timer);
      }
      return () => {};
    }, [controls.isPreviewMode]);

    // Cleanup auto-save timeout
    useEffect(() => {
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div className={`rounded-xl border border-base-300 bg-base-100 shadow-sm ${className}`}>
        {/* Editor Header */}
        {showControls && (
          <div className="flex items-center justify-between border-base-300 border-b p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DocumentTextIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base-content">Resume Editor</h3>
                <div className="flex items-center space-x-4 text-base-content/70 text-sm">
                  <span>{controls.wordCount} words</span>
                  <span>•</span>
                  <span>{controls.characterCount} characters</span>
                  {controls.isDirty && (
                    <>
                      <span>•</span>
                      <span className="text-warning">Unsaved changes</span>
                    </>
                  )}
                  {controls.lastSaved && (
                    <>
                      <span>•</span>
                      <span className="text-success">Saved at {controls.lastSaved}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Auto-save status */}
              {autoSave && (
                <div className="flex items-center space-x-2">
                  {isAutoSaving && (
                    <div className="flex items-center space-x-2 text-info">
                      <div className="loading loading-spinner loading-xs" />
                      <span className="text-xs">Saving...</span>
                    </div>
                  )}
                  {autoSaveError && (
                    <div className="tooltip tooltip-left" data-tip={autoSaveError}>
                      <XMarkIcon className="h-4 w-4 text-error" />
                    </div>
                  )}
                </div>
              )}

              {/* Manual save button */}
              {onAutoSave && (
                <button
                  onClick={handleManualSave}
                  disabled={!editorState.isDirty || isAutoSaving}
                  className="btn btn-sm btn-primary"
                  aria-label="Save changes"
                >
                  <CheckIcon className="h-4 w-4" />
                  Save
                </button>
              )}

              {/* Preview toggle */}
              <button
                onClick={togglePreviewMode}
                className={`btn btn-sm ${controls.isPreviewMode ? 'btn-active' : 'btn-ghost'}`}
                aria-label={controls.isPreviewMode ? 'Exit preview mode' : 'Enter preview mode'}
              >
                {controls.isPreviewMode ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
                {controls.isPreviewMode ? 'Edit' : 'Preview'}
              </button>

              {/* Reset button */}
              <button
                onClick={resetContent}
                disabled={!editorState.isDirty}
                className="btn btn-sm btn-ghost"
                aria-label="Reset to original content"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          {/* Preview Mode */}
          <div
            className={`prose prose-sm max-w-none p-6 ${controls.isPreviewMode ? 'block' : 'hidden'}`}
            style={{ minHeight: height }}
            dangerouslySetInnerHTML={{ __html: content }}
            role="document"
            aria-label="Resume content preview"
          />

          {/* Edit Mode */}
          <div
            className={`quill-editor-container ${controls.isPreviewMode ? 'hidden' : 'block'}`}
            aria-label="Resume content editor"
          >
            <ReactQuillWrapper
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              readOnly={readOnly}
              placeholder={placeholder}
              modules={quillModules}
              formats={quillFormats}
              style={{
                height: height,
                backgroundColor: 'transparent',
              }}
              className="border-0"
            />
          </div>
        </div>
        {/* Auto-save notifications - positioned in bottom right */}
        {isAutoSaving && (
          <div className="fixed right-4 bottom-4 z-50">
            <div className="slide-in-from-right-2 fade-in-0 animate-in rounded-lg border border-base-300 bg-base-100 p-3 shadow-lg duration-300">
              <div className="flex items-center space-x-2">
                <div className="loading loading-spinner loading-xs text-primary" />
                <span className="font-medium text-xs">Saving...</span>
              </div>
            </div>
          </div>
        )}

        {/* Success notification */}
        {showSaveSuccess && (
          <div className="fixed right-4 bottom-4 z-50">
            <div className="slide-in-from-right-2 fade-in-0 animate-in rounded-lg border border-success bg-success/10 p-3 shadow-lg duration-300">
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-4 w-4 text-success" />
                <span className="font-medium text-success text-xs">Saved!</span>
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {autoSaveError && (
          <div className="fixed right-4 bottom-4 z-50">
            <div className="slide-in-from-right-2 fade-in-0 animate-in rounded-lg border border-error bg-error/10 p-3 shadow-lg duration-300">
              <div className="flex items-center space-x-2">
                <XMarkIcon className="h-4 w-4 text-error" />
                <span className="font-medium text-error text-xs">Save failed</span>
              </div>
            </div>
          </div>
        )}
        {/* Editor Footer */}
        {showControls && (
          <div className="flex items-center justify-between border-base-300 border-t bg-base-50 p-3">
            <div className="text-base-content/60 text-xs">
              {readOnly ? 'Read-only mode' : 'Click to edit • Auto-formatting enabled'}
            </div>
          </div>
        )}

        {/* Custom Styles */}
        <style jsx global>{`
        .quill-editor-container .ql-editor {
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          padding: 1.5rem;
          min-height: ${height};
        }
        
        .quill-editor-container .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid hsl(var(--bc) / 0.2);
          background: hsl(var(--b2));
        }
        
        .quill-editor-container .ql-container {
          border: none;
          font-family: inherit;
        }
        
        .quill-editor-container .ql-editor.ql-blank::before {
          color: hsl(var(--bc) / 0.5);
          font-style: italic;
        }
        
        .quill-editor-container .ql-editor:focus {
          outline: none;
        }
        
        /* Ensure toolbar buttons are always black for visibility */
        .quill-editor-container .ql-toolbar .ql-stroke {
          stroke: #000000 !important;
        }
        
        .quill-editor-container .ql-toolbar .ql-fill {
          fill: #000000 !important;
        }
        
        .quill-editor-container .ql-toolbar button {
          color: #000000 !important;
        }
        
        .quill-editor-container .ql-toolbar button:hover .ql-stroke {
          stroke: #0066cc !important;
        }
        
        .quill-editor-container .ql-toolbar button:hover .ql-fill {
          fill: #0066cc !important;
        }
        
        .quill-editor-container .ql-toolbar button:hover {
          color: #0066cc !important;
        }
        
        .quill-editor-container .ql-toolbar button.ql-active .ql-stroke {
          stroke: #0066cc !important;
        }
        
        .quill-editor-container .ql-toolbar button.ql-active .ql-fill {
          fill: #0066cc !important;
        }
        
        .quill-editor-container .ql-toolbar button.ql-active {
          color: #0066cc !important;
        }
        
        /* Ensure dropdown arrows and other elements are also black */
        .quill-editor-container .ql-toolbar .ql-picker-label {
          color: #000000 !important;
        }
        
        .quill-editor-container .ql-toolbar .ql-picker-label:before {
          color: #000000 !important;
        }
        
        .quill-editor-container .ql-toolbar .ql-picker-options {
          color: #000000 !important;
        }
        
        /* Ensure text in dropdowns is black */
        .quill-editor-container .ql-toolbar .ql-picker-item {
          color: #000000 !important;
        }
      `}</style>
      </div>
    );
  }
);

export default EmbeddedTextEditor;
