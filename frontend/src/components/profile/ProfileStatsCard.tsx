import { LuEye, LuClock, LuChartBar } from "react-icons/lu";
import { formatDateIndo } from "../../utils/date";

interface ProfileStatsCardProps {
  userId: number;
  createdAt?: string;
  openCount?: number;
  totalUsageTime?: number;
  onOpenAnalytics: () => void;
}

export default function ProfileStatsCard({
  userId,
  createdAt,
  openCount = 0,
  totalUsageTime,
  onOpenAnalytics,
}: ProfileStatsCardProps) {
  const formatCreatedAt = (dateStr?: string) => formatDateIndo(dateStr, true);

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
    <div className="w-full bg-white rounded-[28px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Informasi Sistem & Statistik
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* ID Pengguna */}
        <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
              ID Pengguna
            </h4>
            <p className="text-[11px] font-mono text-[#2C2B30] mt-0.5 select-all">
              {userId}
            </p>
          </div>
          <span className="text-[9px] font-bold px-2.5 py-1 bg-[#F5F5F7] text-[#555555] rounded-md">
            ReadOnly
          </span>
        </div>

        {/* Terdaftar Sejak */}
        <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
              Terdaftar Sejak
            </h4>
            <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
              {formatCreatedAt(createdAt)}
            </p>
          </div>
        </div>

        {/* Frekuensi Dibuka */}
        <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
              Frekuensi Dibuka
            </h4>
            <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
              {openCount} Kali
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#E6F8F6] text-[#2C8578] flex items-center justify-center">
            <LuEye className="w-4 h-4" />
          </div>
        </div>

        {/* Total Durasi Penggunaan */}
        <div className="flex justify-between items-center py-2 border-b border-[#F0EDFF]/50">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
              Durasi Penggunaan
            </h4>
            <p className="text-xs font-bold text-[#2C2B30] mt-0.5">
              {formatUsageTime(totalUsageTime)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#FFF4EB] text-[#FF9D42] flex items-center justify-center">
            <LuClock className="w-4 h-4" />
          </div>
        </div>

        {/* Analitik Aktivitas */}
        <div
          className="flex justify-between items-center py-2 cursor-pointer"
          onClick={onOpenAnalytics}
        >
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8C66FF]">
              Analitik Aktivitas
            </h4>
            <p className="text-xs font-bold text-[#8C66FF] mt-0.5 underline">
              Lihat menu yang sering dibuka
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#EBF3FF] text-[#4285F4] flex items-center justify-center">
            <LuChartBar className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
