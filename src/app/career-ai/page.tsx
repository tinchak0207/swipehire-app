'use client';

import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

interface CareerQuestionnaireData {
  education: string;
  experience: string[];
  skills: string[];
  interests: string[];
  values: string[];
  careerExpectations: string;
}

import CareerDashboard from '@/components/career-ai/CareerDashboard';
import FormsAppSurvey from '@/components/career-ai/FormsAppSurvey';

export default function CareerAIPage() {
  const [userData, setUserData] = useState<CareerQuestionnaireData | null>(null);
  const [completedQuestionnaire, setCompletedQuestionnaire] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);

  const { fullBackendUser, fetchAndSetUserPreferences } = useUserPreferences();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoading(true);
        try {
          await fetchAndSetUserPreferences(user.uid);
        } catch (_error) {
          toast({
            title: 'Error loading profile',
            description: 'Failed to load user profile data',
            variant: 'destructive',
          });
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchAndSetUserPreferences, toast]);

  const handleLoginRequest = () => {
    // Implement login redirect logic
    setIsGuestMode(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out' });
    } catch (_error) {
      toast({ title: 'Logout Failed', description: 'Could not log out', variant: 'destructive' });
    }
  };

  const handleQuestionnaireSubmit = (data: CareerQuestionnaireData) => {
    setUserData(data);
    setCompletedQuestionnaire(true);
  };

  const handleSkipToDashboard = () => {
    // Create default data for users who want to skip the questionnaire
    const defaultData: CareerQuestionnaireData = {
      education: 'Not specified',
      experience: ['General experience'],
      skills: ['Communication', 'Problem solving'],
      interests: ['Career development'],
      values: ['Growth', 'Learning'],
      careerExpectations: 'Seeking career advancement opportunities',
    };
    setUserData(defaultData);
    setCompletedQuestionnaire(true);
  };

  const handleBackToQuestionnaire = () => {
    setCompletedQuestionnaire(false);
    setUserData(null);
  };

  const getUserDisplayName = () => {
    if (fullBackendUser?.name) return fullBackendUser.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email;
    return null;
  };

  const getUserPhotoURL = () => {
    if (fullBackendUser?.profileAvatarUrl) {
      if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
        return `${process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL']}${fullBackendUser.profileAvatarUrl}`;
      }
      return fullBackendUser.profileAvatarUrl;
    }
    return currentUser?.photoURL || null;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        isAuthenticated={!!currentUser}
        isGuestMode={isGuestMode}
        onLoginRequest={handleLoginRequest}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        userName={getUserDisplayName()}
        userPhotoURL={getUserPhotoURL()}
      />
      <main className="mx-auto max-w-6xl flex-grow px-4 py-4">
        {!completedQuestionnaire ? (
          <div className="space-y-6">
            {/* Career Planning Header - Top Left, Smaller */}
            <div className="mb-4 flex items-start justify-start">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 p-2 shadow-md">
                  <svg
                    className="h-8 w-8 text-primary drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h1 className="font-bold text-2xl text-black drop-shadow-sm">Career PlanningAI</h1>
              </div>
            </div>

            {/* Forms.app Survey - Clean Implementation */}
            <FormsAppSurvey onCompleteAction={handleQuestionnaireSubmit} />

            {/* Divider */}
            <div className="divider divider-primary">
              <span className="rounded-full border-2 border-primary/20 bg-primary px-6 py-3 font-bold text-white text-xl shadow-lg">
                OR
              </span>
            </div>

            {/* Direct Access Button */}
            <div className="card border-2 border-white/20 bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl">
              <div className="card-body p-8 text-center">
                <div className="mb-8 flex items-center justify-center space-x-4">
                  <div className="rounded-full border border-white/20 bg-white/30 p-4 shadow-lg backdrop-blur-sm">
                    <svg
                      className="h-14 w-14 text-white drop-shadow-md"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-black text-4xl text-white drop-shadow-xl">
                    Quick Access to Career Dashboard
                  </h2>
                </div>
                <p className="mx-auto mb-10 max-w-2xl font-semibold text-white text-xl drop-shadow-lg">
                  Skip the questionnaire and go directly to your career planning dashboard with
                  default recommendations.
                </p>
                <div className="card-actions justify-center">
                  <button
                    onClick={handleSkipToDashboard}
                    className="btn btn-lg border-white bg-white px-8 py-4 font-bold text-lg text-primary shadow-2xl transition-all duration-300 hover:scale-105 hover:border-white/90 hover:bg-white/90 hover:shadow-3xl"
                  >
                    <svg
                      className="mr-3 h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Go to Career Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : userData ? (
          <CareerDashboard
            userData={userData}
            onBackToQuestionnaire={
              userData.education === 'Not specified' ? handleBackToQuestionnaire : undefined
            }
            userName={getUserDisplayName()}
            userPhotoURL={getUserPhotoURL()}
          />
        ) : (
          <div className="alert alert-error">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Failed to Load Career Data</h3>
              <div className="text-xs">Please try refreshing the page or contact support.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
