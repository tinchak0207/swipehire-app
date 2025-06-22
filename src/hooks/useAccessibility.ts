/**
 * React hooks for accessibility features
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AriaLiveType,
  announceToScreenReader,
  FocusManager,
  KeyboardKeys,
  prefersHighContrast,
  prefersReducedMotion,
  trapFocus,
} from '@/lib/accessibility';

/**
 * Hook for managing focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing focus restoration
 */
export function useFocusManager() {
  const focusManagerRef = useRef(new FocusManager());

  const saveFocus = useCallback(() => {
    focusManagerRef.current.saveFocus();
  }, []);

  const restoreFocus = useCallback(() => {
    focusManagerRef.current.restoreFocus();
  }, []);

  const clearSavedFocus = useCallback(() => {
    focusManagerRef.current.clearSavedFocus();
  }, []);

  return { saveFocus, restoreFocus, clearSavedFocus };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback(
    (message: string, priority: AriaLiveType = 'polite', timeout = 1000) => {
      announceToScreenReader(message, priority, timeout);
    },
    []
  );

  return announce;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  handlers: { [key: string]: (event: KeyboardEvent) => void },
  dependencies: unknown[] = []
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [handlers, ...dependencies]);

  return elementRef;
}

/**
 * Hook for managing ARIA live regions
 */
export function useAriaLiveRegion(initialMessage = '') {
  const [message, setMessage] = useState(initialMessage);
  const [priority, setPriority] = useState<AriaLiveType>('polite');
  const regionRef = useRef<HTMLDivElement>(null);

  const updateMessage = useCallback((newMessage: string, newPriority: AriaLiveType = 'polite') => {
    setMessage(newMessage);
    setPriority(newPriority);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  useEffect(() => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority);
    }
  }, [priority]);

  return {
    regionRef,
    message,
    priority,
    updateMessage,
    clearMessage,
  };
}

/**
 * Hook for detecting user preferences
 */
export function useUserPreferences() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    setHighContrast(prefersHighContrast());

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return { reducedMotion, highContrast };
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks(links: Array<{ id: string; label: string }>) {
  const skipLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!skipLinksRef.current) return;

    const container = skipLinksRef.current;
    container.innerHTML = '';

    links.forEach(({ id, label }) => {
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = label;
      link.className = 'skip-link';
      link.style.cssText = `
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
      `;

      link.addEventListener('focus', () => {
        link.style.top = '6px';
      });

      link.addEventListener('blur', () => {
        link.style.top = '-40px';
      });

      container.appendChild(link);
    });
  }, [links]);

  return skipLinksRef;
}

/**
 * Hook for managing accessible form validation
 */
export function useAccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((fieldName: string, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const getFieldProps = useCallback(
    (fieldName: string) => {
      const hasError = errors[fieldName] && touched[fieldName];
      return {
        'aria-invalid': hasError ? 'true' : 'false',
        'aria-describedby': hasError ? `${fieldName}-error` : undefined,
      };
    },
    [errors, touched]
  );

  const getErrorProps = useCallback(
    (fieldName: string) => {
      const hasError = errors[fieldName] && touched[fieldName];
      return {
        id: `${fieldName}-error`,
        role: 'alert' as const,
        'aria-live': 'polite' as const,
        style: { display: hasError ? 'block' : 'none' },
      };
    },
    [errors, touched]
  );

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    getFieldProps,
    getErrorProps,
  };
}

/**
 * Hook for managing accessible tooltips
 */
export function useAccessibleTooltip(content: string, delay = 300) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipId] = useState(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  }, [delay]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === KeyboardKeys.ESCAPE) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const handleMouseEnter = () => showTooltip();
    const handleMouseLeave = () => hideTooltip();
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    trigger.addEventListener('mouseenter', handleMouseEnter);
    trigger.addEventListener('mouseleave', handleMouseLeave);
    trigger.addEventListener('focus', handleFocus);
    trigger.addEventListener('blur', handleBlur);
    trigger.addEventListener('keydown', handleKeyDown);

    return () => {
      trigger.removeEventListener('mouseenter', handleMouseEnter);
      trigger.removeEventListener('mouseleave', handleMouseLeave);
      trigger.removeEventListener('focus', handleFocus);
      trigger.removeEventListener('blur', handleBlur);
      trigger.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip, hideTooltip, handleKeyDown]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const triggerProps = {
    ref: triggerRef,
    'aria-describedby': isVisible ? tooltipId : undefined,
  };

  const tooltipProps = {
    ref: tooltipRef,
    id: tooltipId,
    role: 'tooltip' as const,
    style: { display: isVisible ? 'block' : 'none' },
  };

  return {
    triggerProps,
    tooltipProps,
    isVisible,
    content,
  };
}

/**
 * Hook for managing accessible disclosure (collapsible content)
 */
export function useAccessibleDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [contentId] = useState(() => `disclosure-${Math.random().toString(36).substr(2, 9)}`);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const triggerProps = {
    'aria-expanded': isOpen,
    'aria-controls': contentId,
    onClick: toggle,
  };

  const contentProps = {
    id: contentId,
    'aria-hidden': !isOpen,
    style: { display: isOpen ? 'block' : 'none' },
  };

  return {
    isOpen,
    toggle,
    open,
    close,
    triggerProps,
    contentProps,
  };
}

/**
 * Hook for managing accessible tabs
 */
export function useAccessibleTabs(tabs: string[], initialTab = 0) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectTab = useCallback(
    (index: number) => {
      if (index >= 0 && index < tabs.length) {
        setActiveTab(index);
        tabRefs.current[index]?.focus();
      }
    },
    [tabs.length]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, index: number) => {
      switch (event.key) {
        case KeyboardKeys.ARROW_LEFT:
          event.preventDefault();
          selectTab(index === 0 ? tabs.length - 1 : index - 1);
          break;
        case KeyboardKeys.ARROW_RIGHT:
          event.preventDefault();
          selectTab(index === tabs.length - 1 ? 0 : index + 1);
          break;
        case KeyboardKeys.HOME:
          event.preventDefault();
          selectTab(0);
          break;
        case KeyboardKeys.END:
          event.preventDefault();
          selectTab(tabs.length - 1);
          break;
      }
    },
    [selectTab, tabs.length]
  );

  const getTabProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLButtonElement | null) => {
        tabRefs.current[index] = el;
      },
      role: 'tab' as const,
      'aria-selected': activeTab === index,
      'aria-controls': `tabpanel-${index}`,
      id: `tab-${index}`,
      tabIndex: activeTab === index ? 0 : -1,
      onClick: () => selectTab(index),
      onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event.nativeEvent, index),
    }),
    [activeTab, selectTab, handleKeyDown]
  );

  const getPanelProps = useCallback(
    (index: number) => ({
      role: 'tabpanel' as const,
      'aria-labelledby': `tab-${index}`,
      id: `tabpanel-${index}`,
      hidden: activeTab !== index,
    }),
    [activeTab]
  );

  return {
    activeTab,
    selectTab,
    getTabProps,
    getPanelProps,
  };
}
