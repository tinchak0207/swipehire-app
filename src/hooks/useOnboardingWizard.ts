'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export interface OnboardingState {
  shouldShowWizard: boolean;
  isLoading: boolean;
  canSkip: boolean;
}

export function useOnboardingWizard() {
  const [state, setState] = useState<OnboardingState>({
    shouldShowWizard: false,
    isLoading: true,
    canSkip: true,
  });

  const { fullBackendUser, preferences } = useUserPreferences();

  useEffect(() => {
    if (preferences.isLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!fullBackendUser) {
      setState({
        shouldShowWizard: false,
        isLoading: false,
        canSkip: true,
      });
      return;
    }

    // Check if user has completed or skipped the wizard
    const hasCompletedWizard = fullBackendUser.wizardCompleted;
    const hasSkippedWizard = fullBackendUser.wizardSkipped;
    const hasSelectedRole = fullBackendUser.selectedRole;

    // Show wizard if:
    // 1. User hasn't completed or skipped it
    // 2. User has selected a role (basic requirement)
    // 3. User preferences are loaded
    const shouldShow = !hasCompletedWizard && !hasSkippedWizard && hasSelectedRole;

    setState({
      shouldShowWizard: shouldShow,
      isLoading: false,
      canSkip: true,
    });
  }, [fullBackendUser, preferences.isLoading]);

  const markWizardCompleted = () => {
    setState(prev => ({ ...prev, shouldShowWizard: false }));
  };

  const markWizardSkipped = () => {
    setState(prev => ({ ...prev, shouldShowWizard: false }));
  };

  return {
    ...state,
    markWizardCompleted,
    markWizardSkipped,
  };
}