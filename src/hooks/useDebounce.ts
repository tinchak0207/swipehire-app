/**
 * useDebounce Hook
 *
 * Debounces a value to prevent excessive updates during rapid changes.
 * Useful for search inputs, API calls, and performance optimization.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
