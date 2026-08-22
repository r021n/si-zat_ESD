import { useState } from "react";
import {
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiSend as SendIcon,
  FiRotateCcw as RotateCcwIcon,
} from "react-icons/fi";
import type { Page7InteractiveProps } from "./types";
import { PUZZLE_ITEMS, PUZZLE_SLOTS } from "./constants";

export default function Page7Interactive({
  assignments,
  setAssignments,
  isSubmitted,
  onSubmit,
  onReset,
}: Page7InteractiveProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  const assignedItemIds = Object.values(assignments).filter(
    Boolean,
  ) as string[];
  const unassignedItems = PUZZLE_ITEMS.filter(
    (item) => !assignedItemIds.includes(item.id),
  );

  const handleAssign = (slotId: string, itemId: string) => {
    if (isSubmitted) return;

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === itemId) next[key] = null;
      });
      next[slotId] = itemId;
      return next;
    });

    setSelectedLeftId(null);
  };

  const handleSlotClick = (slotId: string) => {
    if (isSubmitted) return;
    if (selectedLeftId) {
      handleAssign(slotId, selectedLeftId);
    } else if (assignments[slotId]) {
      const currentItem = assignments[slotId];
      setAssignments((prev) => ({ ...prev, [slotId]: null }));
      setSelectedLeftId(currentItem);
    }
  };

  const allAssigned = Object.values(assignments).every((v) => v !== null);

  const isAllCorrect =
    isSubmitted &&
    PUZZLE_SLOTS.every((slot) => assignments[slot.id] === slot.correctItemId);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden select-none">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/7_polos.png"
          alt="Halaman 7"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* --- MAIN PUZZLE BOARD (Inside the blue frame of 7_polos.png) --- */}
        <div
          className="absolute flex flex-col justify-between z-10"
          style={{
            top: "19.5%",
            left: "13%",
            width: "74%",
            height: "36.5%",
          }}
        >
          {PUZZLE_SLOTS.map((slot) => {
            const assignedItemId = assignments[slot.id];
            const assignedItem = PUZZLE_ITEMS.find(
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
                className="flex items-center justify-between w-full h-[28%]"
              >
                {/* --- Left Puzzle Card (Drop Slot / Particle Image) --- */}
                <div
                  onClick={() => handleSlotClick(slot.id)}
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
                      {/* Jigsaw Tab (protruding semi-circle on right edge) */}
                      <div
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 border-l-0 absolute -right-2 sm:-right-2.5 md:-right-3 top-1/2 -translate-y-1/2 z-20 transition-all ${
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
                      <span className="text-[8.5px] sm:text-[9.5px] md:text-[10.5px] text-[#FA8E97] font-bold leading-tight">
                        {selectedLeftId ? "Pasang di sini" : "+ Pasang"}
                      </span>
                      {/* Subtle tab outline on empty slot */}
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 border-l-0 border-dashed border-[#FA8E97]/60 bg-[#FFF5F6] absolute -right-2 sm:-right-2.5 md:-right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* --- Right Puzzle Card (Title: Zat Padat / Cair / Gas) --- */}
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
                  {/* Jigsaw Socket (indented semi-circle on left edge) */}
                  <div
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white border-2 border-l-transparent border-t-2 border-r-2 border-b-2 absolute -left-2 sm:-left-2.5 md:-left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all ${
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

                  {/* Status Indicator Icon */}
                  {isSubmitted && (
                    <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20">
                      {isCorrectSlot ? (
                        <CheckIcon size={16} className="text-[#137333]" />
                      ) : isWrongSlot ? (
                        <XIcon size={16} className="text-[#C5221F]" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- BOTTOM INTERACTIVE CONTROLS & PIECE SELECTION DOCK --- */}
        <div
          className="absolute flex flex-col justify-between z-10"
          style={{
            top: "61.5%",
            left: "8%",
            width: "84%",
            height: "28%",
          }}
        >
          {/* Piece Selector Dock */}
          <div className="bg-white/95 backdrop-blur-xs border border-purple-100 rounded-2xl p-2 sm:p-2.5 shadow-sm">
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <p className="text-[10px] sm:text-[11px] font-bold text-[#8C66FF]">
                Pilihan Partikel:
              </p>
              <p className="text-[8px] sm:text-[9px] text-[#9C98A6] italic">
                {isSubmitted
                  ? "Lihat hasil penilaian di atas"
                  : unassignedItems.length > 0
                  ? "Ketuk partikel lalu pasangkan"
                  : "Semua partikel terpasang ✓"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center">
              {PUZZLE_ITEMS.map((item) => {
                const isAssigned = assignedItemIds.includes(item.id);
                const isSelected = selectedLeftId === item.id;

                if (isAssigned) {
                  return (
                    <div
                      key={item.id}
                      className="h-10 sm:h-11 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center opacity-60"
                    >
                      <span className="text-[8px] sm:text-[9px] text-purple-500 font-semibold">
                        Terpasang ✓
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSubmitted) return;
                      setSelectedLeftId(isSelected ? null : item.id);
                    }}
                    className={`relative bg-[#FEF0F0] border-2 rounded-xl p-1 h-10 sm:h-11 flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#8C66FF] ring-2 ring-[#8C66FF]/40 scale-105 shadow-md"
                        : "border-[#FA8E97] hover:border-[#FF6B81] hover:scale-102 shadow-xs"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full max-h-full object-contain pointer-events-none"
                    />
                    {/* Tab protrusion */}
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEF0F0] border-2 border-l-0 border-[#FA8E97] absolute -right-1.5 top-1/2 -translate-y-1/2 z-20" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission & Reset Controls */}
          {!isSubmitted ? (
            <div>
              <button
                type="button"
                disabled={!allAssigned}
                onClick={onSubmit}
                className={`w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  allAssigned
                    ? "bg-linear-to-r from-[#8C66FF] to-[#6039DF] text-white cursor-pointer hover:brightness-110 active:scale-98 shadow-purple-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <SendIcon size={14} /> Kirim Jawaban
              </button>
            </div>
          ) : (
            <div
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 shadow-xs animate-fade-in flex items-center justify-between gap-2 ${
                isAllCorrect
                  ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                  : "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
              }`}
            >
              <div className="flex items-center gap-1.5 pl-1">
                {isAllCorrect ? (
                  <CheckIcon size={16} className="text-[#137333] shrink-0" />
                ) : (
                  <XIcon size={16} className="text-[#C5221F] shrink-0" />
                )}
                <span className="font-bold text-[10px] sm:text-xs leading-tight">
                  {isAllCorrect
                    ? "Benar semua! 🎉"
                    : "Ada yang belum tepat, coba lagi!"}
                </span>
              </div>

              <button
                type="button"
                onClick={onReset}
                className={`px-3 py-1.5 font-extrabold text-[10.5px] rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0 ${
                  isAllCorrect
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-[#C5221F] text-white hover:bg-red-700"
                }`}
              >
                <RotateCcwIcon size={11} /> Ulangi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
