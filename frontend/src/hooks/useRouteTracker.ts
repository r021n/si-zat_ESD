import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { recordMenuClickApi } from "../api/api";

const PATH_MENU_MAP: Record<string, string> = {
  "/materi": "menu materi",
  "/simulasi": "menu simulasi",
  "/simulasi/air": "menu pencemaran air",
  "/simulasi/eutrofikasi": "menu eutrofikasi",
  "/simulasi/tanah": "menu pencemaran tanah",
  "/simulasi/udara": "menu pencemaran udara",
  "/kuis": "menu kuis",
  "/kuis/berpikir-sistem": "menu berpikir sistem",
  "/profil-pengembang": "menu profil pengembang",
  "/profile-report": "menu profil & report",
};

export function useRouteTracker() {
  const location = useLocation();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    const pathname = location.pathname;
    let menuKey = PATH_MENU_MAP[pathname] || "";

    if (!menuKey && pathname.startsWith("/ruang-diskusi")) {
      menuKey = "menu ruang diskusi";
    }

    if (menuKey) {
      recordMenuClickApi(token, menuKey).catch((err) => {
        console.error("Gagal mencatat kunjungan menu:", err);
      });
    }
  }, [location.pathname, token, user]);
}
