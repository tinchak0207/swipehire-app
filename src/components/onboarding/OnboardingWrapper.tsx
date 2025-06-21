'use client';

import React from 'react';
import { WizardContainer } from '@/components/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { useRouter } from 'next/navigation';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const router = useRouter();
  const { shouldShowWizard, isLoading, markWizardCompleted, markWizardSkipped } = useOnboardingWizard();

  const handleComplete = () => {
    markWizardCompleted();
    // Optionally redirect or just hide the wizard
  };

  const handleSkip = () => {
    markWizardSkipped();
    // Optionally show a toast notification about completing later
  };

  // Show loading state while determining if wizard should be shown
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Show wizard if needed
  if (shouldShowWizard) {
    return (
      <div className="min-h-screen bg-base-100">
        <WizardContainer 
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    );
  }

  // Show normal app content
  return <>{children}</>;
}