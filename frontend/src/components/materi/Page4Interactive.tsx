import {
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiSend as SendIcon,
  FiBookOpen as BookOpenIcon,
  FiRotateCcw as RotateCcwIcon,
} from "react-icons/fi";
import type { Page4InteractiveProps } from "./types";
import { PAGE4_OPTIONS } from "./constants";

export default function Page4Interactive({
  selectedOption,
  setSelectedOption,
  isSubmitted,
  onSubmit,
  onReset,
}: Page4InteractiveProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/4_polos.png"
          alt="Halaman 4"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Overlay interactive content inside the white space of 4_polos.png */}
        <div
          className="absolute flex flex-col justify-between overflow-y-auto text-left p-2.5 sm:p-3 text-[#2C2B30] z-10 custom-scrollbar"
          style={{
            top: "42.2%",
            left: "8.8%",
            width: "82.4%",
            height: "49.2%",
          }}
        >
          <div className="space-y-2">
            {/* Question title */}
            <p className="text-[11px] sm:text-xs font-bold text-[#1E293B] leading-snug">
              Menurutmu apa alasan yang tepat untuk menjawab pertanyaan Andi
              tersebut ?
            </p>

            {/* Options list */}
            <div className="space-y-1.5">
              {PAGE4_OPTIONS.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === "B";

                let cardStyle =
                  "bg-[#DDF0FF] hover:bg-[#D0E8FF] border border-[#BDE0FE] text-[#1E293B]";
                let badgeStyle = "bg-[#1E40AF] text-white";

                if (isSubmitted) {
                  if (isCorrect) {
                    cardStyle =
                      "bg-[#E6F4EA] border-2 border-[#137333] text-[#137333] font-semibold shadow-xs";
                    badgeStyle = "bg-[#137333] text-white";
                  } else if (isSelected && !isCorrect) {
                    cardStyle =
                      "bg-[#FCE8E6] border-2 border-[#C5221F] text-[#C5221F] font-semibold shadow-xs";
                    badgeStyle = "bg-[#C5221F] text-white";
                  } else {
                    cardStyle =
                      "bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] opacity-70";
                    badgeStyle = "bg-[#94A3B8] text-white";
                  }
                } else if (isSelected) {
                  cardStyle =
                    "bg-[#D0E8FF] border-2 border-[#1E40AF] text-[#1E293B] font-semibold shadow-sm scale-[1.01]";
                  badgeStyle =
                    "bg-[#1E40AF] text-white ring-2 ring-[#1E40AF]/30";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full p-1.5 sm:p-2 rounded-xl flex items-center gap-2 text-left transition-all ${
                      isSubmitted
                        ? "cursor-default"
                        : "cursor-pointer active:scale-[0.99]"
                    } ${cardStyle}`}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg font-black flex items-center justify-center text-[10px] sm:text-xs shrink-0 transition-transform ${badgeStyle}`}
                    >
                      {isSubmitted && isCorrect ? (
                        <CheckIcon size={14} />
                      ) : isSubmitted && isSelected && !isCorrect ? (
                        <XIcon size={14} />
                      ) : (
                        opt.id
                      )}
                    </div>
                    <span className="text-[9.5px] sm:text-[10.5px] leading-tight flex-1 font-medium">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit button (if not submitted) */}
            {!isSubmitted && (
              <div className="pt-1">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={onSubmit}
                  className={`w-full py-2 px-3 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    selectedOption
                      ? "bg-linear-to-r from-[#1E40AF] to-[#2563EB] text-white cursor-pointer hover:brightness-110 active:scale-95 shadow-blue-300/50"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <SendIcon size={13} /> Kirim Jawaban
                </button>
              </div>
            )}
          </div>

          {/* Pembahasan Card (shown after submission) */}
          {isSubmitted && (
            <div className="mt-2 bg-white border-2 border-[#1E3A8A] rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col justify-between animate-fade-in shrink-0">
              <div>
                <div className="flex items-center justify-between border-b border-blue-100 pb-1 mb-1.5">
                  <div className="flex items-center gap-1.5 text-[#1E3A8A]">
                    <BookOpenIcon size={15} className="shrink-0" />
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                      Pembahasan
                    </span>
                  </div>
                  <span className="bg-[#1E3A8A] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                    Jawaban B
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#1E293B] font-medium leading-relaxed">
                  Air hujan merupakan salah satu contoh zat yang memiliki massa
                  karena memiliki berat dan dipengaruhi oleh gravitasi,
                  menempati ruang karena air membutuhkan tempat dan mengisi
                  ruang kosong, seperti halaman rumah dan jalanan, dan dapat
                  berubah bentuk, itulah mengapa air yang awalnya berbentuk
                  rintikan di udara akan berubah bentuk menyerupai selokan atau
                  halaman saat jatuh di permukaan.
                </p>
              </div>

              <div className="pt-2 mt-1.5 border-t border-blue-50 flex justify-between items-center text-[9.5px] sm:text-[10.5px]">
                <span
                  className={`font-bold ${
                    selectedOption === "B"
                      ? "text-emerald-700"
                      : "text-rose-600"
                  }`}
                >
                  {selectedOption === "B"
                    ? "Benar! 🎉"
                    : `Jawabanmu (${selectedOption || "-"}) kurang tepat`}
                </span>
                <button
                  type="button"
                  onClick={onReset}
                  className="px-2.5 py-1 bg-[#F0ECFF] text-[#8C66FF] border border-[#DCD6F7] hover:bg-purple-100 font-extrabold rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[9.5px] active:scale-95"
                >
                  <RotateCcwIcon size={10} /> Ulangi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
