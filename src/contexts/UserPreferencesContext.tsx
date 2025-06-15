
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { UserPreferences, AIScriptTone, BackendUser } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const initialDefaultPreferences: UserPreferences = {
  theme: 'light',
  featureFlags: {},
  isLoading: true, // Start as true, will be set to false once initial check is done
  defaultAIScriptTone: 'professional',
  discoveryItemsPerPage: 10,
  enableExperimentalFeatures: false,
  notificationChannels: {
    email: true,
    sms: false,
    inAppToast: true,
    inAppBanner: true,
  },
  notificationSubscriptions: {
    companyReplies: true,
    matchUpdates: true,
    applicationStatusChanges: true,
    platformAnnouncements: true,
    welcomeAndOnboardingEmails: true, // Default for welcome emails
    contentAndBlogUpdates: false,    // Default to opt-out for content
    featureAndPromotionUpdates: false, // Default to opt-out for promos
  },
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  mongoDbUserId: string | null;
  setMongoDbUserId: (id: string | null) => void;
  fetchAndSetUserPreferences: (userId: string) => Promise<void>;
  setPreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  passedCandidateIds: Set<string>;
  passedCompanyIds: Set<string>;
  updatePassedCandidateIds: (newIds: string[]) => void;
  updatePassedCompanyIds: (newIds: string[]) => void;
  fullBackendUser: BackendUser | null;
  updateFullBackendUserFields: (updatedFields: Partial<BackendUser> | null) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
  currentUser: User | null;
}

