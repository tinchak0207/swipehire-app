'use client';

import type React from 'react';
import { useCallback, useId, useState } from 'react';
import { z } from 'zod';

// Define the form schema for validation
const salaryQuerySchema = z.object({
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title must be less than 100 characters'),
  industry: z.string().min(1, 'Industry is required'),
  region: z.string().min(1, 'Region is required'),
  experience: z.string().min(1, 'Experience level is required'),
  education: z.string().min(1, 'Education level is required'),
  companySize: z.string().min(1, 'Company size is required'),
});

// TypeScript interfaces
export interface SalaryQueryFormData {
  jobTitle: string;
  industry: string;
  region: string;
  experience: string;
  education: string;
  companySize: string;
}

export interface SalaryQueryFormProps {
  onSubmitAction: (data: SalaryQueryFormData) => void;
  loading?: boolean;
  initialData?: Partial<SalaryQueryFormData>;
}

// Form validation errors type
type FormErrors = Partial<Record<keyof SalaryQueryFormData, string>>;

// Industry options
const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select Industry' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' },
];

// Region options
const REGION_OPTIONS = [
  { value: '', label: 'Select Region' },
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia Pacific' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'middle-east-africa', label: 'Middle East & Africa' },
];

// Experience options
const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select Experience Level' },
  { value: 'entry-level', label: 'Entry Level (0-2 years)' },
  { value: 'mid-level', label: 'Mid Level (3-5 years)' },
  { value: 'senior-level', label: 'Senior Level (6-10 years)' },
  { value: 'executive-level', label: 'Executive Level (10+ years)' },
];

// Education options
const EDUCATION_OPTIONS = [
  { value: '', label: 'Select Education Level' },
  { value: 'high-school', label: 'High School' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'other', label: 'Other' },
];

// Company size options
const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Select Company Size' },
  { value: 'startup', label: 'Startup (1-50 employees)' },
  { value: 'small', label: 'Small (51-200 employees)' },
  { value: 'medium', label: 'Medium (201-1000 employees)' },
  { value: 'large', label: 'Large (1001-5000 employees)' },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)' },
];

// Form field component for better organization
interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, required = false, error, children }) => (
  <div className="form-control">
    <label htmlFor={id} className="label">
      <span className="label-text font-medium text-white">
        {label}
        {required && <span className="text-error"> *</span>}
      </span>
    </label>
    {children}
    {error && (
      <div className="label" id={`${id}-error`}>
        <span className="label-text-alt text-error">{error}</span>
      </div>
    )}
  </div>
);

// Select field component
interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  error?: string | undefined;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  value,
  onChange,
  options,
  disabled,
  error,
}) => (
  <select
    id={id}
    className={`select select-bordered w-full bg-base-100 text-white ${error ? 'select-error' : ''}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    aria-describedby={error ? `${id}-error` : undefined}
    aria-invalid={!!error}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value} className="bg-base-100 text-white">
        {option.label}
      </option>
    ))}
  </select>
);

// Custom hook for form logic
const useFormLogic = (
  initialData: Partial<SalaryQueryFormData>,
  onSubmitAction: (data: SalaryQueryFormData) => void
) => {
  const [formData, setFormData] = useState<SalaryQueryFormData>({
    jobTitle: initialData.jobTitle || '',
    industry: initialData.industry || '',
    region: initialData.region || '',
    experience: initialData.experience || '',
    education: initialData.education || '',
    companySize: initialData.companySize || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = useCallback(
    (field: keyof SalaryQueryFormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    try {
      salaryQuerySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SalaryQueryFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmitAction(formData);
      }
    },
    [formData, validateForm, onSubmitAction]
  );

  const handleReset = useCallback(() => {
    setFormData({
      jobTitle: '',
      industry: '',
      region: '',
      experience: '',
      education: '',
      companySize: '',
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    handleReset,
  };
};

export const SalaryQueryForm: React.FC<SalaryQueryFormProps> = ({
  onSubmitAction,
  loading = false,
  initialData = {},
}) => {
  const formId = useId();
  const { formData, errors, handleInputChange, handleSubmit, handleReset } = useFormLogic(
    initialData,
    onSubmitAction
  );

  // Generate unique IDs for form fields
  const jobTitleId = `${formId}-jobTitle`;
  const industryId = `${formId}-industry`;
  const regionId = `${formId}-region`;
  const experienceId = `${formId}-experience`;
  const educationId = `${formId}-education`;
  const companySizeId = `${formId}-companySize`;
  const submitHelpId = `${formId}-submit-help`;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-6 text-2xl text-white">Salary Query Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Job Title Input */}
          <FormField id={jobTitleId} label="Job Title" required error={errors.jobTitle}>
            <input
              id={jobTitleId}
              type="text"
              placeholder="e.g., Software Engineer, Marketing Manager"
              className={`input input-bordered w-full bg-base-100 text-white placeholder-gray-400 ${errors.jobTitle ? 'input-error' : ''}`}
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              disabled={loading}
              aria-describedby={errors.jobTitle ? `${jobTitleId}-error` : undefined}
              aria-invalid={!!errors.jobTitle}
            />
          </FormField>

          {/* Industry Select */}
          <FormField id={industryId} label="Industry" required error={errors.industry}>
            <SelectField
              id={industryId}
              value={formData.industry}
              onChange={(value) => handleInputChange('industry', value)}
              options={INDUSTRY_OPTIONS}
              disabled={loading}
              error={errors.industry}
            />
          </FormField>

          {/* Region Select */}
          <FormField id={regionId} label="Region" required error={errors.region}>
            <SelectField
              id={regionId}
              value={formData.region}
              onChange={(value) => handleInputChange('region', value)}
              options={REGION_OPTIONS}
              disabled={loading}
              error={errors.region}
            />
          </FormField>

          {/* Experience Level Select */}
          <FormField id={experienceId} label="Experience Level" required error={errors.experience}>
            <SelectField
              id={experienceId}
              value={formData.experience}
              onChange={(value) => handleInputChange('experience', value)}
              options={EXPERIENCE_OPTIONS}
              disabled={loading}
              error={errors.experience}
            />
          </FormField>

          {/* Education Level Select */}
          <FormField id={educationId} label="Education Level" required error={errors.education}>
            <SelectField
              id={educationId}
              value={formData.education}
              onChange={(value) => handleInputChange('education', value)}
              options={EDUCATION_OPTIONS}
              disabled={loading}
              error={errors.education}
            />
          </FormField>

          {/* Company Size Select */}
          <FormField id={companySizeId} label="Company Size" required error={errors.companySize}>
            <SelectField
              id={companySizeId}
              value={formData.companySize}
              onChange={(value) => handleInputChange('companySize', value)}
              options={COMPANY_SIZE_OPTIONS}
              disabled={loading}
              error={errors.companySize}
            />
          </FormField>

          {/* Form Actions */}
          <div className="card-actions justify-end gap-4 pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
              aria-describedby={submitHelpId}
            >
              {loading ? 'Searching...' : 'Search Salaries'}
            </button>
          </div>

          <div id={submitHelpId} className="mt-2 text-sm text-white">
            All fields marked with * are required
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryQueryForm;
