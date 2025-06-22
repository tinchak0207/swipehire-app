/**
 * Advanced Form Builder Component
 * Provides dynamic form creation with drag-and-drop functionality
 * Built with DaisyUI components and TypeScript strict mode
 */

'use client';

import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AccessibleCheckbox,
  type AccessibleCheckboxProps,
  AccessibleInput,
  type AccessibleInputProps,
  AccessibleRadioGroup,
  AccessibleSelect,
  AccessibleTextarea,
  type AccessibleTextareaProps,
  type RadioOption,
} from './AccessibleForm';

// Form field types
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'file'
  | 'range'
  | 'color'
  | 'section'
  | 'divider';

// Base form field configuration
export interface FormFieldConfig {
  id: string;
  type: FormFieldType;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: unknown) => string | undefined;
  };
  conditional?: {
    dependsOn: string;
    value: unknown;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  multiple?: boolean;
  accept?: string; // for file inputs
  step?: number; // for number/range inputs
  rows?: number; // for textarea
}

// Form section configuration
export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: FormFieldConfig[];
}

// Complete form configuration
export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  sections: FormSectionConfig[];
  submitButtonText?: string;
  resetButtonText?: string;
  showProgress?: boolean;
  allowSaveAsDraft?: boolean;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Form data and validation state
export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form builder props
export interface FormBuilderProps {
  config: FormConfig;
  initialValues?: Record<string, unknown>;
  onSubmitAction: (values: Record<string, unknown>) => Promise<void> | void;
  onSaveAsDraft?: (values: Record<string, unknown>) => Promise<void> | void;
  onFieldChange?: (name: string, value: unknown) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  className?: string;
  readOnly?: boolean;
  showFieldTypes?: boolean;
  enableDragDrop?: boolean;
}

// Field type definitions for the builder palette
export const FIELD_TYPES: Array<{
  type: FormFieldType;
  label: string;
  icon: string;
  category: 'input' | 'selection' | 'layout';
  description: string;
}> = [
  {
    type: 'text',
    label: 'Text Input',
    icon: '📝',
    category: 'input',
    description: 'Single line text input',
  },
  {
    type: 'email',
    label: 'Email',
    icon: '📧',
    category: 'input',
    description: 'Email address input with validation',
  },
  {
    type: 'password',
    label: 'Password',
    icon: '🔒',
    category: 'input',
    description: 'Password input field',
  },
  {
    type: 'number',
    label: 'Number',
    icon: '🔢',
    category: 'input',
    description: 'Numeric input with validation',
  },
  { type: 'tel', label: 'Phone', icon: '📞', category: 'input', description: 'Phone number input' },
  { type: 'url', label: 'URL', icon: '🔗', category: 'input', description: 'Website URL input' },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: '📄',
    category: 'input',
    description: 'Multi-line text input',
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: '📋',
    category: 'selection',
    description: 'Dropdown selection list',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: '☑️',
    category: 'selection',
    description: 'Single checkbox option',
  },
  {
    type: 'radio',
    label: 'Radio Group',
    icon: '🔘',
    category: 'selection',
    description: 'Multiple choice selection',
  },
  { type: 'date', label: 'Date', icon: '📅', category: 'input', description: 'Date picker input' },
  { type: 'time', label: 'Time', icon: '⏰', category: 'input', description: 'Time picker input' },
  {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
    category: 'input',
    description: 'File upload input',
  },
  {
    type: 'range',
    label: 'Range Slider',
    icon: '🎚️',
    category: 'input',
    description: 'Range slider input',
  },
  {
    type: 'color',
    label: 'Color Picker',
    icon: '🎨',
    category: 'input',
    description: 'Color selection input',
  },
  {
    type: 'section',
    label: 'Section Header',
    icon: '📑',
    category: 'layout',
    description: 'Section divider with title',
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '➖',
    category: 'layout',
    description: 'Visual separator line',
  },
];

