'use client';

import { Briefcase, Building, GraduationCap, MapPin, Target } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
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

export interface TypeformSalaryQueryProps {
  onSubmitAction: (data: SalaryQueryFormData) => void;
  loading?: boolean;
  initialData?: Partial<SalaryQueryFormData>;
  className?: string;
}

// Form validation errors type
type FormErrors = Partial<Record<keyof SalaryQueryFormData, string>>;

// Step configuration
interface FormStep {
  id: keyof SalaryQueryFormData;
  title: string;
  subtitle: string;
  type: 'input' | 'select' | 'slider';
  placeholder?: string;
  options?: Array<{ value: string; label: string; emoji?: string }>;
  validation: (value: string) => string | null;
  icon?: React.ComponentType<{ className?: string | undefined }>;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// Industry options with emojis
const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'manufacturing', label: 'Manufacturing', emoji: '🏭' },
  { value: 'retail', label: 'Retail', emoji: '🛍️' },
  { value: 'consulting', label: 'Consulting', emoji: '💼' },
  { value: 'media', label: 'Media & Entertainment', emoji: '🎬' },
  { value: 'government', label: 'Government', emoji: '🏛️' },
  { value: 'nonprofit', label: 'Non-Profit', emoji: '❤️' },
  { value: 'other', label: 'Other', emoji: '🔧' },
];

// Region options with emojis
const REGION_OPTIONS = [
  { value: 'north-america', label: 'North America', emoji: '🇺🇸' },
  { value: 'europe', label: 'Europe', emoji: '🇪🇺' },
  { value: 'asia-pacific', label: 'Asia Pacific', emoji: '🌏' },
  { value: 'latin-america', label: 'Latin America', emoji: '🌎' },
  { value: 'middle-east-africa', label: 'Middle East & Africa', emoji: '🌍' },
];

// Experience options with emojis
const EXPERIENCE_OPTIONS = [
  { value: 'entry-level', label: 'Entry Level (0-2 years)', emoji: '🌱' },
  { value: 'mid-level', label: 'Mid Level (3-5 years)', emoji: '🌿' },
  { value: 'senior-level', label: 'Senior Level (6-10 years)', emoji: '🌳' },
  { value: 'executive-level', label: 'Executive Level (10+ years)', emoji: '🦅' },
];

