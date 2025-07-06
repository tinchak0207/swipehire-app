'use client';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { TargetJobInfo, UserProfileData } from '@/lib/types/resume-optimizer';
import { fetchUserProfile, generateResumeFromProfile } from '@/services/resumeOptimizerService';

interface ProfileImportState {
  isLoading: boolean;
  error: string | null;
  profileData: UserProfileData | null;
  hasProfile: boolean;
}

/**
 * Import from profile page component
 * Handles importing resume data from user's SwipeHire profile
 */
const ResumeImportPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importState, setImportState] = useState<ProfileImportState>({
    isLoading: true,
    error: null,
    profileData: null,
    hasProfile: false,
  });

  // Check if user just completed onboarding
  const onboardingStatus = searchParams?.get('onboarding') || null;
  const [showOnboardingMessage, setShowOnboardingMessage] = useState(false);

  const [targetJob, setTargetJob] = useState<TargetJobInfo>({
    title: '',
    keywords: '',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadProfileData = useCallback(async (): Promise<void> => {
    setImportState((prev: ProfileImportState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const profileData = await fetchUserProfile();

      if (profileData) {
        setImportState({
          isLoading: false,
          error: null,
          profileData,
          hasProfile: true,
        });
      } else {
        setImportState({
          isLoading: false,
          error: null,
          profileData: null,
          hasProfile: false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setImportState({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load profile data. Please try again.',
        profileData: null,
        hasProfile: false,
      });
    }
  }, []);

  useEffect(() => {
    const handleOnboardingCompletion = async () => {
      if (onboardingStatus === 'completed') {
        setShowOnboardingMessage(true);

        // Clear the URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('onboarding');
        window.history.replaceState({}, '', newUrl.toString());

        // Try loading profile data with increasing delays
        let retries = 5;
        let success = false;

        while (retries > 0 && !success) {
          console.log(`Attempting to load profile data (${retries} retries remaining)`);
          await loadProfileData();

          // Check updated state for profile data
          await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state to update

          // Get fresh state
          const freshState = await new Promise<ProfileImportState>((resolve) => {
            setImportState((prev) => {
              resolve(prev);
              return prev;
            });
          });

          if (freshState.profileData) {
            console.log('Successfully loaded profile data');
            success = true;
          } else {
            const delay = (6 - retries) * 1000;
            console.log(`No profile data yet, waiting ${delay}ms before retrying`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries--;
          }
        }

        if (!success) {
          console.log('Failed to load profile data after all retries');
        }

        // Hide message after 5 seconds
        setTimeout(() => setShowOnboardingMessage(false), 5000);
      } else {
        // Normal profile data loading
        loadProfileData();
      }
    };

    handleOnboardingCompletion();
  }, [loadProfileData, onboardingStatus]);

  const handleRetry = useCallback((): void => {
    loadProfileData();
  }, [loadProfileData]);

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!importState.profileData || !targetJob.title.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const resumeText = generateResumeFromProfile(importState.profileData);

      // Store data in sessionStorage for the analysis page
      sessionStorage.setItem(
        'resumeOptimizerData',
        JSON.stringify({
          resumeText,
          targetJob,
          source: 'profile',
          profileData: importState.profileData,
        })
      );

      // Navigate to analysis page
      router.push('/resume-optimizer/analyze');
    } catch (error) {
      console.error('Error preparing analysis:', error);
      setImportState((prev: ProfileImportState) => ({
        ...prev,
        error: 'Failed to prepare resume for analysis. Please try again.',
      }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [importState.profileData, targetJob, router]);

  const handleInputChange = useCallback((field: keyof TargetJobInfo, value: string): void => {
    setTargetJob((prev: TargetJobInfo) => ({ ...prev, [field]: value }));
  }, []);

  if (importState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
              <p className="text-lg text-gray-600">Loading your profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/resume-optimizer" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Import from Profile</h1>
        </div>

        {/* Onboarding completion success message */}
        {showOnboardingMessage && (
          <div className="alert alert-success mb-8">
            <CheckCircleIcon className="w-5 h-5" />
            <div className="flex-1">
              <span className="font-semibold">Profile completed successfully!</span>
              <p className="text-sm mt-1">
                Your SwipeHire profile is now ready. We can now import your profile data for resume
                optimization.
              </p>
            </div>
            <button
              onClick={() => setShowOnboardingMessage(false)}
              className="btn btn-sm btn-ghost"
            >
              ×
            </button>
          </div>
        )}

        {/* Onboarding skipped message */}
        {onboardingStatus === 'skipped' && (
          <div className="alert alert-info mb-8">
            <InformationCircleIcon className="w-5 h-5" />
            <div className="flex-1">
              <span className="font-semibold">Onboarding skipped</span>
              <p className="text-sm mt-1">
                You can complete your profile later to use the import feature. For now, you can
                upload a resume file instead.
              </p>
            </div>
            <Link href="/onboarding" className="btn btn-sm btn-outline btn-info">
              Complete Profile
            </Link>
          </div>
        )}

        {importState.error && (
          <div className="alert alert-error mb-8">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <div className="flex-1">
              <span>{importState.error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="btn btn-sm btn-outline btn-error"
              disabled={importState.isLoading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Retry
            </button>
          </div>
        )}

        {!importState.hasProfile && !importState.error && (
          <div className="card bg-white shadow-lg mb-8">
            <div className="card-body text-center">
              <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Profile Data Found</h2>
              <p className="text-gray-600 mb-4">
                It looks like you haven't completed your SwipeHire profile yet. Complete your
                profile first to use this feature.
              </p>
              <Link href="/onboarding?returnTo=resume-optimizer-import" className="btn btn-primary">
                Complete Profile
              </Link>
            </div>
          </div>
        )}

        {importState.profileData && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Data Preview */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="card-title">Profile Data Found</h2>
                </div>

                {/* Personal Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">{importState.profileData.name}</h3>
                  <p className="text-gray-600">{importState.profileData.email}</p>
                  <p className="text-gray-600">{importState.profileData.phone}</p>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <div className="space-y-3">
                    {importState.profileData.experience.map((exp: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-gray-600">
                          {exp.company} • {exp.duration}
                        </p>
                        <p className="text-sm mt-1">{exp.description.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Education</h4>
                  <div className="space-y-2">
                    {importState.profileData.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-600">
                          {edu.school} • {edu.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {importState.profileData.skills.map((skill: string, index: number) => (
                      <span key={index} className="badge badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Job Section */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Target Job Information</h2>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Target Job Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Product Manager"
                    value={targetJob.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Keywords (comma-separated)</span>
                  </label>
                  <textarea
                    placeholder="e.g., Product Strategy, Agile, User Research, Analytics"
                    value={targetJob.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    className="textarea textarea-bordered w-full h-24"
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Add relevant skills and technologies from the job posting
                    </span>
                  </label>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-medium">Company (optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Google, Microsoft"
                    value={targetJob.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!importState.profileData || !targetJob.title.trim() || isAnalyzing}
                  className="btn btn-success w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Preparing Analysis...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>

                <div className="divider">OR</div>

                <Link href="/resume-optimizer/upload" className="btn btn-outline w-full">
                  Upload Different Resume
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeImportPage;