// Validation utilities
const validateField = (field: FormFieldConfig, value: unknown): string | undefined => {
  if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${field.label} is required`;
  }

  if (field.validation) {
    const { min, max, minLength, maxLength, pattern, custom } = field.validation;

    if (typeof value === 'string') {
      if (minLength && value.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }
      if (maxLength && value.length > maxLength) {
        return `${field.label} must be no more than ${maxLength} characters`;
      }
      if (pattern && !new RegExp(pattern).test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return `${field.label} must be at least ${min}`;
      }
      if (max !== undefined && value > max) {
        return `${field.label} must be no more than ${max}`;
      }
    }

    if (custom) {
      const customError = custom(value);
      if (customError) return customError;
    }
  }

  return undefined;
};

// Check if field should be visible based on conditional logic
const isFieldVisible = (field: FormFieldConfig, formValues: Record<string, unknown>): boolean => {
  if (!field.conditional) return true;

  const { dependsOn, value: expectedValue, operator } = field.conditional;
  const actualValue = formValues[dependsOn];

  switch (operator) {
    case 'equals':
      return actualValue === expectedValue;
    case 'not_equals':
      return actualValue !== expectedValue;
    case 'contains':
      return typeof actualValue === 'string' && typeof expectedValue === 'string'
        ? actualValue.includes(expectedValue)
        : false;
    case 'greater_than':
      return typeof actualValue === 'number' && typeof expectedValue === 'number'
        ? actualValue > expectedValue
        : false;
    case 'less_than':
      return typeof actualValue === 'number' && typeof expectedValue === 'number'
        ? actualValue < expectedValue
        : false;
    default:
      return true;
  }
};

// Individual field renderer component
const FormFieldRenderer: React.FC<{
  field: FormFieldConfig;
  value: unknown;
  error?: string | undefined;
  touched?: boolean | undefined;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  readOnly?: boolean;
  showFieldType?: boolean;
}> = ({
  field,
  value,
  error = '',
  touched = false,
  onChange,
  onBlur,
  readOnly = false,
  showFieldType = false,
}) => {
  const fieldId = `field-${field.id}`;
  const showError = touched && error;

  // Common props for all field types
  const commonProps = {
    id: fieldId,
    name: field.name,
    label: field.label,
    error: showError ? error : undefined,
    helperText: field.helperText,
    required: field.required,
    className: field.className,
    labelClassName: field.labelClassName,
    inputClassName: field.inputClassName,
    disabled: readOnly,
    onBlur,
  };

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <AccessibleTextarea
            {...(commonProps as AccessibleTextareaProps)}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <AccessibleSelect
            id={fieldId}
            name={field.name}
            label={field.label}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            options={field.options || []}
            placeholder={field.placeholder || ''}
            multiple={field.multiple || false}
            error={showError ? error || '' : ''}
            helperText={field.helperText || ''}
            required={field.required || false}
            className={field.className || ''}
            labelClassName={field.labelClassName || ''}
            inputClassName={field.inputClassName || ''}
            disabled={readOnly || false}
            onBlur={onBlur}
          />
        );

      case 'checkbox':
        return (
          <AccessibleCheckbox
            {...(commonProps as AccessibleCheckboxProps)}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        );

      case 'radio':
        return (
          <AccessibleRadioGroup
            name={field.name}
            label={field.label}
            value={(value as string) || ''}
            onChange={(newValue: string) => onChange(newValue)}
            options={(field.options || []) as RadioOption[]}
            error={showError ? error || '' : ''}
            helperText={field.helperText || ''}
            required={field.required || false}
            className={field.className || ''}
            labelClassName={field.labelClassName || ''}
          />
        );

      case 'file':
        return (
          <div className={cn('form-control w-full', field.className)}>
            <label htmlFor={fieldId} className={cn('label', field.labelClassName)}>
              <span className="label-text">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-error" aria-label="required">
                    *
                  </span>
                )}
              </span>
            </label>
            <input
              type="file"
              id={fieldId}
              name={field.name}
              className={cn(
                'file-input file-input-bordered w-full',
                { 'file-input-error': showError },
                field.inputClassName
              )}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              onBlur={onBlur}
              accept={field.accept}
              multiple={field.multiple}
              disabled={readOnly}
              aria-invalid={showError ? 'true' : 'false'}
              aria-describedby={showError ? `${fieldId}-error` : undefined}
            />
            {field.helperText && (
              <div className="label">
                <span className="label-text-alt text-base-content/70">{field.helperText}</span>
              </div>
            )}
            {showError && (
              <div id={`${fieldId}-error`} className="label" role="alert" aria-live="polite">
                <span className="label-text-alt text-error">{error}</span>
              </div>
            )}
          </div>
        );

      case 'range':
        return (
          <div className={cn('form-control w-full', field.className)}>
            <label htmlFor={fieldId} className={cn('label', field.labelClassName)}>
              <span className="label-text">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-error" aria-label="required">
                    *
                  </span>
                )}
              </span>
              <span className="label-text-alt">{String(value || 0)}</span>
            </label>
            <input
              type="range"
              id={fieldId}
              name={field.name}
              className={cn('range range-primary', field.inputClassName)}
              value={(value as number) || field.validation?.min || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              onBlur={onBlur}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.step || 1}
              disabled={readOnly}
            />
            {field.helperText && (
              <div className="label">
                <span className="label-text-alt text-base-content/70">{field.helperText}</span>
              </div>
            )}
          </div>
        );

      case 'section':
        return (
          <div className="divider">
            <h3 className="font-semibold text-base-content text-lg">{field.label}</h3>
          </div>
        );

      case 'divider':
        return <div className="divider" />;

      default:
        // Handle all other input types (text, email, password, number, etc.)
        return (
          <AccessibleInput
            {...(commonProps as AccessibleInputProps)}
            type={field.type as AccessibleInputProps['type']}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            step={field.step}
          />
        );
    }
  };

  return (
    <div className="group relative">
      {showFieldType && (
        <div className="-top-2 -right-2 absolute z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="badge badge-primary badge-xs">
            {FIELD_TYPES.find((ft) => ft.type === field.type)?.icon} {field.type}
          </div>
        </div>
      )}
      {renderField()}
    </div>
  );
};

// Main FormBuilder component
export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  initialValues = {},
  onSubmitAction,
  onSaveAsDraft,
  onFieldChange,
  onValidationChange,
  className,
  readOnly = false,
  showFieldTypes = false,
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
  });

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(config.sections.filter((s) => s.collapsed).map((s) => s.id))
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Validate all fields
  const validateForm = useCallback(
    (values: Record<string, unknown>): Record<string, string> => {
      const errors: Record<string, string> = {};

      config.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (isFieldVisible(field, values)) {
            const error = validateField(field, values[field.name]);
            if (error) {
              errors[field.name] = error;
            }
          }
        });
      });

      return errors;
    },
    [config]
  );

  // Handle field value changes
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [fieldName]: value };
        const newErrors = { ...prev.errors };

        // Validate field if validation mode is onChange
        if (config.validationMode === 'onChange') {
          const field = config.sections.flatMap((s) => s.fields).find((f) => f.name === fieldName);

          if (field && isFieldVisible(field, newValues)) {
            const error = validateField(field, value);
            if (error) {
              newErrors[fieldName] = error;
            } else {
              delete newErrors[fieldName];
            }
          }
        }

        const newState = {
          ...prev,
          values: newValues,
          errors: newErrors,
          isDirty: true,
        };

        // Notify parent of changes
        onFieldChange?.(fieldName, value);
        onValidationChange?.(Object.keys(newErrors).length === 0, newErrors);

        return newState;
      });
    },
    [config, onFieldChange, onValidationChange]
  );

  // Handle field blur events
  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setFormState((prev) => {
        const newTouched = { ...prev.touched, [fieldName]: true };
        const newErrors = { ...prev.errors };

        // Validate field if validation mode is onBlur
        if (config.validationMode === 'onBlur') {
          const field = config.sections.flatMap((s) => s.fields).find((f) => f.name === fieldName);

          if (field && isFieldVisible(field, prev.values)) {
            const error = validateField(field, prev.values[fieldName]);
            if (error) {
              newErrors[fieldName] = error;
            } else {
              delete newErrors[fieldName];
            }
          }
        }

        return {
          ...prev,
          touched: newTouched,
          errors: newErrors,
        };
      });
    },
    [config]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Validate all fields
      const errors = validateForm(formState.values);

      if (Object.keys(errors).length > 0) {
        setFormState((prev) => ({
          ...prev,
          errors,
          touched: Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
          isSubmitting: false,
        }));
        return;
      }

      await onSubmitAction(formState.values);

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        isDirty: false,
      }));
    } catch (error) {
      console.error('Form submission error:', error);
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    if (!onSaveAsDraft) return;

    try {
      await onSaveAsDraft(formState.values);
    } catch (error) {
      console.error('Save as draft error:', error);
    }
  };

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Calculate form progress
  const calculateProgress = (): number => {
    const allFields = config.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.type !== 'section' && f.type !== 'divider')
      .filter((f) => isFieldVisible(f, formState.values));

    const filledFields = allFields.filter((f) => {
      const value = formState.values[f.name];
      return value !== undefined && value !== null && value !== '';
    });

    return allFields.length > 0 ? (filledFields.length / allFields.length) * 100 : 0;
  };

  const progress = calculateProgress();

  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      {/* Form Header */}
      <div className="mb-6 rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 font-bold text-2xl text-gray-800">{config.title}</h1>
            {config.description && <p className="text-gray-600">{config.description}</p>}
          </div>
          {showFieldTypes && (
            <div className="badge badge-info">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Field Types Visible
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {config.showProgress && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-gray-700 text-sm">Form Progress</span>
              <span className="text-gray-500 text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <progress className="progress progress-primary w-full" value={progress} max="100" />
          </div>
        )}
      </div>

      {/* Form Content */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {config.sections.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);
          const visibleFields = section.fields.filter((field) =>
            isFieldVisible(field, formState.values)
          );

          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-sm"
            >
              {/* Section Header */}
              <div
                className={cn(
                  'border-gray-200/50 border-b p-6',
                  section.collapsible && 'cursor-pointer transition-colors hover:bg-gray-50/50'
                )}
                onClick={section.collapsible ? () => toggleSection(section.id) : undefined}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="mb-1 font-semibold text-gray-800 text-xl">{section.title}</h2>
                    {section.description && (
                      <p className="text-gray-600 text-sm">{section.description}</p>
                    )}
                  </div>
                  {section.collapsible && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle"
                      aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                      <svg
                        className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Section Content */}
              {!isCollapsed && (
                <div className="space-y-6 p-6">
                  {visibleFields.map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      value={formState.values[field.name]}
                      error={formState.errors[field.name]}
                      touched={formState.touched[field.name]}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      onBlur={() => handleFieldBlur(field.name)}
                      readOnly={readOnly}
                      showFieldType={showFieldTypes}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Form Actions */}
        {!readOnly && (
          <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className={cn('btn btn-primary', formState.isSubmitting && 'loading')}
                >
                  {formState.isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Submitting...
                    </>
                  ) : (
                    config.submitButtonText || 'Submit'
                  )}
                </button>

                {config.allowSaveAsDraft && onSaveAsDraft && (
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    className="btn btn-outline"
                    disabled={formState.isSubmitting}
                  >
                    Save as Draft
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => formRef.current?.reset()}
                  className="btn btn-ghost"
                  disabled={formState.isSubmitting}
                >
                  {config.resetButtonText || 'Reset'}
                </button>
              </div>

              {formState.isDirty && (
                <div className="flex items-center text-amber-600 text-sm">
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormBuilder;
