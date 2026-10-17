import { FaCircleInfo, FaXmark } from "react-icons/fa6";

interface WaterLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaterLegendModal({
  isOpen,
  onClose,
}: WaterLegendModalProps) {
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
          <FaCircleInfo className="text-sky-600 text-[11px]" />
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
          <span className="font-bold text-sky-600">DO</span>
          <span className="text-slate-600 font-medium">Oksigen Terlarut</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-emerald-600">pH</span>
          <span className="text-slate-600 font-medium">Derajat Keasaman Air</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-amber-600">BOD</span>
          <span className="text-slate-600 font-medium">Kebutuhan Oksigen Biologis</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-purple-600">COD</span>
          <span className="text-slate-600 font-medium">Kebutuhan Oksigen Kimiawi</span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-50/90 px-2 py-0.5 rounded border border-slate-100/70">
          <span className="font-bold text-rose-600">Polutan</span>
          <span className="text-slate-600 font-medium">Akumulasi Bahan Pencemar</span>
        </div>
      </div>
    </div>
  );
}
