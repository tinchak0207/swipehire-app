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
    gradient: 'from-teal-600 via-green-600 to-emerald-600',
    component: WelcomeStep,
  },
  {
    key: 'basicInfo',
    title: 'Tell us about yourself',
    subtitle: 'Basic information for your portfolio',
    icon: Target,
    gradient: 'from-teal-600 via-green-600 to-emerald-600',
    component: BasicInfoStep,
  },
  {
    key: 'theme',
    title: 'Choose your style',
    subtitle: 'Pick a theme that represents you',
    icon: Palette,
    gradient: 'from-teal-600 via-green-600 to-emerald-600',
    component: ThemeSelectionStep,
  },
  {
    key: 'projects',
    title: 'Showcase your work',
    subtitle: 'Add your best projects',
    icon: Rocket,
    gradient: 'from-teal-600 via-green-600 to-emerald-600',
    component: ProjectsStep,
  },
  {
    key: 'review',
    title: 'Review & Launch',
    subtitle: 'Final check before publishing',
    icon: CheckCircle,
    gradient: 'from-teal-600 via-green-600 to-emerald-600',
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
  }, [currentStep.key, form, isLastStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  // Handle final submission
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create portfolio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [portfolioData, form, createPortfolioMutation, router, toast]);

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
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${currentStep.gradient} transition-all duration-1000 ease-in-out`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Progress indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStepIndex ? 'bg-white shadow-lg' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Step header */}
          <motion.div
            key={`header-${currentStepIndex}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
              <currentStep.icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 font-montserrat tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/95 max-w-2xl mx-auto leading-relaxed">
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
              className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-3xl p-8 md:p-12"
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
            className="flex justify-between items-center mt-8"
          >
            <button
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-200 ${
                isFirstStep
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="text-white/60 text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <button
              onClick={goToNextStep}
              disabled={isSubmitting}
              className="focus:outline-none focus:ring-4 focus:ring-white/30 flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-full font-bold transition-all duration-200 hover:scale-105 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isSubmitting ? 'Creating...' : isLastStep ? 'Create Portfolio' : 'Continue'}
              </span>
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>

          {/* Keyboard shortcuts hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center mt-8 text-white/50 text-sm"
          >
            Press <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Ctrl+Enter</kbd> to
            continue, <kbd className="px-2 py-1 bg-white/20 rounded text-xs">Esc</kbd> to go back
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreationWizard;
