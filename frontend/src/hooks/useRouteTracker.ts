import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { recordMenuClickApi } from "../api/api";
import { getMenuKeyFromPathname } from "../utils/routeMapping";

export function useRouteTracker() {
  const location = useLocation();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    const menuKey = getMenuKeyFromPathname(location.pathname);
    if (!menuKey) return;

    // Debounce 500ms to prevent spamming analytics during fast navigation
    const debounceTimer = setTimeout(() => {
      recordMenuClickApi(token, menuKey).catch((err) => {
        console.error("Gagal mencatat kunjungan menu:", err);
      });
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [location.pathname, token, user]);
}
