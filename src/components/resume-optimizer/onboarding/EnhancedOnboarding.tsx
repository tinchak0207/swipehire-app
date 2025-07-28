'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Progress from '@radix-ui/react-progress';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import type { AnimationConfig, OnboardingPath, OptimizationGoals, UserProfile } from '../types';

/**
 * Enhanced Onboarding Component with Progressive Disclosure
 *
 * Features:
 * - Interactive tutorial with tooltips
 * - Skill assessment for personalization
 * - Goal setting with AI recommendations
 * - Progress tracking with visual journey map
 * - Smart entry point selection
 * - Responsive design with touch optimization
 *
 * DaisyUI Components Used:
 * - hero, card, badge, progress, modal, btn, input, select
 *
 * Tailwind Classes:
 * - transition-all duration-300 ease-in-out
 * - transform hover:scale-105
 * - bg-gradient-to-r from-blue-500 to-purple-600
 * - shadow-lg hover:shadow-xl
 * - animate-pulse for loading states
 */

interface EnhancedOnboardingProps {
  readonly isOpen: boolean;
  readonly userProfile?: UserProfile;
  readonly onComplete: (goals: OptimizationGoals, path: OnboardingPath) => void;
  readonly onClose: () => void;
  readonly onSkip: () => void;
}

interface OnboardingStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly component: React.ComponentType<StepProps>;
  readonly isOptional: boolean;
  readonly estimatedTime: number;
}

interface StepProps {
  readonly onNext: (data?: Record<string, unknown>) => void;
  readonly onPrevious: () => void;
  readonly onSkip: () => void;
  readonly stepData: Record<string, unknown>;
  readonly userProfile?: UserProfile;
}

const animationConfig: AnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  stagger: 100,
};

