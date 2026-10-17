import {
  FiArrowLeft as ArrowLeftIcon,
  FiGrid as GridIcon,
  FiMaximize2 as Maximize2Icon,
  FiMinimize2 as Minimize2Icon,
} from "react-icons/fi";

interface MateriHeaderProps {
  onBack: () => void;
  onOpenIndex: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function MateriHeader({
  onBack,
  onOpenIndex,
  isFullscreen,
  onToggleFullscreen,
}: MateriHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
          title="Kembali"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#9C98A6] font-bold">
            Pembelajaran
          </p>
          <h1 className="text-base font-extrabold text-[#2C2B30] leading-tight">
            Materi Belajar
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenIndex}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
          title="Daftar Halaman"
        >
          <GridIcon size={18} />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:scale-95 transition-all shrink-0"
          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
        >
          {isFullscreen ? <Minimize2Icon size={18} /> : <Maximize2Icon size={18} />}
        </button>
      </div>
    </div>
  );
}
