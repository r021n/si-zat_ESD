import { useCallback } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";

interface KioskModePlugin {
  startLockTask(): Promise<{ success: boolean }>;
  stopLockTask(): Promise<{ success: boolean; error?: string }>;
  isInLockTaskMode(): Promise<{ isLocked: boolean }>;
}

const NativeKiosk = registerPlugin<KioskModePlugin>("KioskMode");

export function useKioskMode() {
  const startLock = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await NativeKiosk.startLockTask();
    } catch (err) {
      console.warn("startLockTask failed:", err);
    }
  }, []);

  const stopLock = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await NativeKiosk.stopLockTask();
    } catch (err) {
      console.warn("stopLockTask failed:", err);
    }
  }, []);

  const isLocked = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const res = await NativeKiosk.isInLockTaskMode();
      return !!res.isLocked;
    } catch (err) {
      console.warn("isInLockTaskMode failed:", err);
      return false;
    }
  }, []);

  return { startLock, stopLock, isLocked };
}
