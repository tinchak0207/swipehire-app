'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Palette,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useCreatePortfolio } from '@/hooks/usePortfolio';
import type { PortfolioDraft } from '@/lib/types/portfolio';
import BasicInfoStep from './wizard-steps/BasicInfoStep';
import ProjectsStep from './wizard-steps/ProjectsStep';
import ReviewStep from './wizard-steps/ReviewStep';
import SuccessStep from './wizard-steps/SuccessStep';
import ThemeSelectionStep from './wizard-steps/ThemeSelectionStep';
// Step components
import WelcomeStep from './wizard-steps/WelcomeStep';

// Validation schemas for each step
const stepSchemas = {
  welcome: z.object({}),
  basicInfo: z.object({
    title: z.string().min(1, 'Portfolio title is required').max(100, 'Title too long'),
    description: z.string().max(500, 'Description too long').optional(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  }),
  theme: z.object({
    theme: z.enum(['modern', 'minimal', 'creative', 'professional']),
    layout: z.enum(['grid', 'masonry', 'list']),
  }),
  projects: z.object({
    projects: z
      .array(
        z.object({
          title: z.string().min(1, 'Project title required'),
          description: z.string().min(1, 'Project description required'),
          technologies: z.array(z.string()),
          links: z.array(
            z.object({
              type: z.enum(['github', 'live', 'demo']),
              url: z.string().url('Invalid URL'),
            })
          ),
        })
      )
      .min(1, 'At least one project required'),
  }),
  review: z.object({}),
};

type StepKey = keyof typeof stepSchemas;

interface WizardStep {
  key: StepKey;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  component: React.ComponentType<any>;
}

const steps: WizardStep[] = [
  {
    key: 'welcome',
    title: 'Welcome to Portfolio Builder',
    subtitle: 'Create a stunning portfolio in minutes',
    icon: Sparkles,
    gradient: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
    component: WelcomeStep,
  },
  {
    key: 'basicInfo',
    title: 'Tell us about yourself',
    subtitle: 'Basic information for your portfolio',
    icon: Target,
    gradient: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
    component: BasicInfoStep,
  },
  {
    key: 'theme',
    title: 'Choose your style',
    subtitle: 'Pick a theme that represents you',
    icon: Palette,
    gradient: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
    component: ThemeSelectionStep,
  },
  {
    key: 'projects',
    title: 'Showcase your work',
    subtitle: 'Add your best projects',
    icon: Rocket,
    gradient: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
    component: ProjectsStep,
  },
  {
    key: 'review',
    title: 'Review & Launch',
    subtitle: 'Final check before publishing',
    icon: CheckCircle,
    gradient: 'from-slate-50 via-blue-50/30 to-indigo-50/20',
    component: ReviewStep,
  },
];

/**
 * Portfolio Creation Wizard
 *
 * A full-screen immersive multi-step wizard for creating portfolios with:
 * - Dynamic gradient backgrounds that transition between steps
 * - Smooth animations using Framer Motion
 * - Form validation with react-hook-form + zod
 * - Glass-morphism design elements
 * - Keyboard navigation support
 * - Mobile-first responsive design
 * - Success celebration with confetti
 */
const PortfolioCreationWizard: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const createPortfolioMutation = useCreatePortfolio();

  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [portfolioData, setPortfolioData] = useState<Partial<PortfolioDraft>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = steps[currentStepIndex] as WizardStep;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Form management for current step
  const form = useForm({
    resolver: zodResolver(stepSchemas[currentStep.key]),
    mode: 'onChange',
  });

  // Navigation handlers
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const finalData = { ...portfolioData, ...form.getValues() };

      const portfolioPayload = {
        title: finalData.title || 'My Portfolio',
        description: finalData.description || '',
        projects: finalData.projects || [],
        layout: finalData.layout || 'grid',
        tags: finalData.tags || [],
        theme: finalData.theme || 'modern',
        isPublished: true,
        visibility: 'public' as const,
        url: (finalData.title || 'my-portfolio').toLowerCase().replace(/\s+/g, '-'),
      };

      const result = await createPortfolioMutation.mutateAsync(portfolioPayload);

      setIsCompleted(true);

      // Redirect after celebration
      setTimeout(() => {
        router.push(`/portfolio/edit/${result.id}`);
      }, 3000);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to create portfolio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [portfolioData, form, createPortfolioMutation, router, toast]);

  const goToNextStep = useCallback(async () => {
    if (currentStep.key === 'welcome') {
      setCurrentStepIndex((prev) => prev + 1);
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) return;

    const stepData = form.getValues();
    setPortfolioData((prev) => ({ ...prev, ...stepData }));

    if (isLastStep) {
      await handleSubmit();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep.key, form, isLastStep, handleSubmit]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        goToPreviousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextStep, goToPreviousStep]);

  // Show success screen
  if (isCompleted) {
    return <SuccessStep />;
  }

  const StepComponent = currentStep.component;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 backdrop-blur-sm transition-all duration-1000 ease-in-out">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="-top-40 -right-40 absolute h-80 w-80 animate-pulse rounded-full bg-blue-400/10 blur-3xl" />
        <div className="-bottom-40 -left-40 absolute h-80 w-80 animate-pulse rounded-full bg-indigo-400/10 blur-3xl delay-1000" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform animate-pulse rounded-full bg-slate-400/5 blur-3xl delay-500" />
      </div>

      {/* Progress indicator */}
      <div className="-translate-x-1/2 absolute top-8 left-1/2 z-20 transform">
        <div className="flex items-center space-x-2 rounded-full border border-gray-200/50 bg-white/80 px-6 py-3 backdrop-blur-sm shadow-lg">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index <= currentStepIndex ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Step header */}
          <motion.div
            key={`header-${currentStepIndex}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-lg">
              <currentStep.icon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-6 font-extrabold font-montserrat text-5xl text-blue-600 tracking-tight md:text-6xl">
              {currentStep.title}
            </h1>
            <p className="mx-auto max-w-2xl font-medium text-black text-xl leading-relaxed md:text-2xl">
              {currentStep.subtitle}
            </p>
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm md:p-12"
            >
              <StepComponent
                form={form}
                data={portfolioData}
                onDataChange={setPortfolioData}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex items-center justify-between"
          >
            <button
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 rounded-full px-6 py-3 transition-all duration-200 ${
                isFirstStep
                  ? 'cursor-not-allowed opacity-50'
                  : 'border border-gray-200/50 bg-white/80 text-black backdrop-blur-sm hover:scale-105 hover:bg-white/90 hover:text-blue-600 shadow-lg'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <div className="text-sm text-black">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <button
              onClick={goToNextStep}
              disabled={isSubmitting}
              className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3.5 font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
            >
              <span>
                {isSubmitting ? 'Creating...' : isLastStep ? 'Create Portfolio' : 'Continue'}
              </span>
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </button>
          </motion.div>

          {/* Keyboard shortcuts hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-center text-sm text-black"
          >
            Press{' '}
            <kbd className="rounded bg-gray-200/50 px-2 py-1 text-xs text-blue-600 font-semibold">
              Ctrl+Enter
            </kbd>{' '}
            to continue,{' '}
            <kbd className="rounded bg-gray-200/50 px-2 py-1 text-xs text-blue-600 font-semibold">
              Esc
            </kbd>{' '}
            to go back
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreationWizard;
