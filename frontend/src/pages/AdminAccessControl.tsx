import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import { getAccessSettingsApi, updateAccessSettingsApi } from "../api/api";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  LuLock,
  LuLockOpen,
  LuCalendar,
  LuClock,
  LuSave,
  LuShieldAlert,
} from "react-icons/lu";
import { useCustomDialog } from "../components/CustomDialog";

interface ScheduleItem {
  id: string;
  days: number[]; // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  type: "allow" | "block";
}

const DAYS_OF_WEEK = [
  { value: 1, label: "S", fullName: "Senin" },
  { value: 2, label: "S", fullName: "Selasa" },
  { value: 3, label: "R", fullName: "Rabu" },
  { value: 4, label: "K", fullName: "Kamis" },
  { value: 5, label: "J", fullName: "Jumat" },
  { value: 6, label: "S", fullName: "Sabtu" },
  { value: 0, label: "M", fullName: "Minggu" },
];

export default function AdminAccessControl() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showConfirm } = useCustomDialog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Access Control states
  const [isLocked, setIsLocked] = useState(false);
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Form states for adding new schedule
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [ruleType, setRuleType] = useState<"allow" | "block">("allow");
  const [formError, setFormError] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) return;
      const res = await getAccessSettingsApi(token);
      if (res && res.status === "success") {
        setIsLocked(res.settings.isLocked);
        setIsScheduleEnabled(res.settings.isScheduleEnabled);
        setSchedules(res.settings.schedules || []);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat konfigurasi kontrol akses");
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
    fetchSettings();
  }, [user, navigate, fetchSettings]);

  const handleToggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (selectedDays.length === 0) {
      setFormError("Pilih minimal satu hari.");
      return;
    }

    if (!startTime || !endTime) {
      setFormError("Jam mulai dan selesai harus diisi.");
      return;
    }

    if (startTime >= endTime) {
      setFormError("Jam mulai harus sebelum jam selesai.");
      return;
    }

    const newSchedule: ScheduleItem = {
      id: `sched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      days: [...selectedDays].sort(),
      startTime,
      endTime,
      type: ruleType,
    };

    setSchedules([...schedules, newSchedule]);
    // Reset form states
    setSelectedDays([]);
    setStartTime("08:00");
    setEndTime("14:00");
    setRuleType("allow");
    setShowAddForm(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    const confirmDelete = await showConfirm(
      "Apakah Anda yakin ingin menghapus jadwal ini?",
    );
    if (confirmDelete) {
      setSchedules(schedules.filter((s) => s.id !== id));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await updateAccessSettingsApi(token, {
        isLocked,
        isScheduleEnabled,
        schedules,
      });
      if (res && res.status === "success") {
        setSuccessMsg("Pengaturan berhasil disimpan.");
        // Clear message after 3s
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return "Setiap Hari";
    if (
      days.length === 5 &&
      [1, 2, 3, 4, 5].every((val) => days.includes(val))
    ) {
      return "Senin - Jumat";
    }
    if (days.length === 2 && [0, 6].every((val) => days.includes(val))) {
      return "Sabtu & Minggu";
    }

    return days
      .map((d) => DAYS_OF_WEEK.find((item) => item.value === d)?.fullName)
      .filter(Boolean)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
            Memuat Pengaturan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#FFF9E6] rounded-full filter blur-3xl opacity-40"></div>
      </div>

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
                  Kontrol Akses
                </h1>
              </div>
            </div>

            {/* Status indicators & Desktop Save button */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {isLocked ? (
                  <span className="px-3 py-1.5 bg-[#FFEBF0] text-[#D95276] text-xs font-bold rounded-full flex items-center gap-1.5">
                    <LuLock size={13} /> Terkunci Manual
                  </span>
                ) : isScheduleEnabled ? (
                  <span className="px-3 py-1.5 bg-[#F0ECFF] text-[#8C66FF] text-xs font-bold rounded-full flex items-center gap-1.5">
                    <LuCalendar size={13} /> Jadwal Aktif ({schedules.length} Aturan)
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-[#E6F8F6] text-[#2C8578] text-xs font-bold rounded-full flex items-center gap-1.5">
                    <LuLockOpen size={13} /> Akses Terbuka
                  </span>
                )}
              </div>

              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="hidden md:flex py-2.5 px-5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors items-center gap-2"
              >
                <LuSave size={14} />
                <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
              </button>
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

          {/* Responsive Cards Layout */}
          <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-none md:overflow-visible pr-0.5 no-scrollbar">
            {/* CARD 1: MANUAL LOCK */}
            <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner ${
                      isLocked
                        ? "bg-[#FFEBF0] text-[#D95276]"
                        : "bg-[#E6F8F6] text-[#2C8578]"
                    }`}
                  >
                    {isLocked ? <LuLock size={20} /> : <LuLockOpen size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
                      Kunci Manual (Override)
                    </h3>
                    <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
                      Kunci instan aplikasi untuk semua siswa
                    </p>
                  </div>
                </div>

                {/* Custom iOS-like switch toggle */}
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    isLocked ? "bg-[#D95276]" : "bg-neutral-200"
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-all duration-300 transform ${
                      isLocked ? "translate-x-5.5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {isLocked ? (
                <div className="bg-[#FFEBF0]/60 border border-[#FFEBF0] rounded-2xl p-4 flex gap-3 items-start">
                  <LuShieldAlert
                    className="text-[#D95276] mt-0.5 shrink-0"
                    size={18}
                  />
                  <p className="text-[10px] md:text-xs text-[#D95276] font-bold leading-relaxed">
                    Aplikasi saat ini terkunci manual. Seluruh siswa yang membuka aplikasi akan langsung dialihkan ke halaman blokir.
                  </p>
                </div>
              ) : (
                <div className="bg-[#E6F8F6]/50 border border-[#E6F8F6] rounded-2xl p-3.5 flex gap-2.5 items-center">
                  <LuLockOpen className="text-[#2C8578] shrink-0" size={16} />
                  <p className="text-[10px] md:text-xs text-[#2C8578] font-bold leading-tight">
                    Aplikasi terbuka. Akses berjalan normal mengikuti aturan jadwal.
                  </p>
                </div>
              )}
            </div>

            {/* CARD 2: AUTOMATIC SCHEDULE */}
            <div className="w-full bg-white rounded-[28px] p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner ${
                      isScheduleEnabled
                        ? "bg-[#F0ECFF] text-[#8C66FF]"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <LuCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide">
                      Jadwal Akses Otomatis
                    </h3>
                    <p className="text-[9px] md:text-xs text-[#9C98A6] font-medium mt-0.5">
                      Batasi akses otomatis pada jam & hari tertentu
                    </p>
                  </div>
                </div>

                {/* Custom switch toggle */}
                <button
                  onClick={() => setIsScheduleEnabled(!isScheduleEnabled)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    isScheduleEnabled ? "bg-[#8C66FF]" : "bg-neutral-200"
                  }`}
                >
                  <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-all duration-300 transform ${
                      isScheduleEnabled ? "translate-x-5.5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {isScheduleEnabled && (
                <div className="flex flex-col gap-4 border-t border-[#F0EDFF]/70 pt-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] md:text-xs uppercase tracking-wider text-[#9C98A6] font-bold">
                      Aturan Jadwal Aktif ({schedules.length})
                    </h4>

                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="py-1.5 px-3.5 bg-[#F0ECFF] text-[#8C66FF] font-extrabold uppercase text-[9px] md:text-[10px] tracking-wider rounded-full shadow-inner cursor-pointer hover:bg-[#8C66FF] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <FiPlus size={12} /> Tambah Jadwal
                      </button>
                    )}
                  </div>

                  {/* Form & List Container */}
                  <div className={showAddForm ? "flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 md:items-start" : "flex flex-col gap-4"}>
                    {/* Form to Add Schedule */}
                    {showAddForm && (
                      <div className="md:col-span-5">
                        <form
                          onSubmit={handleAddSchedule}
                          className="bg-[#FAF9FF] border border-[#F0EDFF] rounded-[24px] p-5 flex flex-col gap-4 animate-slide-down"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8C66FF]">
                              Konfigurasi Aturan Baru
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddForm(false);
                                setFormError("");
                              }}
                              className="text-xs font-bold text-[#D95276] cursor-pointer hover:underline"
                            >
                              Batal
                            </button>
                          </div>

                          {formError && (
                            <p className="text-[10px] text-[#D95276] font-bold">
                              {formError}
                            </p>
                          )}

                          {/* Day Selectors */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
                              Hari Efektif
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {DAYS_OF_WEEK.map((day) => {
                                const active = selectedDays.includes(day.value);
                                return (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleToggleDay(day.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                                      active
                                        ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                                        : "bg-white border border-[#F0EDFF] text-[#9C98A6] hover:border-[#8C66FF]/40"
                                    }`}
                                    title={day.fullName}
                                  >
                                    {day.fullName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time Inputs */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
                                Jam Mulai
                              </label>
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-[#8C66FF]"
                              />
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
                                Jam Selesai
                              </label>
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-[#8C66FF]"
                              />
                            </div>
                          </div>

                          {/* Rule Type Option */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#9C98A6]">
                              Tindakan
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setRuleType("allow")}
                                className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                                  ruleType === "allow"
                                    ? "bg-[#E6F8F6] text-[#2C8578] border border-[#2C8578] shadow-xs"
                                    : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
                                }`}
                              >
                                Bisa Diakses
                              </button>
                              <button
                                type="button"
                                onClick={() => setRuleType("block")}
                                className={`py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                                  ruleType === "block"
                                    ? "bg-[#FFEBF0] text-[#D95276] border border-[#D95276] shadow-xs"
                                    : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
                                }`}
                              >
                                Tidak Bisa Diakses
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full mt-2 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md shadow-purple-50 cursor-pointer hover:bg-[#7b55f0] transition-colors"
                          >
                            Tambahkan Jadwal
                          </button>
                        </form>
                      </div>
                    )}

                    {/* List of Schedules */}
                    <div className={showAddForm ? "flex flex-col gap-3 md:col-span-7" : "flex flex-col gap-3"}>
                      {schedules.length === 0 ? (
                        <p className="text-xs text-[#9C98A6] font-semibold text-center py-8 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl leading-relaxed px-4">
                          Belum ada aturan jadwal yang dikonfigurasi. Klik "+ Tambah Jadwal" di atas untuk membuat aturan baru.
                        </p>
                      ) : (
                        schedules.map((item) => (
                          <div
                            key={item.id}
                            className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-4 flex justify-between items-center gap-3 hover:border-[#8C66FF]/40 transition-colors"
                          >
                            <div className="flex flex-col gap-1 truncate">
                              <span className="text-xs md:text-sm font-extrabold text-[#2C2B30] truncate">
                                {formatDays(item.days)}
                              </span>
                              <span className="text-[10px] md:text-xs text-[#9C98A6] font-bold flex items-center gap-1.5">
                                <LuClock size={13} className="text-[#8C66FF]" />
                                {item.startTime} - {item.endTime} WIB
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`text-[9px] md:text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                                  item.type === "allow"
                                    ? "bg-[#E6F8F6] text-[#2C8578]"
                                    : "bg-[#FFEBF0] text-[#D95276]"
                                }`}
                              >
                                {item.type === "allow" ? "Bisa Diakses" : "Terkunci"}
                              </span>

                              <button
                                onClick={() => handleDeleteSchedule(item.id)}
                                className="w-8 h-8 bg-white text-[#D95276] border border-[#FFEBF0] rounded-xl flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FFEBF0] transition-colors"
                                title="Hapus Aturan"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Save Button (also available on desktop bottom) */}
        <div className="w-full pt-4 md:mt-4 md:border-t md:border-[#F0EDFF]/50">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full py-4 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center gap-2"
          >
            <LuSave size={16} />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
