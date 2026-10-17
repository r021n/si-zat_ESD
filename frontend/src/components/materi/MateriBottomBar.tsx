import {
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
} from "react-icons/fi";

interface MateriBottomBarProps {
  currentPage: number;
  totalSlides: number;
  isNextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenIndex: () => void;
}

export default function MateriBottomBar({
  currentPage,
  totalSlides,
  isNextDisabled,
  onPrev,
  onNext,
  onOpenIndex,
}: MateriBottomBarProps) {
  return (
    <div className="w-full shrink-0">
      <div className="flex items-center justify-between gap-3">
        <button
          disabled={currentPage === 0}
          onClick={onPrev}
          className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-2xl shadow-sm disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <ChevronLeftIcon size={16} /> Prev
        </button>

        <button
          onClick={onOpenIndex}
          className="px-4 py-3 bg-[#F0ECFF] text-[#8C66FF] font-black text-xs rounded-2xl cursor-pointer hover:bg-purple-100 transition-all border border-[#F0EDFF]"
        >
          {currentPage + 1} / {totalSlides}
        </button>

        <button
          disabled={isNextDisabled}
          onClick={onNext}
          className="flex-1 py-3 bg-linear-to-r from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-2xl shadow-md shadow-purple-200 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          Next <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}
