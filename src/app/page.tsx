
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase"; // Import db for Firestore
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Firestore functions
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
// const USER_ROLE_KEY = 'userRole'; // Will be primarily managed in Firestore
const GUEST_MODE_KEY = 'isGuestModeActive';

export default function HomePage() {
  // Core state variables
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);


  const [activeTab, setActiveTab] = useState<string>("findJobs");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  useEffect(() => {
    console.log("HomePage useEffect: Starting auth check, setting isInitialLoading to true");
    setIsInitialLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("HomePage useEffect: onAuthStateChanged fired. User:", user);
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);

      if (user) {
        console.log("HomePage useEffect: onAuthStateChanged - User authenticated.");
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        localStorage.removeItem(GUEST_MODE_KEY);

        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.selectedRole || null);
            setUserName(userData.name || user.displayName || user.email);
            console.log("HomePage useEffect: Firestore data for user:", userData);
             // Update recruiterProfileComplete in localStorage based on Firestore
            if (userData.selectedRole === 'recruiter' && userData.name && userData.email) {
              localStorage.setItem('recruiterProfileComplete', 'true');
            } else if (userData.selectedRole === 'recruiter') {
              localStorage.setItem('recruiterProfileComplete', 'false');
            } else {
              localStorage.removeItem('recruiterProfileComplete');
            }
          } else {
            // Document doesn't exist, might be a brand new user. Role will be null.
            // Extension should create basic doc. App might create custom fields on role selection.
            setUserRole(null);
            setUserName(user.displayName || user.email);
            localStorage.removeItem('recruiterProfileComplete'); // New user, profile not complete
            console.log("HomePage useEffect: No Firestore document for user yet.");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUserRole(null); // Fallback if Firestore fetch fails
          setUserName(user.displayName || user.email);
          localStorage.removeItem('recruiterProfileComplete');
        }
        
        if (hasSeenWelcomeStorage !== 'true') {
          setShowWelcomePage(true);
        } else {
          setShowWelcomePage(false);
        }
      } else if (guestActive) {
        console.log("HomePage useEffect: onAuthStateChanged - Guest mode is active, no user session.");
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
        setIsAuthenticated(false);
        setUserRole(null); 
        setUserName('Guest User');
        setIsGuestMode(true);
        setShowWelcomePage(false); 
        localStorage.removeItem('recruiterProfileComplete');
      } else { // No user and not guest
        console.log("HomePage useEffect: onAuthStateChanged - No user authenticated, not guest.");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        setIsGuestMode(false);
        localStorage.removeItem('recruiterProfileComplete');
        
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
      .then(async (result) => { // make async to handle potential Firestore operations
        console.log("HomePage useEffect: getRedirectResult result:", result);
        if (result?.user) {
          const user = result.user;
          toast({
            title: "Signed In Successfully!",
            description: `Welcome back, ${user.displayName || user.email}!`,
          });
          localStorage.removeItem(GUEST_MODE_KEY);
          setIsGuestMode(false);
          // User object is available here, could also fetch/update Firestore doc if needed
          // For instance, Rowy extension would have created the basic doc.
          // You might want to check if `selectedRole` exists and prompt if not.
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setUserRole(userData.selectedRole || null);
              setUserName(userData.name || user.displayName || user.email);
              if (userData.selectedRole === 'recruiter' && userData.name && userData.email) {
                localStorage.setItem('recruiterProfileComplete', 'true');
              } else if (userData.selectedRole === 'recruiter') {
                localStorage.setItem('recruiterProfileComplete', 'false');
              } else {
                localStorage.removeItem('recruiterProfileComplete');
              }
            } else {
              // Role selection page will handle this for new users after welcome
              setUserRole(null);
              setUserName(user.displayName || user.email);
              localStorage.removeItem('recruiterProfileComplete');
            }
          } catch (error) {
            console.error("Error fetching user data from Firestore post-redirect:", error);
            setUserRole(null);
            setUserName(user.displayName || user.email);
            localStorage.removeItem('recruiterProfileComplete');
          }
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
        if (!initialAuthCheckDone.current) {
            console.log("HomePage useEffect: getRedirectResult.finally - Fallback for initial flags.");
            const guestStillActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            if (guestStillActive && !auth.currentUser) {
                if(!isGuestMode) handleGuestMode(); 
            } else if (!auth.currentUser && !guestStillActive) {
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
  };

  const handleLoginBypass = async () => {
    console.log("HomePage: handleLoginBypass called");
    const mockUid = `mock-bypass-user-${Date.now()}`;
    const mockUser: User = {
      uid: mockUid,
      email: 'dev.user@example.com',
      displayName: 'Dev User (Bypass)',
      emailVerified: true, isAnonymous: false, metadata: {creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber: null, photoURL: null, providerData: [],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY);
    
    // Simulate Firestore interaction for bypass user
    try {
        const userDocRef = doc(db, "users", mockUid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().selectedRole) {
            setUserRole(userDocSnap.data().selectedRole);
            setUserName(userDocSnap.data().name || mockUser.displayName);
            if (userDocSnap.data().selectedRole === 'recruiter' && userDocSnap.data().name && userDocSnap.data().email) {
                localStorage.setItem('recruiterProfileComplete', 'true');
            } else if (userDocSnap.data().selectedRole === 'recruiter') {
                localStorage.setItem('recruiterProfileComplete', 'false');
            }
        } else {
            // Set a default role for bypass if not in Firestore, e.g., jobseeker
            setUserRole('jobseeker'); // Or prompt for role
            setUserName(mockUser.displayName);
            // No need to write to Firestore for a bypass, but RoleSelectionPage would normally handle this.
        }
    } catch (error) {
        console.error("Firestore error during bypass login, defaulting role:", error);
        setUserRole('jobseeker');
        setUserName(mockUser.displayName);
    }
    
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
    setIsAuthenticated(false); 
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
    setUserRole(null); 
    setUserName('Guest User');
    setShowWelcomePage(false); 
    localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true'); 

    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest."});
  };

  const handleRoleSelect = async (role: UserRole) => {
    console.log("HomePage: handleRoleSelect called with role:", role);
    if (currentUser && isAuthenticated) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        // Using setDoc with merge: true will create or update the document.
        await setDoc(userDocRef, { selectedRole: role, uid: currentUser.uid, email: currentUser.email, name: userName || currentUser.displayName }, { merge: true });
        setUserRole(role);
        toast({ title: "Role Selected", description: `You are now a ${role}.` });
         if (role === 'recruiter' && userName && currentUser.email) {
            localStorage.setItem('recruiterProfileComplete', 'true');
        } else if (role === 'recruiter') {
            localStorage.setItem('recruiterProfileComplete', 'false');
        } else {
             localStorage.removeItem('recruiterProfileComplete');
        }
      } catch (error: any) {
        console.error("Error saving role to Firestore:", error);
        let description = "Could not save your role selection. Please try again.";
        if (error.code) {
            description += ` (Error: ${error.code})`;
        } else if (error.message) {
            description += ` (Message: ${error.message})`;
        }
        toast({ title: "Error Saving Role", description, variant: "destructive" });
      }
    } else {
      // Should not happen if role selection page is shown only for authenticated users without a role
      console.warn("handleRoleSelect called without an authenticated user.");
      // localStorage.setItem(USER_ROLE_KEY, role); // Fallback to localStorage if no user (should be rare)
    }
    setUserRole(role); // Optimistic update
    setShowWelcomePage(false); 
  };

  const handleLogout = async () => {
    console.log("HomePage: handleLogout called");
    try {
      await signOut(auth);
      localStorage.removeItem(GUEST_MODE_KEY); 
      localStorage.removeItem('recruiterProfileComplete');
      setIsGuestMode(false);
      // USER_ROLE_KEY is removed from localStorage as Firestore is source of truth
      // User related state (currentUser, isAuthenticated, userRole, userName) will be reset by onAuthStateChanged
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
      setShowWelcomePage(hasSeenWelcomeStorage !== 'true');
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
        const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
        setShowWelcomePage(hasSeenWelcomeStorage !== 'true');
    }
  };

  const baseTabItems = [
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage isGuestMode={isGuestMode} currentUserRole={userRole} /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage isGuestMode={isGuestMode} /> },
    { value: "settings", label: "Settings", icon: UserCog, component: <SettingsPage isGuestMode={isGuestMode} currentUserRole={userRole} onRoleChange={handleRoleSelect} /> },
  ];

  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage searchTerm={searchTerm} /> },
    { value: "postJob", label: "Post a Job", icon: FilePlus2, component: <CreateJobPostingPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage searchTerm={searchTerm} /> },
    { value: "myProfile", label: "My Profile", icon: UserCircle, component: <MyProfilePage isGuestMode={isGuestMode} /> },
    { value: "myDiary", label: "My Diary", icon: BookOpenText, component: <StaffDiaryPage isGuestMode={isGuestMode} /> },
    ...baseTabItems,
  ];
  
  let currentTabItems = jobseekerTabItems;
  if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestMode && isAuthenticated && userRole === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  } else if (isGuestMode) {
    currentTabItems = jobseekerTabItems; 
  }


  useEffect(() => {
    if (!isInitialLoading && initialAuthCheckDone.current) {
      const itemsForCurrentContext = isGuestMode 
        ? jobseekerTabItems 
        : (isAuthenticated && userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems);
      
      const validTabValues = itemsForCurrentContext.map(item => item.value);
      
      let defaultTabForCurrentContext = "findJobs"; 
      if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
        defaultTabForCurrentContext = "findTalent";
      }

      if (!validTabValues.includes(activeTab) || 
          (userRole === 'recruiter' && activeTab === 'findJobs') || 
          (userRole === 'jobseeker' && activeTab === 'findTalent') ||
          (isGuestMode && activeTab === 'findTalent') ) {
        setActiveTab(defaultTabForCurrentContext);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, isGuestMode, isAuthenticated, isInitialLoading]); 

  console.log("HomePage: Rendering - isInitialLoading:", isInitialLoading, "isAuthenticated:", isAuthenticated, "showWelcomePage:", showWelcomePage, "userRole:", userRole, "isGuestMode:", isGuestMode, "activeTab:", activeTab);

  if (isInitialLoading) {
    console.log("HomePage: Rendering Loader2 because isInitialLoading is true.");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (showWelcomePage && !isGuestMode) { 
    console.log("HomePage: Rendering WelcomePage.");
    return <WelcomePage onStartExploring={handleStartExploring} />;
  }
  
  // If authenticated but no role is set in Firestore (and not guest, welcome done)
  if (isAuthenticated && !isGuestMode && !userRole && !showWelcomePage) { 
    console.log("HomePage: Rendering RoleSelectionPage (authenticated, no role, welcome done, not guest).");
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }
  
  // If not authenticated (and not guest, welcome done)
  if (!isAuthenticated && !isGuestMode && !showWelcomePage) { 
    console.log("HomePage: Rendering LoginPage (not authenticated, not guest, welcome done).");
    return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
  }


  console.log("HomePage: Rendering Main App Content for user/guest.");
  
  const mainAppContainerClasses = cn("flex flex-col min-h-screen bg-background");

  return (
    <div className={mainAppContainerClasses}>
      <AppHeader
        isAuthenticated={isAuthenticated}
        isGuestMode={isGuestMode}
        onLoginRequest={handleLoginRequest}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        userName={userName}
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
                ...(item.value === 'aiTools' && { currentUserRole: userRole }) 
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        <div className="flex justify-center items-center gap-x-4 mb-1">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer">AI Ethics</span>
        </div>
        <div>
          © {new Date().getFullYear()} SwipeHire. All rights reserved.
        </div>
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

    