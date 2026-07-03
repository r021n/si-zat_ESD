import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FiArrowLeft } from "react-icons/fi";
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Authentication & Admin Check
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
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
        setMessage({
          type: "error",
          text: err.message || "Gagal mengambil daftar siswa",
        });
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
      setMessage({
        type: "error",
        text: "Silakan pilih siswa terlebih dahulu.",
      });
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
      await changeSiswaPasswordApi(
        token!,
        Number(selectedUserId),
        newPassword.trim(),
      );
      setMessage({ type: "success", text: "Password berhasil diubah!" });
      setNewPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Gagal mengubah password.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {/* Header Section */}
        <div className="w-full flex items-center gap-3 mt-6">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none flex-shrink-0"
            title="Kembali"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
              Panel Administrator
            </p>
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
              Ubah Password Siswa
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col justify-center my-6">
          {fetching ? (
            <div className="w-full flex flex-col items-center gap-3 py-12 text-center justify-center">
              <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#9C98A6]">
                Memuat data siswa...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4"
            >
              {/* Message Box */}
              {message && (
                <div
                  className={`p-4 border text-xs font-bold rounded-[20px] transition-none flex items-center gap-2 ${
                    message.type === "success"
                      ? "border-[#E6F8F6] bg-[#E6F8F6] text-[#2C8578]"
                      : "border-[#FFEAEA] bg-[#FFEAEA] text-[#FF5E8C]"
                  }`}
                >
                  {message.type === "success" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Selector Siswa */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                  Pilih Siswa
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setMessage(null);
                  }}
                  className="w-full p-4 border border-[#F0EDFF] bg-white text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl cursor-pointer"
                >
                  <option value="">-- Pilih Akun Siswa --</option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.nama || "Tanpa Nama"} ({siswa.kelas}) -{" "}
                      {siswa.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password Baru Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
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
                  className="w-full p-4 border border-[#F0EDFF] bg-white text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
                  autoComplete="off"
                />
                <p className="text-[9px] text-[#9C98A6] font-bold uppercase tracking-wide mt-1">
                  * Password akan langsung ditimpa. Admin tidak dapat melihat
                  password sebelumnya.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
