'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type {
  Availability,
  BackendUser,
  CompanyScale,
  EducationLevel,
  LocationPreference,
  UserRole,
  WorkExperienceLevel,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import CompletionStep from './steps/CompletionStep';
import GoalSettingStep from './steps/GoalSettingStep';
import PreferencesStep from './steps/PreferencesStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import WelcomeStep from './steps/WelcomeStep';

const steps = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'profile', title: 'Profile Setup' },
  { id: 'goals', title: 'Set Goals' },
  { id: 'preferences', title: 'Preferences' },
  { id: 'completion', title: 'All Set!' },
];

const formVariant: any = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'ease-in' } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.4, ease: 'ease-out' } },
};

export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  location: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
});

export const experienceSchema = z.object({
  experiences: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
});

export const educationSchema = z.object({
  educations: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    graduationYear: z.string().optional(),
  })),
});

export const skillsSchema = z.object({
  skills: z.array(z.string()),
  interests: z.array(z.string()),
});

export type WizardData = z.infer<typeof personalInfoSchema> &
  z.infer<typeof experienceSchema> &
  z.infer<typeof educationSchema> &
  z.infer<typeof skillsSchema> & {
    role?: UserRole | null;
    headline?: string;
    experienceSummary?: string;
    workExperienceLevel?: WorkExperienceLevel;
    educationLevel?: EducationLevel;
    locationPreference?: LocationPreference;
    availability?: Availability;
    desiredWorkStyle?: string;
    salaryExpectationMin?: number;
    salaryExpectationMax?: number;
    companyName?: string;
    companyIndustry?: string;
    companyScale?: CompanyScale;
    companyDescription?: string;
    companyCultureHighlights?: string[];
    companyNeeds?: string;
    goals?: {
      jobSearchStatus?: string;
      targetRoles?: string[];
      workModels?: string[];
    };
    preferences?: {
      theme?: 'light' | 'dark' | 'system';
      notificationChannels?: Record<string, boolean>;
      notificationSubscriptions?: Record<string, boolean>;
    };
  };

interface WizardContainerProps {
  onCompleteAction: () => void;
  onSkipAction: () => void;
  returnTo?: string | null;
}

export function WizardContainer({ onCompleteAction, onSkipAction }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<WizardData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser, updateFullBackendUserFields } = useUserPreferences();

  const methods = useForm();

  const { trigger, getValues, reset } = methods;

  useEffect(() => {
    if (fullBackendUser) {
      const initialData: Partial<WizardData> = {
        role: fullBackendUser.selectedRole,
        name: fullBackendUser.name,
        // Map other fields as necessary
      };
      reset(initialData); // Reset form with user data
      setFormData(initialData);
    }
  }, [fullBackendUser, reset]);

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      const values = getValues();
      const newFormData = { ...formData, ...values };
      setFormData(newFormData);

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    toast({ title: 'Saving Profile', description: 'Please wait while we update your profile.' });

    if (!mongoDbUserId) {
      toast({
        title: 'Error',
        description: 'User not authenticated. Cannot save profile.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000'}/api/users/${mongoDbUserId}/update`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile.');
      }

      const updatedUser: BackendUser = await response.json();
      updateFullBackendUserFields(updatedUser);

      toast({
        title: 'Profile Saved!',
        description: 'Your onboarding is complete and your profile has been updated.',
      });
      setCurrentStep(steps.length - 1); // Move to the final confirmation screen
    } catch (error: any) {
      toast({
        title: 'Submission Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    const stepProps: any = {
      data: formData,
      onUpdate: setFormData,
      onNext: nextStep,
      onBack: prevStep,
      isLoading: isSubmitting,
    };

    switch (currentStep) {
      case 0:
        return <WelcomeStep {...stepProps} onSkip={onSkipAction} />;
      case 1:
        return <ProfileSetupStep {...stepProps} />;
      case 2:
        return <GoalSettingStep {...stepProps} />;
      case 3:
        return <PreferencesStep {...stepProps} />;
      case 4:
        return <CompletionStep {...stepProps} onComplete={onCompleteAction} showConfetti />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl text-gray-800">Profile Setup</h2>
          <span className="font-medium text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <p className="mt-1 text-gray-600">{(steps[currentStep] as any).title}</p>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} variants={formVariant} initial="hidden" animate="visible" exit="exit">
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {currentStep < steps.length - 1 && (
        <div
          className={cn(
            'mt-8 flex',
            currentStep === 0 ? 'justify-end' : 'justify-between'
          )}
        >
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {currentStep < steps.length - 2 ? (
            <Button onClick={nextStep} disabled={isSubmitting}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Finish & Save Profile
            </Button>
          )}
        </div>
      )}

      {currentStep === steps.length - 1 && (
        <div className="mt-8 text-center">
          <Button size="lg" onClick={onCompleteAction}>
            <Check className="mr-2 h-5 w-5" /> Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}

export default WizardContainer;
