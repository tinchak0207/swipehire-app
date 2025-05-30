
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
import { MyProfilePage } from "@/components/pages/MyProfilePage"; // Added import
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
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Start true
  const [activeTab, setActiveTab] = useState<string>("findTalent");
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false); 

  useEffect(() => {
    setIsInitialLoading(true); // Explicitly start in loading state

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        const authenticated = !!user;
        setIsAuthenticated(authenticated);

        const storedRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
        setUserRole(authenticated ? storedRole : null); // If user is authenticated, use storedRole, otherwise clear role.

        const seenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
        if (!seenWelcome) {
            setShowWelcomePage(true);
        } else {
            setShowWelcomePage(false);
        }
        
        // This is the most critical part: ensure initial loading stops
        // only after the first onAuthStateChanged event has processed.
        if (!initialAuthCheckDone.current) {
            initialAuthCheckDone.current = true;
            setIsInitialLoading(false);
        }
    });

    // Process redirect result for side effects like toasts.
    // onAuthStateChanged is the primary source for state that drives UI changes.
    getRedirectResult(auth)
        .then((result) => {
            if (result?.user) {
                // User signed in via redirect.
                toast({
                    title: "Signed In Successfully!",
                    description: `Welcome back, ${result.user.displayName || result.user.email}!`,
                });
            }
        })
        .catch((error) => {
            console.error("Error processing redirect result:", error);
            toast({
                title: "Sign-In Issue During Redirect",
                description: error.message || "Could not complete sign-in after redirect.",
                variant: "destructive",
            });
        });

    return () => unsubscribe();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Empty dependency array is correct for this setup.


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStartExploring = () => {
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    setShowWelcomePage(false);
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
    
    const seenWelcome = localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
    setShowWelcomePage(!seenWelcome);

    const storedRoleValue = localStorage.getItem(USER_ROLE_KEY);
    if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
      setUserRole(storedRoleValue as UserRole);
    } else {
      setUserRole(null); 
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
      // currentUser to null, isAuthenticated to false, userRole to null.
      // showWelcomePage logic will also re-run.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLoginRequest = () => {
    // This mainly ensures welcome is false if trying to log in explicitly.
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
  
  if (!isAuthenticated) { 
    return <LoginPage onLoginBypass={handleLoginBypass} />;
  }
  
  if (!userRole) { 
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  // Authenticated, welcome seen, role selected -> Show main app
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
    

    