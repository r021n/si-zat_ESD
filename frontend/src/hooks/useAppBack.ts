import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

export function useAppBack() {
  const navigate = useNavigate();

  return (defaultPath: string) => {
    if (Capacitor.isNativePlatform() && window.history.length > 1) {
      window.history.back();
    } else {
      navigate(defaultPath);
    }
  };
}
