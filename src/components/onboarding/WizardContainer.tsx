'use client';

import React, { useState, useEffect } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import type { UserRole, BackendUser } from '@/lib/types';
import WelcomeStep from './steps/WelcomeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import PreferencesStep from './steps/PreferencesStep';
import GoalSettingStep from './steps/GoalSettingStep';
import CompletionStep from './steps/CompletionStep';
import ProgressIndicator from './ProgressIndicator';

export interface WizardData {
  userType: UserRole | null;
  profileData: {
    // Candidate fields
    headline?: string;
    experienceSummary?: string;
    skills?: string[];
    desiredWorkStyle?: string;
    workExperienceLevel?: string;
    educationLevel?: string;
    locationPreference?: string;
    availability?: string;
    jobTypePreference?: string;
    salaryExpectationMin?: number;
    salaryExpectationMax?: number;
    
    // Company fields
    companyName?: string;
    companyIndustry?: string;
    companyScale?: string;
    companyDescription?: string;
    companyCultureHighlights?: string[];
    companyNeeds?: string;
  };
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notificationChannels?: {
      email: boolean;
      sms: boolean;
      inAppToast: boolean;
      inAppBanner: boolean;
    };
    notificationSubscriptions?: {
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
  profileData: {},
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
  onComplete: () => void;
  onSkip: () => void;
}

export default function WizardContainer({ onComplete, onSkip }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { 
    fullBackendUser, 
    updateFullBackendUserFields, 
    setPreferences,
    mongoDbUserId 
  } = useUserPreferences();

  const totalSteps = 5;

  // Load existing data if user has partial progress
  useEffect(() => {
    if (fullBackendUser) {
      setWizardData(prev => ({
        ...prev,
        userType: fullBackendUser.selectedRole,
        profileData: {
          // Candidate fields
          headline: fullBackendUser.profileHeadline,
          experienceSummary: fullBackendUser.profileExperienceSummary,
          skills: fullBackendUser.profileSkills?.split(',').map(s => s.trim()),
          desiredWorkStyle: fullBackendUser.profileDesiredWorkStyle,
          workExperienceLevel: fullBackendUser.profileWorkExperienceLevel,
          educationLevel: fullBackendUser.profileEducationLevel,
          locationPreference: fullBackendUser.profileLocationPreference,
          availability: fullBackendUser.profileAvailability,
          jobTypePreference: fullBackendUser.profileJobTypePreference,
          salaryExpectationMin: fullBackendUser.profileSalaryExpectationMin,
          salaryExpectationMax: fullBackendUser.profileSalaryExpectationMax,
          
          // Company fields
          companyName: fullBackendUser.companyName,
          companyIndustry: fullBackendUser.companyIndustry,
          companyScale: fullBackendUser.companyScale,
          companyDescription: fullBackendUser.companyDescription,
          companyCultureHighlights: fullBackendUser.companyCultureHighlights,
          companyNeeds: fullBackendUser.companyNeeds,
        },
        preferences: {
          theme: fullBackendUser.preferences?.theme || 'system',
          notificationChannels: fullBackendUser.preferences?.notificationChannels || initialWizardData.preferences.notificationChannels,
          notificationSubscriptions: fullBackendUser.preferences?.notificationSubscriptions || initialWizardData.preferences.notificationSubscriptions,
        },
      }));
    }
  }, [fullBackendUser]);

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData(prev => ({
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000'}/api/users/${mongoDbUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userUpdates),
      });

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
          await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000'}/api/users/${mongoDbUserId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              wizardCompleted: true,
              onboardingCompletedAt: new Date().toISOString(),
            }),
          });
          
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
        onComplete();
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
        await fetch(`${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000'}/api/users/${mongoDbUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            wizardSkipped: true,
            wizardSkippedAt: new Date().toISOString(),
          }),
        });
        
        updateFullBackendUserFields({ 
          wizardSkipped: true,
          wizardSkippedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error marking wizard as skipped:', error);
      }
    }
    onSkip();
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
            onBack={handleBack}
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

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          stepTitles={[
            'Welcome',
            'Profile Setup',
            'Preferences',
            'Goal Setting',
            'Complete'
          ]}
        />
        
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}