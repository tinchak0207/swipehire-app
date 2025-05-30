
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("findTalent");
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false); 

  useEffect(() => {
    // This function processes the auth state and determines welcome/role page visibility.
    // It's called by onAuthStateChanged on initial load, and potentially by getRedirectResult.
    const processAuthStateAndInitialFlags = (userFromAuth: User | null) => {
      if (initialAuthCheckDone.current && userFromAuth === currentUser) return; // Avoid redundant processing if user hasn't changed

      setCurrentUser(userFromAuth);
      const authenticated = !!userFromAuth;
      setIsAuthenticated(authenticated);

      const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
      setUserRole(storedRole);

      const seenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';

      if (!seenWelcome) {
        setShowWelcomePage(true);
      } else {
        setShowWelcomePage(false);
      }
      
      // Only mark initial check as done and stop loading once this comprehensive check is performed.
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // onAuthStateChanged is the primary listener for auth state.
      // It will fire on initial load (with cached user or null) and on subsequent changes.
      processAuthStateAndInitialFlags(user);
    });

    // Check for redirect result.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // If redirect successful, a toast is shown.
          // onAuthStateChanged should also fire with this user, so primary state setting happens there.
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
          // If onAuthStateChanged hasn't run its initial course yet, explicitly trigger processing
          // for the user from the redirect. This ensures faster UI update.
          if (!initialAuthCheckDone.current) {
            processAuthStateAndInitialFlags(result.user);
          }
        } else {
          // No redirect result, or redirect failed.
          // If initial check hasn't run, and onAuthStateChanged hasn't fired yet for initial state,
          // we ensure it gets processed using auth.currentUser (which might be null or cached).
          if (!initialAuthCheckDone.current) {
            processAuthStateAndInitialFlags(auth.currentUser);
          }
        }
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        toast({
          title: "Sign-In Issue",
          description: error.message || "Could not complete sign-in after redirect.",
          variant: "destructive",
        });
        // Even on error, ensure the initial auth state processing completes.
        if (!initialAuthCheckDone.current) {
          processAuthStateAndInitialFlags(auth.currentUser);
        }
      });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentUser is intentionally not in deps to avoid re-running this setup


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = () => {
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false);
    // After welcome, if not authenticated, LoginPage will show (derived).
    // If authenticated but no role, RoleSelectionPage will show (derived).
  };

  const handleLoginBypass = () => {
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
    setShowWelcomePage(false); // Assume welcome has been "seen" for bypass

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY);
    if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
      setUserRole(storedRoleValue as UserRole);
    } else {
      setUserRole(null); // No role set, will go to RoleSelectionPage
    }
    
    if (!initialAuthCheckDone.current) { 
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
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
      // currentUser to null, isAuthenticated to false.
      // userRole will be set to null by processAuthStateAndInitialFlags if initial check is redone, or explicitly in subsequent.
      // showWelcomePage will be re-evaluated.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    // This typically comes from AppHeader if user is not authenticated and tries an action
    // or if they explicitly click a login button when logged out.
    // The main rendering logic should handle showing LoginPage if needed.
    // This function might just ensure welcome is false if it was somehow true.
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
  }, [userRole, isAuthenticated]);


  // ------ Page Rendering Logic ------
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
  
  // If not authenticated (and welcome has been seen, and not initial loading)
  if (!isAuthenticated) { 
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }
  
  // If authenticated, welcome seen, but no role selected
  if (!userRole) { 
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // Authenticated, welcome seen, role selected -> Show main app
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        isAuthenticated={isAuthenticated}
        onLoginRequest={handleLoginRequest} // For explicit login requests from header
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
    
