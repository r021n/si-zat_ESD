import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { recordOpenApi, recordUsageApi } from "../api/api";
import { API_URL } from "../utils/constants";

export function useHeartbeatTracker() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    // 1. Record App Open (once per session)
    const hasRecordedOpen = sessionStorage.getItem("tracked_open_session");
    if (!hasRecordedOpen) {
      sessionStorage.setItem("tracked_open_session", "true");
      recordOpenApi(token).catch((err) => {
        console.error("Gagal mencatat pembukaan aplikasi:", err);
        sessionStorage.removeItem("tracked_open_session");
      });
    }

    // 2. Track usage time
    let elapsedSeconds = 0;
    const intervalTime = 10; // Heartbeat interval in seconds

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        elapsedSeconds += 1;
        if (elapsedSeconds >= intervalTime) {
          const secondsToSend = elapsedSeconds;
          elapsedSeconds = 0;
          recordUsageApi(token, secondsToSend).catch((err) => {
            console.error("Gagal mencatat durasi penggunaan:", err);
            elapsedSeconds += secondsToSend;
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (elapsedSeconds > 0) {
        fetch(`${API_URL}/api/auth/record-usage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seconds: elapsedSeconds }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [user, token]);
}
