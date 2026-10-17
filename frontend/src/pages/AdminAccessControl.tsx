import { useState } from "react";
import { useAppBack } from "../hooks/useAppBack";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import {
  LuLock,
  LuLockOpen,
  LuCalendar,
  LuSave,
} from "react-icons/lu";
import { useAccessControl } from "../components/admin/access/useAccessControl";
import ManualLockCard from "../components/admin/access/ManualLockCard";
import ScheduleList from "../components/admin/access/ScheduleList";
import ScheduleAddForm from "../components/admin/access/ScheduleAddForm";

export default function AdminAccessControl() {
  const goBack = useAppBack();
  const {
    loading,
    saving,
    error,
    successMsg,
    isLocked,
    setIsLocked,
    isScheduleEnabled,
    setIsScheduleEnabled,
    schedules,
    handleDeleteSchedule,
    handleAddScheduleItem,
    handleSaveChanges,
  } = useAccessControl();

  const [showAddForm, setShowAddForm] = useState(false);

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
            <ManualLockCard
              isLocked={isLocked}
              onToggle={() => setIsLocked(!isLocked)}
            />

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

                  <div className={showAddForm ? "flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 md:items-start" : "flex flex-col gap-4"}>
                    {showAddForm && (
                      <div className="md:col-span-5">
                        <ScheduleAddForm
                          onAddSchedule={(sched) => {
                            handleAddScheduleItem(sched);
                            setShowAddForm(false);
                          }}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </div>
                    )}

                    <div className={showAddForm ? "flex flex-col gap-3 md:col-span-7" : "flex flex-col gap-3"}>
                      <ScheduleList
                        schedules={schedules}
                        onDeleteSchedule={handleDeleteSchedule}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
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
