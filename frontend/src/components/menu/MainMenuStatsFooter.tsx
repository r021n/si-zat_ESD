import { formatAbbreviatedTime } from "../../utils/time";

interface MainMenuStatsFooterProps {
  openCount?: number;
  totalUsageTime?: number;
  onOpenStatsDetail: (type: "openCount" | "usageTime") => void;
}

export default function MainMenuStatsFooter({
  openCount = 0,
  totalUsageTime,
  onOpenStatsDetail,
}: MainMenuStatsFooterProps) {
  return (
    <div className="w-full mt-6 mb-2 bg-white rounded-3xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex items-center justify-between">
      <div
        className="flex-1 flex flex-col items-center border-r border-[#F0EDFF]/70 cursor-pointer"
        onClick={() => onOpenStatsDetail("openCount")}
      >
        <p className="text-[9px] uppercase tracking-wider text-[#9C98A6] font-bold">
          Kunjungan
        </p>
        <h4 className="text-sm font-extrabold text-[#2C2B30] mt-1 hover:text-[#8C66FF] active:text-[#8C66FF] cursor-pointer transition-none">
          {openCount} Kali
        </h4>
      </div>
      <div
        className="flex-1 flex flex-col items-center cursor-pointer"
        onClick={() => onOpenStatsDetail("usageTime")}
      >
        <p className="text-[9px] uppercase tracking-wider text-[#9C98A6] font-bold">
          Lama Belajar
        </p>
        <h4 className="text-sm font-extrabold text-[#2C2B30] mt-1 hover:text-[#8C66FF] active:text-[#8C66FF] cursor-pointer transition-none">
          {formatAbbreviatedTime(totalUsageTime)}
        </h4>
      </div>
    </div>
  );
}
