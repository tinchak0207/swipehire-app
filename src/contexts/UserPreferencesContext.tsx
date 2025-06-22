'use client';

import type { User } from 'firebase/auth';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { BackendUser, UserPreferences } from '@/lib/types';

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
    contentAndBlogUpdates: false, // Default to opt-out for content
    featureAndPromotionUpdates: false, // Default to opt-out for promos
  },
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  mongoDbUserId: string | null;
  setMongoDbUserId: (id: string | null) => void;
  fetchAndSetUserPreferences: (userId: string, forceRefresh?: boolean) => Promise<void>;
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

export const UserPreferencesProvider = ({
  children,
  currentUser,
}: UserPreferencesProviderProps) => {
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
    console.log('[UserPreferencesContext] setMongoDbUserId called with id:', id);
    setMongoDbUserIdState(id);
    if (id) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mongoDbUserId', id);
          console.log('[UserPreferencesContext] Stored mongoDbUserId in localStorage:', id);
          // Verify it was stored correctly
          const stored = localStorage.getItem('mongoDbUserId');
          if (stored !== id) {
            console.error(
              '[UserPreferencesContext] Failed to store mongoDbUserId in localStorage. Expected:',
              id,
              'Got:',
              stored
            );
          }
        } catch (error) {
          console.error(
            '[UserPreferencesContext] Error storing mongoDbUserId in localStorage:',
            error
          );
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('mongoDbUserId');
          console.log('[UserPreferencesContext] Removed mongoDbUserId from localStorage');
        } catch (error) {
          console.error(
            '[UserPreferencesContext] Error removing mongoDbUserId from localStorage:',
            error
          );
        }
      }
      setFullBackendUserState(null);
      setPassedCandidateIdsState(new Set());
      setPassedCompanyIdsState(new Set());
      setPreferencesState((prev) => {
        const newPrefs = {
          ...initialDefaultPreferences,
          theme: prev.theme,
          isLoading: false,
        };
        console.log(
          '[UserPreferencesContext] mongoDbUserId cleared. Preferences reset (theme preserved), isLoading set to false.',
          newPrefs
        );
        return newPrefs;
      });
    }
  }, []);

  const fetchAndSetUserPreferences = useCallback(
    async (userIdToFetch: string, forceRefresh = false) => {
      console.log(
        '[UserPreferencesContext] fetchAndSetUserPreferences called for userId:',
        userIdToFetch,
        'forceRefresh:',
        forceRefresh
      );

      if (!userIdToFetch) {
        console.warn(
          '[UserPreferencesContext] No userIdToFetch provided. Resetting to defaults and setting isLoading to false.'
        );
        setPreferencesState((prev) => ({
          ...initialDefaultPreferences,
          theme: prev.theme,
          isLoading: false,
        }));
        applyTheme(initialDefaultPreferences.theme);
        setPassedCandidateIdsState(new Set());
        setPassedCompanyIdsState(new Set());
        setFullBackendUserState(null);
        return;
      }

      setPreferencesState((prev) => ({ ...prev, isLoading: true }));

      // Add cache busting for force refresh
      const url = forceRefresh
        ? `${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}?_t=${Date.now()}`
        : `${CUSTOM_BACKEND_URL}/api/users/${userIdToFetch}`;

      console.log(`[UserPreferencesContext] Fetching user data from ${url}`);
      try {
        const response = await fetch(url, {
          headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {},
        });
        console.log(
          `[UserPreferencesContext] Fetch response status for user ${userIdToFetch}: ${response.status}`
        );

        if (response.ok) {
          const responseData = await response.json();
          // Handle both direct user object and wrapped response
          const userData = responseData.user || responseData;
          console.log(
            '[UserPreferencesContext] User data fetched successfully. companyProfileComplete:',
            userData.companyProfileComplete
          );

          const completeUserData: BackendUser = {
            ...userData,
            companyProfileComplete:
              userData.companyProfileComplete === undefined
                ? false
                : userData.companyProfileComplete,
          };

          console.log('[UserPreferencesContext] Setting fullBackendUser state:', {
            _id: completeUserData._id,
            selectedRole: completeUserData.selectedRole,
            companyProfileComplete: completeUserData.companyProfileComplete,
            companyName: completeUserData.companyName,
          });

          setFullBackendUserState(completeUserData);

          // Ensure the MongoDB ID is set if it's not already
          if (completeUserData._id && mongoDbUserId !== completeUserData._id) {
            console.log(
              '[UserPreferencesContext] Updating mongoDbUserId from user data:',
              completeUserData._id
            );
            setMongoDbUserId(completeUserData._id);
          }

          const loadedPrefsBase: Partial<UserPreferences> = completeUserData.preferences || {};
          const loadedNotificationChannels = {
            email: true,
            sms: false,
            inAppToast: true,
            inAppBanner: true,
            ...((
              loadedPrefsBase as {
                notificationChannels?: typeof initialDefaultPreferences.notificationChannels;
              }
            ).notificationChannels || {}),
          };

          const loadedNotificationSubscriptions = {
            companyReplies: true,
            matchUpdates: true,
            applicationStatusChanges: true,
            platformAnnouncements: true,
            welcomeAndOnboardingEmails: true,
            contentAndBlogUpdates: false,
            featureAndPromotionUpdates: false,
            ...((
              loadedPrefsBase as {
                notificationSubscriptions?: typeof initialDefaultPreferences.notificationSubscriptions;
              }
            ).notificationSubscriptions || {}),
          };

          const loadedPrefs: UserPreferences = {
            ...initialDefaultPreferences,
            ...loadedPrefsBase,
            featureFlags: {
              ...(initialDefaultPreferences.featureFlags || {}),
              ...((loadedPrefsBase as { featureFlags?: object }).featureFlags || {}),
            },
            notificationChannels: loadedNotificationChannels,
            notificationSubscriptions: loadedNotificationSubscriptions,
            isLoading: false,
          };
          setPreferencesState(loadedPrefs);
          applyTheme(loadedPrefs.theme);
          setPassedCandidateIdsState(new Set(completeUserData.passedCandidateProfileIds || []));
          setPassedCompanyIdsState(new Set(completeUserData.passedCompanyProfileIds || []));
          console.log(
            '[UserPreferencesContext] Preferences and user data applied for user:',
            userIdToFetch,
            'companyProfileComplete:',
            completeUserData.companyProfileComplete
          );
        } else {
          console.warn(
            `[UserPreferencesContext] Failed to fetch preferences for user ${userIdToFetch}, status: ${response.status}.`
          );
          setFullBackendUserState(null);
          if (response.status === 404 && mongoDbUserId === userIdToFetch) {
            setMongoDbUserId(null);
          }
          setPreferencesState((prev) => ({ ...prev, isLoading: false })); // Ensure isLoading is false on fetch error
        }
      } catch (error) {
        console.error(
          '[UserPreferencesContext] Critical error in fetchAndSetUserPreferences for user ' +
            userIdToFetch +
            ':',
          error
        );
        setFullBackendUserState(null);
        setPreferencesState((prev) => ({ ...prev, isLoading: false })); // Ensure isLoading is false on catch
      }
    },
    [applyTheme, mongoDbUserId, setMongoDbUserId]
  );

  useEffect(() => {
    console.log(
      '[UserPreferencesContext] Effect for localStorage mongoDbUserId. currentUser?.uid:',
      currentUser?.uid,
      'mongoDbUserId:',
      mongoDbUserId
    );
    if (typeof window !== 'undefined') {
      const storedMongoId = localStorage.getItem('mongoDbUserId');
      console.log('[UserPreferencesContext] Stored mongoDbUserId in localStorage:', storedMongoId);

      if (storedMongoId && mongoDbUserId !== storedMongoId) {
        console.log(
          '[UserPreferencesContext] Setting mongoDbUserId from localStorage:',
          storedMongoId
        );
        setMongoDbUserIdState(storedMongoId);
      } else if (!currentUser && !mongoDbUserId && preferences.isLoading) {
        // Initial load, no user, no stored ID, but context says loading
        console.log(
          '[UserPreferencesContext] No storedMongoId, no currentUser, but context isLoading is true. Deferring isLoading=false decision.'
        );
      } else if (!currentUser && !mongoDbUserId && !preferences.isLoading) {
        // Truly initial state with no user and not loading
        console.log(
          '[UserPreferencesContext] No storedMongoId and no currentUser and not loading. Ensuring isLoading is false.'
        );
        setPreferencesState((prev) => ({
          ...initialDefaultPreferences,
          theme: prev.theme,
          isLoading: false,
        }));
      }
    }
  }, [currentUser, mongoDbUserId, preferences.isLoading]);

  useEffect(() => {
    console.log(
      '[UserPreferencesContext] Main Auth/MongoID Effect | mongoDbUserId:',
      mongoDbUserId,
      '| currentUser?.uid:',
      currentUser?.uid
    );
    if (mongoDbUserId) {
      fetchAndSetUserPreferences(mongoDbUserId);
    } else {
      // mongoDbUserId is null.
      // If we have a currentUser but no mongoDbUserId, we should wait for AppContent to fetch/create the MongoDB user
      // Only set isLoading to false if we truly don't have a currentUser (meaning no auth at all)
      if (!currentUser) {
        console.log(
          '[UserPreferencesContext] Main Auth/MongoID Effect: mongoDbUserId is null and no currentUser. Setting isLoading: false.'
        );
        setPreferencesState((prev) => ({
          ...initialDefaultPreferences,
          theme: prev.theme, // Preserve theme choice
          isLoading: false, // Set to false only when no user is authenticated
        }));
        applyTheme(initialDefaultPreferences.theme);
        setPassedCandidateIdsState(new Set());
        setPassedCompanyIdsState(new Set());
        setFullBackendUserState(null);
      } else {
        console.log(
          '[UserPreferencesContext] Main Auth/MongoID Effect: mongoDbUserId is null but currentUser exists. Keeping isLoading: true while waiting for MongoDB ID.'
        );
        // Keep loading state true while we wait for the MongoDB ID to be fetched/created
        setPreferencesState((prev) => ({
          ...prev,
          isLoading: true,
        }));
      }
    }
  }, [mongoDbUserId, currentUser?.uid, fetchAndSetUserPreferences, applyTheme, currentUser]);

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (currentUser && !mongoDbUserId && preferences.isLoading) {
      console.log('[UserPreferencesContext] Setting timeout for MongoDB ID fetch...');
      const timeout = setTimeout(() => {
        console.log(
          '[UserPreferencesContext] Timeout reached - MongoDB ID not fetched. Setting isLoading to false.'
        );
        setPreferencesState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [currentUser, mongoDbUserId, preferences.isLoading]);

  useEffect(() => {
    if (preferences.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme, applyTheme]);

  const setPreferences = useCallback(
    async (newPrefsPartial: Partial<UserPreferences>) => {
      setPreferencesState((prevPreferences) => {
        const updatedPreferences: UserPreferences = {
          ...prevPreferences,
          ...newPrefsPartial,
          isLoading:
            newPrefsPartial.isLoading !== undefined
              ? newPrefsPartial.isLoading
              : prevPreferences.isLoading,
        };
        if (newPrefsPartial.notificationChannels) {
          updatedPreferences.notificationChannels = {
            ...(prevPreferences.notificationChannels ||
              initialDefaultPreferences.notificationChannels),
            ...newPrefsPartial.notificationChannels,
          };
        }
        if (newPrefsPartial.notificationSubscriptions) {
          updatedPreferences.notificationSubscriptions = {
            ...(prevPreferences.notificationSubscriptions ||
              initialDefaultPreferences.notificationSubscriptions),
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
        console.log(
          '[UserPreferencesContext] Preferences updated locally. Backend save via Settings page. New isLoading:',
          updatedPreferences.isLoading
        );
        return updatedPreferences;
      });
    },
    [applyTheme]
  );

  const updatePassedCandidateIds = useCallback((newIds: string[]) => {
    setPassedCandidateIdsState(new Set(newIds));
  }, []);

  const updatePassedCompanyIds = useCallback((newIds: string[]) => {
    setPassedCompanyIdsState(new Set(newIds));
  }, []);

  const updateFullBackendUserFields = useCallback(
    (updatedFields: Partial<BackendUser> | null) => {
      setFullBackendUserState((prevUser) => {
        if (updatedFields === null) return null;
        if (!prevUser && mongoDbUserId) {
          const newUser: BackendUser = {
            _id: mongoDbUserId,
            name: '',
            email: '',
            selectedRole: null,
            companyProfileComplete: false,
            ...updatedFields,
          };
          return newUser;
        }
        if (prevUser) {
          return { ...prevUser, ...updatedFields };
        }
        return null;
      });
    },
    [mongoDbUserId]
  );

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
