
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye } from 'lucide-react'; // Added Eye for Guest
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

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
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("findTalent"); 
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true); // Ensure it starts true

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';

      if (guestActive) {
        console.log("HomePage useEffect: onAuthStateChanged - Guest mode is active from localStorage, handling guest state.");
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User' } as User); // Mock guest user
        setIsAuthenticated(false); // Guests are not authenticated
        setUserRole(null); // Guests browse generally, no specific role initially
        setIsGuestMode(true);
        setShowWelcomePage(false); // Guests bypass welcome
      } else if (user) {
        console.log("HomePage useEffect: onAuthStateChanged - User authenticated.");
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        setUserRole(storedRole);
        console.log("HomePage useEffect: onAuthStateChanged - Stored role:", storedRole);
        
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        if (hasSeenWelcomeStorage !== 'true') {
            setShowWelcomePage(true);
        } else {
            setShowWelcomePage(false);
        }
      } else {
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, clearing active user state.");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsGuestMode(false); // Ensure guest mode is off if no user and not explicitly in guest mode
        // Welcome page logic for non-authenticated, non-guest users
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        if (hasSeenWelcomeStorage !== 'true') {
            setShowWelcomePage(true);
        } else {
            setShowWelcomePage(false);
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
          // onAuthStateChanged will handle main state, but ensure guest mode is off
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
        // Ensure loading is false if getRedirectResult was the first to finish and onAuthStateChanged hasn't run yet
        if (!initialAuthCheckDone.current) {
            initialAuthCheckDone.current = true;
            setIsInitialLoading(false);
            console.log("HomePage useEffect: getRedirectResult.finally - Forcing initial flags processing as a fallback.");
             // Re-check welcome state based on current (likely null) user if onAuthStateChanged hasn't set it
            if (localStorage.getItem(GUEST_MODE_KEY) !== 'true' && localStorage.getItem(HAS_SEEN_WELCOME_KEY) !== 'true') {
                 setShowWelcomePage(true);
            }
        }
      });

    return () => {
      console.log("HomePage useEffect: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [toast]); 


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
    setUserRole(storedRoleValue); 
    console.log("HomePage: handleLoginBypass - Stored role:", storedRoleValue);
    
    setShowWelcomePage(false); // Bypass welcome

    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage: handleLoginBypass - Initial auth check forced complete, isInitialLoading set to false. ShowWelcomePage forced to false.");
    }
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };

  const handleGuestMode = () => {
    console.log("HomePage: handleGuestMode called");
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setIsAuthenticated(false); // Guests are not authenticated
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({})} as User); // Mock guest user
    setUserRole(null); // Guests browse generally, no specific role initially
    setShowWelcomePage(false); // Guests bypass welcome directly to role selection or app

    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest. Some features will be limited."});
  };


  const handleRoleSelect = (role: UserRole) => {
    console.log("HomePage: handleRoleSelect called with role:", role);
    localStorage.setItem(USER_ROLE_KEY, role);
    setUserRole(role);
    // Set default tab based on role
    if (role === 'recruiter') {
      setActiveTab('findTalent');
    } else {
      setActiveTab('findJobs');
    }
    // Welcome page would have already been handled or skipped.
    // If guest mode was active, selecting a role implies they might want to log in next.
    // However, actual login is a separate step.
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will handle resetting: currentUser, isAuthenticated.
      // It will also set isGuestMode to false if not already handled.
      localStorage.removeItem(GUEST_MODE_KEY);
      setIsGuestMode(false); 
      // USER_ROLE_KEY is not cleared by default for convenience.
      // HAS_SEEN_WELCOME_KEY is not cleared.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    console.log("HomePage: handleLoginRequest called - This means Login page should be shown.");
    // If guest mode is active, turn it off as user intends to login
    if (isGuestMode) {
        localStorage.removeItem(GUEST_MODE_KEY);
        setIsGuestMode(false);
    }
    // The rendering logic will show LoginPage if !isAuthenticated and other prerequisites are met.
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage isGuestMode={isGuestMode} /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage isGuestMode={isGuestMode} currentUserRole={userRole} onRoleChange={handleRoleSelect} /> },
  ];

  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage isGuestMode={isGuestMode} searchTerm={searchTerm} /> },
    { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage isGuestMode={isGuestMode} searchTerm={searchTerm} /> },
    { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage isGuestMode={isGuestMode} /> },
    { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];

  let currentTabItems = jobseekerTabItems; 
  if (userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (isGuestMode) {
    // For guests, provide a generic set of tabs, perhaps more limited or a combined view.
    // For now, let's default to jobseeker view for browsing, but with restrictions.
    // Or, choose a sensible default if no role implies guest too
    currentTabItems = jobseekerTabItems; // Default for guest, individual pages will handle restrictions.
  }


  useEffect(() => {
    // Adjust active tab if current one is not available for the role/guest status
    if (userRole || isGuestMode) { // Only run if role is set or guest mode is active
      const itemsForCurrentContext = userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems; // Guests default to jobseeker view items for now
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      
      let defaultTabForCurrentContext = "findJobs"; // Default for jobseeker/guest
      if (userRole === 'recruiter') {
        defaultTabForCurrentContext = "findTalent";
      }

      if (!validTabValues.includes(activeTab)) {
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isGuestMode, activeTab]);


  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole, "isGuestMode:", isGuestMode);

  if (isInitialLoading) {
    console.log("HomePage: Rendering Loader2 because isInitialLoading is true.");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Desired flow: Welcome -> Role Selection -> Login -> Main App (or Main App if Guest)
  if (showWelcomePage && !isGuestMode) { // Guests skip welcome
    console.log("HomePage: Rendering WelcomePage because showWelcomePage is true and not in guest mode.");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  if (!userRole && !isGuestMode) { // Role selection if not guest and no role
    console.log("HomePage: Rendering RoleSelectionPage because !userRole and not in guest mode (and welcome page done).");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // If a role is selected (or guest mode is active, implies role selection can be skipped for browsing),
  // but user is NOT authenticated AND NOT in guest mode, show Login.
  if (!isAuthenticated && !isGuestMode) { 
    console.log("HomePage: Rendering LoginPage because !isAuthenticated and not in guest mode (and role is selected or bypassed, welcome is done).");
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }

  // All prerequisites met (or in guest mode): Authenticated, or guest mode active. Role selected (or guest). Welcome seen (or guest).
  console.log("HomePage: Rendering Main App Content because all prerequisite conditions met or in guest mode.");
  return (
    <div className="flex flex-col min-h-screen bg-background">
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
                isGuestMode, // Pass isGuestMode to all tab components
                // For SettingsPage, ensure other necessary props are still passed
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
    
