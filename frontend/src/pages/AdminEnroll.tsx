import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import {
  getEnrollConfigApi,
  generateEnrollCodeApi,
  getEnrollListApi,
  revokeEnrollApi,
} from "../api/api";
import { FiArrowLeft } from "react-icons/fi";
import {
  LuKeyRound,
  LuRefreshCw,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCopy,
  LuTrash2,
} from "react-icons/lu";
import { useCustomDialog } from "../components/CustomDialog";

export default function AdminEnroll() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showConfirm } = useCustomDialog();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentCode, setCurrentCode] = useState("");
  const [currentDeadline, setCurrentDeadline] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [enrollList, setEnrollList] = useState<
    {
      id: number;
      email: string;
      nama: string;
      kelas: string;
      isEnrolled: boolean;
      enrolledAt: string | null;
    }[]
  >([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "enrolled" | "not-enrolled"
  >("all");
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) return;
      const [configRes, listRes] = await Promise.all([
        getEnrollConfigApi(token),
        getEnrollListApi(token),
      ]);
      if (configRes.status === "success" && configRes.config) {
        setCurrentCode(configRes.config.code);
        setCurrentDeadline(configRes.config.deadline);
      }
      if (listRes.status === "success") {
        setEnrollList(listRes.list || []);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data enroll");
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleGenerate = async () => {
    if (!newDeadline) {
      setError("Deadline harus diisi.");
      return;
    }

    const confirm = await showConfirm(
      "Semua enrollment siswa akan di-reset saat kode baru dibuat. Lanjutkan?",
    );
    if (!confirm) return;

    setGenerating(true);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await generateEnrollCodeApi(token, newDeadline);
      if (res.status === "success") {
        setCurrentCode(res.code);
        setCurrentDeadline(res.deadline);
        setNewDeadline("");
        setSuccessMsg("Kode enroll baru berhasil dibuat.");
        // Refresh list
        const listRes = await getEnrollListApi(token);
        if (listRes.status === "success") {
          setEnrollList(listRes.list || []);
        }
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat kode enroll baru");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (userId: number, name: string) => {
    const confirm = await showConfirm(
      `Enrollment untuk ${name} akan dicabut. Lanjutkan?`,
    );
    if (!confirm) return;

    setRevokingId(userId);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await revokeEnrollApi(token, userId);
      if (res.status === "success") {
        setEnrollList((prev) =>
          prev.map((s) =>
            s.id === userId ? { ...s, isEnrolled: false, enrolledAt: null } : s,
          ),
        );
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mencabut enrollment");
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setSuccessMsg("Kode berhasil disalin!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

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

  const isExpired = currentDeadline
    ? new Date() > new Date(currentDeadline)
    : false;

  const enrolledCount = enrollList.filter((s) => s.isEnrolled).length;
  const filteredList = enrollList.filter((s) => {
    if (filterStatus === "enrolled") return s.isEnrolled;
    if (filterStatus === "not-enrolled") return !s.isEnrolled;
    return true;
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
            Memuat Data Enrollment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        <div>
          {/* Header */}
          <div className="w-full flex items-center gap-3 mt-6 mb-6">
            <button
              onClick={() => goBack("/admin")}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
              title="Kembali"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                Panel Administrator
              </p>
              <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                Enrollment
              </h1>
            </div>
          </div>

          {error && (
            <div className="w-full bg-[#FFEBF0] border border-[#FFEBF0] text-[#D95276] text-xs font-semibold p-4 rounded-2xl mb-4">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="w-full bg-[#E6F8F6] border border-[#E6F8F6] text-[#2C8578] text-xs font-bold p-4 rounded-2xl mb-4 animate-fade-in">
              {successMsg}
            </div>
          )}

          <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-200px)] pr-0.5 no-scrollbar">
            {/* CARD 1: Current Code */}
            <div className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E6F8F6] text-[#2C8578] rounded-xl flex items-center justify-center shadow-inner">
                  <LuKeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                    Kode Aktif
                  </h3>
                  <p className="text-[9px] text-[#9C98A6] font-medium mt-0.5">
                    Kode yang digunakan siswa untuk enroll
                  </p>
                </div>
              </div>

              {currentCode ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl p-3">
                    <span className="text-lg font-black text-[#8C66FF] tracking-[0.3em] flex-1 text-center">
                      {currentCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="w-8 h-8 bg-[#F0ECFF] text-[#8C66FF] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#8C66FF] hover:text-white transition-all"
                      title="Salin Kode"
                    >
                      <LuCopy size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <LuClock size={12} className="text-[#9C98A6]" />
                    <span
                      className={`font-bold ${
                        isExpired ? "text-[#D95276]" : "text-[#9C98A6]"
                      }`}
                    >
                      {isExpired ? "Expired" : "Berlaku hingga:"}{" "}
                      {formatDeadline(currentDeadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <LuCircleCheck size={12} className="text-[#2C8578]" />
                    <span className="font-bold text-[#9C98A6]">
                      {enrolledCount} dari {enrollList.length} siswa sudah
                      enroll
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFF9E6]/50 border border-[#FFF9E6] text-[#FFC107] text-[10px] font-bold py-3 px-4 rounded-xl text-center">
                  Belum ada kode enroll yang dibuat.
                </div>
              )}
            </div>

            {/* CARD 2: Generate New Code */}
            <div className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center shadow-inner">
                  <LuRefreshCw size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                    Generate Kode Baru
                  </h3>
                  <p className="text-[9px] text-[#9C98A6] font-medium mt-0.5">
                    Kode lama akan ditimpa dan enrollment di-reset
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9px] font-extrabold uppercase text-[#9C98A6]">
                    Deadline Enroll
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-[#8C66FF] text-[#2C2B30]"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || !newDeadline}
                  className="w-full py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#7b55f0] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <LuRefreshCw
                    className={`text-xs ${generating ? "animate-spin" : ""}`}
                  />
                  <span>
                    {generating ? "Membuat..." : "Generate Kode Baru"}
                  </span>
                </button>
              </div>
            </div>

            {/* CARD 3: Student List */}
            <div className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFEBF0] text-[#D95276] rounded-xl flex items-center justify-center shadow-inner">
                  <LuKeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                    Status Siswa
                  </h3>
                  <p className="text-[9px] text-[#9C98A6] font-medium mt-0.5">
                    Kelola enrollment setiap siswa
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {(["all", "enrolled", "not-enrolled"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 py-2 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                          : "bg-[#FAF9FF] border border-[#F0EDFF] text-[#9C98A6]"
                      }`}
                    >
                      {status === "all"
                        ? "Semua"
                        : status === "enrolled"
                        ? "Enrolled"
                        : "Belum"}
                    </button>
                  ),
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredList.length === 0 ? (
                  <p className="text-[10px] text-[#9C98A6] font-semibold text-center py-6 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl">
                    Tidak ada data siswa.
                  </p>
                ) : (
                  filteredList.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-3 flex justify-between items-center gap-2"
                    >
                      <div className="flex flex-col gap-1 truncate">
                        <span className="text-[10px] font-extrabold text-[#2C2B30] truncate">
                          {siswa.nama || siswa.email.split("@")[0]}
                        </span>
                        <span className="text-[9px] text-[#9C98A6] font-bold truncate">
                          {siswa.email} - Kelas {siswa.kelas || "-"}
                        </span>
                        {siswa.isEnrolled && siswa.enrolledAt && (
                          <span className="text-[8px] text-[#2C8578] font-bold">
                            Enrolled:{" "}
                            {new Date(siswa.enrolledAt).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            siswa.isEnrolled
                              ? "bg-[#E6F8F6] text-[#2C8578]"
                              : "bg-[#FFEBF0] text-[#D95276]"
                          }`}
                        >
                          {siswa.isEnrolled ? (
                            <span className="flex items-center gap-1">
                              <LuCircleCheck size={8} /> Enrolled
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <LuCircleX size={8} /> Belum
                            </span>
                          )}
                        </span>

                        {siswa.isEnrolled && (
                          <button
                            onClick={() =>
                              handleRevoke(siswa.id, siswa.nama || siswa.email)
                            }
                            disabled={revokingId === siswa.id}
                            className="w-7 h-7 bg-white text-[#D95276] border border-[#FFEBF0] rounded-lg flex items-center justify-center shadow-sm cursor-pointer active:bg-[#FFEBF0] disabled:opacity-50"
                            title="Revoke Enrollment"
                          >
                            {revokingId === siswa.id ? (
                              <div className="w-3 h-3 border-2 border-[#D95276] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <LuTrash2 size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
