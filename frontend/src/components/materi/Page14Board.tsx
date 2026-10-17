import { FiCheck as CheckIcon, FiX as XIcon } from "react-icons/fi";
import { PAGE14_PUZZLE_ITEMS, PAGE14_PUZZLE_SLOTS } from "./constants";

interface Page14BoardProps {
  assignments: Record<string, string | null>;
  isSubmitted: boolean;
  selectedLeftId: string | null;
  onSlotClick: (slotId: string) => void;
}

export default function Page14Board({
  assignments,
  isSubmitted,
  selectedLeftId,
  onSlotClick,
}: Page14BoardProps) {
  return (
    <div
      className="absolute flex flex-col justify-between z-10"
      style={{
        top: "17%",
        left: "13%",
        width: "74%",
        height: "44%",
      }}
    >
      {PAGE14_PUZZLE_SLOTS.map((slot) => {
        const assignedItemId = assignments[slot.id];
        const assignedItem = PAGE14_PUZZLE_ITEMS.find(
          (it) => it.id === assignedItemId,
        );
        const isCorrectSlot =
          isSubmitted && assignedItemId === slot.correctItemId;
        const isWrongSlot =
          isSubmitted &&
          assignedItemId !== null &&
          assignedItemId !== slot.correctItemId;

        return (
          <div
            key={slot.id}
            className="flex items-center justify-between w-full h-[22%]"
          >
            {/* Left Puzzle Card (Drop Slot / Event Image) */}
            <div
              onClick={() => onSlotClick(slot.id)}
              className={`w-[47%] h-full rounded-xl sm:rounded-2xl relative flex items-center justify-center p-1 sm:p-1.5 transition-all ${
                isSubmitted
                  ? isCorrectSlot
                    ? "bg-[#FEF0F0] border-2 border-[#137333] shadow-xs"
                    : isWrongSlot
                    ? "bg-[#FEF0F0] border-2 border-[#C5221F] shadow-xs"
                    : "bg-[#FEF0F0] border-2 border-[#FA8E97]"
                  : assignedItem
                  ? "bg-[#FEF0F0] border-2 border-[#FA8E97] shadow-xs cursor-pointer hover:scale-[1.02] active:scale-98"
                  : selectedLeftId
                  ? "bg-[#FFF5F6] border-2 border-dashed border-[#8C66FF] ring-2 ring-[#8C66FF]/30 cursor-pointer animate-pulse"
                  : "bg-[#FFF5F6] border-2 border-dashed border-[#FA8E97]/70 cursor-pointer hover:border-[#FA8E97] hover:bg-[#FEF0F0]/50"
              }`}
            >
              {assignedItem ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  <img
                    src={assignedItem.image}
                    alt={assignedItem.label}
                    className="w-full max-h-full object-contain pointer-events-none"
                  />
                  <div
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full border-2 border-l-0 absolute -right-1.5 sm:-right-2 md:-right-2.5 top-1/2 -translate-y-1/2 z-20 transition-all ${
                      isSubmitted
                        ? isCorrectSlot
                          ? "bg-[#FEF0F0] border-[#137333]"
                          : isWrongSlot
                          ? "bg-[#FEF0F0] border-[#C5221F]"
                          : "bg-[#FEF0F0] border-[#FA8E97]"
                        : "bg-[#FEF0F0] border-[#FA8E97]"
                    }`}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center text-center">
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-[#FA8E97] font-bold leading-tight">
                    {selectedLeftId ? "Pasang di sini" : "+ Pasang"}
                  </span>
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full border-2 border-l-0 border-dashed border-[#FA8E97]/60 bg-[#FFF5F6] absolute -right-1.5 sm:-right-2 md:-right-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Right Puzzle Card (Title: Mencair / Menyublim / etc.) */}
            <div
              className={`w-[47%] h-full rounded-xl sm:rounded-2xl relative flex items-center justify-center p-1 sm:p-2 text-center transition-all bg-[#FEF0F0] border-2 ${
                isSubmitted
                  ? isCorrectSlot
                    ? "border-[#137333] text-[#137333]"
                    : isWrongSlot
                    ? "border-[#C5221F] text-[#C5221F]"
                    : "border-[#FA8E97] text-[#1F2227]"
                  : "border-[#FA8E97] text-[#1F2227]"
              }`}
            >
              <div
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full bg-white border-2 border-l-transparent border-t-2 border-r-2 border-b-2 absolute -left-1.5 sm:-left-2 md:-left-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all ${
                  isSubmitted
                    ? isCorrectSlot
                      ? "border-t-[#137333] border-r-[#137333] border-b-[#137333]"
                      : isWrongSlot
                      ? "border-t-[#C5221F] border-r-[#C5221F] border-b-[#C5221F]"
                      : "border-t-[#FA8E97] border-r-[#FA8E97] border-b-[#FA8E97]"
                    : "border-t-[#FA8E97] border-r-[#FA8E97] border-b-[#FA8E97]"
                }`}
              />

              <span className="font-bold text-[11px] sm:text-xs md:text-sm text-[#1F2227] tracking-tight z-10 select-none">
                {slot.title}
              </span>

              {isSubmitted && (
                <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20">
                  {isCorrectSlot ? (
                    <CheckIcon size={15} className="text-[#137333]" />
                  ) : isWrongSlot ? (
                    <XIcon size={15} className="text-[#C5221F]" />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
