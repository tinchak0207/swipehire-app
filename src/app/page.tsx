
"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateDiscoveryPage } from "@/components/pages/CandidateDiscoveryPage";
import { JobDiscoveryPage } from "@/components/pages/JobDiscoveryPage";
import { AiToolsPage } from "@/components/pages/AiToolsPage";
import { MatchesPage } from "@/components/pages/MatchesPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { RoleSelectionPage } from "@/components/pages/RoleSelectionPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { CreateJobPostingPage } from "@/components/pages/CreateJobPostingPage";
import { StaffDiaryPage } from "@/components/pages/StaffDiaryPage";
import { WelcomePage } from "@/components/pages/WelcomePage";
import { MyProfilePage } from "@/components/pages/MyProfilePage";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";


const HAS_SEEN_WELCOME_KEY = 'hasSeenSwipeHireWelcome';
const USER_ROLE_KEY = 'userRole';

export default function HomePage() {
  // Core state variables
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false); // Default to false, useEffect will set it

  const [activeTab, setActiveTab] = useState<string>("findTalent"); // Default for recruiter
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true); // Explicitly set loading to true at the start of the effect.
    initialAuthCheckDone.current = false;

    const processInitialFlags = () => {
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage useEffect: Initial flags processed, isInitialLoading set to false.");

        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
        if (!hasSeenWelcomeStorage) {
            setShowWelcomePage(true);
            console.log("HomePage useEffect: Welcome not seen in storage, setting showWelcomePage to true.");
        } else {
            setShowWelcomePage(false);
            console.log("HomePage useEffect: Welcome seen in storage, setting showWelcomePage to false.");
        }
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
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        // Don't clear USER_ROLE_KEY here, allow role selection even if logged out then back in.
        // Welcome page state is determined by its own flag.
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, clearing active user state.");
      }
      processInitialFlags();
    });

    getRedirectResult(auth)
      .then((result) => {
        console.log("HomePage useEffect: getRedirectResult result:", result);
        if (result?.user) {
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
          // onAuthStateChanged will also fire and handle the main state updates.
        }
        // Ensure initial flags are processed if getRedirectResult finishes before onAuthStateChanged completes the *first* check
        processInitialFlags();
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({
          title: "Sign-In Issue During Redirect",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
        processInitialFlags(); // Also ensure flags are processed on error
      })
      .finally(() => {
        // Fallback: Ensure initial loading flags are processed if nothing else has by now.
        // This is a safeguard.
        if (!initialAuthCheckDone.current) {
            console.log("HomePage useEffect: getRedirectResult.finally - Forcing initial flags processing.");
            processInitialFlags();
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

    // Check existing role, bypass doesn't select a role automatically
    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setUserRole(storedRoleValue);
    console.log("HomePage: handleLoginBypass - Stored role:", storedRoleValue);

    // If initial auth check hasn't completed (e.g. bypass clicked very fast), ensure it's marked as done.
    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
        console.log("HomePage: handleLoginBypass - Initial auth check forced complete, isInitialLoading set to false");
        // And ensure welcome page logic runs if it hasn't
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
        if (!hasSeenWelcomeStorage) {
            setShowWelcomePage(true);
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
    // The rendering logic will now determine the next page (likely LoginPage if not authenticated)
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will handle resetting: currentUser, isAuthenticated.
      // userRole remains from localStorage unless explicitly cleared or user changes it.
      // HAS_SEEN_WELCOME_KEY is not cleared on logout.
      // Explicitly clear userRole from localStorage if desired on logout.
      // localStorage.removeItem(USER_ROLE_KEY);
      // setUserRole(null); // if USER_ROLE_KEY is removed.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    console.log("HomePage: handleLoginRequest called");
    // Ensures other modal-like pages are not shown if a login is explicitly requested.
    setShowWelcomePage(false);
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

  let currentTabItems = jobseekerTabItems;
  if (userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  }

  useEffect(() => {
    // This effect ensures the activeTab is valid for the current userRole.
    if (userRole) { // Only run if userRole is determined
      const itemsForCurrentRole = userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems;
      const validTabValues = itemsForCurrentRole.map(item => item.value);
      const defaultTabForCurrentRole = userRole === 'recruiter' ? "findTalent" : "findJobs";

      if (!validTabValues.includes(activeTab)) {
        setActiveTab(defaultTabForCurrentRole);
      }
    } else {
        // If no role, maybe set a general default or ensure no tab is "active" if tabs aren't shown
        // For now, we'll assume tabs are only shown when a role is set and user is authenticated.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, activeTab]); // Removed isAuthenticated from deps as role selection implies intent


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

  // Step 1: Show WelcomePage if it hasn't been seen.
  if (showWelcomePage) {
    console.log("HomePage: Rendering WelcomePage because showWelcomePage is true.");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  // Step 2: If Welcome is done (or wasn't needed), and no role selected, show RoleSelectionPage.
  if (!userRole) {
    console.log("HomePage: Rendering RoleSelectionPage because !userRole and welcome page condition not met.");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // Step 3: If Welcome is done, AND a role is selected, but user is not authenticated, show LoginPage.
  if (!isAuthenticated) { // userRole is guaranteed to be set here
    console.log("HomePage: Rendering LoginPage because !isAuthenticated, but role is selected and welcome is done.");
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }

  // Step 4: Authenticated, welcome seen (or not applicable), role selected -> Show main app
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
    
