'use client';

import React from 'react';
import type { UserRole } from '@/lib/types';
import type { WizardData } from '../WizardContainer';

interface WelcomeStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export default function WelcomeStep({ 
  data, 
  onUpdate, 
  onNext, 
  onSkip, 
  isLoading 
}: WelcomeStepProps) {
  const handleRoleSelect = (role: UserRole) => {
    onUpdate({ userType: role });
  };

  const canProceed = data.userType !== null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Welcome to SwipeHire! 🎉
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Let's get you set up with a personalized experience. This quick setup will help us tailor 
            SwipeHire to your specific needs and goals.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base-content mb-2">Personalized Experience</h3>
            <p className="text-sm text-base-content/60">
              Get recommendations tailored to your specific role and preferences
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-base-content mb-2">Goal Tracking</h3>
            <p className="text-sm text-base-content/60">
              Set and track your career goals with AI-powered insights
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base-content mb-2">Smart Notifications</h3>
            <p className="text-sm text-base-content/60">
              Stay informed with customizable notification preferences
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center text-base-content mb-2">
          What brings you to SwipeHire?
        </h2>
        <p className="text-center text-base-content/60 mb-8">
          Choose your primary role to get started with the right experience
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Job Seeker Option */}
          <div 
            className={`
              card cursor-pointer transition-all duration-300 hover:shadow-lg
              ${data.userType === 'jobseeker' 
                ? 'bg-primary text-primary-content ring-2 ring-primary' 
                : 'bg-base-200 hover:bg-base-300'
              }
            `}
            onClick={() => handleRoleSelect('jobseeker')}
          >
            <div className="card-body text-center p-8">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                ${data.userType === 'jobseeker' 
                  ? 'bg-primary-content/20' 
                  : 'bg-primary/10'
                }
              `}>
                <svg className={`
                  w-8 h-8 
                  ${data.userType === 'jobseeker' 
                    ? 'text-primary-content' 
                    : 'text-primary'
                  }
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">I'm Looking for Jobs</h3>
              <p className={`
                text-sm mb-4
                ${data.userType === 'jobseeker' 
                  ? 'text-primary-content/80' 
                  : 'text-base-content/60'
                }
              `}>
                Find your next career opportunity with AI-powered matching and career guidance
              </p>
              <ul className={`
                text-sm text-left space-y-1
                ${data.userType === 'jobseeker' 
                  ? 'text-primary-content/70' 
                  : 'text-base-content/50'
                }
              `}>
                <li>• Career path recommendations</li>
                <li>• Skill development tracking</li>
                <li>• Personalized job matching</li>
                <li>• Interview preparation tools</li>
              </ul>
            </div>
          </div>

          {/* Recruiter Option */}
          <div 
            className={`
              card cursor-pointer transition-all duration-300 hover:shadow-lg
              ${data.userType === 'recruiter' 
                ? 'bg-primary text-primary-content ring-2 ring-primary' 
                : 'bg-base-200 hover:bg-base-300'
              }
            `}
            onClick={() => handleRoleSelect('recruiter')}
          >
            <div className="card-body text-center p-8">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                ${data.userType === 'recruiter' 
                  ? 'bg-primary-content/20' 
                  : 'bg-primary/10'
                }
              `}>
                <svg className={`
                  w-8 h-8 
                  ${data.userType === 'recruiter' 
                    ? 'text-primary-content' 
                    : 'text-primary'
                  }
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">I'm Hiring Talent</h3>
              <p className={`
                text-sm mb-4
                ${data.userType === 'recruiter' 
                  ? 'text-primary-content/80' 
                  : 'text-base-content/60'
                }
              `}>
                Discover exceptional candidates with intelligent screening and matching tools
              </p>
              <ul className={`
                text-sm text-left space-y-1
                ${data.userType === 'recruiter' 
                  ? 'text-primary-content/70' 
                  : 'text-base-content/50'
                }
              `}>
                <li>• AI-powered candidate matching</li>
                <li>• Company profile optimization</li>
                <li>• Streamlined hiring workflow</li>
                <li>• Talent pipeline management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onSkip}
          className="btn btn-ghost btn-sm"
          disabled={isLoading}
        >
          Skip Setup (Complete Later)
        </button>

        <div className="flex gap-3">
          <button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                Continue Setup
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="text-center mt-8">
        <p className="text-sm text-base-content/50">
          ⏱️ This setup takes about 3-5 minutes to complete
        </p>
      </div>
    </div>
  );
}