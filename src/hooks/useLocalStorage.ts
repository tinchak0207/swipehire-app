/**
 * useLocalStorage Hook
 *
 * Provides a way to persist state in localStorage with automatic serialization.
 * Includes error handling and SSR compatibility.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 */

import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to the localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
