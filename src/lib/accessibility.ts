/**
 * Accessibility utilities for SwipeHire application
 * Provides comprehensive accessibility features and helpers
 */

// ARIA live region types
export type AriaLiveType = 'polite' | 'assertive' | 'off';

// Focus management utilities
export interface FocusableElement extends HTMLElement {
  focus(): void;
}

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as FocusableElement[];
}

/**
 * Traps focus within a container (useful for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleTabKey);

  // Focus the first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announces text to screen readers using ARIA live regions
 */
export function announceToScreenReader(
  message: string,
  priority: AriaLiveType = 'polite',
  timeout = 1000
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, timeout);
}

/**
 * Manages skip links for keyboard navigation
 */
export function createSkipLink(targetId: string, text: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
  `;

  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
}

/**
 * Validates color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  function getLuminance(color: string): number {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      const channel = Number.parseInt(c, 10) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if color contrast meets WCAG guidelines
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };

  return ratio >= requirements[level][size];
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
} as const;

/**
 * Creates keyboard event handler for common patterns
 */
export function createKeyboardHandler(handlers: {
  [key: string]: (event: KeyboardEvent) => void;
}): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler(event);
    }
  };
}

/**
 * Manages reduced motion preferences
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Creates accessible form validation messages
 */
export function createValidationMessage(
  fieldId: string,
  message: string,
  type: 'error' | 'warning' | 'success' = 'error'
): HTMLElement {
  const messageElement = document.createElement('div');
  messageElement.id = `${fieldId}-${type}`;
  messageElement.className = `validation-message validation-message--${type}`;
  messageElement.setAttribute('role', type === 'error' ? 'alert' : 'status');
  messageElement.setAttribute('aria-live', 'polite');
  messageElement.textContent = message;

  return messageElement;
}

/**
 * Manages focus restoration after modal/dialog interactions
 */
export class FocusManager {
  private previousActiveElement: Element | null = null;

  public saveFocus(): void {
    this.previousActiveElement = document.activeElement;
  }

  public restoreFocus(): void {
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
  }

  public clearSavedFocus(): void {
    this.previousActiveElement = null;
  }
}

/**
 * Creates accessible loading states
 */
export function createLoadingAnnouncement(message = 'Loading content'): HTMLElement {
  const loader = document.createElement('div');
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-busy', 'true');
  loader.className = 'sr-only';
  loader.textContent = message;

  return loader;
}

/**
 * Screen reader only text utility
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
}

/**
 * Accessible tooltip management
 */
export interface TooltipOptions {
  trigger: HTMLElement;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function createAccessibleTooltip({
  trigger,
  content,
  placement = 'top',
  delay = 300,
}: TooltipOptions): () => void {
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  let tooltip: HTMLElement | null = null;
  let showTimeout: NodeJS.Timeout;
  let hideTimeout: NodeJS.Timeout;

  function showTooltip(): void {
    if (tooltip) return;

    tooltip = document.createElement('div');
    tooltip.id = tooltipId;
    tooltip.className = `tooltip tooltip--${placement}`;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = content;

    document.body.appendChild(tooltip);
    trigger.setAttribute('aria-describedby', tooltipId);

    // Position tooltip (simplified positioning)
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top: number;
    let left: number;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    }

    tooltip.style.position = 'absolute';
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.zIndex = '1000';
  }

  function hideTooltip(): void {
    if (tooltip) {
      document.body.removeChild(tooltip);
      tooltip = null;
      trigger.removeAttribute('aria-describedby');
    }
  }

  function handleMouseEnter(): void {
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(showTooltip, delay);
  }

  function handleMouseLeave(): void {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(hideTooltip, delay);
  }

  function handleFocus(): void {
    clearTimeout(hideTimeout);
    showTooltip();
  }

  function handleBlur(): void {
    clearTimeout(showTimeout);
    hideTooltip();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === KeyboardKeys.ESCAPE) {
      hideTooltip();
    }
  }

  // Add event listeners
  trigger.addEventListener('mouseenter', handleMouseEnter);
  trigger.addEventListener('mouseleave', handleMouseLeave);
  trigger.addEventListener('focus', handleFocus);
  trigger.addEventListener('blur', handleBlur);
  trigger.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    hideTooltip();
    trigger.removeEventListener('mouseenter', handleMouseEnter);
    trigger.removeEventListener('mouseleave', handleMouseLeave);
    trigger.removeEventListener('focus', handleFocus);
    trigger.removeEventListener('blur', handleBlur);
    trigger.removeEventListener('keydown', handleKeyDown);
  };
}
