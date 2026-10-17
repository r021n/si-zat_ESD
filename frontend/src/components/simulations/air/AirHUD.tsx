import type { RefObject } from "react";
import { FaCity, FaHeadSideMask } from "react-icons/fa6";

interface AirHUDProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  airStatusBadgeRef: RefObject<HTMLDivElement | null>;
  hudMaskWarningRef: RefObject<HTMLDivElement | null>;
  isHudExpanded: boolean;
  onOpenHud: () => void;
  onCloseHud: (e: React.MouseEvent) => void;
  hudHealthyRef: RefObject<HTMLSpanElement | null>;
  hudCoughingRef: RefObject<HTMLSpanElement | null>;
  hudSmogRef: RefObject<HTMLSpanElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtPerilakuRef: RefObject<HTMLSpanElement | null>;
  txtToksikRef: RefObject<HTMLSpanElement | null>;
}

export default function AirHUD({
  canvasRef,
  airStatusBadgeRef,
  hudMaskWarningRef,
  isHudExpanded,
  onOpenHud,
  onCloseHud,
  hudHealthyRef,
  hudCoughingRef,
  hudSmogRef,
  txtWarnaRef,
  txtPerilakuRef,
  txtToksikRef,
}: AirHUDProps) {
  return (
    <section className="col-span-5 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between h-full">
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex justify-between items-center shrink-0">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <FaCity className="text-sky-600" /> Profil Langit & Lingkungan Kota
          </h3>
          <div
            ref={airStatusBadgeRef}
            className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sehat (Baik)
          </div>
        </div>

        <div className="relative flex-1 bg-sky-100/30 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
          <canvas ref={canvasRef} className="w-full h-full block"></canvas>

          {/* Badge Peringatan Masker */}
          <div
            ref={hudMaskWarningRef}
            className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-[8px] px-1.5 py-0.5 rounded font-extrabold shadow-sm transition-all duration-300 opacity-0 scale-90"
          >
            <FaHeadSideMask className="text-[10px]" /> Warga Memakai Masker!
          </div>

          {/* Tombol Info HUD */}
          <button
            onClick={onOpenHud}
            className={`absolute bottom-2 left-2 w-5 h-5 bg-white/95 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-full flex items-center justify-center font-serif font-bold italic text-[10px] shadow-md hover:scale-105 active:scale-95 cursor-pointer z-20 select-none backdrop-blur-sm transition-all duration-300 ${
              isHudExpanded
                ? "scale-0 opacity-0 pointer-events-none"
                : "scale-100 opacity-100"
            }`}
            title="Tampilkan Info"
          >
            i
          </button>

          {/* Overlay HUD Mini */}
          <div
            className={`absolute bottom-2 left-2 bg-white/95 border border-slate-200/80 p-1.5 pr-6 rounded shadow-lg text-[9px] space-y-0.5 backdrop-blur-sm z-20 transition-all duration-300 origin-bottom-left ${
              isHudExpanded
                ? "scale-100 opacity-100 pointer-events-auto"
                : "scale-75 opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={onCloseHud}
              className="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
              title="Tutup"
            >
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-between gap-3 text-slate-600">
              <span>Warga Sehat:</span>
              <span ref={hudHealthyRef} className="font-mono font-bold text-emerald-600">
                10
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Warga Batuk:</span>
              <span ref={hudCoughingRef} className="font-mono font-bold text-rose-500">
                0
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Kepekatan Kabut:</span>
              <span ref={hudSmogRef} className="font-mono font-bold text-slate-700">
                5%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2 text-center shrink-0">
        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Kondisi Udara
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtWarnaRef} className="text-[10px] font-bold text-sky-600">
              Udara Bersih
            </span>
          </div>
        </div>

        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Kondisi Warga
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtPerilakuRef} className="text-[10px] font-bold text-emerald-600">
              Normal Sehat
            </span>
          </div>
        </div>

        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Status Toksisitas
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtToksikRef} className="text-[10px] font-bold text-emerald-600">
              Aman
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
