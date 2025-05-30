
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
  const [showWelcomePage, setShowWelcomePage] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("findTalent");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true);
    initialAuthCheckDone.current = false; // Reset this ref on effect run

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);

        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        console.log("HomePage useEffect: onAuthStateChanged - Stored user role:", storedRole);
        setUserRole(storedRole);

        const seenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
        console.log("HomePage useEffect: onAuthStateChanged - Seen welcome:", seenWelcome);
        // Show welcome if authenticated, role is selected (or no role needed to see welcome), AND not seen welcome
        if (!seenWelcome && (storedRole || !storedRole /* Adjust if welcome should show even before role selection */)) {
          console.log("HomePage useEffect: onAuthStateChanged - Setting showWelcomePage to true");
          setShowWelcomePage(true);
        } else {
          console.log("HomePage useEffect: onAuthStateChanged - Setting showWelcomePage to false");
          setShowWelcomePage(false);
        }
      } else {
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, clearing state.");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setShowWelcomePage(false);
        localStorage.removeItem(USER_ROLE_KEY);
        // Decide if HAS_SEEN_WELCOME_KEY should be cleared on logout for next login
        // localStorage.removeItem(HAS_SEEN_WELCOME_KEY); 
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
          // onAuthStateChanged should handle the state update based on this result.
          // If there's a case where onAuthStateChanged doesn't fire quickly enough after redirect,
          // you might need to manually trigger a state update here or call a processing function.
          // For now, we rely on onAuthStateChanged.
        }
        // If getRedirectResult finishes before the first onAuthStateChanged and no user was redirected,
        // and initialAuthCheckDone is still false, it means onAuthStateChanged will soon run with user=null.
        // We ensure that isInitialLoading is set to false by onAuthStateChanged in that case.
        if (!result?.user && !initialAuthCheckDone.current) {
          console.log("HomePage useEffect: getRedirectResult - No redirect user and initial check not done. Waiting for onAuthStateChanged.");
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({
          title: "Sign-In Issue During Redirect",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
        // Ensure loading finishes even if redirect processing fails before onAuthStateChanged
        if (!initialAuthCheckDone.current) {
          initialAuthCheckDone.current = true; // Mark as done to avoid multiple sets of isInitialLoading
          setIsInitialLoading(false);
          console.log("HomePage useEffect: getRedirectResult error - Initial auth check forced complete, isInitialLoading set to false");
        }
      });

    return () => {
      console.log("HomePage useEffect: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      emailVerified: true,
      isAnonymous: false,
      metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
      phoneNumber: null, photoURL: null, providerData: [{ providerId: 'google.com', uid: `mock-google-uid-${Date.now()}`, displayName: 'Dev User (Bypass)', email: 'dev.user@example.com', phoneNumber: null, photoURL: null, }],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: (_forceRefresh?: boolean) => Promise.resolve('mock-id-token'),
      getIdTokenResult: (_forceRefresh?: boolean) => Promise.resolve({ token: 'mock-id-token', expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(), authTime: new Date().toISOString(), issuedAtTime: new Date().toISOString(), signInProvider: 'google.com', signInSecondFactor: null, claims: {}, }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: `mock-bypass-user-${Date.now()}`, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setUserRole(storedRoleValue);

    const seenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
    // Show welcome if not seen AND (either no role is set yet OR a role is set - adjust logic if welcome depends on role presence strictly)
    setShowWelcomePage(!seenWelcome);


    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
         console.log("HomePage: handleLoginBypass - Initial auth check forced complete, isInitialLoading set to false");
    }

    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };


  const handleRoleSelect = (role: UserRole) => {
    console.log("HomePage: handleRoleSelect called with role:", role);
    localStorage.setItem(USER_ROLE_KEY, role);
    setUserRole(role);
    if (role === 'recruiter') {
      setActiveTab('findTalent');
    } else {
      setActiveTab('findJobs');
    }
    // If selecting a role means they've "started", hide welcome page
    // This depends on whether role selection *is* the start of exploring.
    // If welcome page is intended to be shown *after* role selection, this logic changes.
    // Assuming role selection means exploration started:
    if (showWelcomePage) {
        localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
        setShowWelcomePage(false);
    }
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      // onAuthStateChanged will handle resetting:
      // currentUser, isAuthenticated, userRole, showWelcomePage.
      // It also clears USER_ROLE_KEY from localStorage.
      // You might want to explicitly clear HAS_SEEN_WELCOME_KEY if users should see it again on next login.
      // localStorage.removeItem(HAS_SEEN_WELCOME_KEY); 
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    console.log("HomePage: handleLoginRequest called - typically navigates to login or shows modal");
    // In this single-page model, this might set a state to show a login modal,
    // or ensure welcome page is false if user explicitly clicks login.
    // For now, the rendering logic handles showing LoginPage if !isAuthenticated.
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

  let currentTabItems = jobseekerTabItems; // Default
  if (userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  }

  useEffect(() => {
    if (userRole && isAuthenticated) {
      const itemsForCurrentRole = userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems;
      const validTabValues = itemsForCurrentRole.map(item => item.value);
      const defaultTabForCurrentRole = userRole === 'recruiter' ? "findTalent" : "findJobs";

      if (!validTabValues.includes(activeTab)) {
        setActiveTab(defaultTabForCurrentRole);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isAuthenticated, activeTab]);


  // ------ Page Rendering Logic ------
  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole);

  if (isInitialLoading) {
    console.log("HomePage: Rendering Loader2");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Show welcome page if authenticated and it's time to show it.
  if (isAuthenticated && showWelcomePage) {
    console.log("HomePage: Rendering WelcomePage");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }

  // If not authenticated (and by implication, welcome page process is done or not applicable for non-auth user)
  if (!isAuthenticated) {
    console.log("HomePage: Rendering LoginPage");
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }

  // If authenticated, welcome seen (or skipped), but no role selected
  if (!userRole) {
    console.log("HomePage: Rendering RoleSelectionPage");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // Authenticated, welcome seen (or skipped), role selected -> Show main app
  console.log("HomePage: Rendering Main App Content");
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
    
