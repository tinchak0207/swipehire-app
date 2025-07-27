'use client';

import type React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

interface ReactQuillWrapperProps {
  theme?: string;
  value: string;
  onChange: (value: string, delta?: unknown, source?: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  modules?: any;
  formats?: string[];
  style?: React.CSSProperties;
  className?: string;
}

interface ReactQuillWrapperRef {
  getEditor: () => any;
  getEditingArea: () => HTMLElement | null;
  focus: () => void;
  blur: () => void;
}

/**
 * ReactQuill Wrapper Component
 *
 * This wrapper fixes the findDOMNode compatibility issue with React 18
 * by monkey-patching ReactDOM.findDOMNode before ReactQuill loads.
 */
const ReactQuillWrapper = forwardRef<ReactQuillWrapperRef, ReactQuillWrapperProps>((props, ref) => {
  const quillRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ReactQuillComponent, setReactQuillComponent] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      return quillRef.current?.getEditor?.() || null;
    },
    getEditingArea: () => {
      // Instead of using findDOMNode, we'll find the editing area using querySelector
      if (containerRef.current) {
        const editingArea = containerRef.current.querySelector('.ql-editor');
        return editingArea as HTMLElement;
      }
      return null;
    },
    focus: () => {
      const editor = quillRef.current?.getEditor?.();
      if (editor) {
        editor.focus();
      }
    },
    blur: () => {
      const editor = quillRef.current?.getEditor?.();
      if (editor) {
        editor.blur();
      }
    },
  }));

  // Load ReactQuill with findDOMNode patch
  useEffect(() => {
    if (typeof window !== 'undefined' && !ReactQuillComponent) {
      // Monkey patch ReactDOM.findDOMNode before loading ReactQuill
      const originalFindDOMNode = require('react-dom').findDOMNode;

      // Create a safe findDOMNode replacement
      const safeFindDOMNode = (component: any) => {
        if (!component) return null;

        // If it's already a DOM node, return it
        if (component.nodeType) {
          return component;
        }

        // If it has a current property (ref), use that
        if (component.current) {
          return component.current;
        }

        // Try to find the DOM node using the original method with error handling
        try {
          return originalFindDOMNode(component);
        } catch (error) {
          console.warn('findDOMNode fallback used:', error);

          // Last resort: try to find the editor element in the container
          if (containerRef.current) {
            const editor = containerRef.current.querySelector('.ql-editor');
            return editor;
          }

          return null;
        }
      };

      // Temporarily replace findDOMNode
      require('react-dom').findDOMNode = safeFindDOMNode;

      // Dynamically import ReactQuill
      import('react-quill')
        .then((module) => {
          setReactQuillComponent(() => module.default);

          // Restore original findDOMNode after a short delay
          setTimeout(() => {
            require('react-dom').findDOMNode = originalFindDOMNode;
          }, 100);
        })
        .catch((error) => {
          console.error('Failed to load ReactQuill:', error);
          // Restore original findDOMNode on error
          require('react-dom').findDOMNode = originalFindDOMNode;
        });
    }
  }, [ReactQuillComponent]);

  if (!ReactQuillComponent) {
    return (
      <div className="animate-pulse rounded-lg bg-base-200 p-8">
        <div className="mb-4 h-4 w-3/4 rounded bg-base-300" />
        <div className="mb-4 h-4 w-1/2 rounded bg-base-300" />
        <div className="h-4 w-5/6 rounded bg-base-300" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="react-quill-wrapper">
      <ReactQuillComponent ref={quillRef} {...props} />
    </div>
  );
});

ReactQuillWrapper.displayName = 'ReactQuillWrapper';

export default ReactQuillWrapper;
