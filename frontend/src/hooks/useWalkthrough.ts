import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getWalkthroughSteps,
  hasSeenWalkthrough,
  setSeenWalkthrough,
  type WalkthroughStep,
} from '../config/walkthroughSteps';

interface UseWalkthroughOptions {
  userId?: number | string | null;
  isAdmin: boolean;
  isEnrolled?: boolean | null;
}

export function useWalkthrough({ userId, isAdmin, isEnrolled }: UseWalkthroughOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WalkthroughStep[] = useMemo(
    () => getWalkthroughSteps(isAdmin, isEnrolled ?? false),
    [isAdmin, isEnrolled]
  );

  // Otomatis muncul pada kunjungan pertama kali setelah pengguna terautentikasi
  useEffect(() => {
    if (userId !== undefined && userId !== null) {
      const alreadySeen = hasSeenWalkthrough(userId);
      if (!alreadySeen) {
        setCurrentStep(0);
        setIsOpen(true);
      }
    }
  }, [userId]);

  const openWalkthrough = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const closeWalkthrough = useCallback(() => {
    setIsOpen(false);
    if (userId !== undefined && userId !== null) {
      setSeenWalkthrough(userId);
    }
  }, [userId]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      closeWalkthrough();
      return prev;
    });
  }, [steps.length, closeWalkthrough]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    isOpen,
    currentStep,
    steps,
    openWalkthrough,
    closeWalkthrough,
    nextStep,
    prevStep,
    setCurrentStep,
  };
}
