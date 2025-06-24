'use client';

import { getRedirectResult, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  BookOpenText,
  Briefcase,
  DollarSign,
  FilePlus2,
  FileText,
  HeartHandshake,
  LayoutGrid,
  Loader2,
  Settings as SettingsIcon,
  UserCircle,
  UserCog,
  Users,
  Wand2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { OnboardingStepsModal } from '@/components/common/OnboardingStepsModal';
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar';
import { TopNotificationBanner } from '@/components/notifications/TopNotificationBanner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { mockNotifications } from '@/lib/mockData';
import type { BackendUser, NotificationItem, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';
const loadingComponent = () => (
  <div className="flex min-h-[calc(100vh-250px)] items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const CandidateDiscoveryPage = dynamic(
  () =>
    import('@/components/pages/CandidateDiscoveryPage').then((mod) => mod.CandidateDiscoveryPage),
  {
    loading: loadingComponent,
    ssr: false,
  }
);
const JobDiscoveryPage = dynamic(
  () => import('@/components/pages/JobDiscoveryPage').then((mod) => mod.JobDiscoveryPage),
  {
    loading: loadingComponent,
    ssr: false,
  }
);
const AiToolsPage = dynamic(
  () => import('@/components/pages/AiToolsPage').then((mod) => mod.AiToolsPage),
  { loading: loadingComponent, ssr: false }
);
const MatchesPage = dynamic(
  () => import('@/components/pages/MatchesPage').then((mod) => mod.MatchesPage),
  { loading: loadingComponent, ssr: false }
);
const SettingsPage = dynamic(
  () => import('@/components/pages/SettingsPage').then((mod) => mod.SettingsPage),
  { loading: loadingComponent, ssr: false }
);
const LoginPage = dynamic(
  () => import('@/components/pages/LoginPage').then((mod) => mod.LoginPage),
  { loading: loadingComponent, ssr: false }
);
const CreateJobPostingPage = dynamic(() => import('@/components/pages/CreateJobPostingPage'), {
  loading: loadingComponent,
  ssr: false,
});
const ManageJobPostingsPage = dynamic(
  () => import('@/components/pages/ManageJobPostingsPage').then((mod) => mod.ManageJobPostingsPage),
  { loading: loadingComponent, ssr: false }
);
const StaffDiaryPage = dynamic(
  () => import('@/components/pages/StaffDiaryPage').then((mod) => mod.StaffDiaryPage),
  { loading: loadingComponent, ssr: false }
);
const WelcomePage = dynamic(
  () => import('@/components/pages/WelcomePage').then((mod) => mod.WelcomePage),
  { loading: loadingComponent, ssr: false }
);
const MyProfilePage = dynamic(
  () => import('@/components/pages/MyProfilePage').then((mod) => mod.MyProfilePage),
  { loading: loadingComponent, ssr: false }
);
const RecruiterOnboardingPage = dynamic(() => import('@/app/recruiter-onboarding/page'), {
  loading: loadingComponent,
  ssr: false,
});
const MarketSalaryTypeformPage = dynamic(
  () => import('@/components/pages/MarketSalaryTypeformPage'),
  {
    loading: loadingComponent,
    ssr: false,
  }
);
const ResumeOptimizerPage = dynamic(() => import('@/app/resume-optimizer/page'), {
  loading: loadingComponent,
  ssr: false,
});

const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcomeV2';
const GUEST_MODE_KEY = 'isGuestModeActive';
const DISMISSED_BANNER_NOTIF_ID_KEY = 'dismissedBannerNotificationId';
const HAS_SEEN_ONBOARDING_MODAL_KEY = 'hasSeenSwipeHireOnboardingV1';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('findJobs');
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerNotification, setBannerNotification] = useState<NotificationItem | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const {
    mongoDbUserId,
    setMongoDbUserId,
    preferences,
    fullBackendUser,
    fetchAndSetUserPreferences,
    updateFullBackendUserFields,
  } = useUserPreferences();

  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);
  const [profileSetupStep, setProfileSetupStep] = useState<'role' | null>(null);
  const hasScrolledAndModalTriggeredRef = useRef(false);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [firebaseAuthStateResolved, setFirebaseAuthStateResolved] = useState(false);
  const [firebaseRedirectResultResolved, setFirebaseRedirectResultResolved] = useState(false);

  const [isGuestModeActive, setIsGuestModeActive] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      setIsGuestModeActive(localStorage.getItem(GUEST_MODE_KEY) === 'true');
      setHasSeenWelcome(localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true');
    }
  }, [hasMounted]);

  useEffect(() => {
    if (
      hasMounted &&
      preferences.notificationChannels?.inAppBanner &&
      preferences.isLoading === false &&
      fullBackendUser?.selectedRole !== null &&
      fullBackendUser?.selectedRole !== undefined
    ) {
      const latestUnreadUrgent = mockNotifications
        .filter(
          (n) =>
            !n.read && n.isUrgent && localStorage.getItem(DISMISSED_BANNER_NOTIF_ID_KEY) !== n.id
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const latestUnreadNormal = mockNotifications
        .filter(
          (n) =>
            !n.read && !n.isUrgent && localStorage.getItem(DISMISSED_BANNER_NOTIF_ID_KEY) !== n.id
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      setBannerNotification(latestUnreadUrgent || latestUnreadNormal || null);
    } else {
      setBannerNotification(null);
    }
  }, [preferences.notificationChannels, preferences.isLoading, fullBackendUser, hasMounted]);

  const handleDismissBanner = (notificationId: string) => {
    setBannerNotification(null);
    if (hasMounted) {
      localStorage.setItem(DISMISSED_BANNER_NOTIF_ID_KEY, notificationId);
    }
  };

  const fetchUserFromBackendAndSetContext = useCallback(
    async (
      firebaseUid: string,
      firebaseDisplayName?: string | null,
      firebaseEmail?: string | null
    ): Promise<string | null> => {
      console.log(
        '[AppContent] fetchUserFromBackendAndSetContext called with firebaseUid:',
        firebaseUid
      );
      console.log('[AppContent] Backend URL:', CUSTOM_BACKEND_URL);

      // Check if backend URL is available
      if (!CUSTOM_BACKEND_URL || CUSTOM_BACKEND_URL === 'undefined') {
        console.error('[AppContent] Backend URL is not configured properly:', CUSTOM_BACKEND_URL);
        toast({
          title: 'Configuration Error',
          description: 'Backend service is not configured.',
          variant: 'destructive',
        });
        return null;
      }

      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${firebaseUid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        console.log('[AppContent] Backend response status:', response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log('[AppContent] Backend response data:', responseData);

          // Handle both direct user object and wrapped response
          const userData: BackendUser = responseData.user || responseData;

          if (userData?._id) {
            console.log('[AppContent] Setting mongoDbUserId to:', userData._id);
            setMongoDbUserId(userData._id);
            updateFullBackendUserFields(userData);
            return userData._id;
          }
          console.error('[AppContent] User data missing _id:', userData);
          toast({
            title: 'Profile Error',
            description: 'User profile data is incomplete.',
            variant: 'destructive',
          });
          return null;
        }
        if (response.status === 404) {
          console.log('[AppContent] User not found, creating new user...');
          const createUserResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: firebaseDisplayName || firebaseEmail || 'New User',
              email: firebaseEmail,
              firebaseUid: firebaseUid,
              preferences: { theme: 'light', featureFlags: {} },
            }),
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          console.log('[AppContent] Create user response status:', createUserResponse.status);

          if (createUserResponse.ok) {
            const responseData = await createUserResponse.json();
            console.log('[AppContent] Create user response data:', responseData);

            const createdUser = responseData.user || responseData;
            if (createdUser?._id) {
              console.log(
                '[AppContent] Setting mongoDbUserId to newly created user:',
                createdUser._id
              );
              setMongoDbUserId(createdUser._id);
              updateFullBackendUserFields(createdUser);
              toast({
                title: 'Profile Initialized',
                description: 'Your basic profile has been set up.',
              });
              return createdUser._id;
            }
            console.error(
              'Failed to create user in MongoDB: User object or _id missing',
              responseData
            );
            toast({
              title: 'Profile Creation Failed',
              description: 'Could not initialize profile: backend error.',
              variant: 'destructive',
            });
            setMongoDbUserId(null);
            updateFullBackendUserFields(null);
            return null;
          }
          const errorData = await createUserResponse.json().catch(() => ({}));
          console.error(
            'Failed to create user in MongoDB:',
            errorData.message || createUserResponse.statusText
          );
          toast({
            title: 'Profile Creation Failed',
            description: `Could not initialize profile: ${errorData.message || 'Please try again.'}`,
            variant: 'destructive',
          });
          setMongoDbUserId(null);
          updateFullBackendUserFields(null);
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error(
          'Error fetching user from MongoDB (non-404):',
          errorData.message || response.statusText
        );
        toast({
          title: 'Error Loading Profile',
          description: 'Could not load profile data.',
          variant: 'destructive',
        });
        setMongoDbUserId(null);
        updateFullBackendUserFields(null);
        return null;
      } catch (error: any) {
        console.error(
          '[AppContent] Error in fetchUserFromBackendAndSetContext (catch block):',
          error
        );
        toast({
          title: 'Network/Backend Error',
          description: error.message || 'Could not connect to backend.',
          variant: 'destructive',
        });
        setMongoDbUserId(null);
        updateFullBackendUserFields(null);
        return null;
      }
    },
    [setMongoDbUserId, toast, updateFullBackendUserFields]
  );

  useEffect(() => {
    console.log('[AppContent] Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        '[AppContent] Auth state changed. User:',
        user ? `${user.uid} (${user.email})` : 'null'
      );
      setCurrentUser(user);
      if (user) {
        console.log('[AppContent] User is authenticated, fetching from backend...');
        try {
          const currentMongoId = await fetchUserFromBackendAndSetContext(
            user.uid,
            user.displayName,
            user.email
          );
          console.log('[AppContent] Backend fetch result - mongoId:', currentMongoId);
          if (
            currentMongoId &&
            hasMounted &&
            localStorage.getItem(HAS_SEEN_ONBOARDING_MODAL_KEY) !== 'true' &&
            !isGuestModeActive
          ) {
            setShowOnboardingModal(true);
          }
        } catch (error) {
          console.error('[AppContent] Error in fetchUserFromBackendAndSetContext:', error);
          // Ensure we don't leave the user in a loading state
          setMongoDbUserId(null);
          updateFullBackendUserFields(null);
        }
      } else {
        console.log('[AppContent] User is not authenticated, clearing context...');
        setMongoDbUserId(null);
        updateFullBackendUserFields(null);
      }
      setFirebaseAuthStateResolved(true);
    });

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('[AppContent] Redirect result user:', result.user.uid);
          toast({
            title: 'Signed In Successfully!',
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
        }
      })
      .catch((error) => {
        console.error('[AppContent] Error during getRedirectResult:', error);
        toast({
          title: 'Sign-In Issue During Redirect',
          description: error.message || 'Could not complete sign-in after redirect.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setFirebaseRedirectResultResolved(true);
      });

    return () => {
      unsubscribe();
    };
  }, [
    fetchUserFromBackendAndSetContext,
    setMongoDbUserId,
    toast,
    updateFullBackendUserFields,
    hasMounted,
    isGuestModeActive,
  ]);

  const handleCloseOnboardingModal = () => {
    setShowOnboardingModal(false);
    if (hasMounted) {
      localStorage.setItem(HAS_SEEN_ONBOARDING_MODAL_KEY, 'true');
    }
  };

  useEffect(() => {
    if (fullBackendUser) {
      setUserName(
        fullBackendUser.name ||
          fullBackendUser.email ||
          currentUser?.displayName ||
          currentUser?.email ||
          'User'
      );
      let finalPhotoURL = currentUser?.photoURL || null;

      console.log('[AppContent] Setting user photo URL:', {
        currentUserPhotoURL: currentUser?.photoURL,
        backendProfileAvatarUrl: fullBackendUser.profileAvatarUrl,
        backendUrl: CUSTOM_BACKEND_URL,
      });

      if (fullBackendUser.profileAvatarUrl) {
        if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
          finalPhotoURL = `${CUSTOM_BACKEND_URL}${fullBackendUser.profileAvatarUrl}`;
          console.log('[AppContent] Using backend avatar URL:', finalPhotoURL);
        } else {
          finalPhotoURL = fullBackendUser.profileAvatarUrl;
          console.log('[AppContent] Using direct avatar URL:', finalPhotoURL);
        }
      } else if (currentUser?.photoURL) {
        console.log('[AppContent] Using Firebase avatar URL:', currentUser.photoURL);
      } else {
        console.log('[AppContent] No avatar URL available, will show fallback');
      }

      setUserPhotoURL(finalPhotoURL);
    } else if (!mongoDbUserId && !currentUser) {
      setUserName(null);
      setUserPhotoURL(null);
    }
  }, [fullBackendUser, currentUser, mongoDbUserId]);

  useEffect(() => {
    if (firebaseAuthStateResolved && firebaseRedirectResultResolved) {
      setIsAppLoading(false);
    }
  }, [firebaseAuthStateResolved, firebaseRedirectResultResolved]);

  // Ensure loading state is resolved after logout
  useEffect(() => {
    if (!currentUser && firebaseAuthStateResolved && !isGuestModeActive) {
      setIsAppLoading(false);
    }
  }, [currentUser, firebaseAuthStateResolved, isGuestModeActive]);

  useEffect(() => {
    if (isAppLoading || !hasMounted) {
      return;
    }

    if (currentUser && mongoDbUserId && !showOnboardingModal) {
      if (typeof window !== 'undefined') localStorage.removeItem(GUEST_MODE_KEY);
      setIsGuestModeActive(false);
      setShowWelcomePage(false);
    } else if (isGuestModeActive) {
      setShowWelcomePage(false);
      if (!currentUser) {
        setCurrentUser({
          uid: 'guest-user',
          email: 'guest@example.com',
          displayName: 'Guest User',
          emailVerified: false,
          isAnonymous: true,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
          },
          phoneNumber: null,
          photoURL: null,
          providerData: [],
          providerId: 'guest',
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({}) as any,
          reload: async () => {},
          toJSON: () => ({
            uid: 'guest-user',
            email: 'guest@example.com',
            displayName: 'Guest User',
          }),
        } as User);
      }
    } else if (!showOnboardingModal) {
      setShowWelcomePage(!hasSeenWelcome);
    }
  }, [
    isAppLoading,
    currentUser,
    mongoDbUserId,
    isGuestModeActive,
    hasSeenWelcome,
    hasMounted,
    showOnboardingModal,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        currentUser &&
        mongoDbUserId &&
        fullBackendUser &&
        !isGuestModeActive &&
        !hasScrolledAndModalTriggeredRef.current &&
        preferences.isLoading === false &&
        !fullBackendUser.selectedRole &&
        !showOnboardingModal
      ) {
        setProfileSetupStep('role');
        setIsProfileSetupModalOpen(true);
        hasScrolledAndModalTriggeredRef.current = true;
      } else if (
        currentUser &&
        mongoDbUserId &&
        fullBackendUser?.selectedRole &&
        !hasScrolledAndModalTriggeredRef.current
      ) {
        hasScrolledAndModalTriggeredRef.current = true;
      }
    };

    if (
      hasMounted &&
      currentUser &&
      mongoDbUserId &&
      preferences.isLoading === false &&
      fullBackendUser &&
      !showOnboardingModal
    ) {
      const needsRoleSetup = !fullBackendUser.selectedRole;
      if (needsRoleSetup && !hasScrolledAndModalTriggeredRef.current) {
        window.addEventListener('scroll', handleScroll, { once: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }
      if (!needsRoleSetup) {
        hasScrolledAndModalTriggeredRef.current = true;
      }
    }

    // Return undefined explicitly for cases where no cleanup is needed
    return undefined;
  }, [
    currentUser,
    mongoDbUserId,
    fullBackendUser,
    preferences.isLoading,
    isGuestModeActive,
    hasMounted,
    showOnboardingModal,
  ]);

  useEffect(() => {
    if (
      isAppLoading ||
      preferences.isLoading !== false ||
      (currentUser && !isGuestModeActive && !fullBackendUser) ||
      showOnboardingModal
    ) {
      return;
    }

    // Check if onboarding was just completed to prevent redirect loops
    const onboardingJustCompleted =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('onboardingJustCompleted') === 'true'
        : false;

    if (
      currentUser &&
      !isGuestModeActive &&
      fullBackendUser?.selectedRole === 'recruiter' &&
      fullBackendUser?.companyProfileComplete === false
    ) {
      if (pathname !== '/recruiter-onboarding') {
        // Don't redirect if onboarding was just completed
        if (onboardingJustCompleted) {
          console.log('[AppContent] Onboarding just completed, clearing flag and not redirecting');
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('onboardingJustCompleted');
          }
          return;
        }

        if (typeof window !== 'undefined') {
          const skippedOnce = sessionStorage.getItem('skippedRecruiterOnboardingOnce');
          if (skippedOnce === 'true') {
            sessionStorage.removeItem('skippedRecruiterOnboardingOnce');
            return;
          }
        }
        console.log('[AppContent] Redirecting to recruiter onboarding');
        router.push('/recruiter-onboarding');
        return;
      }
    }

    if (pathname === '/recruiter-onboarding') {
      if (isGuestModeActive || !currentUser) {
        console.log('[AppContent] Redirecting from onboarding page - no user or guest mode');
        router.push('/');
        return;
      }
      if (
        fullBackendUser?.selectedRole !== 'recruiter' ||
        fullBackendUser?.companyProfileComplete === true
      ) {
        console.log(
          '[AppContent] Redirecting from onboarding page - not recruiter or profile complete'
        );
        router.push('/');
        return;
      }
    }
  }, [
    isAppLoading,
    pathname,
    currentUser,
    fullBackendUser,
    preferences.isLoading,
    router,
    isGuestModeActive,
    showOnboardingModal,
  ]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    if (hasMounted) {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }

    // Return undefined explicitly for cases where no cleanup is needed
    return undefined;
  }, [hasMounted]);

  const handleStartExploring = useCallback(() => {
    if (hasMounted) {
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    }
    setHasSeenWelcome(true);
    setShowWelcomePage(false);
  }, [hasMounted]);

  const handleLoginBypass = useCallback(async () => {
    const mockUid = `mock-bypass-user-${Date.now()}`;
    const mockUserInstance: User = {
      uid: mockUid,
      email: 'dev.user@example.com',
      displayName: 'Dev User (Bypass)',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      phoneNumber: null,
      photoURL: null,
      providerData: [],
      providerId: 'firebase',
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: () => Promise.resolve(),
      getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () =>
        Promise.resolve({
          token: 'mock-id-token',
          expirationTime: '',
          authTime: '',
          issuedAtTime: '',
          signInProvider: null,
          signInSecondFactor: null,
          claims: {},
        }),
      reload: () => Promise.resolve(),
      toJSON: () => ({
        uid: mockUid,
        email: 'dev.user@example.com',
        displayName: 'Dev User (Bypass)',
      }),
    };

    if (hasMounted) {
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
      localStorage.removeItem(GUEST_MODE_KEY);
      localStorage.setItem(HAS_SEEN_ONBOARDING_MODAL_KEY, 'true');
    }
    setHasSeenWelcome(true);
    setIsGuestModeActive(false);
    setShowOnboardingModal(false);

    setCurrentUser(mockUserInstance);
    setFirebaseAuthStateResolved(true);
    setFirebaseRedirectResultResolved(true);

    await fetchUserFromBackendAndSetContext(
      mockUid,
      mockUserInstance.displayName,
      mockUserInstance.email
    );
    toast({ title: 'Dev Bypass Active', description: 'Proceeding with a mock development user.' });
  }, [fetchUserFromBackendAndSetContext, toast, hasMounted]);

  const activateGuestMode = useCallback(async () => {
    if (hasMounted) {
      localStorage.setItem(GUEST_MODE_KEY, 'true');
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
      localStorage.setItem(HAS_SEEN_ONBOARDING_MODAL_KEY, 'true');
    }
    setIsGuestModeActive(true);
    setHasSeenWelcome(true);
    setShowOnboardingModal(false);

    setCurrentUser(null);
    setMongoDbUserId(null);
    updateFullBackendUserFields(null);

    setFirebaseAuthStateResolved(true);
    setFirebaseRedirectResultResolved(true);

    toast({ title: 'Guest Mode Activated', description: 'You are browsing as a guest.' });
  }, [setMongoDbUserId, toast, hasMounted, updateFullBackendUserFields]);

  const handleGuestMode = useCallback(() => {
    activateGuestMode();
  }, [activateGuestMode]);

  const handleRoleSelect = async (role: UserRole, currentMongoId?: string | null) => {
    const idToUse = currentMongoId || mongoDbUserId;
    if (isGuestModeActive || !currentUser || !idToUse) {
      toast({
        title: 'Error',
        description: 'Action requires login and profile.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/proxy/users/${idToUse}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRole: role,
          name: fullBackendUser?.name || currentUser.displayName,
          email: fullBackendUser?.email || currentUser.email,
        }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `Failed to save role. Status: ${response.status}` }));
        throw new Error(errorData.message);
      }

      const savedUserData = await response.json();
      if (savedUserData.user) {
        updateFullBackendUserFields(savedUserData.user);
        await fetchAndSetUserPreferences(idToUse);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userSelectedRole', role);
        }
      }

      const companyProfileIsComplete =
        role === 'recruiter' && savedUserData.user?.companyProfileComplete;

      if (role === 'recruiter' && !companyProfileIsComplete) {
        toast({
          title: 'Role Set to Recruiter',
          description: 'Please complete your company profile. You might be redirected.',
          duration: 8000,
        });
      } else if (role === 'recruiter' && companyProfileIsComplete) {
        toast({ title: 'Role Set to Recruiter', description: 'Your company profile is complete.' });
      } else if (role === 'jobseeker') {
        toast({
          title: 'Role Set to Job Seeker',
          description: "Welcome! You can fill out your detailed profile in 'My Profile'.",
          duration: 7000,
        });
      } else {
        toast({ title: 'Role Selected', description: `You are now a ${role}.` });
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error Saving Role',
        description: error.message || 'Could not save role selection.',
        variant: 'destructive',
      });
    }
    setIsProfileSetupModalOpen(false);
    hasScrolledAndModalTriggeredRef.current = true;
  };

  const handleLogout = async () => {
    try {
      console.log('[AppContent] Starting logout process...');

      await signOut(auth);

      if (hasMounted) {
        localStorage.removeItem(GUEST_MODE_KEY);
        localStorage.removeItem('mongoDbUserId');
        localStorage.removeItem(HAS_SEEN_WELCOME_KEY);
        localStorage.removeItem(DISMISSED_BANNER_NOTIF_ID_KEY);
        localStorage.removeItem(HAS_SEEN_ONBOARDING_MODAL_KEY);
        sessionStorage.removeItem('skippedRecruiterOnboardingOnce');
      }

      // Reset all user-related state
      setIsGuestModeActive(false);
      setHasSeenWelcome(false);
      setShowOnboardingModal(false);
      setMongoDbUserId(null);
      updateFullBackendUserFields(null);
      setUserName(null);
      setUserPhotoURL(null);
      setActiveTab('findJobs');
      hasScrolledAndModalTriggeredRef.current = false;

      // Immediately show welcome page and ensure loading is resolved
      setShowWelcomePage(true);

      console.log('[AppContent] Logout process completed, showing welcome page');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ title: 'Logout Failed', description: 'Could not log out.', variant: 'destructive' });
    }
  };

  const handleLoginRequest = () => {
    if (hasMounted) {
      localStorage.removeItem(GUEST_MODE_KEY);
    }
    setIsGuestModeActive(false);
    setShowOnboardingModal(false);

    setCurrentUser(null);
    setMongoDbUserId(null);
    updateFullBackendUserFields(null);
    setFirebaseAuthStateResolved(false);
    setFirebaseRedirectResultResolved(false);

    setShowWelcomePage(false);
    setIsAppLoading(true);
  };

  const baseTabItems = [
    {
      value: 'salaryEnquiry',
      label: 'Market Salary Inquiry',
      icon: DollarSign,
      component: <MarketSalaryTypeformPage />,
      description: 'Research market salary data and compensation trends',
      isNew: true,
      shortcut: '⌘S',
    },
    {
      value: 'resumeOptimizer',
      label: 'Resume Optimization tools',
      icon: FileText,
      component: <ResumeOptimizerPage />,
      description:
        'AI-powered resume analysis, ATS optimization, and personalized suggestions to boost your job prospects',
      isNew: true,
      shortcut: '⌘R',
    },
    {
      value: 'aiTools',
      label: 'AI Tools',
      icon: Wand2,
      component: (
        <AiToolsPage
          isGuestMode={isGuestModeActive}
          currentUserRole={fullBackendUser?.selectedRole || null}
        />
      ),
      description: 'AI-powered career and recruitment tools',
      isNew: true,
      shortcut: '⌘T',
    },
    {
      value: 'myMatches',
      label: 'My Matches',
      icon: HeartHandshake,
      component: <MatchesPage isGuestMode={isGuestModeActive} />,
      description: 'View and manage your job matches',
      badge:
        mockNotifications.filter((n) => n.type === 'new_message' && !n.read).length > 0
          ? mockNotifications.filter((n) => n.type === 'new_message' && !n.read).length
          : undefined,
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: UserCog,
      component: (
        <SettingsPage
          isGuestMode={isGuestModeActive}
          currentUserRole={fullBackendUser?.selectedRole || null}
        />
      ),
      description: 'Account settings and preferences',
      shortcut: '⌘,',
    },
  ];
  const recruiterTabItems = [
    {
      value: 'findTalent',
      label: 'Find Talent',
      icon: Users,
      component: (
        <CandidateDiscoveryPage
          searchTerm={searchTerm}
          key={`cand-discovery-${fullBackendUser?.selectedRole}-${mongoDbUserId}`}
          isGuestMode={isGuestModeActive}
        />
      ),
      description: 'Discover and connect with top talent',
      shortcut: '⌘F',
    },
    {
      value: 'postJob',
      label: 'Post a Job',
      icon: FilePlus2,
      component: <CreateJobPostingPage isGuestMode={isGuestModeActive} />,
      description: 'Create and publish job openings',
      shortcut: '⌘N',
    },
    {
      value: 'manageJobs',
      label: 'Manage Jobs',
      icon: SettingsIcon,
      component: <ManageJobPostingsPage isGuestMode={isGuestModeActive} />,
      description: 'Track and manage your job postings',
      shortcut: '⌘M',
    },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    {
      value: 'findJobs',
      label: 'Find Jobs',
      icon: Briefcase,
      component: (
        <JobDiscoveryPage
          searchTerm={searchTerm}
          key={`job-discovery-${fullBackendUser?.selectedRole}-${mongoDbUserId}`}
        />
      ),
      description: 'Discover exciting job opportunities',
      shortcut: '⌘J',
    },
    {
      value: 'myProfile',
      label: 'My Profile',
      icon: UserCircle,
      component: <MyProfilePage isGuestMode={isGuestModeActive} />,
      description: 'Manage your professional profile',
      shortcut: '⌘P',
    },
    {
      value: 'myDiary',
      label: 'My Diary',
      icon: BookOpenText,
      component: (
        <StaffDiaryPage
          isGuestMode={isGuestModeActive}
          currentUserName={userName}
          currentUserMongoId={mongoDbUserId}
          currentUserAvatarUrl={userPhotoURL}
        />
      ),
      description: 'Share your professional journey',
      shortcut: '⌘D',
    },
    ...baseTabItems,
  ];

  const currentRoleForTabs = fullBackendUser?.selectedRole;
  let currentTabItems = jobseekerTabItems;

  if (!isGuestModeActive && currentUser && currentRoleForTabs === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestModeActive && currentUser && currentRoleForTabs === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  } else if (isGuestModeActive) {
    currentTabItems = jobseekerTabItems;
  }

  useEffect(() => {
    if (isAppLoading || preferences.isLoading !== false || !hasMounted) return;

    const itemsForCurrentContext = isGuestModeActive
      ? jobseekerTabItems
      : currentUser && currentRoleForTabs === 'recruiter'
        ? recruiterTabItems
        : jobseekerTabItems;
    const validTabValues = itemsForCurrentContext.map((item) => item.value);

    let defaultTabForCurrentContext = 'findJobs';
    if (!isGuestModeActive && currentUser && currentRoleForTabs === 'recruiter') {
      defaultTabForCurrentContext = 'findTalent';
    }

    if (
      !validTabValues.includes(activeTab) ||
      (currentRoleForTabs === 'recruiter' && activeTab === 'findJobs') ||
      (currentRoleForTabs === 'jobseeker' && activeTab === 'findTalent') ||
      (isGuestModeActive && activeTab === 'findTalent')
    ) {
      setActiveTab(defaultTabForCurrentContext);
    }
  }, [
    currentRoleForTabs,
    isGuestModeActive,
    currentUser,
    isAppLoading,
    activeTab,
    jobseekerTabItems,
    recruiterTabItems,
    preferences.isLoading,
    hasMounted,
  ]);

  const mainContentRender = () => {
    if (!hasMounted) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          {' '}
          <Loader2 className="h-16 w-16 animate-spin text-primary" />{' '}
        </div>
      );
    }

    if (isAppLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          {' '}
          <Loader2 className="h-16 w-16 animate-spin text-primary" />{' '}
        </div>
      );
    }

    if (currentUser && !isGuestModeActive && preferences.isLoading !== false) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          {' '}
          <Loader2 className="h-16 w-16 animate-spin text-primary" />{' '}
        </div>
      );
    }

    if (pathname === '/recruiter-onboarding') {
      if (
        currentUser &&
        !isGuestModeActive &&
        fullBackendUser?.selectedRole === 'recruiter' &&
        fullBackendUser?.companyProfileComplete === false
      ) {
        return <RecruiterOnboardingPage />;
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          {' '}
          <Loader2 className="h-16 w-16 animate-spin text-primary" />{' '}
        </div>
      );
    }

    if (showOnboardingModal && !isGuestModeActive) {
      return (
        <OnboardingStepsModal isOpen={showOnboardingModal} onClose={handleCloseOnboardingModal} />
      );
    }

    if (showWelcomePage) {
      return (
        <WelcomePage
          key="welcome_page_wrapper"
          onStartExploring={handleStartExploring}
          onGuestMode={handleGuestMode}
        />
      );
    }
    if (!currentUser && !isGuestModeActive) {
      return (
        <div className="animate-fadeInPage" key="login_page_wrapper">
          {' '}
          <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />{' '}
        </div>
      );
    }

    const mainAppContainerClasses = cn(
      'flex min-h-screen w-full bg-background',
      bannerNotification ? 'pt-16 sm:pt-[72px]' : ''
    );

    return (
      <SidebarProvider>
        <div className={mainAppContainerClasses}>
          <TopNotificationBanner
            notification={bannerNotification}
            onDismiss={handleDismissBanner}
          />

          {/* Enhanced Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTabAction={setActiveTab}
            tabItems={currentTabItems}
            currentUserRole={fullBackendUser?.selectedRole || null}
            isGuestMode={isGuestModeActive}
            userName={userName}
            userPhotoURL={userPhotoURL}
            onLogout={handleLogout}
            onProfileClick={() => setActiveTab('myProfile')}
            onSearch={setSearchTerm}
            notificationCount={mockNotifications.filter((n) => !n.read).length}
            profileCompletion={fullBackendUser?.profileCompletion || 0}
          />

          {/* Main Content Area */}
          <SidebarInset className="flex-1">
            {/* Header with sidebar trigger */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger className="-ml-1" />
              <div className="flex flex-1 items-center gap-2">
                <AppHeader
                  isAuthenticated={!!currentUser}
                  isGuestMode={isGuestModeActive}
                  onLoginRequest={handleLoginRequest}
                  onLogout={handleLogout}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  userName={userName}
                  userPhotoURL={userPhotoURL}
                  className="border-0 bg-transparent shadow-none"
                />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 flex-col p-4 md:p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex w-full flex-grow flex-col"
              >
                {/* Mobile Navigation - Show only on mobile */}
                {isMobile && (
                  <MobileNavMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabItems={currentTabItems}
                  />
                )}

                {/* Tab Content */}
                {currentTabItems.map((item) => (
                  <TabsContent
                    key={item.value}
                    value={item.value}
                    className="mt-0 flex flex-grow flex-col"
                  >
                    {React.cloneElement(item.component, {
                      ...((item.value === 'findTalent' || item.value === 'findJobs') && {
                        searchTerm,
                      }),
                      isGuestMode: isGuestModeActive,
                      ...(item.value === 'settings' && {
                        currentUserRole: fullBackendUser?.selectedRole || null,
                      }),
                      ...(item.value === 'aiTools' && {
                        currentUserRole: fullBackendUser?.selectedRole || null,
                      }),
                      ...(item.value === 'salaryEnquiry' && {
                        currentUserRole: fullBackendUser?.selectedRole || null,
                      }),
                      ...(item.value === 'myDiary' && {
                        currentUserName: userName,
                        currentUserMongoId: mongoDbUserId,
                        currentUserAvatarUrl: userPhotoURL,
                      }),
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </main>

            {/* Footer */}
            <footer className="border-t bg-background/95 p-4 text-center text-muted-foreground text-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4">
                <div
                  className="trustpilot-widget"
                  data-locale="en-US"
                  data-template-id="56278e9abfbbba0bdcd568bc"
                  data-businessunit-id="6840338e0d1dfb766b149a4b"
                  data-style-height="52px"
                  data-style-width="100%"
                >
                  <a
                    href="https://www.trustpilot.com/review/studio--swipehire-3bscz.us-central1.hosted.app"
                    target="_blank"
                    rel="noopener"
                  >
                    Trustpilot
                  </a>
                </div>
              </div>
              <div className="mb-1 flex items-center justify-center gap-x-4">
                <span className="cursor-pointer hover:text-primary">Privacy Policy</span>
                <span className="cursor-pointer hover:text-primary">Terms of Service</span>
                <span className="cursor-pointer hover:text-primary">AI Ethics</span>
              </div>
              <div>© {new Date().getFullYear()} SwipeHire. All rights reserved.</div>
            </footer>
          </SidebarInset>

          {/* Profile Setup Modal */}
          <Dialog
            open={isProfileSetupModalOpen}
            onOpenChange={(open) => {
              if (!open && profileSetupStep === 'role') {
                hasScrolledAndModalTriggeredRef.current = false;
              }
              setIsProfileSetupModalOpen(open);
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{profileSetupStep === 'role' && 'Choose Your Path'}</DialogTitle>
                <DialogDescription>
                  {profileSetupStep === 'role' &&
                    "To tailor your experience, please tell us if you're primarily here to hire or to find a job."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {profileSetupStep === 'role' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="group flex h-auto flex-col items-start py-4 text-left hover:bg-primary/5"
                      onClick={() => {
                        handleRoleSelect('recruiter', mongoDbUserId);
                      }}
                    >
                      <Users className="mb-2 h-6 w-6 text-orange-500 group-hover:text-orange-600" />
                      <span className="font-semibold text-foreground">I'm Hiring (Recruiter)</span>
                      <span className="text-muted-foreground text-xs">
                        Post jobs and find top talent.
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="group flex h-auto flex-col items-start py-4 text-left hover:bg-primary/5"
                      onClick={() => {
                        handleRoleSelect('jobseeker', mongoDbUserId);
                      }}
                    >
                      <Briefcase className="mb-2 h-6 w-6 text-blue-500 group-hover:text-blue-600" />
                      <span className="font-semibold text-foreground">I'm Job Hunting</span>
                      <span className="text-muted-foreground text-xs">
                        Discover opportunities and showcase your skills.
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter className="sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsProfileSetupModalOpen(false)}
                >
                  Maybe Later
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarProvider>
    );
  };
  return mainContentRender();
}

export default function HomePage() {
  return <AppContent />;
}

interface MobileNavMenuProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabItems: { value: string; label: string; icon: React.ElementType; component: JSX.Element }[];
}
function MobileNavMenu({ activeTab, setActiveTab, tabItems }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ActiveIcon = tabItems.find((item) => item.value === activeTab)?.icon || LayoutGrid;
  const activeLabel = tabItems.find((item) => item.value === activeTab)?.label || 'Menu';
  return (
    <div className="mb-4 px-2 sm:hidden">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between bg-card py-3 text-lg shadow"
      >
        <div className="flex items-center">
          {' '}
          <ActiveIcon className="mr-2 h-5 w-5" /> {activeLabel}{' '}
        </div>
        <LayoutGrid className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
      {isOpen && (
        <div className={'mt-2 grid grid-cols-2 gap-2 rounded-md border bg-card p-2 shadow-lg'}>
          {' '}
          {tabItems.map((item) => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? 'default' : 'ghost'}
              onClick={() => {
                setActiveTab(item.value);
                setIsOpen(false);
              }}
              className="flex h-12 items-center justify-start text-left text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {' '}
              <item.icon className="mr-2 h-5 w-5 opacity-80" /> {item.label}{' '}
            </Button>
          ))}{' '}
        </div>
      )}
    </div>
  );
}
