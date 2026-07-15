import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import unsLogo from "../assets/uns_logo.webp";
import { useCustomDialog } from "../components/CustomDialog";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuthStore();
  const { showAlert } = useCustomDialog();

  // States for class selection modal (for first-time Google signups)
  const [showClassModal, setShowClassModal] = useState(false);
  const [tempIdToken, setTempIdToken] = useState("");
  const [inputKelas, setInputKelas] = useState("");
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/menu", { replace: true });
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate("/menu");
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    if (!idToken) return;

    setIsSubmittingGoogle(true);
    try {
      const res = await loginWithGoogle(idToken);
      if (res.registered) {
        navigate("/menu");
      } else {
        // Not registered yet, need to select class
        setTempIdToken(idToken);
        setShowClassModal(true);
      }
    } catch (err: any) {
      await showAlert(err.message || "Gagal masuk menggunakan Google.");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      await showAlert(err.message || "Gagal menyelesaikan pendaftaran.");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  useEffect(() => {
    // Dynamically load Google GSI client script
    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeGoogleSignIn = () => {
      if (window.google) {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id,
          callback: handleGoogleCredentialResponse,
        });
        
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { 
              theme: "outline", 
              size: "large", 
              width: 366, 
              shape: "pill",
              text: "signin_with"
            }
          );
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

    // Re-initialize button after potential layout changes
    const timeout = setTimeout(() => {
      initializeGoogleSignIn();
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [mode]);

  if (user) return null; // Avoid rendering login/register briefly before redirecting

  return (
    <div className="w-full h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2B2927] font-sans overflow-hidden relative">
      {/* Decorative Shapes for premium outer aesthetic */}
      <div className="absolute top-[-5%] left-[-15%] w-[250px] h-[250px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[220px] h-[220px] bg-[#FFEAEA] rounded-full filter blur-xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] h-screen bg-gradient-to-b from-[#18113C] to-[#0A071E] flex flex-col justify-between overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        {/* Top Header Row & Title */}
        <div className="w-full px-8 pt-10 pb-8 flex flex-col gap-4 z-20">
          <div className="w-full flex justify-between items-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/55 font-extrabold">
                Media Pembelajaran
              </p>
              <h1 className="text-2xl font-black text-white leading-tight mt-0.5 tracking-wide">
                SI-ZAT
              </h1>
            </div>
            {/* Logo UNS Card */}
            <div className="h-10 px-3 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
              <img
                src={unsLogo}
                alt="UNS Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-white/60 leading-relaxed pr-4">
            Silakan masuk ke akun Anda atau daftarkan akun baru untuk mulai menggunakan modul pembelajaran interaktif.
          </p>
        </div>

        {/* Bottom Card Section (Full vertical height remaining) */}
        <div className="w-full flex-grow bg-white rounded-t-[40px] px-8 pt-8 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-5 relative z-20 overflow-hidden">
          {/* Segment Control / Tabs */}
          <div className="flex bg-[#F5F3FF] p-1.5 rounded-full w-full">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-full cursor-pointer transition-all duration-200 ${
                mode === "login"
                  ? "bg-[#FF5E8C] text-white shadow-md shadow-pink-100"
                  : "text-[#9C98A6] hover:text-[#8C66FF]"
              }`}
            >
              MASUK
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-full cursor-pointer transition-all duration-200 ${
                mode === "register"
                  ? "bg-[#FF5E8C] text-white shadow-md shadow-pink-100"
                  : "text-[#9C98A6] hover:text-[#8C66FF]"
              }`}
            >
              DAFTAR
            </button>
          </div>

          {/* Form Container (Scrollable) */}
          <div className="flex-grow overflow-y-auto pr-1 select-text">
            {mode === "login" ? (
              <Login
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setMode("register")}
              />
            ) : (
              <Register
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-150"></div>
            <span className="flex-shrink mx-3 text-[#9C98A6] text-[10px] font-extrabold uppercase tracking-widest">
              Atau
            </span>
            <div className="flex-grow border-t border-gray-150"></div>
          </div>

          {/* Google Button */}
          <div className="flex justify-center w-full pb-1">
            <div id="google-signin-btn" className="w-full max-w-[366px] flex justify-center"></div>
          </div>
        </div>
      </div>

      {/* Class Modal Setup */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-[360px] bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 text-left animate-none">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                Satu Langkah Lagi!
              </h3>
              <p className="text-[10px] text-[#9C98A6] font-semibold mt-1">
                Silakan masukkan Kelas Anda untuk menyelesaikan pendaftaran dengan Google.
              </p>
            </div>

            <form onSubmit={handleClassSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={inputKelas}
                  onChange={(e) => setInputKelas(e.target.value)}
                  placeholder="Contoh: XII MIPA 1"
                  required
                  className="w-full px-4 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setTempIdToken("");
                  }}
                  className="flex-1 py-3 bg-[#F5F3FF] text-[#9C98A6] font-extrabold uppercase tracking-wider text-[10px] rounded-full cursor-pointer hover:bg-neutral-100 transition-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGoogle}
                  className="flex-1 py-3 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-pink-100 cursor-pointer disabled:opacity-50 transition-none"
                >
                  {isSubmittingGoogle ? "Memproses..." : "Selesai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
