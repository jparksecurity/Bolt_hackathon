import { useState, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage with automatic JSON serialization
 * @param key - localStorage key
 * @param defaultValue - default value if no stored value exists
 * @returns [state, setState] tuple similar to useState
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn(`Failed to parse localStorage value for key "${key}":`, error);
    }
    return defaultValue;
  });

  const setPersistentState = useCallback((value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setState(value);
    } catch (error) {
      console.warn(`Failed to save to localStorage for key "${key}":`, error);
      // Still update state even if localStorage fails
      setState(value);
    }
  }, [key]);

  return [state, setPersistentState];
} 