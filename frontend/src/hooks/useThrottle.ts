import { useRef, useCallback, useEffect } from "react";

/**
 * Hook to throttle a callback function.
 * Ensures the callback is executed at most once per `delayMs` window.
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs = 500,
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRan.current >= delayMs) {
        lastRan.current = now;
        callbackRef.current(...args);
      }
    },
    [delayMs],
  );
}
