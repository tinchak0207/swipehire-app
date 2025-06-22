/**
 * Accessible Button Component with DaisyUI integration
 * Provides comprehensive accessibility features and performance optimizations
 */

import React, { type ButtonHTMLAttributes, forwardRef } from 'react';
import { useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';

export interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'ghost'
    | 'link'
    | 'outline'
    | 'error'
    | 'warning'
    | 'success'
    | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  announcement?: string;
  announcementDelay?: number;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'Loading...',
      leftIcon,
      rightIcon,
      fullWidth = false,
      announcement,
      announcementDelay = 100,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const announce = useScreenReaderAnnouncement();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }

      if (announcement) {
        setTimeout(() => {
          announce(announcement);
        }, announcementDelay);
      }

      onClick?.(event);
    };

    const getVariantClasses = () => {
      const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        ghost: 'btn-ghost',
        link: 'btn-link',
        outline: 'btn-outline',
        error: 'btn-error',
        warning: 'btn-warning',
        success: 'btn-success',
        info: 'btn-info',
      };
      return variants[variant];
    };

    const getSizeClasses = () => {
      const sizes = {
        xs: 'btn-xs',
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
      };
      return sizes[size];
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          getVariantClasses(),
          getSizeClasses(),
          {
            'btn-block': fullWidth,
            loading: loading,
            'btn-disabled': isDisabled,
          },
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        onClick={handleClick}
        {...props}
      >
        {loading && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}

        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span>{loading ? loadingText : children}</span>

        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen reader only loading indicator */}
        {loading && (
          <span className="sr-only" aria-live="polite">
            {loadingText}
          </span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export { AccessibleButton };
