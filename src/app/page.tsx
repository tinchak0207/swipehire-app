
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginPage, setShowLoginPage] = useState<boolean>(false); // Initial state should not assume login page
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("findTalent"); // Default for recruiter
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false); // Tracks if the first auth check has completed

  useEffect(() => {
    // Listener for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setShowLoginPage(false); // User is authenticated, hide login page

        const storedRoleValue = localStorage.getItem(USER_ROLE_KEY);
        if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
          const role = storedRoleValue as UserRole;
          setUserRole(role);
          // Determine welcome page visibility after role is known
          const hasSeenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
          if (hasSeenWelcome !== 'true') {
            setShowWelcomePage(true); // Still show welcome if first time, even with role
          } else {
            setShowWelcomePage(false);
          }
        } else {
          setUserRole(null); // No valid role, prompt for role selection
          // If authenticated but no role, might still show welcome if it's their first time
          const hasSeenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
          if (hasSeenWelcome !== 'true') {
            setShowWelcomePage(true);
          } else {
             setShowWelcomePage(false); // If welcome seen, and no role, role selection will show
          }
        }
      } else {
        // No user
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem(USER_ROLE_KEY);

        // Decide whether to show Welcome or Login
        const hasSeenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        if (hasSeenWelcome !== 'true') {
          setShowWelcomePage(true);
          setShowLoginPage(false); // Welcome page handles navigation to login if needed
        } else {
          setShowWelcomePage(false);
          setShowLoginPage(true); // Welcome has been seen, no user, show login
        }
      }

      // Mark initial auth check as done and stop global loading spinner
      if (!initialAuthCheckDone.current) {
        setIsInitialLoading(false);
        initialAuthCheckDone.current = true;
      }
    });

    // Check for redirect result from Google Sign-In
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in via redirect.
          // onAuthStateChanged will be triggered with result.user and will handle main state updates.
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
          // It's good to ensure login page is hidden here as well,
          // in case onAuthStateChanged is slightly delayed.
          setShowLoginPage(false);
        }
        // If there's no redirect result, and onAuthStateChanged hasn't completed its first run,
        // we rely on onAuthStateChanged to set the final state and finish initial loading.
        // If initialAuthCheckDone is still false, onAuthStateChanged will handle setIsInitialLoading(false).
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        toast({
          title: "Sign-In Issue",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
        // If redirect processing fails, and onAuthStateChanged hasn't completed its first run,
        // ensure we finish initial loading.
        if (!initialAuthCheckDone.current) {
            setIsInitialLoading(false);
            initialAuthCheckDone.current = true;
            setShowLoginPage(true); // Likely need to show login page on error
        }
      });

    return () => unsubscribe(); // Cleanup listener on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array: run once on mount

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = () => {
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false);
    // After welcome, if not authenticated, user should be directed to login.
    // The onAuthStateChanged handler will manage showing LoginPage if currentUser is null.
  };

  const handleLoginBypass = () => {
    const mockUser: User = {
      uid: `mock-bypass-user-${Date.now()}`,
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
      providerData: [{
        providerId: 'google.com', 
        uid: `mock-google-uid-${Date.now()}`,
        displayName: 'Dev User (Bypass)',
        email: 'dev.user@example.com',
        phoneNumber: null,
        photoURL: null,
      }],
      providerId: 'firebase', 
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: () => Promise.resolve(),
      getIdToken: (_forceRefresh?: boolean) => Promise.resolve('mock-id-token'),
      getIdTokenResult: (_forceRefresh?: boolean) => Promise.resolve({
        token: 'mock-id-token',
        expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        signInProvider: 'google.com',
        signInSecondFactor: null,
        claims: {},
      }),
      reload: () => Promise.resolve(),
      toJSON: () => ({ uid: `mock-bypass-user-${Date.now()}`, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };
    
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setShowLoginPage(false);
    setIsInitialLoading(false); // Ensure loading is false if bypassing
    initialAuthCheckDone.current = true; // Mark auth check as done

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY);
    if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
      setUserRole(storedRoleValue as UserRole);
    } else {
      setUserRole(null); // Prompt for role selection
    }
    setShowWelcomePage(false); // Bypass welcome as well

    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };


  const handleRoleSelect = (role: UserRole) => {
    localStorage.setItem(USER_ROLE_KEY, role);
    setUserRole(role);
    if (role === 'recruiter') {
      setActiveTab('findTalent');
    } else {
      setActiveTab('findJobs');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting states:
      // currentUser to null, isAuthenticated to false, userRole to null,
      // and showLoginPage to true (or WelcomePage if applicable).
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    setShowWelcomePage(false); 
    setShowLoginPage(true);
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
  }, [userRole, isAuthenticated]); // Rerun when userRole or isAuthenticated changes


  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (showWelcomePage) {
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }
  
  if (showLoginPage && !isAuthenticated) { 
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }
  
  if (!isAuthenticated) { // Fallback if somehow missed
     return <LoginPage onLoginBypass={handleLoginBypass} />;
  }

  if (!userRole) { // Authenticated but no role selected
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // If authenticated and role selected, show the main app
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

    

    