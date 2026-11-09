import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { APP_INFO, calculateRemainingSplashTime } from "../config/appInfo";

export interface UseSplashScreenOptions {
  isReady: boolean;
  minDurationMs?: number;
  fadeDurationMs?: number;
  autoDismiss?: boolean;
}

export interface UseSplashScreenResult {
  isVisible: boolean;
  isFading: boolean;
  skip: () => void;
}

export function useSplashScreen({
  isReady,
  minDurationMs = APP_INFO.minSplashDurationMs,
  fadeDurationMs = APP_INFO.fadeDurationMs,
  autoDismiss = false,
}: UseSplashScreenOptions): UseSplashScreenResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dismiss native Capacitor splash screen as soon as React component mounts
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {
        // Silently ignore if native plugin is unavailable
      });
    }
  }, []);

  const triggerExit = useCallback(() => {
    setIsFading(true);
    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFading(false);
    }, fadeDurationMs);
  }, [fadeDurationMs]);

  // When autoDismiss is enabled and readiness condition is satisfied, wait for remaining duration then fade out
  useEffect(() => {
    if (!autoDismiss || !isReady || !isVisible || isFading) return;

    const remainingTime = calculateRemainingSplashTime(
      startTimeRef.current,
      Date.now(),
      minDurationMs,
    );

    timerRef.current = setTimeout(() => {
      triggerExit();
    }, remainingTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoDismiss, isReady, isVisible, isFading, minDurationMs, triggerExit]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const skip = useCallback(() => {
    if (!isVisible || isFading || !isReady) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    triggerExit();
  }, [isVisible, isFading, isReady, triggerExit]);

  return { isVisible, isFading, skip };
}
