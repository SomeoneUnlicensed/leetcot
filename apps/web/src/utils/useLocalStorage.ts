import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  // Use a state that starts with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Synchronize with localStorage after mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // Try to parse if it looks like JSON, otherwise return as is (for strings)
        try {
          setStoredValue(JSON.parse(item));
        } catch {
          setStoredValue(item as unknown as T);
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  };

  return [storedValue, setValue];
}