// Education options with emojis
const EDUCATION_OPTIONS = [
  { value: 'high-school', label: 'High School', emoji: '📚' },
  { value: 'associate', label: 'Associate Degree', emoji: '📖' },
  { value: 'bachelor', label: "Bachelor's Degree", emoji: '🎓' },
  { value: 'master', label: "Master's Degree", emoji: '👨‍🎓' },
  { value: 'doctorate', label: 'Doctorate', emoji: '👨‍🔬' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

// Company size options with emojis
const COMPANY_SIZE_OPTIONS = [
  { value: 'startup', label: 'Startup (1-50 employees)', emoji: '🚀' },
  { value: 'small', label: 'Small (51-200 employees)', emoji: '🏢' },
  { value: 'medium', label: 'Medium (201-1000 employees)', emoji: '🏬' },
  { value: 'large', label: 'Large (1001-5000 employees)', emoji: '🏭' },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)', emoji: '🌆' },
];

// Color scheme configurations
const COLOR_SCHEMES = {
  blue: {
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    accent: 'border-blue-400 bg-blue-500/20 shadow-blue-500/25',
    button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    text: 'text-blue-100',
    ring: 'focus:ring-blue-400',
  },
  green: {
    gradient: 'from-emerald-600 via-green-700 to-teal-800',
    accent: 'border-emerald-400 bg-emerald-500/20 shadow-emerald-500/25',
    button:
      'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
    text: 'text-emerald-100',
    ring: 'focus:ring-emerald-400',
  },
  purple: {
    gradient: 'from-purple-600 via-violet-700 to-indigo-800',
    accent: 'border-purple-400 bg-purple-500/20 shadow-purple-500/25',
    button:
      'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    text: 'text-purple-100',
    ring: 'focus:ring-purple-400',
  },
  orange: {
    gradient: 'from-orange-600 via-red-600 to-pink-700',
    accent: 'border-orange-400 bg-orange-500/20 shadow-orange-500/25',
    button: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    text: 'text-orange-100',
    ring: 'focus:ring-orange-400',
  },
  pink: {
    gradient: 'from-pink-600 via-rose-700 to-red-800',
    accent: 'border-pink-400 bg-pink-500/20 shadow-pink-500/25',
    button: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
    text: 'text-pink-100',
    ring: 'focus:ring-pink-400',
  },
  indigo: {
    gradient: 'from-indigo-600 via-blue-700 to-purple-800',
    accent: 'border-indigo-400 bg-indigo-500/20 shadow-indigo-500/25',
    button: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
    text: 'text-indigo-100',
    ring: 'focus:ring-indigo-400',
  },
};

// Form steps configuration with enhanced visual design
const FORM_STEPS: FormStep[] = [
  {
    id: 'jobTitle',
    title: "What's your job title?",
    subtitle: 'Tell us about your role to get accurate salary data',
    type: 'input',
    placeholder: 'e.g., Software Engineer, Marketing Manager, Data Scientist',
    icon: Briefcase,
    colorScheme: 'blue',
    validation: (value: string) => {
      if (!value.trim()) return 'Job title is required';
      if (value.length > 100) return 'Job title must be less than 100 characters';
      return null;
    },
  },
  {
    id: 'industry',
    title: 'Which industry do you work in?',
    subtitle: 'Select the industry that best matches your field',
    type: 'select',
    options: INDUSTRY_OPTIONS,
    icon: Target,
    colorScheme: 'green',
    validation: (value: string) => (!value ? 'Please select an industry' : null),
  },
  {
    id: 'region',
    title: 'Where are you located?',
    subtitle: 'Choose your geographic region for location-based salary insights',
    type: 'select',
    options: REGION_OPTIONS,
    icon: MapPin,
    colorScheme: 'purple',
    validation: (value: string) => (!value ? 'Please select a region' : null),
  },
  {
    id: 'experience',
    title: "What's your experience level?",
    subtitle: 'This helps us provide more accurate salary ranges',
    type: 'select',
    options: EXPERIENCE_OPTIONS,
    icon: GraduationCap,
    colorScheme: 'orange',
    validation: (value: string) => (!value ? 'Please select your experience level' : null),
  },
  {
    id: 'education',
    title: "What's your education level?",
    subtitle: 'Education can impact salary expectations in many fields',
    type: 'select',
    options: EDUCATION_OPTIONS,
    icon: GraduationCap,
    colorScheme: 'pink',
    validation: (value: string) => (!value ? 'Please select your education level' : null),
  },
  {
    id: 'companySize',
    title: 'What size company do you work for?',
    subtitle: 'Company size often correlates with compensation packages',
    type: 'select',
    options: COMPANY_SIZE_OPTIONS,
    icon: Building,
    colorScheme: 'indigo',
    validation: (value: string) => (!value ? 'Please select company size' : null),
  },
];

// Progress indicator component with enhanced animations
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  colorScheme: keyof typeof COLOR_SCHEMES;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  colorScheme,
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const scheme = COLOR_SCHEMES[colorScheme];

  return (
    <div className="relative bg-black/10 backdrop-blur-sm">
      <div className="h-2 bg-white/10">
        <div
          className={`h-2 bg-gradient-to-r ${scheme.button} shadow-lg transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="absolute top-2 right-4 font-medium text-white/70 text-xs">
        {currentStep + 1} / {totalSteps}
      </div>
    </div>
  );
};

// Step navigation component with enhanced styling
interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLoading?: boolean;
  colorScheme: keyof typeof COLOR_SCHEMES;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext,
  isLoading,
  colorScheme,
}) => {
  const scheme = COLOR_SCHEMES[colorScheme];

  return (
    <div className="mt-12 flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="group flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white/70 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg
          className="group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i <= currentStep ? `bg-gradient-to-r ${scheme.button} shadow-lg` : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className={`group relative overflow-hidden rounded-xl px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${scheme.button} shadow-lg hover:shadow-xl`}
      >
        <div className="absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
        <div className="relative flex items-center">
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Searching...
            </>
          ) : currentStep === totalSteps - 1 ? (
            <>
              Get Results
              <svg
                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5-5 5M6 12h12"
                />
              </svg>
            </>
          ) : (
            <>
              Next
              <svg
                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

// Input step component with enhanced styling and icons
interface InputStepProps {
  step: FormStep;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  isVisible: boolean;
}

const InputStep: React.FC<InputStepProps> = ({ step, value, onChange, error, isVisible }) => {
  const inputId = useId();
  const scheme = COLOR_SCHEMES[step.colorScheme];
  const IconComponent = step.icon;

  useEffect(() => {
    if (isVisible) {
      const input = document.getElementById(inputId);
      if (input) {
        setTimeout(() => input.focus(), 300);
      }
    }
  }, [isVisible, inputId]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'
      }`}
    >
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          {IconComponent && (
            <div
              className={`inline-flex rounded-2xl bg-gradient-to-br p-4 ${scheme.gradient} shadow-2xl`}
            >
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="space-y-3">
            <h2 className="animate-fadeIn font-bold text-4xl text-white leading-tight md:text-5xl">
              {step.title}
            </h2>
            <p className="mx-auto max-w-lg text-white/80 text-xl leading-relaxed">
              {step.subtitle}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-md space-y-4">
          <div className="group relative">
            <input
              id={inputId}
              type="text"
              placeholder={step.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full rounded-2xl border-2 border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:scale-105 focus:shadow-2xl focus:outline-none ${
                error
                  ? 'border-red-400 bg-red-500/10'
                  : `focus:border-white/60 ${scheme.ring} focus:bg-white/20`
              }`}
              autoComplete="off"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          {error && (
            <div className="flex animate-pulse items-center space-x-2 font-medium text-red-300 text-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Select step component with enhanced styling and animations
interface SelectStepProps {
  step: FormStep;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  isVisible: boolean;
}

const SelectStep: React.FC<SelectStepProps> = ({ step, value, onChange, error, isVisible }) => {
  const scheme = COLOR_SCHEMES[step.colorScheme];
  const IconComponent = step.icon;

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'
      }`}
    >
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          {IconComponent && (
            <div
              className={`inline-flex rounded-2xl bg-gradient-to-br p-4 ${scheme.gradient} shadow-2xl`}
            >
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="space-y-3">
            <h2 className="animate-fadeIn font-bold text-4xl text-white leading-tight md:text-5xl">
              {step.title}
            </h2>
            <p className="mx-auto max-w-lg text-white/80 text-xl leading-relaxed">
              {step.subtitle}
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {step.options?.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`group relative transform-gpu rounded-2xl border-2 p-4 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl md:p-5 ${
                value === option.value
                  ? `${scheme.accent} scale-[1.02] shadow-2xl`
                  : 'border-white/20 bg-white/5 backdrop-blur-sm hover:border-white/40 hover:bg-white/10'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isVisible ? 'fadeIn 0.6s ease-out forwards' : 'none',
              }}
            >
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="transform text-2xl transition-transform duration-300 group-hover:scale-110 md:text-3xl">
                  {option.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-white leading-tight md:text-xl">
                    {option.label}
                  </div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                    value === option.value
                      ? 'border-white bg-white shadow-lg'
                      : 'border-white/40 group-hover:scale-110 group-hover:border-white/70'
                  }`}
                >
                  {value === option.value && (
                    <div
                      className={`h-full w-full rounded-full bg-gradient-to-br ${scheme.gradient} scale-75 shadow-inner`}
                    />
                  )}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Selection glow effect */}
              {value === option.value && (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${scheme.gradient} animate-pulse opacity-10`}
                />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-auto flex max-w-md animate-pulse items-center justify-center space-x-2 font-medium text-red-300 text-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Typeform component
export const TypeformSalaryQuery: React.FC<TypeformSalaryQueryProps> = ({
  onSubmitAction,
  loading = false,
  initialData = {},
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SalaryQueryFormData>({
    jobTitle: initialData.jobTitle || '',
    industry: initialData.industry || '',
    region: initialData.region || '',
    experience: initialData.experience || '',
    education: initialData.education || '',
    companySize: initialData.companySize || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepConfig = FORM_STEPS[currentStep];

  const handleInputChange = useCallback(
    (field: keyof SalaryQueryFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStepConfig) return false;

    const currentValue = formData[currentStepConfig.id];
    const error = currentStepConfig.validation(currentValue);

    if (error) {
      setErrors((prev) => ({ ...prev, [currentStepConfig.id]: error }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [currentStepConfig.id]: undefined }));
    return true;
  }, [currentStepConfig, formData]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep() || isAnimating) return;

    if (currentStep === FORM_STEPS.length - 1) {
      // Final step - submit form
      try {
        salaryQuerySchema.parse(formData);
        onSubmitAction(formData);
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
      }
    } else {
      // Move to next step
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, validateCurrentStep, isAnimating, formData, onSubmitAction]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, isAnimating]);

  const canGoNext = currentStepConfig ? formData[currentStepConfig.id].trim() !== '' : false;

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canGoNext && !loading) {
        handleNext();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [canGoNext, handleNext, loading]);

  return (
    <div
      className={`relative flex flex-col bg-gradient-to-br from-slate-900 via-blue-900/50 to-indigo-900/30 ${className}`}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
        colorScheme={currentStepConfig?.colorScheme || 'blue'}
      />

      <div className="container mx-auto flex-1 px-4 py-8 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[50vh] flex-col justify-center">
            {currentStepConfig ? (
              currentStepConfig.type === 'input' ? (
                <InputStep
                  step={currentStepConfig}
                  value={formData[currentStepConfig.id]}
                  onChange={(value) => handleInputChange(currentStepConfig.id, value)}
                  error={errors[currentStepConfig.id]}
                  isVisible={!isAnimating}
                />
              ) : (
                <SelectStep
                  step={currentStepConfig}
                  value={formData[currentStepConfig.id]}
                  onChange={(value) => handleInputChange(currentStepConfig.id, value)}
                  error={errors[currentStepConfig.id]}
                  isVisible={!isAnimating}
                />
              )
            ) : (
              <div className="text-center text-white">Loading...</div>
            )}
          </div>

          <StepNavigation
            currentStep={currentStep}
            totalSteps={FORM_STEPS.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoNext={canGoNext}
            isLoading={loading}
            colorScheme={currentStepConfig?.colorScheme || 'blue'}
          />
        </div>
      </div>

      {/* Floating help text */}
      <div className="absolute bottom-4 left-4 hidden text-sm text-white/60 md:block">
        Press <kbd className="rounded bg-white/10 px-2 py-1 text-xs">Enter</kbd> to continue
      </div>
    </div>
  );
};

export default TypeformSalaryQuery;
