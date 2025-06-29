'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { WizardContainer } from '@/components/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { markWizardCompleted, markWizardSkipped } = useOnboardingWizard();

  const returnTo = searchParams.get('returnTo');

  const handleComplete = () => {
    markWizardCompleted();

    // Handle different return destinations
    if (returnTo === 'resume-optimizer-import') {
      router.push('/resume-optimizer/import?onboarding=completed');
    } else {
      // Default redirect to home page
      router.push('/');
    }
  };

  const handleSkip = () => {
    markWizardSkipped();

    // Handle different return destinations for skip case
    if (returnTo === 'resume-optimizer-import') {
      // If they skip onboarding but came from resume optimizer,
      // still redirect back but with a note
      router.push('/resume-optimizer/import?onboarding=skipped');
    } else {
      // Default redirect to home page with a note that they can complete onboarding later
      router.push('/?onboarding=skipped');
    }
  };

  return (
    <WizardContainer
      onCompleteAction={handleComplete}
      onSkipAction={handleSkip}
      returnTo={returnTo}
    />
  );
}
