import { useRef, useEffect, useCallback } from 'react';

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 500,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        savedCallback.current(...args);
      }, delay);
    },
    [delay],
  );
}
