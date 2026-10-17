import { useState, useEffect, useRef } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useKioskMode } from "../../hooks/useKioskMode";
import { useImmersiveMode } from "../../hooks/useImmersiveMode";
import { useCustomDialog } from "../CustomDialog";
import type { Quiz } from "../../types/quiz";

interface UseQuizAntiCheatProps {
  activeQuiz: Quiz | null;
  submitted: boolean;
}

export function useQuizAntiCheat({ activeQuiz, submitted }: UseQuizAntiCheatProps) {
  const { startLock, stopLock } = useKioskMode();
  const { enterImmersive, exitImmersive } = useImmersiveMode();
  const { showAlert } = useCustomDialog();

  const [violationCount, setViolationCount] = useState<number>(0);
  const violationCountRef = useRef<number>(0);

  useEffect(() => {
    if (!activeQuiz || submitted) return;

    startLock();
    enterImmersive();

    let wasBackground = false;

    const handleAppLeft = () => {
      wasBackground = true;
      violationCountRef.current += 1;
      setViolationCount(violationCountRef.current);
    };

    const handleAppReturned = async () => {
      if (wasBackground) {
        wasBackground = false;
        await startLock();
        await enterImmersive();
        await showAlert(
          `PERINGATAN!\n\nAnda terdeteksi meninggalkan aplikasi kuis (Pelanggaran ke-${violationCountRef.current}).\n\nHarap tetap berada di dalam aplikasi selama pengerjaan tes!`,
          "Peringatan Ujian"
        );
      }
    };

    let capAppListener: any = null;
    if (Capacitor.isNativePlatform()) {
      capAppListener = CapApp.addListener("appStateChange", (state) => {
        if (!state.isActive) {
          handleAppLeft();
        } else {
          handleAppReturned();
        }
      });
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAppLeft();
      } else {
        handleAppReturned();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (capAppListener) {
        capAppListener.then((l: any) => l.remove());
      }
      stopLock();
      exitImmersive();
    };
  }, [activeQuiz, submitted, startLock, stopLock, enterImmersive, exitImmersive, showAlert]);

  const resetViolations = (count = 0) => {
    violationCountRef.current = count;
    setViolationCount(count);
  };

  return {
    violationCount,
    violationCountRef,
    resetViolations,
    startLock,
    stopLock,
    enterImmersive,
    exitImmersive,
  };
}
