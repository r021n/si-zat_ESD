import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useCustomDialog } from "../components/CustomDialog";

export function useAppBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = useCustomDialog();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isDialogActive = false;

    const backButtonHandler = CapApp.addListener(
      "backButton",
      async (data: any) => {
        const currentPath = location.pathname;

        if (
          currentPath === "/menu" ||
          currentPath === "/" ||
          currentPath === "/auth"
        ) {
          if (isDialogActive) return;
          isDialogActive = true;

          const confirmExit = await showConfirm(
            "Apakah Anda yakin ingin keluar dari aplikasi?",
          );
          isDialogActive = false;

          if (confirmExit) {
            CapApp.exitApp();
          }
        } else if (currentPath === "/kuis") {
          window.dispatchEvent(new CustomEvent("kuisBackButton"));
        } else {
          if (data.canGoBack) {
            window.history.back();
          } else {
            navigate("/menu");
          }
        }
      },
    );

    return () => {
      backButtonHandler.then((listener: any) => listener.remove());
    };
  }, [location.pathname, navigate, showConfirm]);
}