export const EnhancedOnboarding: React.FC<EnhancedOnboardingProps> = ({
  isOpen,
  userProfile,
  onComplete,
  onClose,
  onSkip,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<string, Record<string, unknown>>>({});
  const [isLoading] = useState(false);

  const steps: readonly OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SwipeHire',
      description: "Let's optimize your resume for success",
      component: WelcomeStep,
      isOptional: false,
      estimatedTime: 1,
    },
    {
      id: 'assessment',
      title: 'Quick Assessment',
      description: 'Help us understand your background',
      component: AssessmentStep,
      isOptional: false,
      estimatedTime: 3,
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      description: 'Define your optimization objectives',
      component: GoalsStep,
      isOptional: false,
      estimatedTime: 2,
    },
    {
      id: 'path-selection',
      title: 'Choose Your Path',
      description: 'Select the best approach for you',
      component: PathSelectionStep,
      isOptional: false,
      estimatedTime: 1,
    },
    {
      id: 'tutorial',
      title: 'Interactive Tutorial',
      description: 'Learn the key features',
      component: TutorialStep,
      isOptional: true,
      estimatedTime: 5,
    },
  ] as const;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);

  // Spring animation for progress bar
  const progressSpring = useSpring({
    width: `${progress}%`,
    config: { tension: 300, friction: 30 },
  });

  const handleNext = useCallback(
    (data?: Record<string, unknown>) => {
      if (currentStep) {
        if (data) {
          setStepData((prev) => ({
            ...prev,
            [currentStep.id]: data,
          }));
        }

        setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));

        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          // Complete onboarding
          const goals = stepData['goals'] as unknown as OptimizationGoals;
          const path = (stepData['path-selection'] as any)?.selectedPath as OnboardingPath;
          onComplete(goals, path);
        }
      }
    },
    [currentStep, currentStepIndex, stepData, onComplete, steps.length]
  );

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkipStep = useCallback(() => {
    if (currentStep?.isOptional) {
      handleNext();
    }
  }, [currentStep, handleNext]);

  const handleSkipOnboarding = useCallback(() => {
    onSkip();
  }, [onSkip]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          if (event.ctrlKey) handleNext();
          break;
        case 'ArrowLeft':
          if (event.ctrlKey) handlePrevious();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrevious]);

  if (!currentStep) {
    return null;
  }

  const StepComponent = currentStep.component;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-4xl transform overflow-hidden rounded-2xl bg-base-100 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={animationConfig}
            className="flex h-full flex-col"
          >
            {/* Header with Progress */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-2xl">{currentStep.title}</h2>
                  <p className="text-primary-content/80">{currentStep.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    Step {currentStepIndex + 1} of {steps.length}
                  </div>
                  <button
                    onClick={handleSkipOnboarding}
                    className="btn btn-ghost btn-sm text-primary-content hover:bg-primary-content/20"
                    aria-label="Skip onboarding"
                  >
                    Skip
                  </button>
                  <Dialog.Close asChild>
                    <button
                      className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-content/20"
                      aria-label="Close onboarding"
                    >
                      ✕
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <Progress.Root
                  className="relative h-2 overflow-hidden rounded-full bg-primary-content/20"
                  value={progress}
                >
                  <animated.div
                    style={progressSpring}
                    className="h-full rounded-full bg-primary-content transition-all duration-300"
                  />
                </Progress.Root>
                <div className="mt-2 flex justify-between text-primary-content/70 text-xs">
                  <span>Progress: {Math.round(progress)}%</span>
                  <span>~{totalEstimatedTime} min total</span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="mt-4 flex justify-center gap-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`h-3 w-3 rounded-full transition-all duration-200 ${
                      index === currentStepIndex
                        ? 'scale-125 bg-primary-content'
                        : completedSteps.has(index)
                          ? 'bg-primary-content/70'
                          : 'bg-primary-content/30'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={animationConfig}
                  className="h-full p-6"
                >
                  <StepComponent
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSkip={handleSkipStep}
                    stepData={stepData[currentStep.id] || {}}
                    userProfile={userProfile!}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="border-base-300 border-t bg-base-50 p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="btn btn-ghost"
                  aria-label="Previous step"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentStep.isOptional && (
                    <button onClick={handleSkipStep} className="btn btn-outline btn-sm">
                      Skip This Step
                    </button>
                  )}
                  <div className="text-base-content/60 text-sm">
                    ~{currentStep.estimatedTime} min
                  </div>
                </div>

                <button
                  onClick={() => handleNext()}
                  disabled={isLoading}
                  className="btn btn-primary"
                  aria-label={
                    currentStepIndex === steps.length - 1 ? 'Complete onboarding' : 'Next step'
                  }
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : currentStepIndex === steps.length - 1 ? (
                    'Complete'
                  ) : (
                    'Next →'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Individual Step Components
const WelcomeStep: React.FC<StepProps> = ({ onNext, userProfile }) => {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-4xl text-primary-content"
      >
        🚀
      </motion.div>

      <div className="space-y-4">
        <h3 className="font-bold text-3xl text-base-content">
          Welcome{userProfile?.name ? `, ${userProfile.name}` : ''}!
        </h3>
        <p className="mx-auto max-w-2xl text-base-content/70 text-lg">
          Let's transform your resume into a powerful tool that gets you noticed by employers and
          passes through ATS systems with flying colors.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: '🎯', title: 'AI-Powered Analysis', desc: 'Get intelligent suggestions' },
          { icon: '📊', title: 'Real-time Scoring', desc: 'Track your improvements' },
          { icon: '🏆', title: 'ATS Optimization', desc: 'Beat applicant tracking systems' },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="card bg-base-200 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div className="card-body text-center">
              <div className="mb-2 text-3xl">{feature.icon}</div>
              <h4 className="font-semibold">{feature.title}</h4>
              <p className="text-base-content/60 text-sm">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNext()}
        className="btn btn-primary btn-lg mt-8"
      >
        Let's Get Started! 🎉
      </motion.button>
    </div>
  );
};

const AssessmentStep: React.FC<StepProps> = ({ onNext, stepData }) => {
  const [responses, setResponses] = useState<Record<string, string>>(
    stepData as Record<string, string>
  );

  const questions = [
    {
      id: 'experience',
      question: "What's your experience level?",
      options: [
        { value: 'entry', label: 'Entry Level (0-2 years)' },
        { value: 'mid', label: 'Mid Level (3-5 years)' },
        { value: 'senior', label: 'Senior Level (6-10 years)' },
        { value: 'executive', label: 'Executive (10+ years)' },
      ],
    },
    {
      id: 'industry',
      question: 'Which industry are you targeting?',
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'goal',
      question: "What's your primary goal?",
      options: [
        { value: 'job-search', label: 'Active job searching' },
        { value: 'career-change', label: 'Career transition' },
        { value: 'promotion', label: 'Internal promotion' },
        { value: 'freelance', label: 'Freelance opportunities' },
      ],
    },
  ];

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = questions.every((q) => responses[q.id]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="mb-2 font-bold text-2xl">Quick Assessment</h3>
        <p className="text-base-content/70">
          Help us personalize your experience with just a few questions
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-base-100 shadow-lg"
          >
            <div className="card-body">
              <h4 className="mb-4 font-semibold">{question.question}</h4>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-base-200"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={responses[question.id] === option.value}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="radio radio-primary"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => onNext(responses)}
          disabled={!canProceed}
          className="btn btn-primary btn-lg"
        >
          Continue to Goals
        </button>
      </div>
    </div>
  );
};

