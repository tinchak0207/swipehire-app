
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { UserPreferences } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  theme: 'system', // Default to system preference
  featureFlags: {},
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loadingPreferences: boolean;
  setPreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>; // For SettingsPage to call
  // updatePreferenceOnBackend: (key: keyof UserPreferences, value: any) => Promise<void>; // More granular update
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
  currentUser: User | null; // Pass current Firebase user
}

export const UserPreferencesProvider = ({ children, currentUser }: UserPreferencesProviderProps) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  const applyTheme = useCallback((themeSetting: UserPreferences['theme']) => {
    if (themeSetting === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeSetting === 'light') {
      document.documentElement.classList.remove('dark');
    } else { // system
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Fetch preferences from Firestore
  useEffect(() => {
    if (currentUser?.uid) {
      setLoadingPreferences(true);
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedPrefs = { ...defaultPreferences, ...data.preferences };
          setPreferencesState(loadedPrefs);
          applyTheme(loadedPrefs.theme);
        } else {
          // No preferences saved yet, use defaults
          setPreferencesState(defaultPreferences);
          applyTheme(defaultPreferences.theme);
        }
      }).catch(error => {
        console.error("Error fetching user preferences from Firestore:", error);
        setPreferencesState(defaultPreferences); // Fallback to defaults
        applyTheme(defaultPreferences.theme);
      }).finally(() => {
        setLoadingPreferences(false);
      });
    } else {
      // No user / Guest mode
      setPreferencesState(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      setLoadingPreferences(false);
    }
  }, [currentUser, applyTheme]);

  // Listen to system theme changes if 'system' is selected
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme, applyTheme]);

  // Function for SettingsPage to call to update and persist preferences
  const setPreferences = async (newPrefsPartial: Partial<UserPreferences>) => {
    if (!currentUser?.uid) {
      // Handle guest or no user case (e.g., save to localStorage or do nothing)
      // For now, just update local state for guests if desired, but won't persist
      const updatedLocalPrefs = { ...preferences, ...newPrefsPartial };
      setPreferencesState(updatedLocalPrefs);
      if (newPrefsPartial.theme) {
        applyTheme(newPrefsPartial.theme);
      }
      console.log("Preferences updated locally for guest/no user.");
      return;
    }

    const updatedPreferences = { ...preferences, ...newPrefsPartial };
    setPreferencesState(updatedPreferences); // Optimistic update
    if (newPrefsPartial.theme) {
      applyTheme(newPrefsPartial.theme);
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      // We merge with existing document, specifically updating the 'preferences' field
      await setDoc(userDocRef, { preferences: updatedPreferences }, { merge: true });
      console.log("Preferences saved to Firestore for user:", currentUser.uid);
    } catch (error) {
      console.error("Error saving preferences to Firestore:", error);
      // Optionally revert optimistic update or show error to user
      // For now, we'll keep the optimistic update on the client
    }
  };


  return (
    <UserPreferencesContext.Provider value={{ preferences, loadingPreferences, setPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
