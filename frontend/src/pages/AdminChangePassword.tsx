import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FiArrowLeft } from "react-icons/fi";
import { LuShieldAlert, LuUserCheck, LuLock } from "react-icons/lu";
import { useAppBack } from "../hooks/useAppBack";
import { getSiswaUsersApi, changeSiswaPasswordApi } from "../api/api";

interface SiswaUser {
  id: number;
  email: string;
  kelas: string;
  nama: string;
}

export default function AdminChangePassword() {
  const navigate = useNavigate();
  const goBack = useAppBack();
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
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      {/* Decorative Blur Bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#F0ECFF] rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>

      {/* Container Responsive Desktop & Mobile */}
      <div className="w-full max-w-107.5 md:max-w-2xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-8 z-10 mx-auto">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between mt-2 md:mt-0 mb-6 pb-4 border-b border-[#F0EDFF]/70">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => goBack("/admin")}
              className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
              title="Kembali"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                Panel Administrator
              </p>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                Ubah Password Siswa
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF9FF] text-[#8C66FF] border border-[#F0EDFF] rounded-full text-xs font-bold">
            <LuUserCheck size={14} />
            <span>{siswaList.length} Siswa Terdaftar</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col justify-center my-4 md:my-auto">
          {fetching ? (
            <div className="w-full flex flex-col items-center gap-3 py-16 text-center justify-center">
              <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-[#9C98A6] animate-pulse">
                Memuat data siswa...
              </p>
            </div>
          ) : (
            <div className="w-full">
              <form
                onSubmit={handleSubmit}
                className="w-full bg-white rounded-[28px] p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] md:shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-5"
              >
                {/* Message Box */}
                {message && (
                  <div
                    className={`p-4 border text-xs font-bold rounded-[20px] transition-colors flex items-center gap-2.5 ${
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
                        className="w-5 h-5 shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <LuShieldAlert className="w-5 h-5 shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Selector Siswa */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#9C98A6] flex items-center gap-1.5">
                    <LuUserCheck size={14} className="text-[#8C66FF]" />
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
                    className="w-full p-4 border border-[#F0EDFF] bg-white text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-colors rounded-2xl shadow-xs cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Pilih Siswa / Akun --
                    </option>
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama ? `${s.nama} (${s.email})` : s.email} - Kelas{" "}
                        {s.kelas || "-"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password Baru Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#9C98A6] flex items-center gap-1.5">
                    <LuLock size={14} className="text-[#8C66FF]" />
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
                    className="w-full p-4 border border-[#F0EDFF] bg-white text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-colors rounded-2xl shadow-xs"
                    autoComplete="off"
                  />
                  <p className="text-[9px] md:text-[10px] text-[#9C98A6] font-bold uppercase tracking-wide mt-0.5">
                    * Password akan langsung ditimpa. Admin tidak dapat melihat
                    password sebelumnya.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-4 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan Password Baru"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
