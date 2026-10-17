import type { RefObject } from "react";
import { FaChartBar, FaCircleInfo } from "react-icons/fa6";

interface LandMetricsPanelProps {
  barPhRef: RefObject<HTMLDivElement | null>;
  barPhValRef: RefObject<HTMLSpanElement | null>;
  barSuburRef: RefObject<HTMLDivElement | null>;
  barSuburValRef: RefObject<HTMLSpanElement | null>;
  barAkarRef: RefObject<HTMLDivElement | null>;
  barAkarValRef: RefObject<HTMLSpanElement | null>;
  barRacunRef: RefObject<HTMLDivElement | null>;
  barRacunValRef: RefObject<HTMLSpanElement | null>;
  barPanenRef: RefObject<HTMLDivElement | null>;
  barPanenValRef: RefObject<HTMLSpanElement | null>;
  isLegendOpen: boolean;
  onToggleLegend: () => void;
}

export default function LandMetricsPanel({
  barPhRef,
  barPhValRef,
  barSuburRef,
  barSuburValRef,
  barAkarRef,
  barAkarValRef,
  barRacunRef,
  barRacunValRef,
  barPanenRef,
  barPanenValRef,
  isLegendOpen,
  onToggleLegend,
}: LandMetricsPanelProps) {
  return (
    <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full relative">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-1 shrink-0">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FaChartBar className="text-emerald-600" /> Parameter Dampak Ekosistem
          </h2>
          <button
            onClick={onToggleLegend}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
              isLegendOpen
                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                : "bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200"
            }`}
            title="Keterangan Parameter"
          >
            <FaCircleInfo className="text-[10px]" /> Keterangan
          </button>
        </div>

        {/* GRAFIK 5 PARAMETER */}
        <div className="flex-1 flex items-end justify-between gap-1 pt-6 pb-1 px-1 min-h-[140px]">
          {/* pH */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barPhValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "50%" }}
              >
                7.0
              </span>
              <div
                ref={barPhRef}
                className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "50%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              pH Tanah
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Netral (7)
            </span>
          </div>

          {/* Subur */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barSuburValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-lime-700 whitespace-nowrap bg-lime-50 border border-lime-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "80%" }}
              >
                80%
              </span>
              <div
                ref={barSuburRef}
                className="w-full bg-linear-to-t from-lime-400 to-lime-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "80%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Kesuburan Tanah
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Subur
            </span>
          </div>

          {/* Akar */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barAkarValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "100%" }}
              >
                100%
              </span>
              <div
                ref={barAkarRef}
                className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "100%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Kondisi Akar
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Akar
            </span>
          </div>

          {/* Racun */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barRacunValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "0%" }}
              >
                0%
              </span>
              <div
                ref={barRacunRef}
                className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "0%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Tingkat Racun
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Racun
            </span>
          </div>

          {/* Panen */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barPanenValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "10%" }}
              >
                10%
              </span>
              <div
                ref={barPanenRef}
                className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "10%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Hasil Panen
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Panen
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
