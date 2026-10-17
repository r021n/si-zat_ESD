interface StatsDetailModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function StatsDetailModal({
  isOpen,
  title,
  message,
  onClose,
}: StatsDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
      <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
        <div>
          <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
            {title}
          </h3>
          <p className="text-xs text-[#9C98A6] font-semibold mt-3 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-2.5 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