const GoalsStep: React.FC<StepProps> = ({ onNext, stepData }) => {
  const [goals, setGoals] = useState<Partial<OptimizationGoals>>(
    stepData as Partial<OptimizationGoals>
  );

  const handleGoalChange = (key: keyof OptimizationGoals, value: string) => {
    setGoals((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed =
    goals.primaryObjective && goals.targetIndustry && goals.targetRole && goals.timeframe;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="mb-2 font-bold text-2xl">Set Your Optimization Goals</h3>
        <p className="text-base-content/70">Define what you want to achieve with your resume</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Primary Objective</span>
          </label>
          <select
            className="select select-bordered"
            value={goals.primaryObjective || ''}
            onChange={(e) =>
              handleGoalChange(
                'primaryObjective',
                e.target.value as OptimizationGoals['primaryObjective']
              )
            }
          >
            <option value="">Select objective...</option>
            <option value="ats-optimization">ATS Optimization</option>
            <option value="content-improvement">Content Improvement</option>
            <option value="format-enhancement">Format Enhancement</option>
            <option value="keyword-optimization">Keyword Optimization</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Target Industry</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Technology, Finance, Healthcare"
            className="input input-bordered"
            value={goals.targetIndustry || ''}
            onChange={(e) => handleGoalChange('targetIndustry', e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Target Role</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Software Engineer, Marketing Manager"
            className="input input-bordered"
            value={goals.targetRole || ''}
            onChange={(e) => handleGoalChange('targetRole', e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Timeframe</span>
          </label>
          <select
            className="select select-bordered"
            value={goals.timeframe || ''}
            onChange={(e) =>
              handleGoalChange('timeframe', e.target.value as OptimizationGoals['timeframe'])
            }
          >
            <option value="">Select timeframe...</option>
            <option value="immediate">Immediate (this week)</option>
            <option value="week">Within a week</option>
            <option value="month">Within a month</option>
            <option value="quarter">Within 3 months</option>
          </select>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => onNext(goals)}
          disabled={!canProceed}
          className="btn btn-primary btn-lg"
        >
          Set Goals & Continue
        </button>
      </div>
    </div>
  );
};

const PathSelectionStep: React.FC<StepProps> = ({ onNext }) => {
  const [selectedPath, setSelectedPath] = useState<OnboardingPath | null>(null);

  const paths = [
    {
      id: 'quick-start' as OnboardingPath,
      title: 'Quick Start',
      description: 'Get immediate results in under 5 minutes',
      time: '2-5 min',
      features: ['Basic analysis', 'Top suggestions', 'Quick fixes'],
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'comprehensive' as OnboardingPath,
      title: 'Comprehensive Analysis',
      description: 'Deep dive into every aspect of your resume',
      time: '15-30 min',
      features: ['Detailed analysis', 'All suggestions', 'Custom recommendations'],
      icon: '🔍',
      color: 'from-blue-400 to-purple-500',
    },
    {
      id: 'guided-tutorial' as OnboardingPath,
      title: 'Guided Tutorial',
      description: 'Learn while you optimize with step-by-step guidance',
      time: '20-40 min',
      features: ['Interactive tutorial', 'Best practices', 'Expert tips'],
      icon: '🎓',
      color: 'from-green-400 to-blue-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="mb-2 font-bold text-2xl">Choose Your Optimization Path</h3>
        <p className="text-base-content/70">
          Select the approach that best fits your needs and available time
        </p>
      </div>

      <div className="grid gap-6">
        {paths.map((path) => (
          <motion.div
            key={path.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`card cursor-pointer transition-all duration-300 ${
              selectedPath === path.id ? 'shadow-xl ring-2 ring-primary' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedPath(path.id)}
          >
            <div className="card-body">
              <div className="flex items-start gap-4">
                <div
                  className={`h-16 w-16 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center text-2xl text-white shadow-lg`}
                >
                  {path.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-bold text-xl">{path.title}</h4>
                    <div className="badge badge-outline">{path.time}</div>
                  </div>
                  <p className="mb-4 text-base-content/70">{path.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {path.features.map((feature) => (
                      <div key={feature} className="badge badge-ghost">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-control">
                  <input
                    type="radio"
                    name="path"
                    className="radio radio-primary"
                    checked={selectedPath === path.id}
                    onChange={() => setSelectedPath(path.id)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => onNext({ selectedPath })}
          disabled={!selectedPath}
          className="btn btn-primary btn-lg"
        >
          Start Optimization Journey
        </button>
      </div>
    </div>
  );
};

const TutorialStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="space-y-6 text-center">
      <h3 className="font-bold text-2xl">Tutorial Coming Soon!</h3>
      <p className="text-base-content/70">
        Interactive tutorial will be available in the next update.
      </p>
      <button onClick={() => onNext()} className="btn btn-primary">
        Complete Onboarding
      </button>
    </div>
  );
};

export default EnhancedOnboarding;
