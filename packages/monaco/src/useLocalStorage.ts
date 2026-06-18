import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !key) return;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
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
      if (typeof window !== 'undefined' && key) {
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  };

  return [storedValue, setValue];
}
