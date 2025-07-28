'use client';

import type { UserRole } from '@/lib/types';
interface WelcomeStepProps {
  data: Record<string, any>;
  onUpdate: (data: Partial<Record<string, any>>) => void;
  onNext: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export default function WelcomeStep({
  data,
  onUpdate,
  onNext,
  onSkip,
  isLoading,
}: WelcomeStepProps) {
  const handleRoleSelect = (role: UserRole) => {
    onUpdate({ userType: role });
  };

  const canProceed = data['userType'] !== null;

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-16 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="mb-6 font-bold text-5xl text-gray-800 leading-tight">
            Welcome to SwipeHire! 🎉
          </h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-xl leading-relaxed">
            Let's get you set up with a personalized experience. This quick setup will help us
            tailor SwipeHire to your specific needs and goals.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-3 font-bold text-gray-800 text-lg">Personalized Experience</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Get recommendations tailored to your specific role and preferences
            </p>
          </div>

          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="mb-3 font-bold text-gray-800 text-lg">Goal Tracking</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Set and track your career goals with AI-powered insights
            </p>
          </div>

          <div className="group text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-3 font-bold text-gray-800 text-lg">Smart Notifications</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Stay informed with customizable notification preferences
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="mb-16">
        <h2 className="mb-3 text-center font-bold text-3xl text-gray-800">
          What brings you to SwipeHire?
        </h2>
        <p className="mb-12 text-center text-gray-600 text-lg">
          Choose your primary role to get started with the right experience
        </p>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Job Seeker Option */}
          <div
            className={`group cursor-pointer rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${
              data['userType'] === 'jobseeker'
                ? 'scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl ring-4 ring-blue-200'
                : 'bg-white/80 shadow-lg hover:scale-102 hover:bg-white'
            } `}
            onClick={() => handleRoleSelect('jobseeker')}
          >
            <div className="text-center">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
                  data['userType'] === 'jobseeker'
                    ? 'bg-white/20 shadow-lg'
                    : 'bg-gradient-to-br from-blue-400 to-blue-600 group-hover:scale-110 group-hover:shadow-xl'
                } `}
              >
                <svg
                  className={`h-10 w-10 transition-colors duration-300 ${
                    data['userType'] === 'jobseeker' ? 'text-white' : 'text-white'
                  } `}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3
                className={`mb-4 font-bold text-2xl ${
                  data['userType'] === 'jobseeker' ? 'text-white' : 'text-gray-800'
                }`}
              >
                I'm Looking for Jobs
              </h3>
              <p
                className={`mb-6 text-base leading-relaxed ${
                  data['userType'] === 'jobseeker' ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                Find your next career opportunity with AI-powered matching and career guidance
              </p>
              <ul
                className={`space-y-2 text-left text-sm ${
                  data['userType'] === 'jobseeker' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Career path recommendations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Skill development tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Personalized job matching
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Interview preparation tools
                </li>
              </ul>
            </div>
          </div>

          {/* Recruiter Option */}
          <div
            className={`group cursor-pointer rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${
              data['userType'] === 'recruiter'
                ? 'scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl ring-4 ring-green-200'
                : 'bg-white/80 shadow-lg hover:scale-102 hover:bg-white'
            } `}
            onClick={() => handleRoleSelect('recruiter')}
          >
            <div className="text-center">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
                  data['userType'] === 'recruiter'
                    ? 'bg-white/20 shadow-lg'
                    : 'bg-gradient-to-br from-green-400 to-green-600 group-hover:scale-110 group-hover:shadow-xl'
                } `}
              >
                <svg
                  className={`h-10 w-10 transition-colors duration-300 ${
                    data['userType'] === 'recruiter' ? 'text-white' : 'text-white'
                  } `}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3
                className={`mb-4 font-bold text-2xl ${
                  data['userType'] === 'recruiter' ? 'text-white' : 'text-gray-800'
                }`}
              >
                I'm Hiring Talent
              </h3>
              <p
                className={`mb-6 text-base leading-relaxed ${
                  data['userType'] === 'recruiter' ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                Discover exceptional candidates with intelligent screening and matching tools
              </p>
              <ul
                className={`space-y-2 text-left text-sm ${
                  data['userType'] === 'recruiter' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  AI-powered candidate matching
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Company profile optimization
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Streamlined hiring workflow
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Talent pipeline management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <button
          onClick={onSkip}
          className="font-medium text-gray-500 transition-colors duration-200 hover:text-gray-700"
          disabled={isLoading}
        >
          Skip Setup (Complete Later)
        </button>

        <div className="flex gap-4">
          <button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={`rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
              canProceed && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:from-blue-600 hover:to-blue-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-white border-b-2" />
                Saving...
              </>
            ) : (
              <>
                Continue Setup
                <svg
                  className="ml-2 inline h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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

      {/* Time Estimate */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">⏱️ This setup takes about 3-5 minutes to complete</p>
      </div>
    </div>
  );
}
