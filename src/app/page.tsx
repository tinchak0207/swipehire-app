
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole, NotificationItem } from "@/lib/types";
import { mockNotifications } from "@/lib/mockData";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye, Home, Settings as SettingsIcon, Info, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { TopNotificationBanner } from "@/components/notifications/TopNotificationBanner";
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const CandidateDiscoveryPage = dynamic(() => import('@/components/pages/CandidateDiscoveryPage').then(mod => mod.CandidateDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const JobDiscoveryPage = dynamic(() => import('@/components/pages/JobDiscoveryPage').then(mod => mod.JobDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const AiToolsPage = dynamic(() => import('@/components/pages/AiToolsPage').then(mod => mod.AiToolsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MatchesPage = dynamic(() => import('@/components/pages/MatchesPage').then(mod => mod.MatchesPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const SettingsPage = dynamic(() => import('@/components/pages/SettingsPage').then(mod => mod.SettingsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const LoginPage = dynamic(() => import('@/components/pages/LoginPage').then(mod => mod.LoginPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const CreateJobPostingPage = dynamic(() => import('@/components/pages/CreateJobPostingPage').then(mod => mod.CreateJobPostingPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const ManageJobPostingsPage = dynamic(() => import('@/components/pages/ManageJobPostingsPage').then(mod => mod.ManageJobPostingsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const StaffDiaryPage = dynamic(() => import('@/components/pages/StaffDiaryPage').then(mod => mod.StaffDiaryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const WelcomePage = dynamic(() => import('@/components/pages/WelcomePage').then(mod => mod.WelcomePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MyProfilePage = dynamic(() => import('@/components/pages/MyProfilePage').then(mod => mod.MyProfilePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const RecruiterOnboardingPage = dynamic(() => import('@/app/recruiter-onboarding/page'), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const RoleSelectionPage = dynamic(() => import('@/components/pages/RoleSelectionPage').then(mod => mod.RoleSelectionPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });


const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcomeV2';
const GUEST_MODE_KEY = 'isGuestModeActive';
const DISMISSED_BANNER_NOTIF_ID_KEY = 'dismissedBannerNotificationId';
const RECRUITER_COMPANY_PROFILE_COMPLETE_KEY = 'recruiterCompanyProfileComplete';


function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("findJobs");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bannerNotification, setBannerNotification] = useState<NotificationItem | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { mongoDbUserId, setMongoDbUserId, fetchAndSetUserPreferences, preferences, fullBackendUser } = useUserPreferences();

  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);
  const [profileSetupStep, setProfileSetupStep] = useState<'role' | 'recruiter_onboarding' | 'jobseeker_profile' | null>(null);
  const hasScrolledAndModalTriggeredRef = useRef(false);

  const [showWelcomePage, setShowWelcomePage] = useState(false); // Initialize to false
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const initialAuthStateReceived = useRef(false);
  const initialRedirectResultProcessed = useRef(false);

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

  const fetchUserFromMongo = useCallback(async (firebaseUid: string, firebaseDisplayName?: string | null, firebaseEmail?: string | null): Promise<string | null> => {
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
        const createUserResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: firebaseDisplayName || firebaseEmail || 'New User', email: firebaseEmail, firebaseUid: firebaseUid, preferences: { theme: 'light', featureFlags: {} } }),
        });
        if (createUserResponse.ok) {
          const responseData = await createUserResponse.json(); const createdUser = responseData.user || responseData;
          if (createdUser && createdUser._id) {
            setUserRole(createdUser.selectedRole || null); setUserName(createdUser.name); setMongoDbUserId(createdUser._id);
            localStorage.setItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY, (createdUser.selectedRole === 'recruiter' && createdUser.companyProfileComplete) ? 'true' : 'false');
            toast({ title: "Profile Initialized", description: "Your basic profile has been set up."});
            return createdUser._id;
          } else { console.error("Failed to create user in MongoDB: User object or _id missing", responseData); toast({ title: "Profile Creation Failed", description: "Could not initialize profile: backend error.", variant: "destructive"});}
        } else { const errorData = await createUserResponse.json().catch(()=>({})); console.error("Failed to create user in MongoDB:", errorData.message || createUserResponse.statusText); toast({ title: "Profile Creation Failed", description: `Could not initialize profile: ${errorData.message || 'Please try again.'}`, variant: "destructive"});}
      } else { const errorData = await response.json().catch(()=>({})); console.error("Error fetching user from MongoDB:", errorData.message || response.statusText); toast({ title: "Error Loading Profile", description: "Could not load profile.", variant: "destructive"});}
    } catch (error: any) { console.error("Error in fetchUserFromMongo:", error); toast({ title: "Network/Backend Error", description: error.message || "Could not connect to backend.", variant: "destructive"});}
    setUserRole(null); setUserName(firebaseDisplayName || firebaseEmail); setMongoDbUserId(null); localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY); return null;
  }, [setMongoDbUserId, toast]);

  const checkAndSetLoadingComplete = useCallback(() => {
    if (initialAuthStateReceived.current && initialRedirectResultProcessed.current) {
      const finalUser = auth.currentUser;
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
      const welcomeSeen = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';

      if (finalUser) {
        setIsAuthenticated(true); // Ensure this is set if user exists
        setIsGuestMode(false);    // Ensure guest mode is off
        setShowWelcomePage(false); // Authenticated user should not see welcome page
      } else if (guestActive) {
        setIsAuthenticated(false); // Not authenticated
        setIsGuestMode(true);     // Is guest
        setShowWelcomePage(false); // Guest has bypassed welcome
         if (!isGuestMode) { 
            setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
            setUserRole(null); setUserName('Guest User'); setUserPhotoURL(null);
            setMongoDbUserId(null); localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
        }
      } else { // No Firebase user, not guest
        setIsAuthenticated(false);
        setIsGuestMode(false);
        setShowWelcomePage(!welcomeSeen); // Show welcome if not seen
        // Clear auth states if no user and not guest
        setCurrentUser(null);
        setMongoDbUserId(null); localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
      }
      setIsInitialLoading(false);
    }
  }, [isGuestMode, setMongoDbUserId]);

  useEffect(() => {
    setIsInitialLoading(true);
    initialAuthStateReceived.current = false;
    initialRedirectResultProcessed.current = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // setIsAuthenticated(true) and setIsGuestMode(false) will be handled by checkAndSetLoadingComplete
        localStorage.removeItem(GUEST_MODE_KEY);
        setUserPhotoURL(user.photoURL);
        const fetchedMongoId = await fetchUserFromMongo(user.uid, user.displayName, user.email);
        if (fetchedMongoId) {
          await fetchAndSetUserPreferences(fetchedMongoId);
        }
      } else {
        // No user from onAuthStateChanged, state clearing will be handled by checkAndSetLoadingComplete
      }
      initialAuthStateReceived.current = true;
      checkAndSetLoadingComplete();
    });

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          toast({ title: "Signed In Successfully!", description: `Welcome back, ${result.user.displayName || result.user.email}!` });
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({ title: "Sign-In Issue During Redirect", description: error.message || "Could not complete sign-in after redirect.", variant: "destructive"});
      })
      .finally(() => {
        initialRedirectResultProcessed.current = true;
        checkAndSetLoadingComplete();
      });

    return () => unsubscribe();
  }, [fetchUserFromMongo, fetchAndSetUserPreferences, toast, checkAndSetLoadingComplete]);


  useEffect(() => {
    const handleScroll = () => {
      if (
        isAuthenticated && !isGuestMode && fullBackendUser &&
        !hasScrolledAndModalTriggeredRef.current && !preferences.loadingPreferences
      ) {
        let step: typeof profileSetupStep = null;
        if (!fullBackendUser.selectedRole) { step = 'role';
        } else if (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete) { step = 'recruiter_onboarding';
        } else if ( fullBackendUser.selectedRole === 'jobseeker' && (!fullBackendUser.profileHeadline || !fullBackendUser.profileExperienceSummary) ) { step = 'jobseeker_profile'; }

        if (step) {
          setProfileSetupStep(step); setIsProfileSetupModalOpen(true);
          hasScrolledAndModalTriggeredRef.current = true;
        } else { 
            hasScrolledAndModalTriggeredRef.current = true;
        }
      }
    };

    if (isAuthenticated && !isGuestMode && fullBackendUser && !preferences.loadingPreferences) {
      const needsSetup = !fullBackendUser.selectedRole ||
        (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete) ||
        (fullBackendUser.selectedRole === 'jobseeker' && (!fullBackendUser.profileHeadline || !fullBackendUser.profileExperienceSummary));

      if (needsSetup && !hasScrolledAndModalTriggeredRef.current) {
        window.addEventListener('scroll', handleScroll, { once: true });
        return () => window.removeEventListener('scroll', handleScroll);
      } else if (!needsSetup) { 
          hasScrolledAndModalTriggeredRef.current = true;
      }
    }
  }, [isAuthenticated, isGuestMode, fullBackendUser, preferences.loadingPreferences]);


   useEffect(() => {
    if (isAuthenticated && !isGuestMode && fullBackendUser && !preferences.loadingPreferences) {
      if (fullBackendUser.selectedRole === 'recruiter' && !fullBackendUser.companyProfileComplete && pathname !== '/recruiter-onboarding') {
        if (!isProfileSetupModalOpen) { // Only redirect if modal isn't already trying to handle it
            router.push('/recruiter-onboarding');
        }
      }
    }
  }, [isAuthenticated, isGuestMode, fullBackendUser, preferences.loadingPreferences, pathname, router, isProfileSetupModalOpen]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = useCallback(() => {
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false); // This will hide WelcomePage
    // AppContent will re-render. Since user is not auth/guest, LoginPage will show.
  }, []);

  const handleLoginBypass = useCallback(async () => {
    const mockUid = `mock-bypass-user-${Date.now()}`;
    const mockUser: User = { uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)', emailVerified: true, isAnonymous: false, metadata: {creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber: null, photoURL: null, providerData: [], providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null, delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'), getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }), reload: () => Promise.resolve(), toJSON: () => ({ uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }), };
    setCurrentUser(mockUser); setIsAuthenticated(true); setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY); setUserPhotoURL(mockUser.photoURL);
    const fetchedMongoId = await fetchUserFromMongo(mockUid, mockUser.displayName, mockUser.email);
    if (fetchedMongoId) { await fetchAndSetUserPreferences(fetchedMongoId); }
    setShowWelcomePage(false); localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    if (isInitialLoading) setIsInitialLoading(false); // Ensure loading is false after bypass
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  }, [fetchUserFromMongo, fetchAndSetUserPreferences, toast, isInitialLoading]);

  const activateGuestMode = useCallback(() => {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true); setIsAuthenticated(false);
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
    setUserRole(null); setUserName('Guest User'); setUserPhotoURL(null);
    setShowWelcomePage(false);
    setMongoDbUserId(null); localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
    hasScrolledAndModalTriggeredRef.current = true; 
    if (isInitialLoading) setIsInitialLoading(false); // Ensure loading is false
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest."});
  }, [setMongoDbUserId, toast, isInitialLoading]);

  const handleGuestMode = useCallback(() => {
    activateGuestMode();
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
  }, [activateGuestMode]);


  const handleRoleSelect = async (role: UserRole, currentMongoId?: string | null) => {
    const idToUse = currentMongoId || mongoDbUserId;
    if (!isGuestMode && isAuthenticated && currentUser && idToUse) {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/proxy/users/${idToUse}/role`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selectedRole: role, name: userName || currentUser.displayName, email: currentUser.email }), });
        if (!response.ok) { const errorData = await response.json().catch(() => ({ message: `Failed to save role. Status: ${response.status}`})); throw new Error(errorData.message); }
        const savedUser = await response.json();
        setUserRole(role); // Update local state immediately
        localStorage.setItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY, (role === 'recruiter' && savedUser.user?.companyProfileComplete) ? 'true' : 'false');
        await fetchAndSetUserPreferences(idToUse); // Re-fetch to get updated fullBackendUser

        if (role === 'recruiter' && !savedUser.user?.companyProfileComplete) {
          // If modal was open, it will close. Redirect will occur from useEffect.
          toast({ title: "Role Updated to Recruiter", description: "Please complete your company profile next.", duration: 5000});
          if(pathname !== '/recruiter-onboarding') router.push('/recruiter-onboarding');
        } else if (role === 'jobseeker' && (!savedUser.user?.profileHeadline || !savedUser.user?.profileExperienceSummary)) {
          setActiveTab("myProfile"); // Switch to profile tab
          toast({ title: "Role Updated to Job Seeker", description: "Help recruiters find you by completing your professional profile!", duration: 7000 });
        } else {
          toast({ title: "Role Selected", description: `You are now a ${role}.` });
        }
      } catch (error: any) { console.error("Error saving role:", error); toast({ title: "Error Saving Role", description: error.message || "Could not save role selection.", variant: "destructive" }); }
    }
    if (!isGuestMode) setUserRole(role); // Update UI even if backend fails, for modal dismissal
    setIsProfileSetupModalOpen(false); 
    hasScrolledAndModalTriggeredRef.current = true; 
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(GUEST_MODE_KEY); localStorage.removeItem(RECRUITER_COMPANY_PROFILE_COMPLETE_KEY);
      localStorage.removeItem('mongoDbUserId'); localStorage.removeItem(HAS_SEEN_WELCOME_KEY);
      localStorage.removeItem(DISMISSED_BANNER_NOTIF_ID_KEY);
      setMongoDbUserId(null); setIsGuestMode(false); setUserPhotoURL(null); setActiveTab('findJobs');
      hasScrolledAndModalTriggeredRef.current = false; 
      initialAuthStateReceived.current = false; initialRedirectResultProcessed.current = false; 
      // Critical: These ensure the flow restarts correctly
      setCurrentUser(null);
      setIsAuthenticated(false);
      setShowWelcomePage(true); // Force re-evaluation which should show WelcomePage
      setIsInitialLoading(true); // Re-trigger initial loading sequence on logout
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) { console.error("Error signing out:", error); toast({ title: "Logout Failed", description: "Could not log out.", variant: "destructive" }); }
  };

  const handleLoginRequest = () => { 
    localStorage.removeItem(GUEST_MODE_KEY);
    setIsGuestMode(false);
    localStorage.removeItem(HAS_SEEN_WELCOME_KEY); 
    // Critical: These ensure the flow restarts correctly
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowWelcomePage(true); // Force re-evaluation
    setIsInitialLoading(true); 
    initialAuthStateReceived.current = false; initialRedirectResultProcessed.current = false;
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} currentUserRole={userRole} /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage isGuestMode={isGuestMode} /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage isGuestMode={isGuestMode} currentUserRole={userRole} onRoleChange={(role) => handleRoleSelect(role, mongoDbUserId)} /> },
  ];
  const recruiterTabItems = [ { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage searchTerm={searchTerm} key={`cand-discovery-${userRole}-${mongoDbUserId}`} isGuestMode={isGuestMode} /> }, { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage isGuestMode={isGuestMode} /> }, { value: "manageJobs", label: "Manage Jobs", icon: SettingsIcon, component: <ManageJobPostingsPage isGuestMode={isGuestMode} /> }, ...baseTabItems, ];
  const jobseekerTabItems = [ { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage searchTerm={searchTerm} key={`job-discovery-${userRole}-${mongoDbUserId}`} /> }, { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage isGuestMode={isGuestMode} /> }, { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage isGuestMode={isGuestMode} currentUserName={userName} currentUserMongoId={mongoDbUserId} currentUserAvatarUrl={userPhotoURL} /> }, ...baseTabItems, ];
  let currentTabItems = jobseekerTabItems;
  if (!isGuestMode && isAuthenticated && userRole === 'recruiter') { currentTabItems = recruiterTabItems; }
  else if (!isGuestMode && isAuthenticated && userRole === 'jobseeker') { currentTabItems = jobseekerTabItems; }
  else if (isGuestMode) { currentTabItems = jobseekerTabItems; }


  useEffect(() => {
    if (!isInitialLoading) {
      const itemsForCurrentContext = isGuestMode ? jobseekerTabItems : (isAuthenticated && userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems);
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      let defaultTabForCurrentContext = "findJobs";
      if (!isGuestMode && isAuthenticated && userRole === 'recruiter') defaultTabForCurrentContext = "findTalent";
      if (!validTabValues.includes(activeTab) || (userRole === 'recruiter' && activeTab === 'findJobs') || (userRole === 'jobseeker' && activeTab === 'findTalent') || (isGuestMode && activeTab === 'findTalent') ) {
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  }, [userRole, isGuestMode, isAuthenticated, isInitialLoading, activeTab, jobseekerTabItems, recruiterTabItems]);

  const mainContentRender = () => {
    if (isInitialLoading || (!isGuestMode && isAuthenticated && preferences.loadingPreferences)) {
      return ( <div className="flex min-h-screen items-center justify-center bg-background"> <Loader2 className="h-16 w-16 animate-spin text-primary" /> </div> );
    }
    if (pathname === '/recruiter-onboarding') { return <RecruiterOnboardingPage />; }
    if (showWelcomePage) { return <WelcomePage key="welcome_page_wrapper" onStartExploring={handleStartExploring} onGuestMode={handleGuestMode} />; }
    if (!isAuthenticated && !isGuestMode) { return ( <div className="animate-fadeInPage" key="login_page_wrapper"> <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} /> </div> ); }

    // Main App Content
    const mainAppContainerClasses = cn("flex flex-col min-h-screen bg-background", bannerNotification ? "pt-16 sm:pt-[72px]" : "");
    return (
      <div className={mainAppContainerClasses}>
        <TopNotificationBanner notification={bannerNotification} onDismiss={handleDismissBanner} />
        <AppHeader isAuthenticated={isAuthenticated} isGuestMode={isGuestMode} onLoginRequest={handleLoginRequest} onLogout={handleLogout} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} userName={userName} userPhotoURL={userPhotoURL} />
        <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {isMobile ? ( <MobileNavMenu activeTab={activeTab} setActiveTab={setActiveTab} tabItems={currentTabItems} />
            ) : (
              <TabsList className={`grid w-full grid-cols-${currentTabItems.length} mb-6 h-auto rounded-lg shadow-sm bg-card border p-1`}>
                {currentTabItems.map(item => ( <TabsTrigger key={item.value} value={item.value} className="py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all duration-200 ease-in-out flex items-center justify-center"> <item.icon className="w-4 h-4 mr-2 opacity-80 shrink-0" /> <span className="truncate">{item.label}</span> </TabsTrigger> ))}
              </TabsList>
            )}
            {currentTabItems.map(item => ( <TabsContent key={item.value} value={item.value} className="mt-0 rounded-lg">
                {React.cloneElement(item.component, { ...((item.value === 'findTalent' || item.value === 'findJobs') && { searchTerm }), isGuestMode, ...((item.value === 'settings') && { currentUserRole: userRole, onRoleChange: (role) => handleRoleSelect(role, mongoDbUserId) }), ...((item.value === 'aiTools') && { currentUserRole: userRole }), ...((item.value === 'myDiary') && { currentUserName: userName, currentUserMongoId: mongoDbUserId, currentUserAvatarUrl: userPhotoURL }) })}
            </TabsContent> ))}
          </Tabs>
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          <div className="mb-4"> <div className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="6840338e0d1dfb766b149a4b" data-style-height="52px" data-style-width="100%"> <a href="https://www.trustpilot.com/review/studio--swipehire-3bscz.us-central1.hosted.app" target="_blank" rel="noopener">Trustpilot</a> </div> </div>
          <div className="flex justify-center items-center gap-x-4 mb-1"> <span className="hover:text-primary cursor-pointer">Privacy Policy</span> <span className="hover:text-primary cursor-pointer">Terms of Service</span> <span className="hover:text-primary cursor-pointer">AI Ethics</span> </div>
          <div>© {new Date().getFullYear()} SwipeHire. All rights reserved.</div>
        </footer>
        <Dialog open={isProfileSetupModalOpen} onOpenChange={(open) => { if (!open) { hasScrolledAndModalTriggeredRef.current = false; } setIsProfileSetupModalOpen(open); }}>
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
              {profileSetupStep === 'role' && ( <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <Button variant="outline" className="h-auto py-4 text-left flex flex-col items-start group hover:bg-primary/5" onClick={() => { handleRoleSelect('recruiter', mongoDbUserId); }}> <Users className="h-6 w-6 mb-2 text-orange-500 group-hover:text-orange-600" /> <span className="font-semibold text-foreground">I'm Hiring (Recruiter)</span> <span className="text-xs text-muted-foreground">Post jobs and find top talent.</span> </Button> <Button variant="outline" className="h-auto py-4 text-left flex flex-col items-start group hover:bg-primary/5" onClick={() => { handleRoleSelect('jobseeker', mongoDbUserId); }}> <Briefcase className="h-6 w-6 mb-2 text-blue-500 group-hover:text-blue-600" /> <span className="font-semibold text-foreground">I'm Job Hunting</span> <span className="text-xs text-muted-foreground">Discover opportunities and showcase your skills.</span> </Button> </div> )}
              {profileSetupStep === 'recruiter_onboarding' && ( <Button className="w-full" onClick={() => { router.push('/recruiter-onboarding'); setIsProfileSetupModalOpen(false); }}> Go to Company Onboarding <ChevronRight className="ml-2 h-4 w-4" /> </Button> )}
              {profileSetupStep === 'jobseeker_profile' && ( <Button className="w-full" onClick={() => { setActiveTab("myProfile"); setIsProfileSetupModalOpen(false); toast({ title: "Let's build your profile!", description: "Switched to 'My Profile' tab.", duration: 4000}); }}> Complete My Profile <ChevronRight className="ml-2 h-4 w-4" /> </Button> )}
            </div>
            <DialogFooter className="sm:justify-center"> <Button type="button" variant="ghost" onClick={() => setIsProfileSetupModalOpen(false)}> Maybe Later </Button> </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  return mainContentRender();
}

export default function HomePage() { return ( <AppContent /> ); }

interface MobileNavMenuProps { activeTab: string; setActiveTab: (value: string) => void; tabItems: { value: string; label: string; icon: React.ElementType; component: JSX.Element }[]; }
function MobileNavMenu({ activeTab, setActiveTab, tabItems }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ActiveIcon = tabItems.find(item => item.value === activeTab)?.icon || LayoutGrid;
  const activeLabel = tabItems.find(item => item.value === activeTab)?.label || "Menu";
  return (
    <div className="sm:hidden mb-4 px-2">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full justify-between text-lg py-3 bg-card shadow">
        <div className="flex items-center"> <ActiveIcon className="w-5 h-5 mr-2" /> {activeLabel} </div>
        <LayoutGrid className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
      {isOpen && ( <div className={`grid grid-cols-2 gap-2 mt-2 bg-card p-2 rounded-md shadow-lg border`}> {tabItems.map(item => ( <Button key={item.value} variant={activeTab === item.value ? "default" : "ghost"} onClick={() => { setActiveTab(item.value); setIsOpen(false); }} className="flex items-center justify-start text-left h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"> <item.icon className="w-5 h-5 mr-2 opacity-80" /> {item.label} </Button> ))} </div> )}
    </div>
  );
}
    
    