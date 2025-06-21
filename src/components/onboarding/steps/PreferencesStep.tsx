'use client';

import React, { useState } from 'react';
import type { WizardData } from '../WizardContainer';

interface PreferencesStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function PreferencesStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack, 
  isLoading 
}: PreferencesStepProps) {
  const [preferences, setPreferences] = useState(data.preferences);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updatedPrefs = { ...preferences, theme };
    setPreferences(updatedPrefs);
    onUpdate({ preferences: updatedPrefs });
  };

  const handleNotificationChannelChange = (channel: string, enabled: boolean) => {
    const updatedChannels = {
      ...preferences.notificationChannels,
      [channel]: enabled
    };
    const updatedPrefs = {
      ...preferences,
      notificationChannels: updatedChannels
    };
    setPreferences(updatedPrefs);
    onUpdate({ preferences: updatedPrefs });
  };

  const handleNotificationSubscriptionChange = (subscription: string, enabled: boolean) => {
    const updatedSubscriptions = {
      ...preferences.notificationSubscriptions,
      [subscription]: enabled
    };
    const updatedPrefs = {
      ...preferences,
      notificationSubscriptions: updatedSubscriptions
    };
    setPreferences(updatedPrefs);
    onUpdate({ preferences: updatedPrefs });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-base-content mb-2">
          Customize Your Experience
        </h2>
        <p className="text-base-content/60">
          Set your preferences for notifications and appearance
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Theme Preference
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Light Theme */}
              <div 
                className={`
                  card cursor-pointer transition-all duration-300 hover:shadow-md
                  ${preferences.theme === 'light' 
                    ? 'bg-primary text-primary-content ring-2 ring-primary' 
                    : 'bg-base-100 hover:bg-base-300'
                  }
                `}
                onClick={() => handleThemeChange('light')}
              >
                <div className="card-body p-4 text-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                    ${preferences.theme === 'light' 
                      ? 'bg-primary-content/20' 
                      : 'bg-yellow-100'
                    }
                  `}>
                    <svg className={`
                      w-6 h-6 
                      ${preferences.theme === 'light' 
                        ? 'text-primary-content' 
                        : 'text-yellow-500'
                      }
                    `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold">Light</h4>
                  <p className="text-xs opacity-70">Bright and clean</p>
                </div>
              </div>

              {/* Dark Theme */}
              <div 
                className={`
                  card cursor-pointer transition-all duration-300 hover:shadow-md
                  ${preferences.theme === 'dark' 
                    ? 'bg-primary text-primary-content ring-2 ring-primary' 
                    : 'bg-base-100 hover:bg-base-300'
                  }
                `}
                onClick={() => handleThemeChange('dark')}
              >
                <div className="card-body p-4 text-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                    ${preferences.theme === 'dark' 
                      ? 'bg-primary-content/20' 
                      : 'bg-gray-100'
                    }
                  `}>
                    <svg className={`
                      w-6 h-6 
                      ${preferences.theme === 'dark' 
                        ? 'text-primary-content' 
                        : 'text-gray-700'
                      }
                    `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold">Dark</h4>
                  <p className="text-xs opacity-70">Easy on the eyes</p>
                </div>
              </div>

              {/* System Theme */}
              <div 
                className={`
                  card cursor-pointer transition-all duration-300 hover:shadow-md
                  ${preferences.theme === 'system' 
                    ? 'bg-primary text-primary-content ring-2 ring-primary' 
                    : 'bg-base-100 hover:bg-base-300'
                  }
                `}
                onClick={() => handleThemeChange('system')}
              >
                <div className="card-body p-4 text-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                    ${preferences.theme === 'system' 
                      ? 'bg-primary-content/20' 
                      : 'bg-blue-100'
                    }
                  `}>
                    <svg className={`
                      w-6 h-6 
                      ${preferences.theme === 'system' 
                        ? 'text-primary-content' 
                        : 'text-blue-500'
                      }
                    `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold">System</h4>
                  <p className="text-xs opacity-70">Match device</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
              </svg>
              Notification Channels
            </h3>
            <p className="text-base-content/60 mb-4">
              Choose how you'd like to receive notifications
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-base-content/60">Receive updates via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.notificationChannels?.email || false}
                  onChange={(e) => handleNotificationChannelChange('email', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-base-content/60">Get urgent updates via text</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.notificationChannels?.sms || false}
                  onChange={(e) => handleNotificationChannelChange('sms', e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">In-App Notifications</h4>
                    <p className="text-sm text-base-content/60">Show notifications within the app</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.notificationChannels?.inAppToast || false}
                  onChange={(e) => handleNotificationChannelChange('inAppToast', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Subscriptions */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              What You'd Like to Hear About
            </h3>
            <p className="text-base-content/60 mb-4">
              Customize the types of notifications you receive
            </p>

            <div className="space-y-3">
              {[
                {
                  key: 'companyReplies',
                  title: 'Company Replies',
                  description: 'When companies respond to your applications',
                  icon: '💬'
                },
                {
                  key: 'matchUpdates',
                  title: 'Match Updates',
                  description: 'New matches and profile views',
                  icon: '🎯'
                },
                {
                  key: 'applicationStatusChanges',
                  title: 'Application Status',
                  description: 'Updates on your job applications',
                  icon: '📋'
                },
                {
                  key: 'platformAnnouncements',
                  title: 'Platform Updates',
                  description: 'Important SwipeHire announcements',
                  icon: '📢'
                },
                {
                  key: 'welcomeAndOnboardingEmails',
                  title: 'Welcome & Onboarding',
                  description: 'Getting started tips and guides',
                  icon: '👋'
                },
                {
                  key: 'contentAndBlogUpdates',
                  title: 'Content & Blog Updates',
                  description: 'Career advice and industry insights',
                  icon: '📚'
                },
                {
                  key: 'featureAndPromotionUpdates',
                  title: 'Features & Promotions',
                  description: 'New features and special offers',
                  icon: '🎁'
                }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-base-content/60">{item.description}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={preferences.notificationSubscriptions?.[item.key as keyof typeof preferences.notificationSubscriptions] || false}
                    onChange={(e) => handleNotificationSubscriptionChange(item.key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="alert alert-info">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Privacy First</h3>
            <div className="text-xs">
              You can change these preferences anytime in your settings. We never share your data with third parties.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="btn btn-ghost"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>

        <button
          onClick={onNext}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}