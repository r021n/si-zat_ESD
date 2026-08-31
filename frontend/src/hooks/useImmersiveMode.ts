import { Capacitor, registerPlugin } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

interface ImmersiveModePlugin {
  hide(): Promise<{ hidden: boolean }>;
  show(): Promise<{ hidden: boolean }>;
}

const NativeImmersive = registerPlugin<ImmersiveModePlugin>("ImmersiveMode");

export function useImmersiveMode() {
  const enterImmersive = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.hide();
    } catch (err) {
      console.warn("StatusBar hide failed:", err);
    }

    try {
      await NativeImmersive.hide();
    } catch (err) {
      console.warn("NativeImmersive hide failed:", err);
    }
  };

  const exitImmersive = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.show();
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      console.warn("StatusBar show failed:", err);
    }

    try {
      await NativeImmersive.show();
    } catch (err) {
      console.warn("NativeImmersive show failed:", err);
    }
  };

  return { enterImmersive, exitImmersive };
}
