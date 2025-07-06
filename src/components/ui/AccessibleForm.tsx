/**
 * Accessible Form Components with DaisyUI integration
 * Provides comprehensive form accessibility features
 */

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { useAccessibleForm } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';

// Base form field props
interface BaseFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
  inputClassName?: string;
}

// Input Field Component
export interface AccessibleInputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseFieldProps {
  required?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className,
      labelClassName,
      inputClassName,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const fieldId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn('form-control w-full', className)}>
        <label htmlFor={fieldId} className={cn('label', labelClassName)}>
          <span className="label-text">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="required">
                *
              </span>
            )}
          </span>
        </label>

        <input
          ref={ref}
          id={fieldId}
          name={name}
          className={cn(
            'input input-bordered w-full',
            {
              'input-error': error,
            },
            inputClassName
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(error && errorId, helperText && helperId).trim() || undefined}
          aria-required={required}
          {...props}
        />

        {helperText && (
          <div id={helperId} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}

        {error && (
          <div id={errorId} className="label" role="alert" aria-live="polite">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Textarea Field Component
export interface AccessibleTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {
  required?: boolean;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className,
      labelClassName,
      inputClassName,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const fieldId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn('form-control w-full', className)}>
        <label htmlFor={fieldId} className={cn('label', labelClassName)}>
          <span className="label-text">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="required">
                *
              </span>
            )}
          </span>
        </label>

        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          className={cn(
            'textarea textarea-bordered w-full',
            {
              'textarea-error': error,
            },
            inputClassName
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(error && errorId, helperText && helperId).trim() || undefined}
          aria-required={required}
          {...props}
        />

        {helperText && (
          <div id={helperId} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}

        {error && (
          <div id={errorId} className="label" role="alert" aria-live="polite">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Select Field Component
export interface AccessibleSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    BaseFieldProps {
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className,
      labelClassName,
      inputClassName,
      id,
      name,
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const fieldId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn('form-control w-full', className)}>
        <label htmlFor={fieldId} className={cn('label', labelClassName)}>
          <span className="label-text">
            {label}
            {required && (
              <span className="ml-1 text-error" aria-label="required">
                *
              </span>
            )}
          </span>
        </label>

        <select
          ref={ref}
          id={fieldId}
          name={name}
          className={cn(
            'select select-bordered w-full',
            {
              'select-error': error,
            },
            inputClassName
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(error && errorId, helperText && helperId).trim() || undefined}
          aria-required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {helperText && (
          <div id={helperId} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}

        {error && (
          <div id={errorId} className="label" role="alert" aria-live="polite">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Checkbox Component
export interface AccessibleCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ label, error, helperText, className, labelClassName, id, name, ...props }, ref) => {
    const fieldId = id || name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn('form-control', className)}>
        <label className={cn('label cursor-pointer justify-start gap-3', labelClassName)}>
          <input
            ref={ref}
            type="checkbox"
            id={fieldId}
            name={name}
            className={cn('checkbox', {
              'checkbox-error': error,
            })}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(error && errorId, helperText && helperId).trim() || undefined}
            {...props}
          />

          <span className="label-text">{label}</span>
        </label>

        {helperText && (
          <div id={helperId} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}

        {error && (
          <div id={errorId} className="label" role="alert" aria-live="polite">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// Radio Group Component
export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AccessibleRadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

export function AccessibleRadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  className,
  labelClassName,
}: AccessibleRadioGroupProps) {
  const groupId = `radio-group-${name}`;
  const errorId = `${groupId}-error`;
  const helperId = `${groupId}-helper`;

  return (
    <div className={cn('form-control', className)}>
      <fieldset>
        <legend className={cn('label-text mb-2 font-medium', labelClassName)}>
          {label}
          {required && (
            <span className="ml-1 text-error" aria-label="required">
              *
            </span>
          )}
        </legend>

        <div
          role="radiogroup"
          aria-labelledby={groupId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(error && errorId, helperText && helperId).trim() || undefined}
          aria-required={required}
          className="space-y-2"
        >
          {options.map((option) => (
            <label key={option.value} className="label cursor-pointer justify-start gap-3">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={cn('radio', {
                  'radio-error': error,
                })}
              />

              <span className="label-text">{option.label}</span>
            </label>
          ))}
        </div>

        {helperText && (
          <div id={helperId} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}

        {error && (
          <div id={errorId} className="label" role="alert" aria-live="polite">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </fieldset>
    </div>
  );
}

// Form validation hook integration
export function useFormValidation() {
  return useAccessibleForm();
}
