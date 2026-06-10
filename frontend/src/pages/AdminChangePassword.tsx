import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getSiswaUsersApi, changeSiswaPasswordApi } from "../api/api";

interface SiswaUser {
  id: number;
  email: string;
  kelas: string;
  nama: string;
}

export default function AdminChangePassword() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [siswaList, setSiswaList] = useState<SiswaUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Authentication & Admin Check
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin = user.status.toLowerCase() === "admin" || user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  // Load Siswa List
  useEffect(() => {
    const fetchSiswa = async () => {
      if (!token) return;
      setFetching(true);
      try {
        const data = await getSiswaUsersApi(token);
        if (data && data.users) {
          setSiswaList(data.users);
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Gagal mengambil daftar siswa" });
      } finally {
        setFetching(false);
      }
    };

    fetchSiswa();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedUserId) {
      setMessage({ type: "error", text: "Silakan pilih siswa terlebih dahulu." });
      return;
    }

    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "Password baru tidak boleh kosong." });
      return;
    }

    if (newPassword.trim().length < 4) {
      setMessage({ type: "error", text: "Password minimal 4 karakter." });
      return;
    }

    setLoading(true);
    try {
      await changeSiswaPasswordApi(token!, Number(selectedUserId), newPassword.trim());
      setMessage({ type: "success", text: "Password berhasil diubah!" });
      setNewPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal mengubah password." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Panel Administrator</p>
          <h1 className="text-xl font-bold uppercase tracking-wide">Ubah Password Siswa</h1>
          <div className="h-[2px] bg-black w-12 mt-2"></div>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col justify-center my-6">
          
          {fetching ? (
            <div className="w-full flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-xs uppercase font-bold tracking-wider text-neutral-500">
                Memuat data siswa...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              
              {/* Message Box */}
              {message && (
                <div className={`p-3 border text-xs font-bold uppercase tracking-wide transition-none ${
                  message.type === "success" ? "border-black bg-black text-white" : "border-black bg-white text-black"
                }`}>
                  {message.type === "error" && "Error: "}{message.text}
                </div>
              )}

              {/* Selector Siswa */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Pilih Siswa
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value ? Number(e.target.value) : "");
                    setMessage(null);
                  }}
                  className="w-full p-3 border border-black bg-white text-black font-mono text-xs focus:outline-none transition-none rounded-none cursor-pointer"
                >
                  <option value="">-- Pilih Akun Siswa --</option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.nama || "Tanpa Nama"} ({siswa.kelas}) - {siswa.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password Baru Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Password Baru
                </label>
                <input
                  type="text"
                  placeholder="Ketik password baru..."
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setMessage(null);
                  }}
                  className="w-full p-3 border border-black bg-white text-black font-mono text-xs focus:outline-none transition-none rounded-none"
                  autoComplete="off"
                />
                <p className="text-[9px] text-neutral-500 uppercase tracking-tight">
                  * Admin tidak dapat melihat password saat ini. Password akan langsung ditimpa.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs active:bg-white active:text-black transition-none cursor-pointer disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>

            </form>
          )}

        </div>

        {/* Footer Section with Back Button */}
        <div className="w-full mt-auto mb-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full py-3 border border-black bg-white text-black font-bold uppercase tracking-wider text-xs active:bg-black active:text-white transition-none cursor-pointer"
          >
            Kembali ke Menu Admin
          </button>
        </div>

      </div>
    </div>
  );
}