export const UserPreferencesProvider = ({ children, currentUser }: UserPreferencesProviderProps) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(initialDefaultPreferences);
  const [mongoDbUserId, setMongoDbUserIdState] = useState<string | null>(null);
  const [passedCandidateIds, setPassedCandidateIdsState] = useState<Set<string>>(new Set());
  const [passedCompanyIds, setPassedCompanyIdsState] = useState<Set<string>>(new Set());
  const [fullBackendUser, setFullBackendUserState] = useState<BackendUser | null>(null);

  const applyTheme = useCallback((themeSetting?: UserPreferences['theme']) => {
    if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        if (themeSetting === 'dark') {
        document.documentElement.classList.add('dark');
        } else if (themeSetting === 'light') {
        document.documentElement.classList.add('light');
        } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.add('light');
        }
        }
    }
  }, []);

  const setMongoDbUserId = useCallback((id: string | null) => {
    console.log("[UserPreferencesContext] setMongoDbUserId called with id:", id);
    setMongoDbUserIdState(id);
    if (id) {
      if (typeof window !== 'undefined') localStorage.setItem('mongoDbUserId', id);
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem('mongoDbUserId');
      setFullBackendUserState(null);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setPreferencesState(prev => {
        const newPrefs = {
          ...initialDefaultPreferences,
          theme: prev.theme, 
          isLoading: false 
        };
        console.log("[UserPreferencesContext] mongoDbUserId cleared. Preferences reset (theme preserved), isLoading set to false.", newPrefs);
        return newPrefs;
      });
    }
  }, []);

  const fetchAndSetUserPreferences = useCallback(async (userIdToFetch: string) => {
    console.log("[UserPreferencesContext] fetchAndSetUserPreferences called for userId:", userIdToFetch);

    if (!userIdToFetch) {
      console.warn("[UserPreferencesContext] No userIdToFetch provided. Resetting to defaults and setting isLoading to false.");
      setPreferencesState(prev => ({ ...initialDefaultPreferences, theme: prev.theme, isLoading: false }));
      applyTheme(initialDefaultPreferences.theme);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setFullBackendUserState(null);
      return;
    }
    
    setPreferencesState(prev => ({ ...prev, isLoading: true }));
    console.log(`[UserPreferencesContext] Fetching user data from ${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`);
      console.log(`[UserPreferencesContext] Fetch response status for user ${userIdToFetch}: ${response.status}`);

      if (response.ok) {
        const userData = await response.json();
        console.log("[UserPreferencesContext] User data fetched successfully:", JSON.stringify(userData).substring(0, 200) + "...");

        const completeUserData: BackendUser = {
          ...userData,
          companyProfileComplete: userData.companyProfileComplete === undefined ? false : userData.companyProfileComplete,
        };
        setFullBackendUserState(completeUserData);

        const loadedPrefsBase = completeUserData.preferences || {};
        const loadedPrefs: UserPreferences = {
          ...initialDefaultPreferences, 
          ...loadedPrefsBase, 
          featureFlags: { ...(initialDefaultPreferences.featureFlags || {}), ...(loadedPrefsBase.featureFlags || {}), },
          notificationChannels: { ...(initialDefaultPreferences.notificationChannels), ...(loadedPrefsBase.notificationChannels || {}), },
          notificationSubscriptions: { ...(initialDefaultPreferences.notificationSubscriptions), ...(loadedPrefsBase.notificationSubscriptions || {}), },
          isLoading: false, 
        };
        setPreferencesState(loadedPrefs);
        applyTheme(loadedPrefs.theme);
        setPassedCandidateIdsState(new Set(completeUserData.passedCandidateProfileIds || []));
        setPassedCompanyIdsState(new Set(completeUserData.passedCompanyProfileIds || []));
        console.log("[UserPreferencesContext] Preferences and user data applied for user:", userIdToFetch);
      } else {
        console.warn(`[UserPreferencesContext] Failed to fetch preferences for user ${userIdToFetch}, status: ${response.status}.`);
        setFullBackendUserState(null); 
        if (response.status === 404 && mongoDbUserId === userIdToFetch) { 
          setMongoDbUserId(null);
        }
         setPreferencesState(prev => ({ ...prev, isLoading: false })); // Ensure isLoading is false on fetch error
      }
    } catch (error) {
      console.error("[UserPreferencesContext] Critical error in fetchAndSetUserPreferences for user " + userIdToFetch + ":", error);
      setFullBackendUserState(null);
      setPreferencesState(prev => ({ ...prev, isLoading: false })); // Ensure isLoading is false on catch
    }
  }, [applyTheme, mongoDbUserId, setMongoDbUserId]);

  useEffect(() => {
    console.log("[UserPreferencesContext] Effect for localStorage mongoDbUserId. currentUser?.uid:", currentUser?.uid);
    if (typeof window !== 'undefined') {
        const storedMongoId = localStorage.getItem('mongoDbUserId');
        if (storedMongoId) {
            console.log("[UserPreferencesContext] Found storedMongoId in localStorage:", storedMongoId);
            if (mongoDbUserId !== storedMongoId) { 
                 setMongoDbUserIdState(storedMongoId);
            }
        } else if (!currentUser && !mongoDbUserId && preferences.isLoading) { // Initial load, no user, no stored ID, but context says loading
             console.log("[UserPreferencesContext] No storedMongoId, no currentUser, but context isLoading is true. Deferring isLoading=false decision.");
        } else if (!currentUser && !mongoDbUserId && !preferences.isLoading) { // Truly initial state with no user and not loading
             console.log("[UserPreferencesContext] No storedMongoId and no currentUser and not loading. Ensuring isLoading is false.");
             setPreferencesState(prev => ({ ...initialDefaultPreferences, theme: prev.theme, isLoading: false }));
        }
    }
  }, [currentUser, mongoDbUserId, preferences.isLoading]);

  useEffect(() => {
    console.log("[UserPreferencesContext] Main Auth/MongoID Effect | mongoDbUserId:", mongoDbUserId, "| currentUser?.uid:", currentUser?.uid);
    if (mongoDbUserId) {
      fetchAndSetUserPreferences(mongoDbUserId);
    } else {
      // mongoDbUserId is null.
      // Regardless of whether currentUser (Firebase user) exists, if we don't have a mongoDbUserId,
      // the process of loading/linking to a backend profile is not actively in progress *via this context's primary mechanism*.
      // AppContent might be trying to get mongoDbUserId if currentUser exists (which would then trigger the `if (mongoDbUserId)` block above).
      // But UserPreferencesContext itself should reflect isLoading:false if mongoDbUserId is definitively null at this point in its own effect.
      console.log("[UserPreferencesContext] Main Auth/MongoID Effect: mongoDbUserId is null. Setting isLoading: false.");
      setPreferencesState(prev => ({
        ...initialDefaultPreferences,
        theme: prev.theme, // Preserve theme choice
        isLoading: false // Key change: always false if mongoDbUserId is null here
      }));
      applyTheme(initialDefaultPreferences.theme); // Apply default theme or preserved theme
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setFullBackendUserState(null);
    }
  }, [mongoDbUserId, currentUser?.uid, fetchAndSetUserPreferences, applyTheme]);


  useEffect(() => {
    if (preferences.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme, applyTheme]);

  const setPreferences = useCallback(async (newPrefsPartial: Partial<UserPreferences>) => {
    setPreferencesState(prevPreferences => {
        const updatedPreferences: UserPreferences = {
            ...prevPreferences,
            ...newPrefsPartial,
            isLoading: newPrefsPartial.isLoading !== undefined ? newPrefsPartial.isLoading : prevPreferences.isLoading,
        };
        if (newPrefsPartial.notificationChannels) {
            updatedPreferences.notificationChannels = {
                ...(prevPreferences.notificationChannels || initialDefaultPreferences.notificationChannels),
                ...newPrefsPartial.notificationChannels,
            };
        }
        if (newPrefsPartial.notificationSubscriptions) {
            updatedPreferences.notificationSubscriptions = {
                ...(prevPreferences.notificationSubscriptions || initialDefaultPreferences.notificationSubscriptions),
                ...newPrefsPartial.notificationSubscriptions,
            };
        }
        if (newPrefsPartial.featureFlags) {
            updatedPreferences.featureFlags = {
                ...(prevPreferences.featureFlags || initialDefaultPreferences.featureFlags),
                ...newPrefsPartial.featureFlags,
            };
        }
        if (newPrefsPartial.theme) {
          applyTheme(newPrefsPartial.theme);
        }
        console.log("[UserPreferencesContext] Preferences updated locally. Backend save via Settings page. New isLoading:", updatedPreferences.isLoading);
        return updatedPreferences;
    });
  }, [applyTheme]);

  const updatePassedCandidateIds = useCallback((newIds: string[]) => {
    setPassedCandidateIdsState(new Set(newIds));
  }, []);

  const updatePassedCompanyIds = useCallback((newIds: string[]) => {
    setPassedCompanyIdsState(new Set(newIds));
  }, []);

  const updateFullBackendUserFields = useCallback((updatedFields: Partial<BackendUser> | null) => {
    setFullBackendUserState(prevUser => {
      if (updatedFields === null) return null; 
      if (!prevUser && mongoDbUserId) {
        const newUser: BackendUser = {
          _id: mongoDbUserId,
          name: '', email: '', selectedRole: null, companyProfileComplete: false,
          ...updatedFields
        };
        return newUser;
      }
      if (prevUser) {
        return { ...prevUser, ...updatedFields };
      }
      return null; 
    });
  }, [mongoDbUserId]);

  const contextValue = useMemo(() => ({
    preferences,
    mongoDbUserId,
    setMongoDbUserId,
    fetchAndSetUserPreferences,
    setPreferences,
    passedCandidateIds,
    passedCompanyIds,
    updatePassedCandidateIds,
    updatePassedCompanyIds,
    fullBackendUser,
    updateFullBackendUserFields,
  }), [
    preferences, mongoDbUserId, setMongoDbUserId, fetchAndSetUserPreferences, setPreferences,
    passedCandidateIds, passedCompanyIds, updatePassedCandidateIds, updatePassedCompanyIds,
    fullBackendUser, updateFullBackendUserFields
  ]);

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

    