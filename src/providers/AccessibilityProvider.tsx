/**
 * Accessibility Provider for global accessibility features
 * Manages skip links, announcements, and user preferences
 */

'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useAriaLiveRegion, useSkipLinks, useUserPreferences } from '../hooks/useAccessibility';
import { addCriticalResourceHints } from '../lib/performance';

interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  skipLinks: Array<{ id: string; label: string }>;
  setSkipLinks: (links: Array<{ id: string; label: string }>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
  initialSkipLinks?: Array<{ id: string; label: string }>;
}

export function AccessibilityProvider({
  children,
  initialSkipLinks = [
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'navigation', label: 'Skip to navigation' },
    { id: 'footer', label: 'Skip to footer' },
  ],
}: AccessibilityProviderProps) {
  const { reducedMotion, highContrast } = useUserPreferences();
  const [skipLinks, setSkipLinks] = useState(initialSkipLinks);
  const skipLinksRef = useSkipLinks(skipLinks);
  const { updateMessage } = useAriaLiveRegion();

  // Add performance optimizations on mount
  useEffect(() => {
    addCriticalResourceHints();
  }, []);

  // Apply user preferences to document
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    updateMessage(message, priority);
  };

  const contextValue: AccessibilityContextType = {
    reducedMotion,
    highContrast,
    announce,
    skipLinks,
    setSkipLinks,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links Container */}
      <div ref={skipLinksRef} className="skip-links" />

      {/* Global ARIA Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="global-announcements" />

      {/* Main Content */}
      {children}

      {/* Global Styles for Accessibility */}
      <style jsx global>{`
        /* Reduced motion styles */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        
        /* High contrast styles */
        .high-contrast {
          filter: contrast(150%);
        }
        
        /* Skip link styles */
        .skip-links a {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          z-index: 1000;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          transition: top 0.2s ease;
        }
        
        .skip-links a:focus {
          top: 6px;
        }
        
        /* Screen reader only utility class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Focus visible styles for better keyboard navigation */
        .focus-visible:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        /* Ensure interactive elements have minimum touch target size */
        button,
        input,
        select,
        textarea,
        a {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Improve text readability */
        body {
          line-height: 1.6;
        }
        
        /* Ensure sufficient color contrast for links */
        a {
          text-decoration-skip-ink: auto;
        }
        
        /* Focus indicators for custom components */
        [role="button"]:focus-visible,
        [role="tab"]:focus-visible,
        [role="menuitem"]:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        /* Ensure form controls are properly sized */
        input,
        select,
        textarea {
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        /* Loading states should be announced */
        [aria-busy="true"] {
          cursor: wait;
        }
        
        /* Error states should be clearly visible */
        [aria-invalid="true"] {
          border-color: hsl(var(--error));
        }
        
        /* Disabled states should be clearly indicated */
        [aria-disabled="true"],
        :disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Ensure tooltips are properly positioned */
        [role="tooltip"] {
          position: absolute;
          z-index: 1000;
          background: hsl(var(--base-100));
          border: 1px solid hsl(var(--border));
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 250px;
          word-wrap: break-word;
        }
        
        /* Ensure modals are properly layered */
        [role="dialog"] {
          z-index: 1000;
        }
        
        /* Improve table accessibility */
        table {
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
        }
        
        /* Ensure proper heading hierarchy */
        h1 { font-size: 2rem; }
        h2 { font-size: 1.75rem; }
        h3 { font-size: 1.5rem; }
        h4 { font-size: 1.25rem; }
        h5 { font-size: 1.125rem; }
        h6 { font-size: 1rem; }
        
        /* Responsive text sizing */
        @media (max-width: 768px) {
          h1 { font-size: 1.75rem; }
          h2 { font-size: 1.5rem; }
          h3 { font-size: 1.25rem; }
        }
        
        /* Print styles for accessibility */
        @media print {
          .skip-links,
          .sr-only {
            display: none !important;
          }
          
          a[href^="http"]:after {
            content: " (" attr(href) ")";
          }
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
}
