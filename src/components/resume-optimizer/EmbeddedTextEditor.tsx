'use client';

import React from 'react';
import {
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorState } from '@/lib/types/resume-optimizer';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="bg-base-200 rounded-lg p-8 animate-pulse">
      <div className="h-4 bg-base-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-base-300 rounded w-5/6"></div>
    </div>
  ),
});

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

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
      'bullet',
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
      ]
    );

    // Handle auto-save
    const handleAutoSave = useCallback(
      async (contentToSave: string) => {
        if (!onAutoSave) return;

        setIsAutoSaving(true);
        setAutoSaveError(null);

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
        } catch (error) {
          setAutoSaveError(error instanceof Error ? error.message : 'Auto-save failed');
        } finally {
          setIsAutoSaving(false);
        }
      },
      [onAutoSave]
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

    // Cleanup auto-save timeout
    useEffect(() => {
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div className={`bg-base-100 rounded-xl border border-base-300 shadow-sm ${className}`}>
        {/* Editor Header */}
        {showControls && (
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base-content">Resume Editor</h3>
                <div className="flex items-center space-x-4 text-sm text-base-content/70">
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
                      <div className="loading loading-spinner loading-xs"></div>
                      <span className="text-xs">Saving...</span>
                    </div>
                  )}
                  {autoSaveError && (
                    <div className="tooltip tooltip-left" data-tip={autoSaveError}>
                      <XMarkIcon className="w-4 h-4 text-error" />
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
                  <CheckIcon className="w-4 h-4" />
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
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
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
                <ArrowPathIcon className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          {controls.isPreviewMode ? (
            /* Preview Mode */
            <div
              className="prose prose-sm max-w-none p-6"
              style={{ minHeight: height }}
              dangerouslySetInnerHTML={{ __html: content }}
              role="document"
              aria-label="Resume content preview"
            />
          ) : (
            /* Edit Mode */
            <div className="quill-editor-container" aria-label="Resume content editor">
              <ReactQuill
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
          )}
        </div>
        {/* Loading overlay */}
        {isAutoSaving && (
          <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center">
            <div className="bg-base-100 rounded-lg p-4 shadow-lg border border-base-300">
              <div className="flex items-center space-x-3">
                <div className="loading loading-spinner loading-sm text-primary"></div>
                <span className="text-sm font-medium">Saving changes...</span>
              </div>
            </div>
          </div>
        )}
        {/* Editor Footer */}
        {showControls && (
          <div className="flex items-center justify-between p-3 border-t border-base-300 bg-base-50">
            <div className="text-xs text-base-content/60">
              {readOnly ? 'Read-only mode' : 'Click to edit • Auto-formatting enabled'}
            </div>

            {autoSaveError && (
              <div className="alert alert-error alert-sm max-w-xs">
                <XMarkIcon className="w-4 h-4" />
                <span className="text-xs">{autoSaveError}</span>
              </div>
            )}
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
        
        .quill-editor-container .ql-toolbar .ql-stroke {
          stroke: hsl(var(--bc) / 0.7);
        }
        
        .quill-editor-container .ql-toolbar .ql-fill {
          fill: hsl(var(--bc) / 0.7);
        }
        
        .quill-editor-container .ql-toolbar button:hover .ql-stroke {
          stroke: hsl(var(--p));
        }
        
        .quill-editor-container .ql-toolbar button:hover .ql-fill {
          fill: hsl(var(--p));
        }
        
        .quill-editor-container .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--p));
        }
        
        .quill-editor-container .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--p));
        }
      `}</style>
      </div>
    );
  }
);

export default EmbeddedTextEditor;
