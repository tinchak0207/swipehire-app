'use client';

import type React from 'react';
import { WizardContainer } from '@/components/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { shouldShowWizard, isLoading, markWizardCompleted, markWizardSkipped } =
    useOnboardingWizard();

  // Show loading state while determining if wizard should be shown
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
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
          onCompleteAction={markWizardCompleted}
          onSkipAction={markWizardSkipped}
          returnTo={null}
        />
      </div>
    );
  }

  // Show normal app content
  return <>{children}</>;
}
