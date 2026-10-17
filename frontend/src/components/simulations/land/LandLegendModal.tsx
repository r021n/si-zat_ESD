import { FaCircleInfo, FaXmark } from "react-icons/fa6";

interface LandLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LandLegendModal({
  isOpen,
  onClose,
}: LandLegendModalProps) {
  return (
    <div
      className={`absolute top-10 right-2 z-30 w-auto min-w-[210px] max-w-[calc(100%-16px)] sm:max-w-[260px] bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-xl p-2.5 transition-all duration-300 origin-top-right ${
        isOpen
          ? "scale-100 opacity-100 pointer-events-auto"
          : "scale-90 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <FaCircleInfo className="text-emerald-600 text-[11px]" />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            Keterangan Parameter
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup Keterangan"
        >
          <FaXmark className="text-[10px]" />
        </button>
      </div>

      <div className="space-y-1 text-[9.5px]">
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-emerald-600">pH</span>
          <span className="text-slate-600 font-medium">Keasaman Tanah</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-lime-600">Kesuburan</span>
          <span className="text-slate-600 font-medium">Kadar Unsur Hara</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-amber-600">Akar</span>
          <span className="text-slate-600 font-medium">Kesehatan Perakaran</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-rose-600">Racun</span>
          <span className="text-slate-600 font-medium">Konsentrasi Kontaminan</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-sky-600">Panen</span>
          <span className="text-slate-600 font-medium">Estimasi Hasil Panen</span>
        </div>
      </div>
    </div>
  );
}
