
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
// Firestore imports removed: import { doc, getDoc, setDoc } from 'firebase/firestore';
// Firestore db import removed: import { db } from '@/lib/firebase';
import type { UserPreferences, AIScriptTone } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

const defaultPreferences: UserPreferences = {
  theme: 'light', // Default theme set to light
  featureFlags: {},
  defaultAIScriptTone: 'professional',
  discoveryItemsPerPage: 10,
  enableExperimentalFeatures: false,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loadingPreferences: boolean;
  mongoDbUserId: string | null; // To store MongoDB _id
  setMongoDbUserId: (id: string | null) => void;
  fetchAndSetUserPreferences: (userId: string) => Promise<void>; // Takes MongoDB _id
  setPreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
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

  const setMongoDbUserId = (id: string | null) => {
    setMongoDbUserIdState(id);
    if (id) {
      localStorage.setItem('mongoDbUserId', id);
    } else {
      localStorage.removeItem('mongoDbUserId');
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
      setLoadingPreferences(false);
      return;
    }
    setLoadingPreferences(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`);
      if (response.ok) {
        const userData = await response.json();
        // Merge fetched preferences with defaults to ensure all keys exist
        const loadedPrefs = {
          ...defaultPreferences,
          ...userData.preferences,
          // Ensure featureFlags is an object even if not present in userData.preferences
          featureFlags: { ...(defaultPreferences.featureFlags || {}), ...(userData.preferences?.featureFlags || {}) }
        };
        setPreferencesState(loadedPrefs);
        applyTheme(loadedPrefs.theme);
      } else {
        console.warn(`Failed to fetch preferences for user ${userIdToFetch}, status: ${response.status}. Using defaults.`);
        setPreferencesState(defaultPreferences);
        applyTheme(defaultPreferences.theme);
        if (response.status === 404) {
          setMongoDbUserId(null); // Clear invalid mongoDbUserId if user not found
        }
      }
    } catch (error) {
      console.error("Error fetching user preferences from MongoDB backend:", error);
      setPreferencesState(defaultPreferences);
      applyTheme(defaultPreferences.theme);
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
    setPreferencesState(updatedPreferences);
    if (newPrefsPartial.theme) {
      applyTheme(newPrefsPartial.theme);
    }
    // Removed direct backend call from here.
    // SettingsPage.tsx handleSaveSettings will persist all settings to the backend.
    console.log("UserPreferencesContext: Preferences updated locally. Backend save will occur via Settings page 'Save Settings' button.");
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, loadingPreferences, mongoDbUserId, setMongoDbUserId, fetchAndSetUserPreferences, setPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
