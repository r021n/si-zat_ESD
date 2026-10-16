import { useEffect } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useImmersiveMode } from "./useImmersiveMode";

export function useLandscapeSimulation() {
  const { enterImmersive, exitImmersive } = useImmersiveMode();

  useEffect(() => {
    const lockOrientationAndReload = async () => {
      try {
        await ScreenOrientation.lock({ orientation: "landscape" });
      } catch (err) {
        console.warn("ScreenOrientation lock failed or not supported:", err);
      }

      try {
        await enterImmersive();
      } catch (err) {
        console.warn("Immersive mode failed:", err);
      }

      const sessionKey = `refreshed-${window.location.hash}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    };

    lockOrientationAndReload();

    return () => {
      const unlockOrientation = async () => {
        try {
          await exitImmersive();
        } catch (err) {
          console.warn("Immersive exit failed:", err);
        }
        try {
          await ScreenOrientation.lock({ orientation: "portrait" });
        } catch {
          try {
            await ScreenOrientation.unlock();
          } catch (unlockErr) {
            console.warn(
              "ScreenOrientation unlock/portrait lock failed:",
              unlockErr,
            );
          }
        }
      };
      unlockOrientation();
    };
  }, [enterImmersive, exitImmersive]);
}
