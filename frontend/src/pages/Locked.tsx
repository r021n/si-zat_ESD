import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { getAccessStatusApi } from "../api/api";
import { LuLock, LuRefreshCw, LuLogOut } from "react-icons/lu";

export default function Locked() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If there is no user, redirect to auth page
    if (!user) {
      navigate("/auth");
      return;
    }

    // Admins should not be on this page, redirect to menu
    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  const handleCheckAccess = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await getAccessStatusApi();
      if (!res.isLocked) {
        // Unlocked! Go to main menu
        navigate("/menu");
      } else {
        setError("Aplikasi masih dikunci oleh Administrator.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Background blobs for premium feeling */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#FFEBF0] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>

      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-12 z-10 text-center">
        {/* Top Spacer */}
        <div></div>

        {/* Main Content Card */}
        <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col items-center gap-6">
          {/* Locked Icon Wrapper */}
          <div className="w-20 h-20 bg-[#FFEBF0] text-[#D95276] rounded-3xl flex items-center justify-center shadow-inner animate-pulse">
            <LuLock size={36} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
              Akses Dibatasi
            </h1>
            <p className="text-xs text-[#9C98A6] font-medium leading-relaxed px-2">
              Maaf, saat ini aplikasi sedang dinonaktifkan atau berada di luar
              jadwal akses yang ditentukan oleh Administrator.
            </p>
          </div>

          {error && (
            <div className="w-full bg-[#FFEBF0]/50 border border-[#FFEBF0] text-[#D95276] text-[10px] font-bold py-2.5 px-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5 mt-2">
            <button
              onClick={handleCheckAccess}
              disabled={checking}
              className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#7b55f0] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LuRefreshCw
                className={`text-xs ${checking ? "animate-spin" : ""}`}
              />
              <span>{checking ? "Memeriksa..." : "Periksa Akses"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-white border border-[#F0EDFF] text-[#D95276] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-inner cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#FAF9FF]"
            >
              <LuLogOut className="text-xs" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div>
          <p className="text-[10px] text-[#9C98A6] font-semibold tracking-wide uppercase">
            Sistem Informasi Zat Interaktif (SiZat-ESD)
          </p>
        </div>
      </div>
    </div>
  );
}
