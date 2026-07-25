import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  }, [user, navigate]);

  const fetchSettings = async () => {
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
  };

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
                Kontrol Akses
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
            {/* CARD 1: MANUAL LOCK */}
            <div className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                      isLocked
                        ? "bg-[#FFEBF0] text-[#D95276]"
                        : "bg-[#E6F8F6] text-[#2C8578]"
                    }`}
                  >
                    {isLocked ? <LuLock size={18} /> : <LuLockOpen size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                      Kunci Manual (Override)
                    </h3>
                    <p className="text-[9px] text-[#9C98A6] font-medium mt-0.5">
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

              {isLocked && (
                <div className="bg-[#FFEBF0]/50 border border-[#FFEBF0]/70 rounded-xl p-3 flex gap-2.5 items-start">
                  <LuShieldAlert
                    className="text-[#D95276] mt-0.5 shrink-0"
                    size={16}
                  />
                  <p className="text-[9px] text-[#D95276] font-bold leading-normal">
                    Aplikasi saat ini terkunci. Semua siswa yang masuk atau
                    sedang membuka aplikasi akan langsung diarahkan ke layar
                    blokir.
                  </p>
                </div>
              )}
            </div>

            {/* CARD 2: AUTOMATIC SCHEDULE */}
            <div className="w-full bg-white rounded-[28px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                      isScheduleEnabled
                        ? "bg-[#F0ECFF] text-[#8C66FF]"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <LuCalendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide">
                      Jadwal Akses Otomatis
                    </h3>
                    <p className="text-[9px] text-[#9C98A6] font-medium mt-0.5">
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
                <div className="flex flex-col gap-3.5 border-t border-[#F0EDFF]/70 pt-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] uppercase tracking-wider text-[#9C98A6] font-bold">
                      Aturan Jadwal Aktif ({schedules.length})
                    </h4>

                    {!showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="py-1 px-3 bg-[#F0ECFF] text-[#8C66FF] font-extrabold uppercase text-[8px] tracking-wider rounded-full shadow-inner cursor-pointer hover:bg-[#8C66FF] hover:text-white transition-all flex items-center gap-1"
                      >
                        <FiPlus size={10} /> Tambah
                      </button>
                    )}
                  </div>

                  {/* Form to Add Schedule */}
                  {showAddForm && (
                    <form
                      onSubmit={handleAddSchedule}
                      className="bg-[#FAF9FF] border border-[#F0EDFF] rounded-[20px] p-4 flex flex-col gap-3.5 animate-slide-down"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C66FF]">
                          Aturan Baru
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setFormError("");
                          }}
                          className="text-[10px] font-bold text-[#D95276]"
                        >
                          Batal
                        </button>
                      </div>

                      {formError && (
                        <p className="text-[9px] text-[#D95276] font-bold">
                          {formError}
                        </p>
                      )}

                      {/* Day Selectors */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-[#9C98A6]">
                          Hari Efektif
                        </label>
                        <div className="flex justify-between gap-1 mt-1">
                          {DAYS_OF_WEEK.map((day) => {
                            const active = selectedDays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => handleToggleDay(day.value)}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                  active
                                    ? "bg-[#8C66FF] text-white shadow-md shadow-purple-100"
                                    : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
                                }`}
                                title={day.fullName}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Inputs */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[9px] font-extrabold uppercase text-[#9C98A6]">
                            Jam Mulai
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#8C66FF]"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <label className="text-[9px] font-extrabold uppercase text-[#9C98A6]">
                            Jam Selesai
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-white border border-[#F0EDFF] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#8C66FF]"
                          />
                        </div>
                      </div>

                      {/* Rule Type Option */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-extrabold uppercase text-[#9C98A6]">
                          Tindakan
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setRuleType("allow")}
                            className={`py-2 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                              ruleType === "allow"
                                ? "bg-[#E6F8F6] text-[#2C8578] border border-[#2C8578]"
                                : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
                            }`}
                          >
                            Bisa Diakses
                          </button>
                          <button
                            type="button"
                            onClick={() => setRuleType("block")}
                            className={`py-2 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                              ruleType === "block"
                                ? "bg-[#FFEBF0] text-[#D95276] border border-[#D95276]"
                                : "bg-white border border-[#F0EDFF] text-[#9C98A6]"
                            }`}
                          >
                            Tidak Bisa Diakses
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[9px] rounded-xl shadow-md shadow-purple-50 cursor-pointer"
                      >
                        Tambahkan Jadwal
                      </button>
                    </form>
                  )}

                  {/* List of Schedules */}
                  <div className="flex flex-col gap-2.5">
                    {schedules.length === 0 ? (
                      <p className="text-[10px] text-[#9C98A6] font-semibold text-center py-6 bg-[#FAF9FF] border border-dashed border-[#F0EDFF] rounded-2xl leading-relaxed px-4">
                        Belum ada aturan jadwal yang dikonfigurasi. Klik "+
                        Tambah" di atas untuk membuat jadwal baru.
                      </p>
                    ) : (
                      schedules.map((item) => (
                        <div
                          key={item.id}
                          className="w-full bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-3 flex justify-between items-center gap-2"
                        >
                          <div className="flex flex-col gap-1 truncate">
                            <span className="text-[10px] font-extrabold text-[#2C2B30] truncate">
                              {formatDays(item.days)}
                            </span>
                            <span className="text-[9px] text-[#9C98A6] font-bold flex items-center gap-1.5">
                              <LuClock size={11} className="text-[#8C66FF]" />
                              {item.startTime} - {item.endTime} WIB
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                item.type === "allow"
                                  ? "bg-[#E6F8F6] text-[#2C8578]"
                                  : "bg-[#FFEBF0] text-[#D95276]"
                              }`}
                            >
                              {item.type === "allow" ? "Bisa" : "Kunci"}
                            </span>

                            <button
                              onClick={() => handleDeleteSchedule(item.id)}
                              className="w-7 h-7 bg-white text-[#D95276] border border-[#FFEBF0] rounded-lg flex items-center justify-center shadow-sm cursor-pointer active:bg-[#FFEBF0]"
                              title="Hapus"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="w-full pt-4">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full py-4 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 hover:bg-[#7b55f0]"
          >
            <LuSave className="text-xs" />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
