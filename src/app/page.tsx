
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle } from 'lucide-react';
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

export default function HomePage() {
  // Core state variables
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("findTalent"); // Default for recruiter
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true);
    initialAuthCheckDone.current = false;

    const processInitialFlags = (user: User | null, roleForWelcomeCheck: UserRole | null) => {
      if (!initialAuthCheckDone.current) {
        console.log("HomePage useEffect: processInitialFlags. User:", user, "Role for welcome check:", roleForWelcomeCheck);
        
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        console.log("HomePage useEffect: processInitialFlags. hasSeenWelcomeStorage:", hasSeenWelcomeStorage);
        if (hasSeenWelcomeStorage !== 'true') {
            setShowWelcomePage(true);
            console.log("HomePage useEffect: processInitialFlags. Welcome not seen, setting showWelcomePage to true.");
        } else {
            setShowWelcomePage(false);
            console.log("HomePage useEffect: processInitialFlags. Welcome seen, setting showWelcomePage to false.");
        }
        
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage useEffect: processInitialFlags. Initial flags processed, isInitialLoading set to false.");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        setUserRole(storedRole);
        console.log("HomePage useEffect: onAuthStateChanged - User authenticated. Stored role:", storedRole);
        processInitialFlags(user, storedRole);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, clearing active user state.");
        processInitialFlags(null, null);
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
          // onAuthStateChanged will likely fire and update state, but ensure flags are set if it's slower
          if (!initialAuthCheckDone.current) {
            const user = result.user;
            const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
            processInitialFlags(user, storedRole); // Ensure flags are processed
          }
        } else if (!initialAuthCheckDone.current) {
            // If getRedirectResult is null and onAuthStateChanged hasn't finished its first run
            console.log("HomePage useEffect: getRedirectResult is null, onAuthStateChanged might be pending initial run, processing flags.");
            processInitialFlags(null, null);
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({
          title: "Sign-In Issue During Redirect",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
        if (!initialAuthCheckDone.current) {
            processInitialFlags(null, null); 
        }
      })
      .finally(() => {
        // Fallback: Ensure initial loading flags are processed if nothing else has by now.
        if (!initialAuthCheckDone.current) {
            console.log("HomePage useEffect: getRedirectResult.finally - Forcing initial flags processing as a fallback.");
            processInitialFlags(currentUser, userRole); // Use current state if available, or nulls
        }
      });

    return () => {
      console.log("HomePage useEffect: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentUser, userRole were removed to avoid re-running this complex logic on every render during their update


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
    // After welcome, user might need to select a role or log in
    // The main rendering logic will handle this progression
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

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setUserRole(storedRoleValue); // Set role from storage
    console.log("HomePage: handleLoginBypass - Stored role:", storedRoleValue);

    // Explicitly handle initial flags if bypass happens very early
    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
        if (!hasSeenWelcomeStorage) { // if welcome not seen
            setShowWelcomePage(true);
        } else {
            setShowWelcomePage(false); // welcome seen, ensure it's false
            // if role is also not set, role selection should appear
        }
        console.log("HomePage: handleLoginBypass - Initial auth check forced complete, isInitialLoading set to false. ShowWelcomePage:", !hasSeenWelcomeStorage);
    } else {
      // If initial check already done, just ensure welcome page is false if already seen
      if (localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true') {
        setShowWelcomePage(false);
      }
    }
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
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
    // After role selection, if user is not authenticated, LoginPage should appear
    // No need to manage showWelcomePage here, as it's handled by its own state and rendering order
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will handle resetting: currentUser, isAuthenticated.
      // USER_ROLE_KEY is not cleared by default, allowing user to log back in with same role.
      // HAS_SEEN_WELCOME_KEY is not cleared.
      // No need to manually set userRole to null here, onAuthStateChanged does this.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    console.log("HomePage: handleLoginRequest called - This means Login page should be shown.");
    // Ensures other modal-like pages are not shown if a login is explicitly requested.
    // The main rendering logic will enforce showing LoginPage if role is set but not authenticated.
    // If welcome not seen, and role not set, those will take precedence over direct login request from header.
    // This function essentially signals intent, but the state-driven rendering determines the view.
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage currentUserRole={userRole} onRoleChange={handleRoleSelect} /> },
  ];

  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage searchTerm={searchTerm} /> },
    { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage /> },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage searchTerm={searchTerm} /> },
    { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage /> },
    { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage /> },
    ...baseTabItems,
  ];

  let currentTabItems = jobseekerTabItems; // Default to jobseeker if role is somehow null but app shown
  if (userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  }

  useEffect(() => {
    if (userRole) {
      const itemsForCurrentRole = userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems;
      const validTabValues = itemsForCurrentRole.map(item => item.value);
      const defaultTabForCurrentRole = userRole === 'recruiter' ? "findTalent" : "findJobs";

      if (!validTabValues.includes(activeTab)) {
        setActiveTab(defaultTabForCurrentRole);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, activeTab]);


  // ------ Page Rendering Logic ------
  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole);

  if (isInitialLoading) {
    console.log("HomePage: Rendering Loader2 because isInitialLoading is true.");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Flow: Welcome -> Role Selection -> Login -> Main App
  if (showWelcomePage) {
    console.log("HomePage: Rendering WelcomePage because showWelcomePage is true.");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  if (!userRole) { // Welcome is done, now check for role
    console.log("HomePage: Rendering RoleSelectionPage because !userRole (and welcome page condition not met).");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // Welcome done, Role selected, now check for authentication
  if (!isAuthenticated) { 
    console.log("HomePage: Rendering LoginPage because !isAuthenticated (and role is selected, welcome is done).");
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }

  // All prerequisites met: Authenticated, welcome seen, role selected -> Show main app
  console.log("HomePage: Rendering Main App Content because all prerequisite conditions met.");
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        isAuthenticated={isAuthenticated}
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
              {React.cloneElement(item.component, (item.value === 'findTalent' || item.value === 'findJobs') ? { searchTerm } : {})}
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
    

