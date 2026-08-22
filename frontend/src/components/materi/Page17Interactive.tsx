import { useState } from "react";
import {
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiSend as SendIcon,
  FiBookOpen as BookOpenIcon,
  FiList as ListIcon,
  FiRotateCcw as RotateCcwIcon,
} from "react-icons/fi";
import type { Page17InteractiveProps } from "./types";
import { PAGE17_OPTIONS } from "./constants";

export default function Page17Interactive({
  selectedOption,
  setSelectedOption,
  isSubmitted,
  onSubmit,
  onReset,
}: Page17InteractiveProps) {
  const [activeTab, setActiveTab] = useState<"pembahasan" | "options">(
    "pembahasan",
  );

  const handleReset = () => {
    setActiveTab("pembahasan");
    onReset();
  };

  const isCorrect = selectedOption === "B";

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden select-none">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/17_polos.png"
          alt="Halaman 17"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Overlay interactive content strictly inside the top white space of 17_polos.png (never covers the girl illustration below 56%) */}
        <div
          className="absolute flex flex-col justify-between overflow-y-auto text-left p-1 sm:p-1.5 text-[#2C2B30] z-10 custom-scrollbar"
          style={{
            top: "23.5%",
            left: "11.5%",
            width: "77%",
            height: "32.5%",
            maxHeight: "32.5%",
          }}
        >
          {!isSubmitted ? (
            /* --- STATE 1: BEFORE SUBMISSION --- */
            <div className="space-y-1.5 flex flex-col justify-between h-full">
              {/* Question title matching 17.png */}
              <p className="text-[10px] sm:text-[11px] md:text-xs font-bold text-[#1E293B] leading-snug tracking-tight">
                Manakah tindakan yang mendukung{" "}
                <span className="text-[#C5221F] font-extrabold">
                  pelestarian lingkungan
                </span>{" "}
                melalui pemanfaatan{" "}
                <span className="text-[#C5221F] font-extrabold">
                  perubahan fisika ?
                </span>
              </p>

              {/* Options list */}
              <div className="space-y-1">
                {PAGE17_OPTIONS.map((opt) => {
                  const isSelected = selectedOption === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOption(opt.id)}
                      className={`w-full p-1 sm:p-1.5 rounded-xl flex items-center gap-1.5 text-left transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? "bg-[#D0E8FF] border-2 border-[#1A368B] text-[#1E293B] font-semibold shadow-xs"
                          : "bg-[#DDF0FF] hover:bg-[#D0E8FF] border border-[#BDE0FE] text-[#1E293B]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg font-black flex items-center justify-center text-[10px] sm:text-xs shrink-0 transition-transform bg-[#1A368B] text-white ${
                          isSelected ? "ring-2 ring-[#1A368B]/30 scale-105" : ""
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] leading-tight flex-1 font-medium">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submit button */}
              <div className="pt-0.5">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={onSubmit}
                  className={`w-full py-1.5 px-3 rounded-xl font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    selectedOption
                      ? "bg-linear-to-r from-[#1A368B] to-[#2563EB] text-white cursor-pointer hover:brightness-110 active:scale-95 shadow-blue-300/50"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <SendIcon size={12} /> Kirim Jawaban
                </button>
              </div>
            </div>
          ) : (
            /* --- STATE 2: AFTER SUBMISSION (Compact, Fits 100% in top area) --- */
            <div className="flex flex-col justify-between h-full animate-fade-in space-y-1">
              {/* Header result bar & retry button */}
              <div
                className={`p-1.5 rounded-xl border flex items-center justify-between gap-1 shrink-0 ${
                  isCorrect
                    ? "bg-[#E6F4EA] border-[#137333] text-[#137333]"
                    : "bg-[#FCE8E6] border-[#C5221F] text-[#C5221F]"
                }`}
              >
                <div className="flex items-center gap-1 pl-0.5 min-w-0">
                  {isCorrect ? (
                    <CheckIcon size={14} className="shrink-0" />
                  ) : (
                    <XIcon size={14} className="shrink-0" />
                  )}
                  <span className="font-extrabold text-[9px] sm:text-[10px] leading-tight truncate">
                    {isCorrect
                      ? "Benar! 🎉 (Jawaban B)"
                      : `Jawaban (${selectedOption || "-"}) Kurang Tepat`}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Tab switch button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        activeTab === "pembahasan" ? "options" : "pembahasan",
                      )
                    }
                    className="px-1.5 py-0.5 bg-white/80 hover:bg-white text-slate-700 font-bold rounded-md text-[8px] sm:text-[8.5px] border border-slate-300 cursor-pointer flex items-center gap-0.5"
                  >
                    {activeTab === "pembahasan" ? (
                      <>
                        <ListIcon size={10} /> Opsi
                      </>
                    ) : (
                      <>
                        <BookOpenIcon size={10} /> Solusi
                      </>
                    )}
                  </button>

                  {/* Reset button */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`px-2 py-0.5 font-extrabold text-[8.5px] sm:text-[9px] rounded-md cursor-pointer transition-all flex items-center gap-0.5 shadow-2xs active:scale-95 text-white ${
                      isCorrect
                        ? "bg-[#137333] hover:bg-emerald-700"
                        : "bg-[#C5221F] hover:bg-red-700"
                    }`}
                  >
                    <RotateCcwIcon size={9} /> Ulangi
                  </button>
                </div>
              </div>

              {/* Tab Content: Pembahasan or Options View */}
              {activeTab === "pembahasan" ? (
                <div className="flex-1 bg-white border-2 border-[#1A368B] rounded-xl p-1.5 sm:p-2 shadow-xs flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  <div>
                    <div className="flex items-center justify-between border-b border-blue-100 pb-0.5 mb-1">
                      <div className="flex items-center gap-1 text-[#1A368B]">
                        <BookOpenIcon size={12} className="shrink-0" />
                        <span className="font-extrabold text-[10px] sm:text-[11px] tracking-wide">
                          Pembahasan Soal
                        </span>
                      </div>
                      <span className="bg-[#1A368B] text-white font-black text-[8px] sm:text-[8.5px] px-1.5 py-0.2 rounded shadow-xs">
                        Kunci: B
                      </span>
                    </div>
                    <p className="text-[8px] sm:text-[9px] text-[#1E293B] font-medium leading-relaxed">
                      Menjemur pakaian dengan memanfaatkan panas sinar matahari
                      merupakan contoh pemanfaatan perubahan fisika (penguapan air)
                      yang mendukung pelestarian lingkungan karena menghemat energi
                      listrik dibandingkan mesin pengering.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                  {PAGE17_OPTIONS.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isOptCorrect = opt.id === "B";

                    let cardStyle =
                      "bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-70";
                    let badgeStyle = "bg-[#94A3B8] text-white";

                    if (isOptCorrect) {
                      cardStyle =
                        "bg-[#E6F4EA] border-2 border-[#137333] text-[#137333] font-semibold";
                      badgeStyle = "bg-[#137333] text-white";
                    } else if (isSelected && !isOptCorrect) {
                      cardStyle =
                        "bg-[#FCE8E6] border-2 border-[#C5221F] text-[#C5221F] font-semibold";
                      badgeStyle = "bg-[#C5221F] text-white";
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`w-full p-1 rounded-lg flex items-center gap-1.5 text-left ${cardStyle}`}
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded font-black flex items-center justify-center text-[9px] shrink-0 ${badgeStyle}`}
                        >
                          {isOptCorrect ? (
                            <CheckIcon size={11} />
                          ) : isSelected && !isOptCorrect ? (
                            <XIcon size={11} />
                          ) : (
                            opt.id
                          )}
                        </div>
                        <span className="text-[8px] sm:text-[8.5px] leading-tight flex-1 font-medium">
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
