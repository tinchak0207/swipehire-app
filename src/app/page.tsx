
"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, LayoutGrid, Loader2, FilePlus2, BookOpenText, UserCircle, Eye, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut, type User, getRedirectResult } from "firebase/auth";
// Firestore imports removed: import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { UserPreferencesProvider, useUserPreferences } from "@/contexts/UserPreferencesContext"; 

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

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
const GUEST_MODE_KEY = 'isGuestModeActive';

// Inner component to access UserPreferencesContext
function AppContent() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  // const [mongoDbUserId, setMongoDbUserIdInternal] = useState<string | null>(null); // Managed by context

  const [activeTab, setActiveTab] = useState<string>("findJobs");
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const initialAuthCheckDone = useRef(false);

  // Use context for mongoDbUserId and its setter
  const { mongoDbUserId, setMongoDbUserId, fetchAndSetUserPreferences } = useUserPreferences();

  const fetchUserFromMongo = async (firebaseUid: string, firebaseDisplayName?: string | null, firebaseEmail?: string | null): Promise<string | null> => {
    try {
      // First, try to get user by Firebase UID (assuming backend supports this or :id can be firebaseUid)
      // This is a placeholder. A robust solution may need a dedicated endpoint like /api/users/by-firebase-uid/:firebaseUid
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${firebaseUid}`); 
      
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.selectedRole || null);
        setUserName(userData.name || firebaseDisplayName || firebaseEmail);
        setMongoDbUserId(userData._id); // Store MongoDB _id
        localStorage.setItem('recruiterProfileComplete', (userData.selectedRole === 'recruiter' && userData.name && userData.email) ? 'true' : 'false');
        return userData._id;
      } else if (response.status === 404) {
        // User not found in MongoDB, attempt to create
        console.log("User not found in MongoDB, attempting to create...");
        const createUserResponse = await fetch(`${CUSTOM_BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firebaseDisplayName || firebaseEmail || 'New User',
            email: firebaseEmail,
            firebaseUid: firebaseUid, // Backend needs to be adapted to store this
            preferences: { theme: 'light', featureFlags: {} } // Default preferences
          }),
        });
        if (createUserResponse.ok) {
          const newUserData = await createUserResponse.json();
          if (newUserData.user) {
            setUserRole(newUserData.user.selectedRole || null);
            setUserName(newUserData.user.name);
            setMongoDbUserId(newUserData.user._id);
            localStorage.setItem('recruiterProfileComplete', (newUserData.user.selectedRole === 'recruiter' && newUserData.user.name && newUserData.user.email) ? 'true' : 'false');
            toast({ title: "Profile Initialized", description: "Your basic profile has been set up."});
            return newUserData.user._id;
          }
        } else {
          const errorData = await createUserResponse.json().catch(()=>({}));
          console.error("Failed to create user in MongoDB:", errorData.message || createUserResponse.statusText);
          toast({ title: "Profile Creation Failed", description: `Could not initialize your profile: ${errorData.message || 'Please try again.'}`, variant: "destructive"});
        }
      } else {
        const errorData = await response.json().catch(()=>({}));
        console.error("Error fetching user data from MongoDB:", errorData.message || response.statusText);
        toast({ title: "Error Loading Profile", description: "Could not load your profile data.", variant: "destructive"});
      }
    } catch (error) {
      console.error("Error in fetchUserFromMongo:", error);
      toast({ title: "Network Error", description: "Could not connect to backend to load profile.", variant: "destructive"});
    }
    // Fallback if fetch or create fails
    setUserRole(null);
    setUserName(firebaseDisplayName || firebaseEmail);
    setMongoDbUserId(null);
    localStorage.removeItem('recruiterProfileComplete');
    return null;
  };


  useEffect(() => {
    setIsInitialLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const guestActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
      const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        localStorage.removeItem(GUEST_MODE_KEY);

        const fetchedMongoId = await fetchUserFromMongo(user.uid, user.displayName, user.email);
        if (fetchedMongoId) {
          fetchAndSetUserPreferences(fetchedMongoId); // Fetch preferences using mongoDbId
        }
        
        if (hasSeenWelcomeStorage !== 'true') setShowWelcomePage(true);
        else setShowWelcomePage(false);

      } else if (guestActive) {
        setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
        setIsAuthenticated(false);
        setUserRole(null); 
        setUserName('Guest User');
        setIsGuestMode(true);
        setMongoDbUserId(null); // Clear mongoDbUserId for guest
        setShowWelcomePage(false); 
        localStorage.removeItem('recruiterProfileComplete');
      } else { 
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName(null);
        setIsGuestMode(false);
        setMongoDbUserId(null);
        localStorage.removeItem('recruiterProfileComplete');
        if (hasSeenWelcomeStorage !== 'true') setShowWelcomePage(true);
        else setShowWelcomePage(false);
      }
      if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
      }
    });

    getRedirectResult(auth)
      .then(async (result) => { 
        if (result?.user) {
          const user = result.user;
          toast({ title: "Signed In Successfully!", description: `Welcome back, ${user.displayName || user.email}!` });
          localStorage.removeItem(GUEST_MODE_KEY);
          setIsGuestMode(false);
          const fetchedMongoId = await fetchUserFromMongo(user.uid, user.displayName, user.email);
           if (fetchedMongoId) {
             fetchAndSetUserPreferences(fetchedMongoId);
           }
        }
      })
      .catch((error) => {
        console.error("HomePage useEffect: Error during getRedirectResult:", error);
        toast({ title: "Sign-In Issue During Redirect", description: error.message || "Could not complete sign-in after redirect.", variant: "destructive"});
      })
      .finally(() => {
        if (!initialAuthCheckDone.current) {
            const guestStillActive = localStorage.getItem(GUEST_MODE_KEY) === 'true';
            if (guestStillActive && !auth.currentUser) { if(!isGuestMode) handleGuestMode(); }
            else if (!auth.currentUser && !guestStillActive) {
                const hasSeenWelcomeStorage = localStorage.getItem(HAS_SEEN_WELCOME_KEY);
                 if (hasSeenWelcomeStorage !== 'true') { if(!showWelcomePage) setShowWelcomePage(true); }
                 else { if(showWelcomePage) setShowWelcomePage(false); }
            }
            initialAuthCheckDone.current = true;
            setIsInitialLoading(false);
        }
      });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mongoDbUserId removed from deps to avoid re-triggering auth flow excessively


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

  const handleLoginBypass = async () => {
    const mockUid = `mock-bypass-user-${Date.now()}`;
    const mockUser: User = {
      uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)',
      emailVerified: true, isAnonymous: false, metadata: {creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber: null, photoURL: null, providerData: [],
      providerId: 'firebase', refreshToken: 'mock-refresh-token', tenantId: null,
      delete: () => Promise.resolve(), getIdToken: () => Promise.resolve('mock-id-token'),
      getIdTokenResult: () => Promise.resolve({ token: 'mock-id-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
      reload: () => Promise.resolve(), toJSON: () => ({ uid: mockUid, email: 'dev.user@example.com', displayName: 'Dev User (Bypass)' }),
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    setIsGuestMode(false); localStorage.removeItem(GUEST_MODE_KEY);
    
    // Simulate fetch/create for bypass user with MongoDB
    const fetchedMongoId = await fetchUserFromMongo(mockUid, mockUser.displayName, mockUser.email);
    if (fetchedMongoId) {
      fetchAndSetUserPreferences(fetchedMongoId);
      // For bypass, explicitly set a role if not set by fetchUserFromMongo
      if (!userRole) {
         const defaultRole = 'jobseeker';
         await handleRoleSelect(defaultRole, fetchedMongoId); // Pass mongoId
      }
    } else {
      setUserRole('jobseeker'); // Fallback if mongo interaction fails during bypass
      setUserName(mockUser.displayName);
    }
    
    setShowWelcomePage(false); localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    if (!initialAuthCheckDone.current) {
        initialAuthCheckDone.current = true;
        setIsInitialLoading(false);
    }
    toast({ title: "Dev Bypass Active", description: "Proceeding with a mock development user." });
  };

  const handleGuestMode = () => {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setIsAuthenticated(false); 
    setCurrentUser({ uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User', emailVerified: false, isAnonymous:true, metadata:{creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString()}, phoneNumber:null, photoURL:null, providerData:[], providerId:'guest', refreshToken:'', tenantId:null, delete:async () => {}, getIdToken: async () => '', getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({uid: 'guest-user', email: 'guest@example.com', displayName: 'Guest User'})} as User);
    setUserRole(null); setUserName('Guest User');
    setShowWelcomePage(false); localStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true'); 
    setMongoDbUserId(null); // Clear mongoDbUserId for guest
    if (!initialAuthCheckDone.current) { initialAuthCheckDone.current = true; setIsInitialLoading(false); }
    toast({ title: "Guest Mode Activated", description: "You are browsing as a guest."});
  };

  const handleRoleSelect = async (role: UserRole, currentMongoId?: string | null) => {
    const idToUse = currentMongoId || mongoDbUserId; // Prefer passed ID, then context ID
    if (currentUser && isAuthenticated && idToUse) {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${idToUse}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedRole: role, name: userName, email: currentUser.email }), // Send name/email too
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to save role. Status: ${response.status}`}));
          throw new Error(errorData.message);
        }
        setUserRole(role); // Update local state
        toast({ title: "Role Selected", description: `You are now a ${role}.` });
        if (role === 'recruiter' && userName && currentUser.email) {
          localStorage.setItem('recruiterProfileComplete', 'true');
        } else if (role === 'recruiter') {
          localStorage.setItem('recruiterProfileComplete', 'false');
        } else {
          localStorage.removeItem('recruiterProfileComplete');
        }
      } catch (error: any) {
        console.error("Error saving role to MongoDB backend:", error);
        toast({ title: "Error Saving Role", description: error.message || "Could not save role selection.", variant: "destructive" });
      }
    } else {
      console.warn("handleRoleSelect called without authenticated user or MongoDB ID.");
    }
    setUserRole(role); 
    setShowWelcomePage(false); 
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(GUEST_MODE_KEY); 
      localStorage.removeItem('recruiterProfileComplete');
      localStorage.removeItem('mongoDbUserId'); // Clear stored MongoDB ID
      setMongoDbUserId(null); // Clear context MongoDB ID
      setIsGuestMode(false);
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
    if (isGuestMode) {
        localStorage.removeItem(GUEST_MODE_KEY);
        setIsGuestMode(false);
        setMongoDbUserId(null);
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
  
  let currentTabItems = jobseekerTabItems; // Default for guests or unauthenticated
  if (!isGuestMode && isAuthenticated && userRole === 'recruiter') {
    currentTabItems = recruiterTabItems;
  } else if (!isGuestMode && isAuthenticated && userRole === 'jobseeker') {
    currentTabItems = jobseekerTabItems;
  } else if (isGuestMode) {
    currentTabItems = jobseekerTabItems; // Guests see job seeker view
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

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const mainContentRender = () => {
    if (showWelcomePage && !isGuestMode) { 
      return <WelcomePage onStartExploring={handleStartExploring} />;
    }
    if (isAuthenticated && !isGuestMode && !userRole && !showWelcomePage && mongoDbUserId) { 
      return <RoleSelectionPage onRoleSelect={(role) => handleRoleSelect(role, mongoDbUserId)} />;
    }
    if (!isAuthenticated && !isGuestMode && !showWelcomePage) { 
      return <LoginPage onLoginBypass={handleLoginBypass} onGuestMode={handleGuestMode} />;
    }

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
                  ...(item.value === 'settings' && { currentUserRole: userRole, onRoleChange: (role) => handleRoleSelect(role, mongoDbUserId) }),
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
          <div>© {new Date().getFullYear()} SwipeHire. All rights reserved.</div>
        </footer>
      </div>
    );
  };
  return mainContentRender();
}

export default function HomePage() {
  const [currentUserForProvider, setCurrentUserForProvider] = useState<User | null>(null);
  // Listen to auth changes at the top level to pass to provider
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserForProvider(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserPreferencesProvider currentUser={currentUserForProvider}>
      <AppContent />
    </UserPreferencesProvider>
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
