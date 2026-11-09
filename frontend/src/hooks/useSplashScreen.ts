import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { APP_INFO } from "../config/appInfo";

const STALL_TIMEOUT_MS = 8000;

export interface UseSplashScreenOptions {
  isReady: boolean;
  fadeDurationMs?: number;
}

export interface UseSplashScreenResult {
  isVisible: boolean;
  isFading: boolean;
  isStalled: boolean;
  skip: () => void;
}

export function useSplashScreen({
  isReady,
  fadeDurationMs = APP_INFO.fadeDurationMs,
}: UseSplashScreenOptions): UseSplashScreenResult {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isStalled, setIsStalled] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dismiss native Capacitor splash screen as soon as React component mounts
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {
        // Silently ignore if native plugin is unavailable
      });
    }
  }, []);

  // Surface a hint when initialization takes unusually long
  useEffect(() => {
    if (isReady || isStalled) return;

    const timer = setTimeout(() => {
      setIsStalled(true);
    }, STALL_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isReady, isStalled]);

  const triggerExit = useCallback(() => {
    setIsFading(true);
    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFading(false);
    }, fadeDurationMs);
  }, [fadeDurationMs]);

  // Clean up the fade timer on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const skip = useCallback(() => {
    if (!isVisible || isFading || !isReady) return;
    triggerExit();
  }, [isVisible, isFading, isReady, triggerExit]);

  return { isVisible, isFading, isStalled, skip };
}
