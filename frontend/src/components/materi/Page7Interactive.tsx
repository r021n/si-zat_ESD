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

  const handleUnassign = (slotId: string) => {
    if (isSubmitted) return;
    setAssignments((prev) => ({ ...prev, [slotId]: null }));
  };

  const handleSlotClick = (slotId: string) => {
    if (isSubmitted) return;
    if (selectedLeftId) {
      handleAssign(slotId, selectedLeftId);
    } else if (assignments[slotId]) {
      handleUnassign(slotId);
    }
  };

  const allAssigned = Object.values(assignments).every((v) => v !== null);

  const isAllCorrect =
    isSubmitted &&
    PUZZLE_SLOTS.every((slot) => assignments[slot.id] === slot.correctItemId);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/7_polos.png"
          alt="Halaman 7"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Minimalist interactive overlay over 7_polos.png */}
        <div
          className="absolute flex flex-col justify-between overflow-y-auto text-left p-3 text-[#2C2B30] z-10 custom-scrollbar space-y-2.5"
          style={{
            top: "13%",
            left: "5%",
            width: "90%",
            height: "80%",
          }}
        >
          {/* Unassigned Pieces Pool */}
          <div className="bg-[#FAF9FF] border border-[#F0EDFF] rounded-2xl p-2 shadow-xs">
            <p className="text-[10px] sm:text-[11px] font-bold text-[#8C66FF] mb-0.5">
              Partikel:
            </p>
            <p className="text-[8px] sm:text-[9px] text-[#9C98A6] mb-1 italic">
              Tap kartu, lalu tap lokasi penempatan
            </p>

            <div className="grid grid-cols-3 gap-2 min-h-12 items-center">
              {unassignedItems.length === 0 ? (
                <div className="col-span-3 text-center py-1.5 text-[9.5px] text-emerald-600 font-semibold italic bg-emerald-50 rounded-xl border border-emerald-100">
                  Terpasang semua ✓
                </div>
              ) : (
                unassignedItems.map((item) => {
                  const isSelected = selectedLeftId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isSubmitted) return;
                        setSelectedLeftId(isSelected ? null : item.id);
                      }}
                      className={`relative bg-[#FFF0F3] border-2 rounded-xl p-1 flex items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#8C66FF] ring-2 ring-[#8C66FF]/40 scale-105 shadow-md"
                          : "border-[#FFB3C1] hover:border-[#FF8FA3] hover:scale-102 shadow-xs"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-7 sm:h-9 object-contain pointer-events-none"
                      />
                      {/* Semi-circle tab on right edge */}
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FFF0F3] border-2 border-l-0 border-[#FFB3C1] absolute -right-1.5 top-1/2 -translate-y-1/2 z-20" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Puzzle Target Rows */}
          <div className="space-y-2 flex-1 flex flex-col justify-center">
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
                <div key={slot.id} className="flex items-center gap-1.5 w-full">
                  {/* Left Drop Zone Slot */}
                  <div
                    onClick={() => handleSlotClick(slot.id)}
                    className={`flex-1 h-11 sm:h-13 rounded-2xl relative flex items-center justify-center p-1 transition-all border-2 ${
                      isSubmitted
                        ? isCorrectSlot
                          ? "bg-[#E6F4EA] border-[#137333]"
                          : isWrongSlot
                          ? "bg-[#FCE8E6] border-[#C5221F]"
                          : "bg-[#F8F9FA] border-slate-200"
                        : assignedItem
                        ? "bg-[#FFF0F3] border-[#FFB3C1] shadow-sm cursor-pointer hover:brightness-95"
                        : "bg-[#FAF9FF] border-dashed border-[#DCD6F7] cursor-pointer hover:bg-purple-50/50"
                    }`}
                  >
                    {assignedItem ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <img
                          src={assignedItem.image}
                          alt={assignedItem.label}
                          className="w-full h-7 sm:h-9 object-contain pointer-events-none"
                        />
                        {/* Semi-circle tab sticking out right to snap into right slot cutout */}
                        <div
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-l-0 absolute -right-2.5 sm:-right-3 top-1/2 -translate-y-1/2 z-20 ${
                            isSubmitted
                              ? isCorrectSlot
                                ? "bg-[#E6F4EA] border-[#137333]"
                                : isWrongSlot
                                ? "bg-[#FCE8E6] border-[#C5221F]"
                                : "bg-[#FFF0F3] border-[#FFB3C1]"
                              : "bg-[#FFF0F3] border-[#FFB3C1]"
                          }`}
                        />
                      </div>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] text-[#9C98A6] font-semibold text-center">
                        Tap di sini
                      </span>
                    )}
                  </div>

                  {/* Right Target Card ("Zat Padat" / "Zat Cair" / "Zat Gas") */}
                  <div
                    className={`w-[48%] h-11 sm:h-13 rounded-2xl relative flex items-center justify-center p-2 text-center transition-all border-2 ${
                      isSubmitted
                        ? isCorrectSlot
                          ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                          : isWrongSlot
                          ? "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
                          : "bg-[#FFF0F3] border-[#FFB3C1] text-[#2C2B30]"
                        : "bg-[#FFF0F3] border-[#FFB3C1] text-[#2C2B30]"
                    }`}
                  >
                    {/* Semi-circle cutout on left edge for tab entry */}
                    <div
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-r-0 absolute -left-1.5 sm:-left-2 top-1/2 -translate-y-1/2 z-10 ${
                        isSubmitted
                          ? isCorrectSlot
                            ? "bg-[#E6F4EA] border-[#137333]"
                            : isWrongSlot
                            ? "bg-[#FCE8E6] border-[#C5221F]"
                            : "bg-white border-[#FFB3C1]"
                          : "bg-white border-[#FFB3C1]"
                      }`}
                    />

                    <span className="font-extrabold text-xs sm:text-sm tracking-wide z-20">
                      {slot.title}
                    </span>

                    {/* Status Badge Icon */}
                    {isSubmitted && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
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

          {/* Controls & Submission Result Feedback */}
          {!isSubmitted ? (
            <div className="pt-0.5">
              <button
                type="button"
                disabled={!allAssigned}
                onClick={onSubmit}
                className={`w-full py-2 px-3 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  allAssigned
                    ? "bg-linear-to-r from-[#8C66FF] to-[#6039DF] text-white cursor-pointer hover:brightness-110 active:scale-95 shadow-purple-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                <SendIcon size={13} /> Kirim Jawaban
              </button>
            </div>
          ) : (
            <div
              className={`p-2 rounded-xl border-2 shadow-xs animate-fade-in flex items-center justify-between gap-2 ${
                isAllCorrect
                  ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                  : "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
              }`}
            >
              <span className="font-bold text-[10.5px] sm:text-xs pl-1">
                {isAllCorrect ? "Benar semua! 🎉" : "Ada yang kurang tepat"}
              </span>

              <button
                type="button"
                onClick={onReset}
                className={`px-3 py-1 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                  isAllCorrect
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-[#C5221F] text-white hover:bg-red-700"
                }`}
              >
                <RotateCcwIcon size={10} /> Ulangi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
