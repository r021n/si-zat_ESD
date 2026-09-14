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

  const [searchQuery, setSearchQuery] = useState("");

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
    if (filterStatus === "enrolled" && !s.isEnrolled) return false;
    if (filterStatus === "not-enrolled" && s.isEnrolled) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nama = (s.nama || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      const kelas = (s.kelas || "").toLowerCase();
      return nama.includes(q) || email.includes(q) || kelas.includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] md:text-xs text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
            Memuat Data Enrollment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#E6F8F6] rounded-full filter blur-3xl opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-6 z-10 transition-all duration-300">
        <div>
          {/* Header */}
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
                  Enrollment
                </h1>
              </div>
            </div>

            {/* Desktop Metrics Pills */}
            <div className="hidden md:flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 bg-white border border-[#F0EDFF] text-xs font-bold text-[#2C2B30] rounded-full shadow-xs">
                Total: <strong className="text-[#8C66FF]">{enrollList.length}</strong> Siswa
              </span>
              <span className="px-3.5 py-1.5 bg-[#E6F8F6] text-[#2C8578] text-xs font-bold rounded-full">
                Enrolled: {enrolledCount}
              </span>
              <span className="px-3.5 py-1.5 bg-[#FFEBF0] text-[#D95276] text-xs font-bold rounded-full">
                Belum: {enrollList.length - enrolledCount}
              </span>
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

          {/* 2-Column Responsive Dashboard Layout */}
          <div className="flex flex-col gap-5 md:grid md:grid-cols-12 md:gap-6 md:items-start overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-none md:overflow-visible pr-0.5 no-scrollbar">
            {/* LEFT COLUMN: CODE & GENERATOR */}
            <div className="flex flex-col gap-5 md:col-span-5 lg:col-span-4">
              {/* CARD 1: Current Code */}
              <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-[#E6F8F6] text-[#2C8578] rounded-xl flex items-center justify-center shadow-inner">
                    <LuKeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
                      Kode Aktif
                    </h3>
                    <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
                      Kode yang digunakan siswa untuk enroll
                    </p>
                  </div>
                </div>

                {currentCode ? (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center gap-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-4">
                      <span className="text-xl md:text-2xl font-black text-[#8C66FF] tracking-[0.3em] flex-1 text-center font-mono">
                        {currentCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="w-10 h-10 bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#8C66FF] hover:text-white transition-colors shadow-xs"
                        title="Salin Kode"
                      >
                        <LuCopy size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] md:text-xs">
                      <LuClock size={14} className="text-[#9C98A6] shrink-0" />
                      <span
                        className={`font-bold ${
                          isExpired ? "text-[#D95276]" : "text-[#9C98A6]"
                        }`}
                      >
                        {isExpired ? "Kedaluwarsa" : "Berlaku hingga:"}{" "}
                        {formatDeadline(currentDeadline)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] md:text-xs font-bold text-[#9C98A6]">
                        <span className="flex items-center gap-1.5">
                          <LuCircleCheck size={14} className="text-[#2C8578]" />
                          Progres Siswa
                        </span>
                        <span>
                          {enrolledCount} / {enrollList.length} ({enrollList.length > 0 ? Math.round((enrolledCount / enrollList.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2C8578] rounded-full transition-all"
                          style={{
                            width: `${
                              enrollList.length > 0
                                ? (enrolledCount / enrollList.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFF9E6]/50 border border-[#FFF9E6] text-[#FFC107] text-xs font-bold py-4 px-4 rounded-xl text-center">
                    Belum ada kode enroll yang dibuat.
                  </div>
                )}
              </div>

              {/* CARD 2: Generate New Code */}
              <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-[#F0ECFF] text-[#8C66FF] rounded-xl flex items-center justify-center shadow-inner">
                    <LuRefreshCw size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
                      Generate Kode Baru
                    </h3>
                    <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
                      Kode lama akan ditimpa dan enrollment di-reset
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
                      Batas Waktu (Deadline)
                    </label>
                    <input
                      type="datetime-local"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl px-3.5 py-3 text-xs font-bold outline-none focus:border-[#8C66FF] text-[#2C2B30] shadow-xs"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={generating || !newDeadline}
                    className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <LuRefreshCw
                      className={`text-sm ${generating ? "animate-spin" : ""}`}
                    />
                    <span>
                      {generating ? "Membuat..." : "Generate Kode Baru"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: STUDENT LIST */}
            <div className="flex flex-col gap-5 md:col-span-7 lg:col-span-8">
              <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-[#FFEBF0] text-[#D95276] rounded-xl flex items-center justify-center shadow-inner">
                      <LuKeyRound size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
                        Status Siswa ({filteredList.length})
                      </h3>
                      <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
                        Kelola dan pantau status enrollment siswa
                      </p>
                    </div>
                  </div>

                  {/* Search box */}
                  <div className="w-full sm:w-56">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari siswa/kelas..."
                      className="w-full px-3.5 py-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl text-xs font-bold text-[#2C2B30] placeholder:text-[#9C98A6] focus:outline-none focus:border-[#8C66FF]"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  {(["all", "enrolled", "not-enrolled"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`flex-1 py-2 text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                          filterStatus === status
                            ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                            : "bg-[#FAF9FF] border border-[#F0EDFF] text-[#9C98A6] hover:border-[#8C66FF]/40"
                        }`}
                      >
                        {status === "all"
                          ? `Semua (${enrollList.length})`
                          : status === "enrolled"
                          ? `Enrolled (${enrolledCount})`
                          : `Belum (${enrollList.length - enrolledCount})`}
                      </button>
                    ),
                  )}
                </div>

                {/* Student Items (Responsive grid on desktop) */}
                <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredList.length === 0 ? (
                    <p className="text-xs text-[#9C98A6] font-semibold text-center py-12 md:col-span-2 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl">
                      {searchQuery ? "Tidak ada siswa yang cocok dengan kata kunci." : "Tidak ada data siswa."}
                    </p>
                  ) : (
                    filteredList.map((siswa) => (
                      <div
                        key={siswa.id}
                        className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-3.5 flex justify-between items-center gap-2 hover:border-[#8C66FF]/30 transition-colors"
                      >
                        <div className="flex flex-col gap-1 truncate min-w-0">
                          <span className="text-xs font-extrabold text-[#2C2B30] truncate">
                            {siswa.nama || siswa.email.split("@")[0]}
                          </span>
                          <span className="text-[10px] text-[#9C98A6] font-bold truncate">
                            {siswa.email} - Kelas {siswa.kelas || "-"}
                          </span>
                          {siswa.isEnrolled && siswa.enrolledAt && (
                            <span className="text-[9px] text-[#2C8578] font-bold">
                              Enrolled:{" "}
                              {new Date(siswa.enrolledAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                              siswa.isEnrolled
                                ? "bg-[#E6F8F6] text-[#2C8578]"
                                : "bg-[#FFEBF0] text-[#D95276]"
                            }`}
                          >
                            {siswa.isEnrolled ? (
                              <span className="flex items-center gap-1">
                                <LuCircleCheck size={10} /> Enrolled
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <LuCircleX size={10} /> Belum
                              </span>
                            )}
                          </span>

                          {siswa.isEnrolled && (
                            <button
                              onClick={() =>
                                handleRevoke(siswa.id, siswa.nama || siswa.email)
                              }
                              disabled={revokingId === siswa.id}
                              className="w-8 h-8 bg-white text-[#D95276] border border-[#FFEBF0] rounded-xl flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FFEBF0] transition-colors disabled:opacity-50"
                              title="Cabut Enrollment"
                            >
                              {revokingId === siswa.id ? (
                                <div className="w-3 h-3 border-2 border-[#D95276] border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <LuTrash2 size={13} />
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
    </div>
  );
}
