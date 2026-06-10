import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProfileReport() {
  const navigate = useNavigate();
  const { user, updateProfile, loading, checkAuth } = useAuthStore();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kelas, setKelas] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setNama(user.nama || "");
    setEmail(user.email || "");
    setKelas(user.kelas || "");
    setStatus(user.status || "");
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile(kelas, nama);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal memperbarui profil." });
    }
  };

  if (!user) return null;

  const formatCreatedAt = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatUsageTime = (seconds?: number) => {
    if (!seconds) return "0 detik";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0) parts.push(`${m} menit`);
    if (s > 0 || parts.length === 0) parts.push(`${s} detik`);
    
    return parts.join(" ");
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Pengaturan Pengguna</p>
          <h1 className="text-xl font-bold leading-tight uppercase tracking-wide">PROFIL & REPORT</h1>
          <p className="text-xs text-neutral-600">Lihat dan edit informasi profil Anda di bawah ini.</p>
        </div>

        {/* Status Message (Monochrome Banner) */}
        {message && (
          <div className={`w-full p-3 border border-black text-xs font-mono uppercase tracking-wide font-bold mb-4 ${
            message.type === "success" ? "bg-black text-white" : "bg-white text-black"
          }`}>
            {message.type === "success" ? "[SUKSES]: " : "[ERROR]: "} {message.text}
          </div>
        )}

        {/* Form Fields Stack */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 my-auto">
          
          {/* ID (Read-only) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              ID Pengguna (Read-only)
            </label>
            <input
              type="text"
              value={user.id}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>

          {/* Tanggal Terdaftar (Read-only) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Terdaftar Sejak (Read-only)
            </label>
            <input
              type="text"
              value={formatCreatedAt(user.createdAt)}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>

          {/* Nama Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-3 py-2 border border-black text-black bg-white focus:outline-none focus:bg-black focus:text-white text-sm"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Email (Read-only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>

          {/* Kelas Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black">
              Kelas
            </label>
            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              required
              className="w-full px-3 py-2 border border-black text-black bg-white focus:outline-none focus:bg-black focus:text-white text-sm"
            />
          </div>

          {/* Status / Peran (Read-only) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Status / Peran (Read-only)
            </label>
            <input
              type="text"
              value={status}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        {/* Separator */}
        <div className="border-t border-black my-6"></div>

        {/* Usage Information Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Statistik Sesi</p>
            <h2 className="text-base font-bold leading-tight uppercase tracking-wide">PENGGUNAAN APLIKASI</h2>
          </div>

          {/* Frekuensi Dibuka */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Frekuensi Dibuka (Read-only)
            </label>
            <input
              type="text"
              value={`${user.openCount ?? 0} Kali`}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>

          {/* Durasi Penggunaan */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Total Durasi Penggunaan (Read-only)
            </label>
            <input
              type="text"
              value={formatUsageTime(user.totalUsageTime)}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 text-neutral-400 bg-neutral-100 text-sm font-mono cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Footer Back Button */}
        <div className="w-full mt-6 mb-2">
          <button
            onClick={() => navigate("/menu")}
            className="w-full py-3 border border-black bg-white text-black font-bold uppercase tracking-wider text-xs active:bg-black active:text-white cursor-pointer"
          >
            Kembali ke Menu
          </button>
        </div>

      </div>
    </div>
  );
}
