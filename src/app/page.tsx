
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
import { cn } from "@/lib/utils"; // Import cn utility

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
  const [showWelcomePage, setShowWelcomePage] = useState(false); // Default to false, will be set by useEffect
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("findJobs"); // Default for jobseeker/guest
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true); // Explicitly set at the start of the effect

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';

      if (user) {
        console.log("HomePage useEffect: onAuthStateChanged - User authenticated.");
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false); 
        localStorage.removeItem(GUEST_MODE_KEY);

        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        setUserRole(storedRole);
        console.log("HomePage useEffect: onAuthStateChanged - Stored role for authenticated user:", storedRole);
        
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        setShowWelcomePage(hasSeenWelcomeStorage !== 'true');

      } else if (guestActive) {
        console.log("HomePage useEffect: onAuthStateChanged - Guest mode is active, no user session. Handling guest state.");
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User' } as User); // Minimal mock user
        setIsAuthenticated(false);
        setUserRole(null); 
        setIsGuestMode(true);
        setShowWelcomePage(false); // Guests bypass welcome
      } else { // No user and not guest
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, not guest. Clearing active user state.");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsGuestMode(false);
        
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        setShowWelcomePage(hasSeenWelcomeStorage !== 'true');
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
          // Ensure guest mode is cleared if login via redirect was successful
          localStorage.removeItem(GUEST_MODE_KEY);
          setIsGuestMode(false);
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
        // This helps ensure loading is false if getRedirectResult finishes
        // and onAuthStateChanged hasn't yet completed the *very first* check.
        if (!initialAuthCheckDone.current) {
            console.log("HomePage useEffect: getRedirectResult.finally - Fallback for initial flags if onAuthStateChanged was slow.");
            // If guest mode was active before attempting login, and login failed or no redirect, it should persist.
            const guestStillActiveAfterAttempt = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            if (guestStillActiveAfterAttempt && !auth.currentUser) {
                if (!isGuestMode) handleGuestMode(); // Re-affirm guest mode if needed
            } else if (!auth.currentUser && !guestStillActiveAfterAttempt) {
                 // No user, not guest, and onAuthStateChanged hasn't run. Process potential welcome page.
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
  }, []); // Empty dependency array ensures this runs once on mount


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
    // After welcome, if not authenticated and no role, LoginPage will be shown.
    // If authenticated but no role, RoleSelectionPage will be shown.
  };

  const handleLoginBypass = () => {
    console.log("HomePage: handleLoginBypass called");
    const mockUser: User = {
      uid: `mock-bypass-user-${Date.now()}`,
      email: 'dev.user@example.com',
      displayName: 'Dev User (Bypass)',
      emailVerified: true, isAnonymous: false, metadata: {}, phoneNumber: null, photoURL: null, providerData: [],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: `mock-bypass-user-${Date.now()}`, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY);

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setUserRole(storedRoleValue); // If a role was stored, use it
    console.log("HomePage: handleLoginBypass - Stored role:", storedRoleValue);
    
    setShowWelcomePage(false); // Bypass welcome

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
    setIsAuthenticated(false);
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({})} as User);
    setUserRole(null); // Guests browse generally, no specific role initially
    setShowWelcomePage(false); // Guests bypass welcome

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
    
    // Default tab setting will be handled by the useEffect below.
    // If not authenticated, LoginPage will show next.
    // If authenticated, main app content will show.
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will set: currentUser=null, isAuthenticated=false, userRole=null.
      localStorage.removeItem(GUEST_MODE_KEY); 
      setIsGuestMode(false);
      localStorage.removeItem(USER_ROLE_KEY); // Also clear stored role on logout
      setUserRole(null); // Ensure userRole state is cleared
      
      // Determine if welcome page should be shown again after logout
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
      setShowWelcomePage(hasSeenWelcomeStorage !== 'true');

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
    }
    // The main rendering logic will take over to show LoginPage if !isAuthenticated.
    // No direct state change here to show LoginPage, as it's based on isAuthenticated.
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} /> },
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

  let currentTabItems = jobseekerTabItems; // Default to jobseeker for guests or un-roled users
  if (!isGuestMode && userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestMode && userRole === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  }


  useEffect(() => {
    if (!isInitialLoading) { // Only adjust tab after initial load
      const itemsForCurrentContext = (!isGuestMode && userRole === 'recruiter') ? recruiterTabItems : jobseekerTabItems;
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      
      let defaultTabForCurrentContext = "findJobs"; // Default for jobseeker/guest
      if (!isGuestMode && userRole === 'recruiter') {
        defaultTabForCurrentContext = "findTalent";
      }

      if (!validTabValues.includes(activeTab) || 
          (userRole === 'recruiter' && activeTab === 'findJobs') || 
          (userRole === 'jobseeker' && activeTab === 'findTalent')) {
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isGuestMode, isInitialLoading]); 

  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole, "isGuestMode:", isGuestMode);

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
    // WelcomePage defines its own 'dynamic-bg'
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  // After Welcome, if authenticated but no role, show Role Selection.
  if (!isGuestMode && !userRole && !showWelcomePage && initialAuthCheckDone.current && isAuthenticated) {
    console.log("HomePage: Rendering RoleSelectionPage (authenticated, no role).");
    // RoleSelectionPage defines its own 'dynamic-bg'
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }
  
  // After Welcome, if role selected but not authenticated, show Login.
  if (!isGuestMode && !isAuthenticated && !showWelcomePage && userRole && initialAuthCheckDone.current && !isInitialLoading) {
    console.log("HomePage: Rendering LoginPage (role selected, not authenticated).");
     // LoginPage defines its own 'dynamic-bg'
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }

  // After Welcome, if NO role selected AND NOT authenticated, show Login.
  if (!isGuestMode && !isAuthenticated && !showWelcomePage && !userRole && initialAuthCheckDone.current && !isInitialLoading) {
    console.log("HomePage: Rendering LoginPage (no role, not authenticated, welcome done).");
    // LoginPage defines its own 'dynamic-bg'
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }


  // Main App Content (Authenticated users with a role, or Guests)
  console.log("HomePage: Rendering Main App Content.");
  
  const mainAppContainerClasses = cn(
    "flex flex-col min-h-screen", // Base classes
    {
      'jobseeker-role-bg-blueish': isGuestMode,
      'recruiter-role-bg': !isGuestMode && userRole === 'recruiter' && isAuthenticated,
      'jobseeker-role-bg': !isGuestMode && userRole === 'jobseeker' && isAuthenticated,
      'bg-background': !isGuestMode && !userRole && !isAuthenticated // Fallback if other states aren't met (e.g. during brief transitions or unexpected state)
    }
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
                ...(item.value === 'settings' && { currentUserRole: userRole, onRoleChange: handleRoleSelect })
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


    