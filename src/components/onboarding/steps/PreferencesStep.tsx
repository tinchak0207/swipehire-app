// import { useState } from 'react';
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
  onUpdate: onUpdateAction,
  onNext: onNextAction,
  onBack: onBackAction,
  isLoading,
}: PreferencesStepProps) {
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updatedPrefs = { ...data.preferences, theme };
    onUpdateAction({ preferences: updatedPrefs });
  };

  const handleNotificationChannelChange = (
    channel: keyof typeof data.preferences.notificationChannels,
    value: boolean
  ) => {
    const updatedPrefs = {
      ...data.preferences,
      notificationChannels: {
        ...data.preferences.notificationChannels,
        [channel]: value,
      },
    };
    onUpdateAction({ preferences: updatedPrefs });
  };

  const handleNotificationSubscriptionChange = (
    subscription: keyof typeof data.preferences.notificationSubscriptions,
    value: boolean
  ) => {
    const updatedPrefs = {
      ...data.preferences,
      notificationSubscriptions: {
        ...data.preferences.notificationSubscriptions,
        [subscription]: value,
      },
    };
    onUpdateAction({ preferences: updatedPrefs });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-bold text-3xl text-base-content">Customize Your Experience</h2>
        <p className="text-base-content/60">
          Set your preferences for notifications and appearance
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="card border border-white/20 bg-white/30 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl flex items-center">
              <span className="mr-2">🎨</span> Appearance Settings
            </h3>
            <div className="space-y-1">
              <div className="form-control py-1">
                <label className="label py-1">
                  <span className="label-text font-medium">Theme Preference</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleThemeChange(theme)}
                      className={`btn btn-sm flex-1 min-w-[100px] transition-all duration-200 transform hover:scale-105 ${
                        data.preferences.theme === theme
                          ? 'btn-primary shadow-md'
                          : 'btn-outline border-2'
                      }`}
                    >
                      <span className="capitalize">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="card border border-white/20 bg-white/30 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl flex items-center">
              <span className="mr-2">🔔</span> Notification Channels
            </h3>
            <div className="space-y-2">
              {Object.entries(data.preferences.notificationChannels).map(([key, value]) => (
                <div
                  key={key}
                  className={`form-control p-3 rounded-lg transition-all duration-200 ${
                    value ? 'bg-primary/10' : 'hover:bg-primary/5'
                  }`}
                >
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-lg h-6 w-6 rounded-md border-2 transition-all duration-200 ease-in-out hover:border-primary-focus focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      checked={value}
                      onChange={(e) =>
                        handleNotificationChannelChange(
                          key as keyof typeof data.preferences.notificationChannels,
                          e.target.checked
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Subscriptions */}
        <div className="card border border-white/20 bg-white/30 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl flex items-center">
              <span className="mr-2">📧</span> Email Subscriptions
            </h3>
            <div className="space-y-2">
              {Object.entries(data.preferences.notificationSubscriptions).map(([key, value]) => (
                <div
                  key={key}
                  className={`form-control p-3 rounded-lg transition-all duration-200 ${
                    value ? 'bg-primary/10' : 'hover:bg-primary/5'
                  }`}
                >
                  <label className="label cursor-pointer justify-between">
                    <span className="label-text font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-lg h-6 w-6 rounded-md border-2 transition-all duration-200 ease-in-out hover:border-primary-focus focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      checked={value}
                      onChange={(e) =>
                        handleNotificationSubscriptionChange(
                          key as keyof typeof data.preferences.notificationSubscriptions,
                          e.target.checked
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBackAction}
            className="btn btn-ghost gap-2"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={onNextAction}
            className="btn btn-primary btn-lg gap-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
