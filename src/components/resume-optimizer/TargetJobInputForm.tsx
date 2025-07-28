'use client';

import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import type { TargetJobInfo } from '@/lib/types/resume-optimizer';

/**
 * Form data interface for target job input
 */
export interface TargetJobFormData {
  title: string;
  keywords: string;
  company?: string;
  description?: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Component props interface
 */
export interface TargetJobInputFormProps {
  /** Initial form data */
  initialData?: Partial<TargetJobFormData>;
  /** Callback when form data changes */
  onChange?: (data: TargetJobFormData, isValid: boolean) => void;
  /** Callback when form is submitted */
  onSubmit?: (data: TargetJobFormData) => void;
  /** Whether the form is in loading state */
  isLoading?: boolean;
  /** Whether to show submit button */
  showSubmitButton?: boolean;
  /** Submit button text */
  submitButtonText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Custom validation function */
  customValidation?: (data: TargetJobFormData) => ValidationResult;
}

/**
 * Validates the target job form data
 */
const validateFormData = (data: TargetJobFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate job title
  if (!data.title.trim()) {
    errors['title'] = 'Job title is required';
  } else if (data.title.trim().length < 2) {
    errors['title'] = 'Job title must be at least 2 characters long';
  } else if (data.title.trim().length > 100) {
    errors['title'] = 'Job title must be less than 100 characters';
  }

  // Validate keywords (optional but if provided, should be meaningful)
  if (data.keywords.trim() && data.keywords.trim().length < 3) {
    errors['keywords'] = 'Keywords must be at least 3 characters long';
  } else if (data.keywords.length > 500) {
    errors['keywords'] = 'Keywords must be less than 500 characters';
  }

  // Validate company (optional)
  if (data.company && data.company.trim().length > 100) {
    errors['company'] = 'Company name must be less than 100 characters';
  }

  // Validate description (optional)
  if (data.description && data.description.trim().length > 1000) {
    errors['description'] = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Parses keywords string into an array and formats them
 */
const parseKeywords = (keywordsString: string): string[] => {
  return keywordsString
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
};

/**
 * Target Job Input Form Component
 *
 * Provides input fields for users to specify target job information including:
 * - Job title (required)
 * - Keywords/skills (optional, comma-separated)
 * - Target company (optional)
 * - Job description (optional)
 */
export default function TargetJobInputForm({
  initialData = {},
  onChange,
  onSubmit,
  isLoading = false,
  showSubmitButton = false,
  submitButtonText = 'Continue',
  className = '',
  validateOnChange = true,
  customValidation,
}: TargetJobInputFormProps) {
  // Form state
  const [formData, setFormData] = useState<TargetJobFormData>({
    title: initialData.title || '',
    keywords: initialData.keywords || '',
    company: initialData.company || '',
    description: initialData.description || '',
  });

  // Validation state
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: {},
  });

  // Focus states for better UX
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Parsed keywords for display
  const [parsedKeywords, setParsedKeywords] = useState<string[]>([]);

  /**
   * Validates form data and updates validation state
   */
  const validateForm = useCallback(
    (data: TargetJobFormData): ValidationResult => {
      const result = customValidation ? customValidation(data) : validateFormData(data);
      setValidation(result);
      return result;
    },
    [customValidation]
  );

  /**
   * Handles input field changes
   */
  const handleInputChange = useCallback(
    (field: keyof TargetJobFormData, value: string) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);

      // Update parsed keywords if keywords field changed
      if (field === 'keywords') {
        setParsedKeywords(parseKeywords(value));
      }

      // Validate if enabled
      let validationResult = validation;
      if (validateOnChange) {
        validationResult = validateForm(newFormData);
      }

      // Notify parent component
      onChange?.(newFormData, validationResult.isValid);
    },
    [formData, validation, validateOnChange, validateForm, onChange]
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationResult = validateForm(formData);
      if (validationResult.isValid) {
        onSubmit?.(formData);
      }
    },
    [formData, validateForm, onSubmit]
  );

  /**
   * Handles focus events
   */
  const handleFocus = useCallback((field: string) => {
    setFocusedField(field);
  }, []);

  /**
   * Handles blur events
   */
  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Initialize validation on mount
  useEffect(() => {
    validateForm(formData);
    setParsedKeywords(parseKeywords(formData.keywords));
  }, [validateForm, formData]);

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title Field */}
        <div className="form-control">
          <label htmlFor="target-job-title" className="label">
            <span className="label-text flex items-center gap-2 font-semibold text-base">
              <BriefcaseIcon className="h-5 w-5 text-primary" />
              Target Job Title
              <span className="text-error">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              id="target-job-title"
              type="text"
              placeholder="e.g., Senior Software Engineer, Product Manager, Marketing Specialist"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onFocus={() => handleFocus('title')}
              onBlur={handleBlur}
              className={`input input-bordered w-full pr-10 transition-all duration-200 ${
                validation.errors['title']
                  ? 'input-error border-error focus:border-error'
                  : focusedField === 'title'
                    ? 'input-primary border-primary'
                    : 'focus:input-primary'
              }`}
              disabled={isLoading}
              required
              maxLength={100}
              aria-describedby={validation.errors['title'] ? 'title-error' : undefined}
            />
            {/* Status Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {validation.errors['title'] ? (
                <ExclamationCircleIcon className="h-5 w-5 text-error" />
              ) : formData.title.trim() ? (
                <CheckCircleIcon className="h-5 w-5 text-success" />
              ) : null}
            </div>
          </div>
          {/* Error Message */}
          {validation.errors['title'] && (
            <div className="label">
              <span id="title-error" className="label-text-alt flex items-center gap-1 text-error">
                <ExclamationCircleIcon className="h-4 w-4" />
                {validation.errors['title']}
              </span>
            </div>
          )}
          {/* Help Text */}
          {!validation.errors['title'] && focusedField === 'title' && (
            <div className="label">
              <span className="label-text-alt flex items-center gap-1 text-base-content/60">
                <InformationCircleIcon className="h-4 w-4" />
                Enter the exact job title you're targeting for better optimization
              </span>
            </div>
          )}
        </div>

        {/* Keywords Field */}
        <div className="form-control">
          <label htmlFor="target-job-keywords" className="label">
            <span className="label-text flex items-center gap-2 font-semibold text-base">
              <TagIcon className="h-5 w-5 text-secondary" />
              Key Skills & Keywords
            </span>
          </label>
          <div className="relative">
            <textarea
              id="target-job-keywords"
              placeholder="e.g., React, Node.js, TypeScript, AWS, Agile, Team Leadership, Project Management"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              onFocus={() => handleFocus('keywords')}
              onBlur={handleBlur}
              className={`textarea textarea-bordered h-24 w-full resize-none transition-all duration-200 ${
                validation.errors['keywords']
                  ? 'textarea-error border-error focus:border-error'
                  : focusedField === 'keywords'
                    ? 'textarea-secondary border-secondary'
                    : 'focus:textarea-secondary'
              }`}
              disabled={isLoading}
              maxLength={500}
              aria-describedby={validation.errors['keywords'] ? 'keywords-error' : undefined}
            />
          </div>

          {/* Keywords Preview */}
          {parsedKeywords.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {parsedKeywords.slice(0, 10).map((keyword, index) => (
                  <div key={index} className="badge badge-secondary badge-sm">
                    {keyword}
                  </div>
                ))}
                {parsedKeywords.length > 10 && (
                  <div className="badge badge-ghost badge-sm">
                    +{parsedKeywords.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {validation.errors['keywords'] && (
            <div className="label">
              <span
                id="keywords-error"
                className="label-text-alt flex items-center gap-1 text-error"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                {validation.errors['keywords']}
              </span>
            </div>
          )}

          {/* Help Text */}
          {!validation.errors['keywords'] && (
            <div className="label">
              <span className="label-text-alt flex items-center gap-1 text-base-content/60">
                <InformationCircleIcon className="h-4 w-4" />
                Separate multiple keywords with commas. Include technical skills, soft skills, and
                industry terms.
              </span>
            </div>
          )}
        </div>

        {/* Company Field */}
        <div className="form-control">
          <label htmlFor="target-job-company" className="label">
            <span className="label-text flex items-center gap-2 font-semibold text-base">
              <BuildingOfficeIcon className="h-5 w-5 text-accent" />
              Target Company (Optional)
            </span>
          </label>
          <div className="relative">
            <input
              id="target-job-company"
              type="text"
              placeholder="e.g., Google, Microsoft, Early-stage startup, Fortune 500"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              onFocus={() => handleFocus('company')}
              onBlur={handleBlur}
              className={`input input-bordered w-full pr-10 transition-all duration-200 ${
                validation.errors['company']
                  ? 'input-error border-error focus:border-error'
                  : focusedField === 'company'
                    ? 'input-accent border-accent'
                    : 'focus:input-accent'
              }`}
              disabled={isLoading}
              maxLength={100}
              aria-describedby={validation.errors['company'] ? 'company-error' : undefined}
            />
            {/* Status Icon */}
            {formData.company?.trim() && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <CheckCircleIcon className="h-5 w-5 text-success" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {validation.errors['company'] && (
            <div className="label">
              <span
                id="company-error"
                className="label-text-alt flex items-center gap-1 text-error"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                {validation.errors['company']}
              </span>
            </div>
          )}

          {/* Help Text */}
          {!validation.errors['company'] && focusedField === 'company' && (
            <div className="label">
              <span className="label-text-alt flex items-center gap-1 text-base-content/60">
                <InformationCircleIcon className="h-4 w-4" />
                Specify a company name or type (e.g., "startup", "enterprise") for targeted
                optimization
              </span>
            </div>
          )}
        </div>

        {/* Job Description Field */}
        <div className="form-control">
          <label htmlFor="target-job-description" className="label">
            <span className="label-text flex items-center gap-2 font-semibold text-base">
              <InformationCircleIcon className="h-5 w-5 text-info" />
              Job Description (Optional)
            </span>
          </label>
          <div className="relative">
            <textarea
              id="target-job-description"
              placeholder="Paste the job description here for more accurate optimization..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={() => handleFocus('description')}
              onBlur={handleBlur}
              className={`textarea textarea-bordered h-32 w-full resize-none transition-all duration-200 ${
                validation.errors['description']
                  ? 'textarea-error border-error focus:border-error'
                  : focusedField === 'description'
                    ? 'textarea-info border-info'
                    : 'focus:textarea-info'
              }`}
              disabled={isLoading}
              maxLength={1000}
              aria-describedby={validation.errors['description'] ? 'description-error' : undefined}
            />
          </div>

          {/* Character Count */}
          {formData.description && (
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.description.length}/1000 characters
              </span>
            </div>
          )}

          {/* Error Message */}
          {validation.errors['description'] && (
            <div className="label">
              <span
                id="description-error"
                className="label-text-alt flex items-center gap-1 text-error"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                {validation.errors['description']}
              </span>
            </div>
          )}

          {/* Help Text */}
          {!validation.errors['description'] && focusedField === 'description' && (
            <div className="label">
              <span className="label-text-alt flex items-center gap-1 text-base-content/60">
                <InformationCircleIcon className="h-4 w-4" />
                Including the job description helps our AI provide more targeted optimization
                suggestions
              </span>
            </div>
          )}
        </div>

        {/* Form Summary */}
        {(formData.title.trim() || parsedKeywords.length > 0) && (
          <div className="alert alert-info">
            <InformationCircleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Target Job Summary</h3>
              <div className="mt-1 text-sm">
                {formData.title.trim() && (
                  <p>
                    <strong>Position:</strong> {formData.title}
                  </p>
                )}
                {parsedKeywords.length > 0 && (
                  <p>
                    <strong>Key Skills:</strong> {parsedKeywords.slice(0, 5).join(', ')}
                    {parsedKeywords.length > 5 ? '...' : ''}
                  </p>
                )}
                {formData.company?.trim() && (
                  <p>
                    <strong>Target Company:</strong> {formData.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="form-control mt-8">
            <button
              type="submit"
              disabled={!validation.isValid || isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Processing...
                </>
              ) : (
                <>
                  {submitButtonText}
                  <BriefcaseIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Hook for managing target job form state
 */
export function useTargetJobForm(initialData?: Partial<TargetJobFormData>) {
  const [formData, setFormData] = useState<TargetJobFormData>({
    title: initialData?.title || '',
    keywords: initialData?.keywords || '',
    company: initialData?.company || '',
    description: initialData?.description || '',
  });

  const [isValid, setIsValid] = useState(false);

  const handleChange = useCallback((data: TargetJobFormData, valid: boolean) => {
    setFormData(data);
    setIsValid(valid);
  }, []);

  const reset = useCallback((newData?: Partial<TargetJobFormData>) => {
    setFormData({
      title: newData?.title || '',
      keywords: newData?.keywords || '',
      company: newData?.company || '',
      description: newData?.description || '',
    });
    setIsValid(false);
  }, []);

  const convertToTargetJobInfo = useCallback((): TargetJobInfo => {
    return {
      title: formData.title,
      keywords: formData.keywords,
      company: formData.company || '',
      description: formData.description || '',
    };
  }, [formData]);

  return {
    formData,
    isValid,
    handleChange,
    reset,
    convertToTargetJobInfo,
  };
}
