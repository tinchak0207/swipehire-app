
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Lazy load components
const CandidateDiscoveryPage = dynamic(() => import('@/components/pages/CandidateDiscoveryPage').then(mod => mod.CandidateDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const JobDiscoveryPage = dynamic(() => import('@/components/pages/JobDiscoveryPage').then(mod => mod.JobDiscoveryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const AiToolsPage = dynamic(() => import('@/components/pages/AiToolsPage').then(mod => mod.AiToolsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MatchesPage = dynamic(() => import('@/components/pages/MatchesPage').then(mod => mod.MatchesPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const SettingsPage = dynamic(() => import('@/components/pages/SettingsPage').then(mod => mod.SettingsPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const RoleSelectionPage = dynamic(() => import('@/components/pages/RoleSelectionPage').then(mod => mod.RoleSelectionPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const LoginPage = dynamic(() => import('@/components/pages/LoginPage').then(mod => mod.LoginPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const CreateJobPostingPage = dynamic(() => import('@/components/pages/CreateJobPostingPage').then(mod => mod.CreateJobPostingPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const StaffDiaryPage = dynamic(() => import('@/components/pages/StaffDiaryPage').then(mod => mod.StaffDiaryPage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const WelcomePage = dynamic(() => import('@/components/pages/WelcomePage').then(mod => mod.WelcomePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });
const MyProfilePage = dynamic(() => import('@/components/pages/MyProfilePage').then(mod => mod.MyProfilePage), { loading: () => <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" /> });


const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcome';
const USER_ROLE_KEY = 'userRole';
const GUEST_MODE_KEY = 'isGuestModeActive';

export default function HomePage() {
  // Core state variables
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false); // Default to false, check localStorage
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("findJobs");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true); // Explicitly set loading to true at the start of the effect

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);

      if (user) {
        console.log("HomePage useEffect: onAuthStateChanged - User authenticated.");
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        localStorage.removeItem(GUEST_MODE_KEY);

        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        setUserRole(storedRole);
        console.log("HomePage useEffect: onAuthStateChanged - Stored role for authenticated user:", storedRole);
        
        if (hasSeenWelcomeStorage !== 'true') {
          setShowWelcomePage(true);
        } else {
          setShowWelcomePage(false);
          if (!storedRole) {
            // If welcome seen but no role, RoleSelectionPage should show, login won't show yet
          }
        }
      } else if (guestActive) {
        console.log("HomePage useEffect: onAuthStateChanged - Guest mode is active, no user session.");
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
        setIsAuthenticated(false);
        setUserRole(null); 
        setIsGuestMode(true);
        setShowWelcomePage(false); 
      } else { // No user and not guest
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, not guest.");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsGuestMode(false);
        
        if (hasSeenWelcomeStorage !== 'true') {
          setShowWelcomePage(true);
        } else {
          setShowWelcomePage(false);
          // Login page or role selection should be shown by rendering logic
        }
      }

      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage useEffect: onAuthStateChanged - Initial auth check complete, isInitialLoading set to false");
      }
    });

    getRedirectResult(auth)
      .then((result) => {
        console.log("HomePage useEffect: getRedirectResult result:", result);
        if (result?.user) {
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
          // onAuthStateChanged will handle the main state updates.
          // Explicitly remove guest mode if login was via redirect
          localStorage.removeItem(GUEST_MODE_KEY);
          setIsGuestMode(false); 
          // The logic within onAuthStateChanged should correctly set showWelcomePage and userRole.
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({
          title: "Sign-In Issue During Redirect",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
      })
      .finally(() => {
        // Ensure loading state is false if getRedirectResult was the first to complete the check
        // (though onAuthStateChanged is usually the primary path for this)
        if (!initialAuthCheckDone.current) {
            console.log("HomePage useEffect: getRedirectResult.finally - Fallback for initial flags if onAuthStateChanged was slow or no user from redirect.");
             const guestStillActiveAfterAttempt = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            if (guestStillActiveAfterAttempt && !auth.currentUser) {
                if (!isGuestMode) handleGuestMode(); // Sync state if somehow localStorage implies guest
            } else if (!auth.currentUser && !guestStillActiveAfterAttempt) {
                const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
                 if (hasSeenWelcomeStorage !== 'true') {
                    if(!showWelcomePage) setShowWelcomePage(true);
                } else {
                    if(showWelcomePage) setShowWelcomePage(false);
                }
            }
            initialAuthCheckDone.current = true;
            setIsInitialLoading(false);
        }
      });

    return () => {
      console.log("HomePage useEffect: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = () => {
    console.log("HomePage: handleStartExploring called");
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false);
    // After welcome, if no role, RoleSelectionPage should appear.
    // If authenticated and role exists, main app.
    // If not authenticated, LoginPage should appear (if role has been selected or is not required before login).
  };

  const handleLoginBypass = () => {
    console.log("HomePage: handleLoginBypass called");
    const mockUser: User = {
      uid: `mock-bypass-user-${Date.now()}`,
      email: 'dev.user@example.com',
      displayName: 'Dev User (Bypass)',
      emailVerified: true, isAnonymous: false, metadata: {creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber: null, photoURL: null, providerData: [],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: `mock-bypass-user-${Date.now()}`, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY);
    
    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setUserRole(storedRoleValue); 
    console.log("HomePage: handleLoginBypass - Stored role:", storedRoleValue);
    
    setShowWelcomePage(false); 
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');

    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage: handleLoginBypass - Initial auth check forced complete.");
    }
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };

  const handleGuestMode = () => {
    console.log("HomePage: handleGuestMode called");
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setIsAuthenticated(false); // Guests are not authenticated
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
    setUserRole(null); // Guests don't have a role that restricts tabs initially
    setShowWelcomePage(false); // Guests bypass welcome page
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true'); // Mark welcome as seen for guest session

    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest."});
  };

  const handleRoleSelect = (role: UserRole) => {
    console.log("HomePage: handleRoleSelect called with role:", role);
    localStorage.setItem(USER_ROLE_KEY, role);
    setUserRole(role);
    // After role selection, if not authenticated, LoginPage should appear.
    // Welcome page should already be handled.
    setShowWelcomePage(false); 
    if (!isAuthenticated && !isGuestMode) {
        // LoginPage will be shown by rendering logic
    }
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will set: currentUser=null, isAuthenticated=false
      localStorage.removeItem(GUEST_MODE_KEY); 
      setIsGuestMode(false);
      localStorage.removeItem(USER_ROLE_KEY);
      setUserRole(null); 
      // Determine if welcome page should be shown again. Generally no on logout, direct to login or role select.
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
      setShowWelcomePage(hasSeenWelcomeStorage !== 'true');
      
      // Reset tab to a sensible default (Jobseeker view if no role, or default for previous role)
      setActiveTab('findJobs'); 

      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    console.log("HomePage: handleLoginRequest called - Login page should be shown.");
    if (isGuestMode) {
        localStorage.removeItem(GUEST_MODE_KEY);
        setIsGuestMode(false);
        // The main rendering logic will take over to show LoginPage
        // Force welcome check again for a non-guest flow
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        setShowWelcomePage(hasSeenWelcomeStorage !== 'true');
    }
  };

  // Define tab items (will be filtered based on role/guest status)
  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} currentUserRole={userRole} /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage isGuestMode={isGuestMode} /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage isGuestMode={isGuestMode} currentUserRole={userRole} onRoleChange={handleRoleSelect} /> },
  ];

  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage searchTerm={searchTerm} isGuestMode={isGuestMode} /> },
    { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage searchTerm={searchTerm} isGuestMode={isGuestMode} /> },
    { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage isGuestMode={isGuestMode} /> },
    { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];
  
  let currentTabItems = jobseekerTabItems; // Default (also for guest)
  if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestMode && isAuthenticated && userRole === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  } else if (isGuestMode) {
    // Guests see a jobseeker-like view but with restrictions handled inside components
    currentTabItems = jobseekerTabItems; 
  }


  useEffect(() => {
    // This effect runs when userRole or isGuestMode changes, or after initial loading.
    // It ensures the activeTab is valid for the current context.
    if (!isInitialLoading && initialAuthCheckDone.current) {
      const itemsForCurrentContext = isGuestMode 
        ? jobseekerTabItems 
        : (isAuthenticated && userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems);
      
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      
      let defaultTabForCurrentContext = "findJobs"; // Default for jobseeker/guest
      if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
        defaultTabForCurrentContext = "findTalent";
      }

      if (!validTabValues.includes(activeTab) || 
          (userRole === 'recruiter' && activeTab === 'findJobs') || 
          (userRole === 'jobseeker' && activeTab === 'findTalent') ||
          (isGuestMode && activeTab === 'findTalent') ) { // Guests shouldn't default to 'findTalent'
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isGuestMode, isAuthenticated, isInitialLoading]); 

  // console.log for debugging current state before rendering
  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole, "isGuestMode:", isGuestMode, "activeTab:", activeTab);

  if (isInitialLoading) {
    console.log("HomePage: Rendering Loader2 because isInitialLoading is true.");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Desired Flow: Welcome -> Role Selection -> Login -> Main App
  if (showWelcomePage && !isGuestMode) { 
    console.log("HomePage: Rendering WelcomePage.");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  if (!isGuestMode && !userRole && !showWelcomePage && isAuthenticated) { 
    // Authenticated but no role selected AFTER welcome
    console.log("HomePage: Rendering RoleSelectionPage (authenticated, no role, welcome done).");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }
   if (!isGuestMode && !userRole && !showWelcomePage && !isAuthenticated) { 
    // Not authenticated, no role, welcome done. This is a common path after welcome.
    console.log("HomePage: Rendering RoleSelectionPage (not authenticated, no role, welcome done).");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }
  
  if (!isGuestMode && userRole && !isAuthenticated && !showWelcomePage) { 
    // Role selected, but not authenticated, AFTER welcome
    console.log("HomePage: Rendering LoginPage (role selected, not authenticated, welcome done).");
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }
  
  // Fallback for unhandled states before main app - typically to LoginPage if conditions are messy
  if (!isGuestMode && !isAuthenticated && !showWelcomePage && !initialAuthCheckDone.current) {
    // This case should ideally be covered by isInitialLoading, but as a safeguard
    console.log("HomePage: Rendering LoginPage as a deep fallback (complex state).");
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }

  // Main App Content (Authenticated users with a role, or Guests)
  console.log("HomePage: Rendering Main App Content for user/guest.");
  
  const mainAppContainerClasses = cn(
    "flex flex-col min-h-screen",
    isGuestMode ? 'jobseeker-role-bg-blueish' : // Neutral for guest
    isAuthenticated && userRole === 'recruiter' ? 'recruiter-role-bg' :
    isAuthenticated && userRole === 'jobseeker' ? 'jobseeker-role-bg' :
    'bg-background' // Fallback, or for login/role selection if they didn't have their own full bg
  );

  return (
    <div className={mainAppContainerClasses}>
      <AppHeader
        isAuthenticated={isAuthenticated}
        isGuestMode={isGuestMode}
        onLoginRequest={handleLoginRequest}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        userName={currentUser?.displayName || currentUser?.email}
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
                ...(item.value === 'settings' && { currentUserRole: userRole, onRoleChange: handleRoleSelect }),
                ...(item.value === 'aiTools' && { currentUserRole: userRole }) // Pass role to AiToolsPage
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SwipeHire. All rights reserved.
      </footer>
    </div>
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
