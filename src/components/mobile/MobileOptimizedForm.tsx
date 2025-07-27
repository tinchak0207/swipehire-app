'use client';

import { Eye, EyeOff, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Mobile Form Field Props
 */
interface MobileFormFieldProps {
  /** Field type */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'textarea'
    | 'select'
    | undefined;
  /** Field label */
  label: string;
  /** Field name/id */
  name: string;
  /** Field value */
  value: string | number;
  /** Change handler */
  onChange: (value: string | number) => void;
  /** Placeholder text */
  placeholder?: string | undefined;
  /** Whether field is required */
  required?: boolean | undefined;
  /** Whether field is disabled */
  disabled?: boolean | undefined;
  /** Error message */
  error?: string | undefined;
  /** Help text */
  helpText?: string | undefined;
  /** Options for select fields */
  options?: Array<{ value: string; label: string }> | undefined;
  /** Textarea rows */
  rows?: number | undefined;
  /** Input mode for mobile keyboards */
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search' | undefined;
  /** Auto-complete attribute */
  autoComplete?: string | undefined;
  /** Custom validation */
  validate?: ((value: string | number) => string | undefined) | undefined;
  /** Field icon */
  icon?: React.ElementType | undefined;
  /** Custom className */
  className?: string | undefined;
}

/**
 * Mobile Form Props
 */
interface MobileOptimizedFormProps {
  /** Form fields */
  fields: MobileFormFieldProps[];
  /** Form submission handler */
  onSubmit: (data: Record<string, string | number>) => void | Promise<void>;
  /** Submit button text */
  submitText?: string;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Additional form actions */
  actions?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Whether to show progress indicator */
  showProgress?: boolean;
  /** Current step (for multi-step forms) */
  currentStep?: number;
  /** Total steps */
  totalSteps?: number;
}

/**
 * Mobile-Optimized Form Field Component
 */
export function MobileFormField({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  options = [],
  rows = 4,
  inputMode,
  autoComplete,
  validate,
  icon: Icon,
  className,
}: MobileFormFieldProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Handle value change with validation
  const handleChange = useCallback(
    (newValue: string | number) => {
      onChange(newValue);

      // Run custom validation if provided
      if (validate) {
        validate(newValue);
        // You might want to handle validation errors here
      }
    },
    [onChange, validate]
  );

  // Handle password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Get input mode based on type
  const getInputMode = () => {
    if (inputMode) return inputMode;

    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'number':
        return 'numeric';
      case 'search':
        return 'search';
      default:
        return 'text';
    }
  };

  // Render input based on type
  const renderInput = () => {
    const baseProps = {
      id: name,
      name,
      value: value.toString(),
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => handleChange(type === 'number' ? Number(e.target.value) : e.target.value),
      placeholder,
      required,
      disabled,
      autoComplete,
      inputMode: getInputMode(),
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      className: cn(
        'h-12 text-base', // Larger for mobile
        'transition-all duration-200',
        error && 'border-destructive focus:border-destructive',
        isFocused && 'ring-2 ring-primary/20',
        Icon && 'pl-12',
        type === 'password' && 'pr-12'
      ),
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={rows}
            className={cn(baseProps.className, 'min-h-[96px] resize-none')}
          />
        );

      case 'select':
        return (
          <select
            {...baseProps}
            className={cn(
              baseProps.className,
              'appearance-none rounded-md border border-input bg-background px-3'
            )}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'password':
        return (
          <div className="relative">
            <Input {...baseProps} type={showPassword ? 'text' : 'password'} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePasswordVisibility}
              className="-translate-y-1/2 absolute top-1/2 right-1 h-10 w-10 transform p-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      default:
        return <Input {...baseProps} type={type} />;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <Label
        htmlFor={name}
        className={cn(
          'font-medium text-sm',
          required && "after:ml-1 after:text-destructive after:content-['*']",
          error && 'text-destructive'
        )}
      >
        {label}
      </Label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <Icon className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-muted-foreground" />
        )}

        {/* Input */}
        {renderInput()}
      </div>

      {/* Help Text */}
      {helpText && !error && <p className="text-muted-foreground text-xs">{helpText}</p>}

      {/* Error Message */}
      {error && (
        <p className="flex items-center gap-1 text-destructive text-xs">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Mobile-Optimized Form Component
 *
 * Provides a responsive, touch-friendly form optimized for mobile devices with:
 * - Large touch targets (minimum 44px)
 * - Appropriate input modes for mobile keyboards
 * - Smooth scrolling and focus management
 * - Progress indicators for multi-step forms
 * - Accessibility features
 * - Auto-complete support
 *
 * @example
 * ```tsx
 * <MobileOptimizedForm
 *   title="Contact Information"
 *   fields={[
 *     {
 *       type: 'text',
 *       label: 'Full Name',
 *       name: 'fullName',
 *       value: formData.fullName,
 *       onChange: (value) => setFormData(prev => ({ ...prev, fullName: value })),
 *       required: true,
 *       autoComplete: 'name'
 *     },
 *     {
 *       type: 'email',
 *       label: 'Email Address',
 *       name: 'email',
 *       value: formData.email,
 *       onChange: (value) => setFormData(prev => ({ ...prev, email: value })),
 *       required: true,
 *       autoComplete: 'email'
 *     }
 *   ]}
 *   onSubmit={handleSubmit}
 *   submitText="Save Information"
 * />
 * ```
 */
export function MobileOptimizedForm({
  fields,
  onSubmit,
  submitText = 'Submit',
  isSubmitting = false,
  title,
  description,
  actions,
  className,
  showProgress = false,
  currentStep = 1,
  totalSteps = 1,
}: MobileOptimizedFormProps): JSX.Element {
  const [formData, setFormData] = useState<Record<string, string | number>>(() => {
    const initialData: Record<string, string | number> = {};
    fields.forEach((field) => {
      initialData[field.name] = field.value || '';
    });
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle field change
  const handleFieldChange = useCallback(
    (name: string, value: string | number) => {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];

      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validate && value) {
        const validationError = field.validate(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }

      // Type-specific validation
      if (value && value.toString().trim() !== '') {
        switch (field.type) {
          case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.toString())) {
              newErrors[field.name] = 'Please enter a valid email address';
            }
            break;
          }

          case 'tel': {
            const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.toString().replace(/\s/g, ''))) {
              newErrors[field.name] = 'Please enter a valid phone number';
            }
            break;
          }

          case 'url':
            try {
              new URL(value.toString());
            } catch {
              newErrors[field.name] = 'Please enter a valid URL';
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        // Scroll to first error
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element?.focus();
        }
        return;
      }

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [validateForm, errors, onSubmit, formData]
  );

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
      {/* Header */}
      {(title || description || showProgress) && (
        <div className="space-y-4">
          {/* Progress Indicator */}
          {showProgress && totalSteps > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Title and Description */}
          {title && <h2 className="font-bold text-2xl text-foreground">{title}</h2>}

          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Form Fields */}
      <ScrollArea className="space-y-4">
        {fields.map((field) => (
          <MobileFormField
            key={field.name}
            {...field}
            value={formData[field.name] || ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
          />
        ))}
      </ScrollArea>

      {/* Actions */}
      <div className="space-y-4 pt-4">
        {/* Custom Actions */}
        {actions}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full touch-manipulation font-medium text-base"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </Button>
      </div>
    </form>
  );
}

export default MobileOptimizedForm;
