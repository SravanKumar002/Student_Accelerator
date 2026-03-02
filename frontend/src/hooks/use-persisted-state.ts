/**
 * ============================================================================
 * usePersistedState — localStorage-backed React state
 * ============================================================================
 *
 * Drop-in replacement for useState that automatically saves to and
 * restores from localStorage, so form data survives page refreshes.
 *
 * USAGE:
 *   const [profile, setProfile] = usePersistedState('form-profile', defaultProfile);
 *
 * The value is JSON-serialized. If the stored JSON is corrupted the
 * hook falls back to the provided default value silently.
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState, useEffect, useCallback } from "react";

/**
 * React hook that mirrors useState but persists the value to localStorage.
 *
 * @param key - The localStorage key to store under
 * @param defaultValue - The initial / fallback value
 * @returns [value, setValue] — same API as useState
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // ---------------------------------------------------------------------------
  // Initialiser — read from localStorage once
  // ---------------------------------------------------------------------------
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupt JSON → ignore and use default
    }
    return defaultValue;
  });

  // ---------------------------------------------------------------------------
  // Side-effect — write to localStorage whenever value changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Helper to clear all persisted form data at once (e.g. after submission).
 */
export function clearPersistedForm() {
  const keys = ["form-profile", "form-goals", "form-availability", "form-step"];
  keys.forEach((k) => localStorage.removeItem(k));
}
