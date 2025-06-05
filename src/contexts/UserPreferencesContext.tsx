
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
// Firestore imports removed: import { doc, getDoc, setDoc } from 'firebase/firestore';
// Firestore db import removed: import { db } from '@/lib/firebase';
import type { UserPreferences, AIScriptTone, BackendUser } from '@/lib/types'; // Added BackendUser

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const defaultPreferences: UserPreferences = {
  theme: 'light', // Default theme set to light
  featureFlags: {},
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
  },
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loadingPreferences: boolean;
  mongoDbUserId: string | null; // To store MongoDB _id
  setMongoDbUserId: (id: string | null) => void;
  fetchAndSetUserPreferences: (userId: string) => Promise<void>; // Takes MongoDB _id
  setPreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  passedCandidateIds: Set<string>; // New state for passed candidate IDs
  passedCompanyIds: Set<string>;   // New state for passed company IDs
  updatePassedCandidateIds: (newIds: string[]) => void; // New setter
  updatePassedCompanyIds: (newIds: string[]) => void;   // New setter
  fullBackendUser: BackendUser | null; // New state to store full user data from backend
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
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [mongoDbUserId, setMongoDbUserIdState] = useState<string | null>(null);
  const [passedCandidateIds, setPassedCandidateIdsState] = useState<Set<string>>(new Set());
  const [passedCompanyIds, setPassedCompanyIdsState] = useState<Set<string>>(new Set());
  const [fullBackendUser, setFullBackendUserState] = useState<BackendUser | null>(null);


  const setMongoDbUserId = (id: string | null) => {
    setMongoDbUserIdState(id);
    if (id) {
      localStorage.setItem('mongoDbUserId', id);
    } else {
      localStorage.removeItem('mongoDbUserId');
      setFullBackendUserState(null); // Clear full user data if mongoDbUserId is cleared
      setPassedCandidateIdsState(new Set()); // Clear passed IDs
      setPassedCompanyIdsState(new Set());   // Clear passed IDs
    }
  };

  useEffect(() => {
    const storedMongoId = localStorage.getItem('mongoDbUserId');
    if (storedMongoId) {
      setMongoDbUserIdState(storedMongoId);
    }
  }, []);


  const applyTheme = useCallback((themeSetting: UserPreferences['theme']) => {
    document.documentElement.classList.remove('dark', 'light'); // Remove both first
    if (themeSetting === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeSetting === 'light') {
      document.documentElement.classList.add('light');
    } else { // system
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light'); // Default to light if system isn't dark
      }
    }
  }, []);

  const fetchAndSetUserPreferences = useCallback(async (userIdToFetch: string) => { // Expects MongoDB _id
    if (!userIdToFetch) {
      setPreferencesState(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setFullBackendUserState(null);
      setLoadingPreferences(false);
      return;
    }
    setLoadingPreferences(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`);
      if (response.ok) {
        const userData: BackendUser = await response.json();
        setFullBackendUserState(userData); // Store full backend user data

        const loadedPrefs = {
          ...defaultPreferences, // Start with system defaults
          ...(userData.preferences || {}), // Override with user-specific preferences if they exist
          // Deep merge for nested objects like featureFlags and notificationChannels/Subscriptions
          featureFlags: {
            ...(defaultPreferences.featureFlags || {}),
            ...(userData.preferences?.featureFlags || {}),
          },
          notificationChannels: {
            ...(defaultPreferences.notificationChannels || { email: true, sms: false, inAppToast: true, inAppBanner: true }), // Provide structure if default is missing
            ...(userData.preferences?.notificationChannels || {}),
          },
          notificationSubscriptions: {
            ...(defaultPreferences.notificationSubscriptions || { companyReplies: true, matchUpdates: true, applicationStatusChanges: true, platformAnnouncements: true }), // Provide structure if default is missing
            ...(userData.preferences?.notificationSubscriptions || {}),
          },
        };

        setPreferencesState(loadedPrefs);
        applyTheme(loadedPrefs.theme);
        setPassedCandidateIdsState(new Set(userData.passedCandidateProfileIds || []));
        setPassedCompanyIdsState(new Set(userData.passedCompanyProfileIds || []));

      } else {
        console.warn(`Failed to fetch preferences for user ${userIdToFetch}, status: ${response.status}. Using defaults.`);
        setPreferencesState(defaultPreferences);
        applyTheme(defaultPreferences.theme);
        setPassedCandidateIdsState(new Set());
        setPassedCompanyIdsState(new Set());
        setFullBackendUserState(null);
        if (response.status === 404) {
          setMongoDbUserId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user preferences from MongoDB backend:", error);
      setPreferencesState(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setFullBackendUserState(null);
    } finally {
      setLoadingPreferences(false);
    }
  }, [applyTheme]);

  // Automatically fetch preferences if mongoDbUserId is available
  useEffect(() => {
    if (mongoDbUserId) {
      fetchAndSetUserPreferences(mongoDbUserId);
    } else if (!currentUser) { // Guest mode or no user
      setPreferencesState(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setFullBackendUserState(null);
      setLoadingPreferences(false);
    }
    // If mongoDbUserId is null but currentUser exists, HomePage will try to fetch/create it
  }, [mongoDbUserId, currentUser, fetchAndSetUserPreferences, applyTheme]);


  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme, applyTheme]);

  const setPreferences = async (newPrefsPartial: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPrefsPartial };
    // Deep merge for nested preferences
    if (newPrefsPartial.notificationChannels) {
        updatedPreferences.notificationChannels = {
            ...(preferences.notificationChannels || defaultPreferences.notificationChannels),
            ...newPrefsPartial.notificationChannels,
        };
    }
    if (newPrefsPartial.notificationSubscriptions) {
        updatedPreferences.notificationSubscriptions = {
            ...(preferences.notificationSubscriptions || defaultPreferences.notificationSubscriptions),
            ...newPrefsPartial.notificationSubscriptions,
        };
    }
    if (newPrefsPartial.featureFlags) {
        updatedPreferences.featureFlags = {
            ...(preferences.featureFlags || defaultPreferences.featureFlags),
            ...newPrefsPartial.featureFlags,
        };
    }

    setPreferencesState(updatedPreferences);
    if (newPrefsPartial.theme) {
      applyTheme(newPrefsPartial.theme);
    }
    console.log("UserPreferencesContext: Preferences updated locally. Backend save will occur via Settings page 'Save Settings' button.");
  };

  const updatePassedCandidateIds = (newIds: string[]) => {
    setPassedCandidateIdsState(new Set(newIds));
  };

  const updatePassedCompanyIds = (newIds: string[]) => {
    setPassedCompanyIdsState(new Set(newIds));
  };


  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      loadingPreferences,
      mongoDbUserId,
      setMongoDbUserId,
      fetchAndSetUserPreferences,
      setPreferences,
      passedCandidateIds,
      passedCompanyIds,
      updatePassedCandidateIds,
      updatePassedCompanyIds,
      fullBackendUser
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
