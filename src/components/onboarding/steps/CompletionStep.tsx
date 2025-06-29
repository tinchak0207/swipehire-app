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
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color:
          ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][
            Math.floor(Math.random() * 6)
          ] || '#ff6b6b',
        size: Math.random() * 10 + 5,
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
                animationDuration: '3s',
                top: '-10px',
              }}
            >
              <div
                className="animate-spin rounded-full"
                style={{
                  backgroundColor: piece.color,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  animationDuration: '2s',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="mb-12 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-black/10">
            <svg
              className="h-12 w-12 text-black"
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
          <h1 className="mb-4 font-bold text-4xl text-black">🎉 Welcome to SwipeHire!</h1>
          <p className="text-base-content/70 text-lg">
            Your profile is set up and you're ready to{' '}
            {isJobSeeker ? 'find your dream job' : 'discover amazing talent'}!
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Profile Summary */}
        <div className="card bg-white text-black">
          <div className="card-body">
            <h3 className="card-title text-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="text-sm">Completeness</span>
                <span className="font-semibold">{profileCompleteness}%</span>
              </div>
              <progress
                className="progress progress-success w-full"
                value={profileCompleteness}
                max="100"
              />
              <div className="text-base-content/60 text-xs">
                {isJobSeeker ? (
                  <>
                    ✓ Role: {data.userType}
                    <br />
                    {data.profileData.headline && '✓ Professional headline set'}
                    <br />
                    {data.profileData.skills?.length &&
                      `✓ ${data.profileData.skills.length} skills added`}
                  </>
                ) : (
                  <>
                    ✓ Role: {data.userType}
                    <br />
                    {data.profileData.companyName && `✓ Company: ${data.profileData.companyName}`}
                    <br />
                    {data.profileData.companyIndustry &&
                      `✓ Industry: ${data.profileData.companyIndustry}`}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="card bg-white text-black">
          <div className="card-body">
            <h3 className="card-title text-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="text-sm">Total Goals</span>
                <span className="font-semibold">{totalGoals}</span>
              </div>
              {totalGoals > 0 ? (
                <div className="space-y-1 text-base-content/60 text-xs">
                  {data.goals.shortTerm.length > 0 && (
                    <div>
                      🎯 {data.goals.shortTerm.length} short-term goal
                      {data.goals.shortTerm.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {data.goals.midTerm.length > 0 && (
                    <div>
                      📈 {data.goals.midTerm.length} mid-term goal
                      {data.goals.midTerm.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {data.goals.longTerm.length > 0 && (
                    <div>
                      🚀 {data.goals.longTerm.length} long-term goal
                      {data.goals.longTerm.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {data.goals.skillDevelopment.length > 0 && (
                    <div>
                      🧠 {data.goals.skillDevelopment.length} skill development goal
                      {data.goals.skillDevelopment.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-base-content/60 text-xs">
                  You can add goals anytime in your dashboard
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card mb-8 border border-primary/20 bg-primary/5">
        <div className="card-body">
          <h3 className="card-title text-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            What's Next?
          </h3>
          <div className="space-y-4">
            {isJobSeeker ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Explore Job Matches</h4>
                    <p className="text-base-content/60 text-sm">
                      Start swiping through personalized job recommendations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Track Your Progress</h4>
                    <p className="text-base-content/60 text-sm">
                      Monitor your goals and get AI-powered career insights
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Connect with Companies</h4>
                    <p className="text-base-content/60 text-sm">
                      Chat with recruiters and schedule interviews
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Post Job Openings</h4>
                    <p className="text-base-content/60 text-sm">
                      Create compelling job posts to attract top talent
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Review Candidates</h4>
                    <p className="text-base-content/60 text-sm">
                      Swipe through AI-matched candidate profiles
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Build Your Pipeline</h4>
                    <p className="text-base-content/60 text-sm">
                      Manage applications and track hiring progress
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="alert alert-info mb-8">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">💡 Pro Tip</h3>
          <div className="text-sm">
            {isJobSeeker
              ? 'Complete your profile with a video resume and portfolio links to stand out to recruiters!'
              : 'Add your company logo and detailed job descriptions to attract the best candidates!'}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button onClick={onComplete} disabled={isLoading} className="btn btn-primary btn-lg px-12">
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Finalizing...
            </>
          ) : (
            <>
              {isJobSeeker ? 'Start Job Hunting' : 'Start Hiring'}
              <svg className="ml-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <p className="text-base-content/50 text-sm">
          Welcome to the future of {isJobSeeker ? 'job searching' : 'recruiting'}! 🚀
        </p>
      </div>
    </div>
  );
}
