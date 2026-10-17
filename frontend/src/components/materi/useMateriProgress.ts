import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  getMateriProgressApi,
  updateMateriProgressApi,
  resetMateriProgressApi,
} from "../../api/api";
import { LOCAL_STORAGE_KEY, MATERI_SLIDES } from "./constants";
import { useMateriInteractiveState } from "./useMateriInteractiveState";

export function useMateriProgress() {
  const { user, token } = useAuthStore();
  const isInitialLoadedRef = useRef<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? Math.min(parseInt(saved, 10), MATERI_SLIDES.length - 1) : 0;
  });

  const {
    page4Selected,
    setPage4Selected,
    page4Submitted,
    setPage4Submitted,
    handleSubmitPage4,
    page7Assignments,
    setPage7Assignments,
    page7Submitted,
    setPage7Submitted,
    handleSubmitPage7,
    page14Assignments,
    setPage14Assignments,
    page14Submitted,
    setPage14Submitted,
    handleSubmitPage14,
    page17Selected,
    setPage17Selected,
    page17Submitted,
    setPage17Submitted,
    handleSubmitPage17,
    resetInteractiveState,
  } = useMateriInteractiveState(maxUnlockedIndex, setMaxUnlockedIndex);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Fetch reading progress from backend on mount
  useEffect(() => {
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      isInitialLoadedRef.current = true;
      return;
    }

    getMateriProgressApi(authToken)
      .then((res) => {
        if (res && res.status === "success" && res.progress) {
          const { lastPage, maxUnlockedIndex: backendMaxUnlocked } = res.progress;
          const validLastPage = Math.min(Math.max(0, lastPage), MATERI_SLIDES.length - 1);
          const validMaxUnlocked = Math.min(
            Math.max(0, backendMaxUnlocked, validLastPage),
            MATERI_SLIDES.length - 1,
          );

          setCurrentPage(validLastPage);
          setMaxUnlockedIndex((prev) => Math.max(prev, validMaxUnlocked));
        }
      })
      .catch((err) => {
        console.error("Gagal memuat progress bacaan dari backend:", err);
      })
      .finally(() => {
        isInitialLoadedRef.current = true;
      });
  }, [token]);

  // Sync reading progress to backend when currentPage or maxUnlockedIndex changes
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;
    const authToken = token || localStorage.getItem("token");
    if (!authToken) return;

    const timer = setTimeout(() => {
      updateMateriProgressApi(authToken, {
        lastPage: currentPage,
        maxUnlockedIndex,
      }).catch((err) => {
        console.error("Gagal menyimpan progress bacaan ke backend:", err);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPage, maxUnlockedIndex, token]);

  // Immediately unlock next page when landing on current page (except interactive pages)
  useEffect(() => {
    if (currentPage >= maxUnlockedIndex && currentPage < MATERI_SLIDES.length - 1) {
      if (currentPage === 3 && !page4Submitted) return;
      if (currentPage === 6 && !page7Submitted) return;
      if (currentPage === 13 && !page14Submitted) return;
      if (currentPage === 16 && !page17Submitted) return;
      setMaxUnlockedIndex(currentPage + 1);
    }
  }, [
    currentPage,
    maxUnlockedIndex,
    page4Submitted,
    page7Submitted,
    page14Submitted,
    page17Submitted,
  ]);

  // Persist maxUnlockedIndex to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, maxUnlockedIndex.toString());
  }, [maxUnlockedIndex]);

  const handleNext = useCallback(() => {
    if (currentPage === 3 && !page4Submitted && maxUnlockedIndex <= 3) {
      showToast("Pilih dan kirim jawaban terlebih dahulu untuk melanjutkan!");
      return;
    }
    if (currentPage === 6 && !page7Submitted && maxUnlockedIndex <= 6) {
      showToast("Hubungkan semua potongan puzzle dan kirim jawaban terlebih dahulu!");
      return;
    }
    if (currentPage === 13 && !page14Submitted && maxUnlockedIndex <= 13) {
      showToast("Hubungkan semua potongan puzzle dan kirim jawaban terlebih dahulu!");
      return;
    }
    if (currentPage === 16 && !page17Submitted && maxUnlockedIndex <= 16) {
      showToast("Pilih dan kirim jawaban terlebih dahulu untuk melanjutkan!");
      return;
    }
    if (currentPage < MATERI_SLIDES.length - 1 && currentPage <= maxUnlockedIndex) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [
    currentPage,
    maxUnlockedIndex,
    page4Submitted,
    page7Submitted,
    page14Submitted,
    page17Submitted,
  ]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handleJumpToPage = (index: number) => {
    if (index <= maxUnlockedIndex) {
      setCurrentPage(index);
      return true;
    } else {
      showToast("Halaman ini belum terbuka. Selesaikan slide sebelumnya!");
      return false;
    }
  };

  const handleResetProgress = () => {
    setMaxUnlockedIndex(0);
    setCurrentPage(0);
    resetInteractiveState();

    localStorage.removeItem(LOCAL_STORAGE_KEY);

    const authToken = token || localStorage.getItem("token");
    if (authToken) {
      resetMateriProgressApi(authToken).catch(() => {});
    }
    showToast("Progres direset ke halaman awal.");
  };

  return {
    user,
    currentPage,
    maxUnlockedIndex,
    page4Selected,
    setPage4Selected,
    page4Submitted,
    setPage4Submitted,
    handleSubmitPage4,
    page7Assignments,
    setPage7Assignments,
    page7Submitted,
    setPage7Submitted,
    handleSubmitPage7,
    page14Assignments,
    setPage14Assignments,
    page14Submitted,
    setPage14Submitted,
    handleSubmitPage14,
    page17Selected,
    setPage17Selected,
    page17Submitted,
    setPage17Submitted,
    handleSubmitPage17,
    toastMessage,
    handleNext,
    handlePrev,
    handleJumpToPage,
    handleResetProgress,
  };
}
