'use client';

import { X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * Mobile Modal Props Interface
 */
interface MobileOptimizedModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether modal can be dismissed by clicking backdrop */
  dismissible?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom className */
  className?: string;
  /** Header actions */
  headerActions?: React.ReactNode;
  /** Whether modal should take full height on mobile */
  fullHeightOnMobile?: boolean;
  /** Whether to show header */
  showHeader?: boolean;
}

/**
 * Mobile-Optimized Modal Component
 *
 * Provides a responsive modal that adapts to mobile constraints with:
 * - Full-screen on mobile, centered on desktop
 * - Touch-friendly interactions
 * - Proper keyboard navigation
 * - Smooth animations
 * - Accessibility features
 * - Safe area support for mobile devices
 *
 * @example
 * ```tsx
 * <MobileOptimizedModal
 *   isOpen={isModalOpen}
 *   onClose={handleClose}
 *   title="Job Details"
 *   size="lg"
 *   fullHeightOnMobile={true}
 * >
 *   <div>Modal content here...</div>
 * </MobileOptimizedModal>
 * ```
 */
export function MobileOptimizedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
  showCloseButton = true,
  className,
  headerActions,
  fullHeightOnMobile = false,
  showHeader = true,
}: MobileOptimizedModalProps): JSX.Element | null {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dismissible, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && dismissible) {
        onClose();
      }
    },
    [dismissible, onClose]
  );

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Get size classes
  const getSizeClasses = () => {
    const baseClasses = 'w-full max-w-full mx-auto';

    switch (size) {
      case 'sm':
        return `${baseClasses} md:max-w-md`;
      case 'md':
        return `${baseClasses} md:max-w-lg`;
      case 'lg':
        return `${baseClasses} md:max-w-2xl`;
      case 'xl':
        return `${baseClasses} md:max-w-4xl`;
      case 'full':
        return 'w-full h-full max-w-none';
      default:
        return `${baseClasses} md:max-w-lg`;
    }
  };

  // Get height classes
  const getHeightClasses = () => {
    if (size === 'full') return 'h-full';
    if (fullHeightOnMobile) {
      return 'h-full md:h-auto md:max-h-[90vh]';
    }
    return 'max-h-[90vh] md:max-h-[80vh]';
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4',
        'bg-black/50 backdrop-blur-sm',
        'transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className={cn(
          'relative flex flex-col bg-background shadow-xl',
          'transition-all duration-200 ease-out',
          'md:rounded-lg md:border',
          getSizeClasses(),
          getHeightClasses(),
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0 md:translate-y-0',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton || headerActions) && (
          <div className="flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:p-6">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="truncate font-semibold text-foreground text-lg md:text-xl"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 line-clamp-2 text-muted-foreground text-sm"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Header Actions */}
            {headerActions && <div className="ml-4 flex items-center gap-2">{headerActions}</div>}

            {/* Close Button */}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2 h-10 w-10 shrink-0 touch-manipulation p-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4 md:p-6">{children}</div>
        </ScrollArea>

        {/* Footer */}
        {footer && (
          <>
            <Separator />
            <div className="bg-muted/30 p-4 md:p-6">{footer}</div>
          </>
        )}

        {/* Safe area padding for mobile devices */}
        <div className="h-safe-area-inset-bottom md:hidden" />
      </div>
    </div>
  );
}

/**
 * Mobile Modal Hook
 * Provides state management for mobile modals
 */
export function useMobileModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

export default MobileOptimizedModal;
