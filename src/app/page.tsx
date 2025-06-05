
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole, NotificationItem } from "@/lib/types";
import { mockNotifications } from "@/lib/mockData";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye, Home, Settings as SettingsIcon, Info, ChevronRight } from 'lucide-react'; // Added Info, ChevronRight
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { TopNotificationBanner } from "@/components/notifications/TopNotificationBanner";
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog components

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const CandidateDiscoveryPage = dynamic(() => import('@/components/pages/CandidateDiscoveryPage').then(mod => mod.CandidateDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const JobDiscoveryPage = dynamic(() => import('@/components/pages/JobDiscoveryPage').then(mod => mod.JobDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const AiToolsPage = dynamic(() => import('@/components/pages/AiToolsPage').then(mod => mod.AiToolsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MatchesPage = dynamic(() => import('@/components/pages/MatchesPage').then(mod => mod.MatchesPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const SettingsPage = dynamic(() => import('@/components/pages/SettingsPage').then(mod => mod.SettingsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
// RoleSelectionPage is no longer directly rendered here, but its logic is moved into the modal
// const RoleSelectionPage = dynamic(() => import('@/components/pages/RoleSelectionPage').then(mod => mod.RoleSelectionPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const LoginPage = dynamic(() => import('@/components/pages/LoginPage').then(mod => mod.LoginPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const CreateJobPostingPage = dynamic(() => import('@/components/pages/CreateJobPostingPage').then(mod => mod.CreateJobPostingPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const ManageJobPostingsPage = dynamic(() => import('@/components/pages/ManageJobPostingsPage').then(mod => mod.ManageJobPostingsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const StaffDiaryPage = dynamic(() => import('@/components/pages/StaffDiaryPage').then(mod => mod.StaffDiaryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const WelcomePage = dynamic(() => import('@/components/pages/WelcomePage').then(mod => mod.WelcomePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MyProfilePage = dynamic(() => import('@/components/pages/MyProfilePage').then(mod => mod.MyProfilePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const RecruiterOnboardingPage = dynamic(() => import('@/app/recruiter-onboarding/page'), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });


const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcomeV2';
const GUEST_MODE_KEY = 'isGuestModeActive';
const DISMISSED_BANNER_NOTIF_ID_KEY = 'dismissedBannerNotificationId';
const RECRUITER_COMPANY_PROFILE_COMPLETE_KEY = 'recruiterCompanyProfileComplete';


function AppContent() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("findJobs");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [bannerNotification, setBannerNotification] = useState<NotificationItem | null>(null);

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const { mongoDbUserId, setMongoDbUserId, fetchAndSetUserPreferences, preferences, fullBackendUser } = useUserPreferences();

  // State for scroll-triggered profile setup modal
  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);
  const [profileSetupStep, setProfileSetupStep] = useState<'role' | 'recruiter_onboarding' | 'jobseeker_profile' | null>(null);
  const hasScrolledAndModalTriggeredRef = useRef(false);

  useEffect(() => {
    if (preferences.notificationChannels?.inAppBanner && !isGuestMode) {
      const latestUnreadUrgent = mockNotifications
        .filter(n => !n.read && n.isUrgent && localStorage.getItem(DISMISSED_BANNER_NOTIF_ID_KEY) !== n.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const latestUnreadNormal = mockNotifications
        .filter(n => !n.read && !n.isUrgent && localStorage.getItem(DISMISSED_BANNER_NOTIF_ID_KEY) !== n.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      setBannerNotification(latestUnreadUrgent || latestUnreadNormal || null);
    } else {
      setBannerNotification(null);
    }
  }, [mockNotifications, preferences.notificationChannels, isGuestMode]);

  const handleDismissBanner = (notificationId: string) => {
    setBannerNotification(null);
    localStorage.setItem(DISMISSED_BANNER_NOTIF_ID_KEY, notificationId);
  };


  const fetchUserFromMongo = async (firebaseUid: string, firebaseDisplayName?: string | null, firebaseEmail?: string | null): Promise<string | null> => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${firebaseUid}`);

      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.selectedRole || null);
        setUserName(userData.name || firebaseDisplayName || firebaseEmail);
        setMongoDbUserId(userData._id);
        localStorage.setItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY, (userData.selectedRole === 'recruiter' && userData.companyProfileComplete) ? 'true' : 'false');
        return userData._id;
      } else if (response.status === 404) {
        console.log("User not found in MongoDB, attempting to create...");
        const createUserResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firebaseDisplayName || firebaseEmail || 'New User',
            email: firebaseEmail,
            firebaseUid: firebaseUid,
            preferences: { theme: 'light', featureFlags: {} }
          }),
        });

        if (createUserResponse.ok) {
          const responseData = await createUserResponse.json();
          const createdUser = responseData.user || responseData;

          if (createdUser && createdUser._id) {
            setUserRole(createdUser.selectedRole || null);
            setUserName(createdUser.name);
            setMongoDbUserId(createdUser._id);
            localStorage.setItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY, (createdUser.selectedRole === 'recruiter' && createdUser.companyProfileComplete) ? 'true' : 'false');
            toast({ title: "Profile Initialized", description: "Your basic profile has been set up."});
            return createdUser._id;
          } else {
            console.error("Failed to create user in MongoDB: User object or _id missing in response", responseData);
            toast({ title: "Profile Creation Failed", description: "Could not initialize your profile: unexpected response from backend.", variant: "destructive"});
          }
        } else {
          const errorData = await createUserResponse.json().catch(()=>({}));
          console.error("Failed to create user in MongoDB:", errorData.message || createUserResponse.statusText);
          toast({ title: "Profile Creation Failed", description: `Could not initialize your profile: ${errorData.message || 'Please try again.'}`, variant: "destructive"});
        }
      } else {
        const errorData = await response.json().catch(()=>({}));
        console.error("Error fetching user data from MongoDB:", errorData.message || response.statusText);
        toast({ title: "Error Loading Profile", description: "Could not load your profile data.", variant: "destructive"});
      }
    } catch (error: any) {
      console.error("Error in fetchUserFromMongo:", error);
      let description = "Could not connect to backend to load profile.";
      if (error.message && error.message.includes('Failed to fetch')) {
        description = "Network error: Could not connect to the backend server. Please ensure it's running and accessible.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Network or Backend Error", description, variant: "destructive"});
    }
    setUserRole(null);
    setUserName(firebaseDisplayName || firebaseEmail);
    setMongoDbUserId(null);
    localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
    return null;
  };


  useEffect(() => {
    setIsInitialLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        setUserPhotoURL(user.photoURL);
        localStorage.removeItem(GUEST_MODE_KEY);

        const fetchedMongoId = await fetchUserFromMongo(user.uid, user.displayName, user.email);
        if (fetchedMongoId) {
          await fetchAndSetUserPreferences(fetchedMongoId);
        }
        setShowWelcomePage(false); // Hide welcome page if user is authenticated

      } else if (guestActive) {
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('Guest User');
        setUserPhotoURL(null);
        setIsGuestMode(true);
        setMongoDbUserId(null);
        setShowWelcomePage(false); // Hide welcome page if in guest mode
        localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        setUserPhotoURL(null);
        setIsGuestMode(false);
        setMongoDbUserId(null);
        localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
        // Show welcome page only if not seen and not authenticated/guest
        setShowWelcomePage(localStorage.getItem(HAS_SEEN_WELCOME_KEY) !== 'true');
      }
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
      }
    });

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          toast({ title: "Signed In Successfully!", description: `Welcome back, ${result.user.displayName || result.user.email}!` });
          // Auth state change will handle the rest via onAuthStateChanged
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({ title: "Sign-In Issue During Redirect", description: error.message || "Could not complete sign-in after redirect.", variant: "destructive"});
      })
      .finally(() => {
        if (!initialAuthCheckDone.current) {
            const guestStillActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            if (!auth.currentUser && !guestStillActive) {
                 // If still not showing welcome, and it hasn't been seen, show it.
                 if(!showWelcomePage) setShowWelcomePage(localStorage.getItem(HAS_SEEN_WELCOME_KEY) !== 'true');
            } else if (guestStillActive && !auth.currentUser) {
                // If guest mode is active from localStorage but not yet reflected in state
                if(!isGuestMode) handleGuestMode(); // Call handleGuestMode to set state correctly
                if(showWelcomePage) setShowWelcomePage(false); // Ensure welcome page is hidden if guest mode is on
            }
            initialAuthCheckDone.current = true;
            setIsInitialLoading(false);
        }
      });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed showWelcomePage and isGuestMode from deps as they are managed inside


  // Scroll listener for profile setup modal
  useEffect(() => {
    const handleScroll = () => {
      if (
        isAuthenticated &&
        !isGuestMode &&
        fullBackendUser &&
        !hasScrolledAndModalTriggeredRef.current
      ) {
        let step: typeof profileSetupStep = null;
        if (!fullBackendUser.selectedRole) {
          step = 'role';
        } else if (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete) {
          step = 'recruiter_onboarding';
        } else if (
          fullBackendUser.selectedRole === 'jobseeker' &&
          (!fullBackendUser.profileHeadline || !fullBackendUser.profileExperienceSummary)
        ) {
          step = 'jobseeker_profile';
        }

        if (step) {
          setProfileSetupStep(step);
          setIsProfileSetupModalOpen(true);
          hasScrolledAndModalTriggeredRef.current = true;
        }
      }
    };

    if (isAuthenticated && !isGuestMode && fullBackendUser && !preferences.loadingPreferences) {
      // Only add listener if setup might be needed and modal hasn't been triggered
      if (!hasScrolledAndModalTriggeredRef.current &&
          (!fullBackendUser.selectedRole ||
           (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete) ||
           (fullBackendUser.selectedRole === 'jobseeker' && (!fullBackendUser.profileHeadline || !fullBackendUser.profileExperienceSummary)))
         ) {
        window.addEventListener('scroll', handleScroll, { once: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }
    }
  }, [isAuthenticated, isGuestMode, fullBackendUser, preferences.loadingPreferences]);


   useEffect(() => {
    // This effect now only handles the recruiter onboarding page redirection
    // The initial role selection or jobseeker profile prompt is handled by the scroll-triggered modal
    if (isAuthenticated && !isGuestMode && fullBackendUser && !preferences.loadingPreferences) {
      if (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete && pathname !== '/recruiter-onboarding') {
        // If modal for recruiter onboarding was already shown and dismissed, or if user directly lands on main page somehow
        // we still might want to redirect. Or, this logic can be removed if the modal is the sole entry point.
        // For now, let's keep it as a fallback.
        if (!isProfileSetupModalOpen) { // Only redirect if modal isn't already up for this
            router.push('/recruiter-onboarding');
        }
      }
    }
  }, [isAuthenticated, isGuestMode, fullBackendUser, preferences.loadingPreferences, pathname, router, isProfileSetupModalOpen]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = () => {
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false);
    // No direct login/guest mode call here; AppContent will re-evaluate and show LoginPage
  };

  const handleLoginBypass = async () => {
    // ... (keep existing bypass logic)
    const mockUid = `mock-bypass-user-${Date.now()}`;
    const mockUser: User = {
      uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)',
      emailVerified: true, isAnonymous: false, metadata: {creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber: null, photoURL: null, providerData: [],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY);
    setUserPhotoURL(mockUser.photoURL);

    const fetchedMongoId = await fetchUserFromMongo(mockUid, mockUser.displayName, mockUser.email);
    if (fetchedMongoId) {
      await fetchAndSetUserPreferences(fetchedMongoId);
       // Role selection will be handled by scroll modal if needed
    } else {
      // If fetchMongoUser didn't set a role (e.g. new user created by bypass),
      // this will also be handled by scroll modal.
    }

    setShowWelcomePage(false);
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };

  const handleGuestMode = () => {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setIsAuthenticated(false);
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
    setUserRole(null); setUserName('Guest User'); setUserPhotoURL(null);
    setShowWelcomePage(false); localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setMongoDbUserId(null);
    if (!initialAuthCheckDone.current) { initialAuthCheckDone.current = true; setIsInitialLoading(false); }
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest."});
  };

  const handleRoleSelect = async (role: UserRole, currentMongoId?: string | null) => {
    const idToUse = currentMongoId || mongoDbUserId;
    if (!isGuestMode && isAuthenticated && currentUser && idToUse) {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/proxy/users/${idToUse}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedRole: role, name: userName || currentUser.displayName, email: currentUser.email }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to save role. Status: ${response.status}`}));
          throw new Error(errorData.message);
        }
        setUserRole(role); // Update local state immediately
        toast({ title: "Role Selected", description: `You are now a ${role}.` });
        localStorage.setItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY, (role === 'recruiter' && fullBackendUser?.companyProfileComplete) ? 'true' : 'false');

        await fetchAndSetUserPreferences(idToUse); // Re-fetch to get potentially updated fullBackendUser

        // Logic for post-role-selection guidance (previously here, now also in scroll modal)
        if (role === 'recruiter' && !fullBackendUser?.companyProfileComplete) {
          // The main useEffect will handle redirect to onboarding if path isn't already there
          // Or, if modal handled it, this is just for reinforcement
        } else if (role === 'jobseeker' && (!fullBackendUser?.profileHeadline || !fullBackendUser?.profileExperienceSummary)) {
          setActiveTab("myProfile");
          toast({ title: "Complete Your Profile", description: "Help recruiters find you by completing your professional profile!", duration: 7000 });
        }

      } catch (error: any) {
        console.error("Error saving role to MongoDB backend:", error);
        toast({ title: "Error Saving Role", description: error.message || "Could not save role selection.", variant: "destructive" });
      }
    } else {
      console.warn("handleRoleSelect called without authenticated user, MongoDB ID, or while in guest mode.");
      if (isGuestMode) {
         toast({ title: "Action Disabled", description: "Role selection is not available in Guest Mode.", variant: "default"});
      }
    }
     if (!isGuestMode) setUserRole(role); // Ensure local userRole is updated even if backend fails, to reflect choice
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(GUEST_MODE_KEY);
      localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
      localStorage.removeItem('mongoDbUserId');
      localStorage.removeItem(HAS_SEEN_WELCOME_KEY);
      localStorage.removeItem(DISMISSED_BANNER_NOTIF_ID_KEY);
      setMongoDbUserId(null);
      setIsGuestMode(false);
      setUserPhotoURL(null);
      setActiveTab('findJobs');
      hasScrolledAndModalTriggeredRef.current = false; // Reset for next login session
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    if (isGuestMode) {
        localStorage.removeItem(GUEST_MODE_KEY);
        setIsGuestMode(false);
        localStorage.removeItem(DISMISSED_BANNER_NOTIF_ID_KEY);
        localStorage.removeItem(HAS_SEEN_WELCOME_KEY); // Remove welcome key so it can be shown again before login
        hasScrolledAndModalTriggeredRef.current = false; // Reset
        // AppContent will re-evaluate: user is not authenticated, not guest, HAS_SEEN_WELCOME_KEY is gone -> WelcomePage or LoginPage
        // Effectively, this will make AppContent show LoginPage if welcome already seen, or WelcomePage if not.
        setShowWelcomePage(localStorage.getItem(HAS_SEEN_WELCOME_KEY) !== 'true'); // Force re-evaluation
    }
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} currentUserRole={userRole} /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage isGuestMode={isGuestMode} /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage isGuestMode={isGuestMode} currentUserRole={userRole} onRoleChange={handleRoleSelect} /> },
  ];

  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage searchTerm={searchTerm} key={`cand-discovery-${userRole}-${mongoDbUserId}`} isGuestMode={isGuestMode} /> },
    { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage isGuestMode={isGuestMode} /> },
    { value: "manageJobs", label: "Manage Jobs", icon: SettingsIcon, component: <ManageJobPostingsPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage searchTerm={searchTerm} key={`job-discovery-${userRole}-${mongoDbUserId}`} /> },
    { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage isGuestMode={isGuestMode} /> },
    { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage isGuestMode={isGuestMode} currentUserName={userName} currentUserMongoId={mongoDbUserId} currentUserAvatarUrl={userPhotoURL} /> },
    ...baseTabItems,
  ];

  let currentTabItems = jobseekerTabItems;
  if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestMode && isAuthenticated && userRole === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  } else if (isGuestMode) {
    currentTabItems = jobseekerTabItems; // Guests see jobseeker view by default
  }


  useEffect(() => {
    if (!isInitialLoading && initialAuthCheckDone.current) {
      const itemsForCurrentContext = isGuestMode
        ? jobseekerTabItems
        : (isAuthenticated && userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems);
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      let defaultTabForCurrentContext = "findJobs";
      if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
        defaultTabForCurrentContext = "findTalent";
      }
      if (!validTabValues.includes(activeTab) ||
          (userRole === 'recruiter' && activeTab === 'findJobs') ||
          (userRole === 'jobseeker' && activeTab === 'findTalent') ||
          (isGuestMode && activeTab === 'findTalent') ) {
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isGuestMode, isAuthenticated, isInitialLoading]);

  const mainContentRender = () => {
    if (isInitialLoading || preferences.loadingPreferences) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    if (pathname === '/recruiter-onboarding') {
        // If recruiter onboarding is handled via modal, this direct page might not be needed
        // or it's a fallback. Ensure context provider wraps it if used directly.
        // This component already receives user from context, so it's fine.
        return <RecruiterOnboardingPage />;
    }

    if (showWelcomePage) {
      return <WelcomePage key="welcome_page_wrapper" onStartExploring={handleStartExploring} onGuestMode={handleGuestMode} />;
    }

    if (!isAuthenticated && !isGuestMode) {
      return (
        <div className="animate-fadeInPage" key="login_page_wrapper">
          <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />
        </div>
      );
    }

    // RoleSelectionPage is no longer directly rendered here. Its logic is in the modal.

    // Main app content (dashboard)
    const mainAppContainerClasses = cn("flex flex-col min-h-screen bg-background", bannerNotification ? "pt-16 sm:pt-[72px]" : "");
    return (
      <div className={mainAppContainerClasses}>
        <TopNotificationBanner notification={bannerNotification} onDismiss={handleDismissBanner} />
        <AppHeader
          isAuthenticated={isAuthenticated}
          isGuestMode={isGuestMode}
          onLoginRequest={handleLoginRequest}
          onLogout={handleLogout}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          userName={userName}
          userPhotoURL={userPhotoURL}
        />
        <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {isMobile ? (
              <MobileNavMenu activeTab={activeTab} setActiveTab={setActiveTab} tabItems={currentTabItems} />
            ) : (
              <TabsList className={`grid w-full grid-cols-${currentTabItems.length} mb-6 h-auto rounded-lg shadow-sm bg-card border p-1`}>
                {currentTabItems.map(item => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all duration-200 ease-in-out flex items-center justify-center"
                  >
                    <item.icon className="w-4 h-4 mr-2 opacity-80 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
            {currentTabItems.map(item => (
              <TabsContent key={item.value} value={item.value} className="mt-0 rounded-lg">
                {React.cloneElement(item.component, {
                  ...( (item.value === 'findTalent' || item.value === 'findJobs') && { searchTerm }),
                  isGuestMode,
                  ...(item.value === 'settings' && { currentUserRole: userRole, onRoleChange: (role) => handleRoleSelect(role, mongoDbUserId) }),
                  ...(item.value === 'aiTools' && { currentUserRole: userRole }),
                  ...(item.value === 'myDiary' && { currentUserName: userName, currentUserMongoId: mongoDbUserId, currentUserAvatarUrl: userPhotoURL })
                })}
              </TabsContent>
            ))}
          </Tabs>
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          <div className="mb-4">
            <div className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="6840338e0d1dfb766b149a4b" data-style-height="52px" data-style-width="100%">
              <a href="https://www.trustpilot.com/review/studio--swipehire-3bscz.us-central1.hosted.app" target="_blank" rel="noopener">Trustpilot</a>
            </div>
          </div>
          <div className="flex justify-center items-center gap-x-4 mb-1">
              <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer">AI Ethics</span>
          </div>
          <div>© {new Date().getFullYear()} SwipeHire. All rights reserved.</div>
        </footer>

        {/* Profile Setup Modal */}
        <Dialog open={isProfileSetupModalOpen} onOpenChange={(open) => {
            if (!open) { // Allow closing, but it might reopen on next scroll if conditions still met
                // Consider if we want to prevent closing until setup is "complete" for this step
                // Or just let it close and the scroll listener might pick it up again.
                // For now, allow simple close.
                hasScrolledAndModalTriggeredRef.current = false; // Allow it to be triggered again if user closes without completing
            }
            setIsProfileSetupModalOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {profileSetupStep === 'role' && "Choose Your Path"}
                {profileSetupStep === 'recruiter_onboarding' && "Complete Company Profile"}
                {profileSetupStep === 'jobseeker_profile' && "Let's Complete Your Profile"}
              </DialogTitle>
              <DialogDescription>
                {profileSetupStep === 'role' && "To get started, please tell us if you're primarily here to hire or to find a job."}
                {profileSetupStep === 'recruiter_onboarding' && "Welcome, Recruiter! Please complete your company profile to access all hiring features."}
                {profileSetupStep === 'jobseeker_profile' && "Help recruiters and companies find you by completing your professional profile."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {profileSetupStep === 'role' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 text-left flex flex-col items-start group hover:bg-primary/5"
                    onClick={() => {
                      handleRoleSelect('recruiter', mongoDbUserId);
                      setIsProfileSetupModalOpen(false);
                    }}
                  >
                    <Users className="h-6 w-6 mb-2 text-orange-500 group-hover:text-orange-600" />
                    <span className="font-semibold text-foreground">I'm Hiring (Recruiter)</span>
                    <span className="text-xs text-muted-foreground">Post jobs and find top talent.</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 text-left flex flex-col items-start group hover:bg-primary/5"
                    onClick={() => {
                      handleRoleSelect('jobseeker', mongoDbUserId);
                      setIsProfileSetupModalOpen(false);
                    }}
                  >
                    <Briefcase className="h-6 w-6 mb-2 text-blue-500 group-hover:text-blue-600" />
                    <span className="font-semibold text-foreground">I'm Job Hunting</span>
                    <span className="text-xs text-muted-foreground">Discover opportunities and showcase your skills.</span>
                  </Button>
                </div>
              )}
              {profileSetupStep === 'recruiter_onboarding' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push('/recruiter-onboarding');
                    setIsProfileSetupModalOpen(false);
                  }}
                >
                  Go to Company Onboarding <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {profileSetupStep === 'jobseeker_profile' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setActiveTab("myProfile");
                    setIsProfileSetupModalOpen(false);
                    toast({ title: "Let's build your profile!", description: "Switched to 'My Profile' tab.", duration: 4000});
                  }}
                >
                  Complete My Profile <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button type="button" variant="ghost" onClick={() => setIsProfileSetupModalOpen(false)}>
                Maybe Later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  return mainContentRender();
}

export default function HomePage() {
  return (
    <AppContent />
  );
}


interface MobileNavMenuProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabItems: { value: string; label: string; icon: React.ElementType; component: JSX.Element }[];
}

function MobileNavMenu({ activeTab, setActiveTab, tabItems }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ActiveIcon = tabItems.find(item => item.value === activeTab)?.icon || LayoutGrid;
  const activeLabel = tabItems.find(item => item.value === activeTab)?.label || "Menu";

  return (
    <div className="sm:hidden mb-4 px-2">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between text-lg py-3 bg-card shadow"
      >
        <div className="flex items-center">
          <ActiveIcon className="w-5 h-5 mr-2" />
          {activeLabel}
        </div>
        <LayoutGrid className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
      {isOpen && (
        <div className={`grid grid-cols-2 gap-2 mt-2 bg-card p-2 rounded-md shadow-lg border`}>
          {tabItems.map(item => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? "default" : "ghost"}
              onClick={() => {
                setActiveTab(item.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-start text-left h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <item.icon className="w-5 h-5 mr-2 opacity-80" />
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

    