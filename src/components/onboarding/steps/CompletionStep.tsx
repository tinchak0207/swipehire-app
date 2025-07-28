'use client';

import { useEffect, useState } from 'react';
import type { WizardData } from '../WizardContainer';

interface CompletionStepProps {
  data: WizardData;
  onComplete: () => void;
  showConfetti: boolean;
  isLoading: boolean;
}

export default function CompletionStep({
  data,
  onComplete,
  showConfetti,
  isLoading,
}: CompletionStepProps) {
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      color: string;
      size: number;
    }>
  >([]);

  const isJobSeeker = data.userType === 'jobseeker';

  // Generate confetti pieces
  useEffect(() => {
    if (showConfetti) {
      const pieces = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        color:
          ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'][
            Math.floor(Math.random() * 6)
          ] || '#2563eb',
        size: Math.random() * 12 + 6,
      }));
      setConfettiPieces(pieces);
    }
  }, [showConfetti]);

  const totalGoals = Object.values(data.goals).flat().length;
  const profileCompleteness = isJobSeeker
    ? (data.profileData.headline ? 25 : 0) +
      (data.profileData.experienceSummary ? 25 : 0) +
      (data.profileData.skills?.length ? 25 : 0) +
      (data.profileData.desiredWorkStyle ? 25 : 0)
    : (data.profileData.companyName ? 33 : 0) +
      (data.profileData.companyIndustry ? 33 : 0) +
      (data.profileData.companyDescription ? 34 : 0);

  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute animate-bounce"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: '4s',
                top: '-20px',
              }}
            >
              <div
                className="animate-spin rounded-full"
                style={{
                  backgroundColor: piece.color,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  animationDuration: '3s',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="mb-12 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-6 flex h-32 w-32 animate-pulse items-center justify-center rounded-full bg-blue-100 shadow-lg">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-200">
              <svg
                className="h-12 w-12 text-blue-700"
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
          </div>
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            🎉 Welcome to SwipeHire!
          </h1>
          <p className="mx-auto max-w-lg text-gray-600 text-lg">
            Your profile is set up and you're ready to{' '}
            <span className="font-semibold text-blue-600">
              {isJobSeeker ? 'find your dream job' : 'discover amazing talent'}!
            </span>
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Profile Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile Setup
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Completeness</span>
                <span className="font-semibold text-gray-900">{profileCompleteness}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-blue-600"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
              <div className="text-gray-600 text-sm">
                {isJobSeeker ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={data.userType ? 'text-gray-700' : 'text-gray-400'}>
                        ✓ Role: {data.userType || 'Not set'}
                      </span>
                    </div>
                    {data.profileData.headline && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-gray-700">
                          ✓ Professional headline set
                        </span>
                      </div>
                    )}
                    {data.profileData.skills?.length && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700">
                          ✓ {data.profileData.skills.length} skills added
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={data.userType ? 'text-gray-700' : 'text-gray-400'}>
                        ✓ Role: {data.userType || 'Not set'}
                      </span>
                    </div>
                    {data.profileData.companyName && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-gray-700">
                          ✓ Company: {data.profileData.companyName}
                        </span>
                      </div>
                    )}
                    {data.profileData.companyIndustry && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700">
                          ✓ Industry: {data.profileData.companyIndustry}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Goals Set
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Total Goals</span>
                <span className="font-semibold text-gray-900">{totalGoals}</span>
              </div>
              {totalGoals > 0 ? (
                <div className="space-y-2 text-gray-600 text-sm">
                  {data.goals.shortTerm.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span>
                        {data.goals.shortTerm.length} short-term goal
                        {data.goals.shortTerm.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {data.goals.midTerm.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      <span>
                        {data.goals.midTerm.length} mid-term goal
                        {data.goals.midTerm.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {data.goals.longTerm.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚀</span>
                      <span>
                        {data.goals.longTerm.length} long-term goal
                        {data.goals.longTerm.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {data.goals.skillDevelopment.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧠</span>
                      <span>
                        {data.goals.skillDevelopment.length} skill development goal
                        {data.goals.skillDevelopment.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 text-sm">
                  You can add goals anytime in your dashboard
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 font-semibold text-gray-900 text-lg">
          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          What's Next?
        </h3>
        <div className="space-y-5">
          {isJobSeeker ? (
            <>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Explore Job Matches</h4>
                  <p className="text-gray-600 text-sm">
                    Start swiping through personalized job recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Track Your Progress</h4>
                  <p className="text-gray-600 text-sm">
                    Monitor your goals and get AI-powered career insights
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Connect with Companies</h4>
                  <p className="text-gray-600 text-sm">
                    Chat with recruiters and schedule interviews
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Post Job Openings</h4>
                  <p className="text-gray-600 text-sm">
                    Create compelling job posts to attract top talent
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Review Candidates</h4>
                  <p className="text-gray-600 text-sm">
                    Swipe through AI-matched candidate profiles
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-semibold text-blue-700">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Build Your Pipeline</h4>
                  <p className="text-gray-600 text-sm">
                    Manage applications and track hiring progress
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <svg className="h-6 w-6 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900">💡 Pro Tip</h3>
            <div className="text-gray-600 text-sm">
              {isJobSeeker
                ? 'Complete your profile with a video resume and portfolio links to stand out to recruiters!'
                : 'Add your company logo and detailed job descriptions to attract the best candidates!'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button 
          onClick={onComplete} 
          disabled={isLoading} 
          className={`rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
            !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:from-blue-600 hover:to-blue-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-white border-b-2" />
              Finalizing...
            </>
          ) : (
            <>
              {isJobSeeker ? 'Start Job Hunting' : 'Start Hiring'}
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

      {/* Footer Message */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Welcome to the future of {isJobSeeker ? 'job searching' : 'recruiting'}! 🚀
        </p>
      </div>
    </div>
  );
}