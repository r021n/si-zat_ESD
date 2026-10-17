import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCustomDialog } from "../CustomDialog";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

declare global {
  interface Window {
    google?: any;
  }
}

export function useGoogleAuth(mode: "login" | "register") {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const { showAlert } = useCustomDialog();

  const [showClassModal, setShowClassModal] = useState(false);
  const [tempIdToken, setTempIdToken] = useState("");
  const [inputKelas, setInputKelas] = useState("");
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const webClientId =
        import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

      SocialLogin.initialize({
        google: {
          webClientId,
          iOSClientId: webClientId,
          mode: "online",
        },
      });
    }
  }, []);

  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      const idToken = response.credential;
      if (!idToken) return;

      setIsSubmittingGoogle(true);
      try {
        const res = await loginWithGoogle(idToken);
        if (res.registered) {
          navigate("/menu");
        } else {
          setTempIdToken(idToken);
          setShowClassModal(true);
        }
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error
            ? err.message
            : typeof err === "object"
            ? JSON.stringify(err)
            : String(err);
        await showAlert(`Error Backend Google Login:\n${errMsg}`);
      } finally {
        setIsSubmittingGoogle(false);
      }
    },
    [loginWithGoogle, navigate, showAlert],
  );

  const handleNativeGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    try {
      const res = await SocialLogin.login({ provider: "google", options: {} });
      const result = res.result;
      if (result.responseType === "offline") {
        await showAlert("Mode offline tidak didukung.");
        return;
      }
      const idToken = result.idToken;
      if (idToken) {
        await handleGoogleCredentialResponse({ credential: idToken });
      } else {
        await showAlert(
          "Gagal mendapatkan token autentikasi Google (idToken kosong).",
        );
      }
    } catch (err: unknown) {
      console.error("Google Auth Native Error:", err);
      const strErr =
        err instanceof Error
          ? err.message
          : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);
      if (!strErr.toLowerCase().includes("cancel")) {
        await showAlert(`Detail Error Native Google Auth:\n${strErr}`);
      }
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleClassSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputKelas.trim()) {
      await showAlert("Kelas harus diisi!");
      return;
    }

    setIsSubmittingGoogle(true);
    try {
      const res = await loginWithGoogle(tempIdToken, inputKelas.trim());
      if (res.registered) {
        setShowClassModal(false);
        navigate("/menu");
      } else {
        await showAlert("Terjadi kesalahan saat pendaftaran.");
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Gagal menyelesaikan pendaftaran.";
      await showAlert(errMsg);
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeGoogleSignIn = () => {
      if (window.google) {
        const client_id =
          import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
          import.meta.env.VITE_GOOGLE_CLIENT_ID ||
          "your-google-client-id.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id,
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 366,
            shape: "pill",
            text: "signin_with",
          });
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    const timeout = setTimeout(() => {
      initializeGoogleSignIn();
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [mode, handleGoogleCredentialResponse]);

  return {
    showClassModal,
    setShowClassModal,
    tempIdToken,
    setTempIdToken,
    inputKelas,
    setInputKelas,
    isSubmittingGoogle,
    handleNativeGoogleSignIn,
    handleClassSubmit,
  };
}
