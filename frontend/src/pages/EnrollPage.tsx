import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { verifyEnrollCodeApi } from "../api/api";
import { LuKeyRound, LuLogOut, LuCircleCheck } from "react-icons/lu";

export default function EnrollPage() {
  const navigate = useNavigate();
  const { user, logout, isEnrolled, enrollDeadline, setEnrolled } = useAuthStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
    if (isAdmin) {
      navigate("/menu");
      return;
    }
  }, [user, navigate]);

  const isExpired = enrollDeadline ? new Date() > new Date(enrollDeadline) : false;

  const formatDeadline = (deadline: string) => {
    const d = new Date(deadline);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Masukkan kode enroll.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Tidak terautentikasi");

      const res = await verifyEnrollCodeApi(token, code.trim());
      setEnrolled(res.deadline);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal memverifikasi kode enroll");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) return null;

  if (isEnrolled === null) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#FFEBF0] rounded-full filter blur-2xl opacity-65"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
        <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-center items-center px-6 py-12 z-10 text-center">
          <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col items-center gap-6">
            <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#9C98A6] font-medium">Memuat data enrollment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E6F8F6] rounded-full filter blur-2xl opacity-65"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-50 h-50 bg-[#E6F8F6] rounded-full filter blur-2xl opacity-65"></div>

        <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-center items-center px-6 py-12 z-10 text-center">
          <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#E6F8F6] text-[#2C8578] rounded-3xl flex items-center justify-center shadow-inner">
              <LuCircleCheck size={36} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
                Enroll Berhasil!
              </h1>
              <p className="text-xs text-[#9C98A6] font-medium leading-relaxed px-2">
                Anda sekarang bisa mengakses materi, kuis, dan simulasi.
              </p>
            </div>
            <button
              onClick={() => navigate("/menu")}
              className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#FFEBF0] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>

      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-12 z-10 text-center">
        <div></div>

        <div className="bg-white rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-[#F0ECFF] text-[#8C66FF] rounded-3xl flex items-center justify-center shadow-inner">
            <LuKeyRound size={36} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
              Belum Terdaftar
            </h1>
            <p className="text-xs text-[#9C98A6] font-medium leading-relaxed px-2">
              Masukkan kode enroll dari guru Anda untuk mengakses materi, kuis, dan simulasi.
            </p>
          </div>

          {enrollDeadline && (
            <div className={`w-full text-[10px] font-bold py-2.5 px-4 rounded-xl ${
              isExpired
                ? "bg-[#FFEBF0]/50 border border-[#FFEBF0] text-[#D95276]"
                : "bg-[#F0ECFF]/50 border border-[#F0EDFF] text-[#8C66FF]"
            }`}>
              {isExpired
                ? "Kode enroll sudah melewati batas waktu."
                : `Batas waktu: ${formatDeadline(enrollDeadline)}`
              }
            </div>
          )}

          {!enrollDeadline && (
            <div className="w-full bg-[#FFF9E6]/50 border border-[#FFF9E6] text-[#FFC107] text-[10px] font-bold py-2.5 px-4 rounded-xl">
              Belum ada kode enroll yang tersedia. Hubungi administrator.
            </div>
          )}

          {error && (
            <div className="w-full bg-[#FFEBF0]/50 border border-[#FFEBF0] text-[#D95276] text-[10px] font-bold py-2.5 px-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="w-full flex flex-col gap-2.5 mt-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode enroll"
              disabled={loading || isExpired || !enrollDeadline}
              className="w-full py-3.5 px-4 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl text-sm font-bold text-[#2C2B30] placeholder:text-[#9C98A6]/50 focus:outline-none focus:ring-2 focus:ring-[#8C66FF]/30 focus:border-[#8C66FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-[0.3em] uppercase"
              maxLength={8}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && !isExpired && enrollDeadline) {
                  handleSubmit();
                }
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={loading || isExpired || !enrollDeadline || !code.trim()}
              className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#7b55f0] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LuKeyRound className="text-xs" />
              <span>{loading ? "Memverifikasi..." : "Enroll Sekarang"}</span>
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

        <div>
          <p className="text-[10px] text-[#9C98A6] font-semibold tracking-wide uppercase">
            Sistem Informasi Zat Interaktif (SiZat-ESD)
          </p>
        </div>
      </div>
    </div>
  );
}
