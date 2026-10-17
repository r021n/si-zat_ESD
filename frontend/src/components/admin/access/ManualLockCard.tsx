import { LuLock, LuLockOpen, LuShieldAlert } from "react-icons/lu";

interface ManualLockCardProps {
  isLocked: boolean;
  onToggle: () => void;
}

export default function ManualLockCard({
  isLocked,
  onToggle,
}: ManualLockCardProps) {
  return (
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
          onClick={onToggle}
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
  );
}
