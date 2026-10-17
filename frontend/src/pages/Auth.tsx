import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import unsLogo from "../assets/uns_logo.webp";
import { Capacitor } from "@capacitor/core";
import { FcGoogle } from "react-icons/fc";
import GoogleClassModal from "../components/auth/GoogleClassModal";
import { useGoogleAuth } from "../components/auth/useGoogleAuth";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    showClassModal,
    setShowClassModal,
    setTempIdToken,
    inputKelas,
    setInputKelas,
    isSubmittingGoogle,
    handleNativeGoogleSignIn,
    handleClassSubmit,
  } = useGoogleAuth(mode);

  useEffect(() => {
    if (user) {
      navigate("/menu", { replace: true });
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate("/menu");
  };

  if (user) return null;

  return (
    <div className="w-full h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2B2927] font-sans overflow-hidden relative">
      {/* Decorative Shapes */}
      <div className="absolute top-[-5%] left-[-15%] w-62.5 h-62.5 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-55 h-55 bg-[#FFEAEA] rounded-full filter blur-xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 h-screen bg-linear-to-b from-[#18113C] to-[#0A071E] flex flex-col justify-between overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        {/* Top Header Row & Title */}
        <div className="w-full px-8 pt-10 pb-8 flex flex-col gap-4 z-20">
          <div className="w-full flex justify-between items-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/55 font-extrabold">
                Media Pembelajaran
              </p>
              <h1 className="text-2xl font-black text-white leading-tight mt-0.5 tracking-wide">
                SiZat-ESD
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
            Silakan masuk ke akun Anda atau daftarkan akun baru untuk mulai
            menggunakan modul pembelajaran interaktif.
          </p>
        </div>

        {/* Bottom Card Section */}
        <div className="w-full grow bg-white rounded-t-[40px] px-8 pt-8 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-5 relative z-20 overflow-hidden">
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

          {/* Form Container */}
          <div className="grow overflow-y-auto pr-1 select-text">
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
            <div className="grow border-t border-gray-150"></div>
            <span className="shrink mx-3 text-[#9C98A6] text-[10px] font-extrabold uppercase tracking-widest">
              Atau
            </span>
            <div className="grow border-t border-gray-150"></div>
          </div>

          {/* Google Button */}
          <div className="flex justify-center w-full pb-1">
            {Capacitor.isNativePlatform() ? (
              <button
                type="button"
                onClick={handleNativeGoogleSignIn}
                disabled={isSubmittingGoogle}
                className="w-full max-w-91.5 py-3 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-gray-300 rounded-full flex items-center justify-center gap-2.5 font-bold text-xs text-[#2C2B30] shadow-sm cursor-pointer disabled:opacity-50 transition-all"
              >
                <FcGoogle className="w-5 h-5 shrink-0" />
                <span>
                  {isSubmittingGoogle ? "Memproses..." : "Masuk dengan Google"}
                </span>
              </button>
            ) : (
              <div
                id="google-signin-btn"
                className="w-full max-w-91.5 flex justify-center"
              ></div>
            )}
          </div>
        </div>
      </div>

      {/* Class Modal Setup */}
      <GoogleClassModal
        isOpen={showClassModal}
        inputKelas={inputKelas}
        isSubmitting={isSubmittingGoogle}
        setInputKelas={setInputKelas}
        onClose={() => {
          setShowClassModal(false);
          setTempIdToken("");
        }}
        onSubmit={handleClassSubmit}
      />
    </div>
  );
}
