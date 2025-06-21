'use client';

import React from 'react';
import { WizardContainer } from '@/components/onboarding';
import { useRouter } from 'next/navigation';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();
  const { markWizardCompleted, markWizardSkipped } = useOnboardingWizard();

  const handleComplete = () => {
    markWizardCompleted();
    // Redirect to appropriate dashboard based on user role
    router.push('/dashboard');
  };

  const handleSkip = () => {
    markWizardSkipped();
    // Redirect to dashboard with a note that they can complete onboarding later
    router.push('/dashboard?onboarding=skipped');
  };

  return (
    <div className="min-h-screen bg-base-100">
      <WizardContainer 
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}