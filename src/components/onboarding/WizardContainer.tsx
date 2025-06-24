'use client';

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import type { BackendUser, UserRole } from '@/lib/types';
import ProgressIndicator from './ProgressIndicator';
import CompletionStep from './steps/CompletionStep';
import GoalSettingStep from './steps/GoalSettingStep';
import PreferencesStep from './steps/PreferencesStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import WelcomeStep from './steps/WelcomeStep';

export interface WizardData {
  userType: UserRole | null;
  profileData: {
    // Candidate fields
    headline: string;
    experienceSummary: string;
    skills: string[];
    desiredWorkStyle: string;
    workExperienceLevel: string;
    educationLevel: string;
    locationPreference: string;
    availability: string;
    jobTypePreference: string;
    salaryExpectationMin: number;
    salaryExpectationMax: number;

    // Company fields
    companyName: string;
    companyIndustry: string;
    companyScale: string;
    companyDescription: string;
    companyCultureHighlights: string[];
    companyNeeds: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notificationChannels: {
      email: boolean;
      sms: boolean;
      inAppToast: boolean;
      inAppBanner: boolean;
    };
    notificationSubscriptions: {
      companyReplies: boolean;
      matchUpdates: boolean;
      applicationStatusChanges: boolean;
      platformAnnouncements: boolean;
      welcomeAndOnboardingEmails: boolean;
      contentAndBlogUpdates: boolean;
      featureAndPromotionUpdates: boolean;
    };
  };
  goals: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
    skillDevelopment: string[];
  };
}

const initialWizardData: WizardData = {
  userType: null,
  profileData: {
    headline: '',
    experienceSummary: '',
    skills: [],
    desiredWorkStyle: '',
    workExperienceLevel: '',
    educationLevel: '',
    locationPreference: '',
    availability: '',
    jobTypePreference: '',
    salaryExpectationMin: 0,
    salaryExpectationMax: 0,
    companyName: '',
    companyIndustry: '',
    companyScale: '',
    companyDescription: '',
    companyCultureHighlights: [],
    companyNeeds: '',
  },
  preferences: {
    theme: 'system',
    notificationChannels: {
      email: true,
      sms: false,
      inAppToast: true,
      inAppBanner: true,
    },
    notificationSubscriptions: {
      companyReplies: true,
      matchUpdates: true,
      applicationStatusChanges: true,
      platformAnnouncements: true,
      welcomeAndOnboardingEmails: true,
      contentAndBlogUpdates: false,
      featureAndPromotionUpdates: false,
    },
  },
  goals: {
    shortTerm: [],
    midTerm: [],
    longTerm: [],
    skillDevelopment: [],
  },
};

interface WizardContainerProps {
  onCompleteAction: () => void;
  onSkipAction: () => void;
}

