import { useState, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback<SetValue<T>>(
    (value) => {
      try {
        setStoredValue((prev) => {
          const next =
            typeof value === 'function'
              ? (value as (prev: T) => T)(prev)
              : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch (err) {
        console.warn(`useLocalStorage: failed to save "${key}"`, err);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
