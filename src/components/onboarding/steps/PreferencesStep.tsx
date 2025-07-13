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
        <div className="card bg-white/30 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl">Appearance Settings</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Theme Preference</span>
                </label>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleThemeChange(theme)}
                      className={`btn btn-sm ${
                        data.preferences.theme === theme ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="card bg-white/30 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl">Notification Channels</h3>
            <div className="space-y-4">
              {Object.entries(data.preferences.notificationChannels).map(([key, value]) => (
                <div key={key} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-lg h-6 w-6 rounded-md border-2 
                        hover:border-primary-focus focus:ring-2 focus:ring-primary focus:ring-offset-2
                        transition-colors duration-200 ease-in-out"
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
        <div className="card bg-white/30 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4 text-xl">Email Subscriptions</h3>
            <div className="space-y-4">
              {Object.entries(data.preferences.notificationSubscriptions).map(([key, value]) => (
                <div key={key} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-lg h-6 w-6 rounded-md border-2 
                        hover:border-primary-focus focus:ring-2 focus:ring-primary focus:ring-offset-2
                        transition-colors duration-200 ease-in-out"
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
            className="btn btn-outline"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNextAction}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