export default function WizardContainer({ onCompleteAction, onSkipAction }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { fullBackendUser, updateFullBackendUserFields, setPreferences, mongoDbUserId } =
    useUserPreferences();

  const totalSteps = 5;

  // Load existing data if user has partial progress
  useEffect(() => {
    if (fullBackendUser) {
      setWizardData((prev) => ({
        ...prev,
        userType: fullBackendUser.selectedRole,
        profileData: {
          // Candidate fields
          headline: fullBackendUser.profileHeadline || '',
          experienceSummary: fullBackendUser.profileExperienceSummary || '',
          skills: fullBackendUser.profileSkills?.split(',').map((s) => s.trim()) || [],
          desiredWorkStyle: fullBackendUser.profileDesiredWorkStyle || '',
          workExperienceLevel: fullBackendUser.profileWorkExperienceLevel || '',
          educationLevel: fullBackendUser.profileEducationLevel || '',
          locationPreference: fullBackendUser.profileLocationPreference || '',
          availability: fullBackendUser.profileAvailability || '',
          jobTypePreference: fullBackendUser.profileJobTypePreference || '',
          salaryExpectationMin: fullBackendUser.profileSalaryExpectationMin || 0,
          salaryExpectationMax: fullBackendUser.profileSalaryExpectationMax || 0,

          // Company fields
          companyName: fullBackendUser.companyName || '',
          companyIndustry: fullBackendUser.companyIndustry || '',
          companyScale: fullBackendUser.companyScale || '',
          companyDescription: fullBackendUser.companyDescription || '',
          companyCultureHighlights: fullBackendUser.companyCultureHighlights || [],
          companyNeeds: fullBackendUser.companyNeeds || '',
        },
        preferences: {
          theme: fullBackendUser.preferences?.theme || 'system',
          notificationChannels:
            fullBackendUser.preferences?.notificationChannels ||
            initialWizardData.preferences.notificationChannels,
          notificationSubscriptions:
            fullBackendUser.preferences?.notificationSubscriptions ||
            initialWizardData.preferences.notificationSubscriptions,
        },
      }));
    }
  }, [fullBackendUser]);

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData((prev) => ({
      ...prev,
      ...stepData,
      profileData: { ...prev.profileData, ...stepData.profileData },
      preferences: { ...prev.preferences, ...stepData.preferences },
      goals: { ...prev.goals, ...stepData.goals },
    }));
  };

  const saveProgress = async () => {
    if (!mongoDbUserId) return;

    try {
      setIsLoading(true);

      // Prepare backend user updates
      const userUpdates: Partial<BackendUser> = {
        selectedRole: wizardData.userType,
        preferences: {
          ...wizardData.preferences,
          isLoading: false,
          notificationChannels: {
            ...wizardData.preferences.notificationChannels,
          },
          notificationSubscriptions: {
            companyReplies: wizardData.preferences.notificationSubscriptions.companyReplies,
            matchUpdates: wizardData.preferences.notificationSubscriptions.matchUpdates,
            applicationStatusChanges:
              wizardData.preferences.notificationSubscriptions.applicationStatusChanges,
            platformAnnouncements:
              wizardData.preferences.notificationSubscriptions.platformAnnouncements,
            welcomeAndOnboardingEmails:
              wizardData.preferences.notificationSubscriptions.welcomeAndOnboardingEmails,
            contentAndBlogUpdates:
              wizardData.preferences.notificationSubscriptions.contentAndBlogUpdates,
            featureAndPromotionUpdates:
              wizardData.preferences.notificationSubscriptions.featureAndPromotionUpdates,
          },
        },
      };

      // Add profile data based on user type
      if (wizardData.userType === 'jobseeker') {
        Object.assign(userUpdates, {
          profileHeadline: wizardData.profileData.headline,
          profileExperienceSummary: wizardData.profileData.experienceSummary,
          profileSkills: wizardData.profileData.skills?.join(', '),
          profileDesiredWorkStyle: wizardData.profileData.desiredWorkStyle,
          profileWorkExperienceLevel: wizardData.profileData.workExperienceLevel,
          profileEducationLevel: wizardData.profileData.educationLevel,
          profileLocationPreference: wizardData.profileData.locationPreference,
          profileAvailability: wizardData.profileData.availability,
          profileJobTypePreference: wizardData.profileData.jobTypePreference,
          profileSalaryExpectationMin: wizardData.profileData.salaryExpectationMin,
          profileSalaryExpectationMax: wizardData.profileData.salaryExpectationMax,
        });
      } else if (wizardData.userType === 'recruiter') {
        Object.assign(userUpdates, {
          companyName: wizardData.profileData.companyName,
          companyIndustry: wizardData.profileData.companyIndustry,
          companyScale: wizardData.profileData.companyScale,
          companyDescription: wizardData.profileData.companyDescription,
          companyCultureHighlights: wizardData.profileData.companyCultureHighlights,
          companyNeeds: wizardData.profileData.companyNeeds,
          companyProfileComplete: true,
        });
      }

      // Save to backend
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000'}/api/users/${mongoDbUserId}/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userUpdates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      // Update local context
      updateFullBackendUserFields(userUpdates);
      setPreferences(wizardData.preferences);
    } catch (error) {
      console.error('Error saving wizard progress:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Save progress on each step
    await saveProgress();

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark wizard as completed
      if (mongoDbUserId) {
        try {
          await fetch(
            `${process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000'}/api/users/${mongoDbUserId}/update`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                wizardCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
              }),
            }
          );

          updateFullBackendUserFields({
            wizardCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error marking wizard as completed:', error);
        }
      }

      setShowConfetti(true);
      setTimeout(() => {
        onCompleteAction();
      }, 3000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (mongoDbUserId) {
      try {
        await fetch(
          `${process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000'}/api/users/${mongoDbUserId}/update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wizardSkipped: true,
              wizardSkippedAt: new Date().toISOString(),
            }),
          }
        );

        updateFullBackendUserFields({
          wizardSkipped: true,
          wizardSkippedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error marking wizard as skipped:', error);
      }
    }
    onSkipAction();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <ProfileSetupStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBackAction={handleBack}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <PreferencesStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <GoalSettingStep
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 5:
        return (
          <CompletionStep
            data={wizardData}
            onComplete={handleNext}
            showConfetti={showConfetti}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  // Step-specific gradient backgrounds
  const getStepGradient = () => {
    switch (currentStep) {
      case 1:
        return 'bg-gradient-to-br from-blue-50 via-white to-blue-100';
      case 2:
        return 'bg-gradient-to-br from-green-50 via-white to-green-100';
      case 3:
        return 'bg-gradient-to-br from-purple-50 via-white to-purple-100';
      case 4:
        return 'bg-gradient-to-br from-orange-50 via-white to-orange-100';
      case 5:
        return 'bg-gradient-to-br from-pink-50 via-white to-pink-100';
      default:
        return 'bg-gradient-to-br from-gray-50 via-white to-gray-100';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${getStepGradient()}`}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={['Welcome', 'Profile Setup', 'Preferences', 'Goal Setting', 'Complete']}
        />

        <div className="mt-8 animate-fade-in">{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
