/**
 * Accessible Modal Component with DaisyUI integration
 * Provides comprehensive accessibility features including focus management
 */

import { X } from 'lucide-react';
import React, { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusManager } from '@/hooks/useAccessibility';
import { trapFocus } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { AccessibleButton } from './AccessibleButton';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  initialFocus?: React.RefObject<HTMLElement>;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  initialFocus,
}: AccessibleModalProps) {
  const { saveFocus, restoreFocus } = useFocusManager();
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const keyboardHandlers = {
    Escape: () => {
      if (closeOnEscape) {
        onClose();
      }
    },
  };

  // Setup focus trap
  useEffect(() => {
    if (!isOpen || !focusTrapRef.current) return;
    return trapFocus(focusTrapRef.current);
  }, [isOpen]);

  // Setup keyboard navigation
  useEffect(() => {
    if (!isOpen || !keyboardRef.current) return;

    const element = keyboardRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        keyboardHandlers.Escape();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Save focus when modal opens and restore when it closes
  useEffect(() => {
    if (isOpen) {
      saveFocus();

      // Focus initial element or first focusable element
      if (initialFocus?.current) {
        initialFocus.current.focus();
      }
    } else {
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus, initialFocus]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'modal-box w-80 max-w-sm',
      md: 'modal-box w-96 max-w-md',
      lg: 'modal-box w-[32rem] max-w-lg',
      xl: 'modal-box w-[48rem] max-w-xl',
      full: 'modal-box w-full max-w-full h-full max-h-full',
    };
    return sizes[size];
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn('modal modal-open', className)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={handleBackdropClick}
    >
      <div className={cn('modal-backdrop', overlayClassName)} aria-hidden="true" />

      <div
        ref={(el) => {
          if (el) {
            (focusTrapRef as React.MutableRefObject<HTMLDivElement>).current = el;
            (keyboardRef as React.MutableRefObject<HTMLDivElement>).current = el;
          }
        }}
        className={cn(getSizeClasses(), contentClassName)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-bold text-xl">
            {title}
          </h2>

          {showCloseButton && (
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
              className="btn-circle"
            >
              <X size={20} aria-hidden="true" />
            </AccessibleButton>
          )}
        </div>

        {/* Modal Description */}
        {description && (
          <p id="modal-description" className="mb-4 text-base-content/70">
            {description}
          </p>
        )}

        {/* Modal Content */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );

  // Render modal in portal to avoid z-index issues
  return createPortal(modalContent, document.body);
}

// Modal Action component for consistent button styling
export interface ModalActionProps {
  children: ReactNode;
  className?: string;
}

export function ModalAction({ children, className }: ModalActionProps) {
  return (
    <div className={cn('modal-action mt-6 flex justify-end gap-2', className)}>{children}</div>
  );
}

// Confirmation Modal variant
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'error' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}: ConfirmationModalProps) {
  const getVariantIcon = () => {
    switch (variant) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'error':
        return 'error' as const;
      case 'warning':
        return 'warning' as const;
      case 'info':
        return 'info' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="py-4 text-center">
        <div className="mb-4 text-4xl" aria-hidden="true">
          {getVariantIcon()}
        </div>

        <p className="mb-6 text-base-content">{message}</p>
      </div>

      <ModalAction>
        <AccessibleButton variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </AccessibleButton>

        <AccessibleButton
          variant={getConfirmVariant()}
          onClick={onConfirm}
          loading={loading}
          loadingText="Processing..."
        >
          {confirmText}
        </AccessibleButton>
      </ModalAction>
    </AccessibleModal>
  );
}
