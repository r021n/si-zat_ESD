import type { RefObject } from "react";
import { FaWater, FaTriangleExclamation } from "react-icons/fa6";

interface EutroHUDProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  airStatusBadgeRef: RefObject<HTMLDivElement | null>;
  bloomBannerRef: RefObject<HTMLDivElement | null>;
  isHudExpanded: boolean;
  onOpenHud: () => void;
  onCloseHud: (e: React.MouseEvent) => void;
  hudFishAliveRef: RefObject<HTMLSpanElement | null>;
  hudFishDeadRef: RefObject<HTMLSpanElement | null>;
  hudTransparencyRef: RefObject<HTMLSpanElement | null>;
  txtWarnaRef: RefObject<HTMLSpanElement | null>;
  txtAlgaeStatusRef: RefObject<HTMLSpanElement | null>;
  txtBiotaStatusRef: RefObject<HTMLSpanElement | null>;
}

export default function EutroHUD({
  canvasRef,
  airStatusBadgeRef,
  bloomBannerRef,
  isHudExpanded,
  onOpenHud,
  onCloseHud,
  hudFishAliveRef,
  hudFishDeadRef,
  hudTransparencyRef,
  txtWarnaRef,
  txtAlgaeStatusRef,
  txtBiotaStatusRef,
}: EutroHUDProps) {
  return (
    <section className="col-span-5 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between h-full">
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex justify-between items-center shrink-0">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <FaWater className="text-emerald-600" /> Profil Ekosistem Danau
          </h3>
          <div
            ref={airStatusBadgeRef}
            className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Oligotrofik (Sangat Sehat)
          </div>
        </div>

        <div className="relative flex-1 bg-sky-50/20 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
          <canvas ref={canvasRef} className="w-full h-full block"></canvas>

          {/* Banner Peringatan Algae Bloom */}
          <div
            ref={bloomBannerRef}
            className="hidden absolute top-2 right-2 flex items-center gap-1 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded font-extrabold shadow-sm animate-pulse z-10"
          >
            <FaTriangleExclamation /> PERINGATAN: ALGAL BLOOM AKTIF!
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
              <span>Biota Hidup:</span>
              <span ref={hudFishAliveRef} className="font-mono font-bold text-sky-600">
                10
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Ikan Mati:</span>
              <span ref={hudFishDeadRef} className="font-mono font-bold text-rose-500">
                0
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Transparansi:</span>
              <span ref={hudTransparencyRef} className="font-mono font-bold text-slate-700">
                100%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2 text-center shrink-0">
        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Warna Perairan
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtWarnaRef} className="text-[10px] font-bold text-sky-500">
              Biru Jernih
            </span>
          </div>
        </div>

        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Populasi Alga
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtAlgaeStatusRef} className="text-[10px] font-bold text-slate-500">
              Sangat Rendah
            </span>
          </div>
        </div>

        <div className="p-1 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center items-center min-h-10.5">
          <span className="block text-[8px] text-slate-400 uppercase font-bold leading-none mb-0.5">
            Status Biota Ikan
          </span>
          <div className="leading-[1.15] text-center w-full">
            <span ref={txtBiotaStatusRef} className="text-[10px] font-bold text-emerald-600">
              Sehat & Aktif
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
