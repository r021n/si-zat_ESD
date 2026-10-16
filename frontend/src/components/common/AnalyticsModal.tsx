import { LuChartBar } from "react-icons/lu";

interface AnalyticsItem {
  menuKey: string;
  count: number;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error?: string;
  analyticsData: AnalyticsItem[];
  subtitle?: React.ReactNode;
  badgeText?: string;
}

export default function AnalyticsModal({
  isOpen,
  onClose,
  loading,
  error,
  analyticsData,
  subtitle = "Menu yang paling sering Anda kunjungi",
  badgeText,
}: AnalyticsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 md:p-6 backdrop-blur-xs">
      <div className="w-full max-w-85 md:max-w-xl bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide uppercase flex items-center gap-2">
              <LuChartBar className="text-[#8C66FF]" />
              Analitik Aktivitas
            </h3>
            <div className="text-[10px] md:text-xs text-[#9C98A6] font-semibold mt-1">
              {subtitle}
            </div>
          </div>
          {badgeText && (
            <span className="text-[10px] px-3 py-1 bg-[#F0ECFF] text-[#8C66FF] font-extrabold rounded-full">
              {badgeText}
            </span>
          )}
        </div>

        <div className="max-h-60 md:max-h-80 overflow-y-auto pr-1 flex flex-col gap-2.5 my-1 no-scrollbar">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-6 h-6 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-widest animate-pulse">
                Memuat Analitik...
              </p>
            </div>
          ) : error ? (
            <p className="text-xs text-[#FF5E8C] font-semibold text-center py-4">
              {error}
            </p>
          ) : analyticsData.length === 0 ? (
            <p className="text-xs text-[#9C98A6] font-semibold text-center py-6">
              Belum ada aktivitas menu yang tercatat.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {analyticsData.map((item, index) => (
                <div
                  key={item.menuKey}
                  className="w-full bg-[#FAF9FF] border border-[#F0EDFF]/70 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-black text-[#9C98A6] w-4">
                      {index + 1}.
                    </span>
                    <span className="text-xs font-bold text-[#2C2B30] truncate">
                      {item.menuKey}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#8C66FF] bg-[#F0ECFF] px-2.5 py-1 rounded-full shrink-0">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] md:text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
