import type { RefObject } from "react";
import { FaChartBar, FaCircleInfo } from "react-icons/fa6";

interface WaterMetricsPanelProps {
  barDoRef: RefObject<HTMLDivElement | null>;
  barDoValRef: RefObject<HTMLSpanElement | null>;
  barPhRef: RefObject<HTMLDivElement | null>;
  barPhValRef: RefObject<HTMLSpanElement | null>;
  barBodRef: RefObject<HTMLDivElement | null>;
  barBodValRef: RefObject<HTMLSpanElement | null>;
  barCodRef: RefObject<HTMLDivElement | null>;
  barCodValRef: RefObject<HTMLSpanElement | null>;
  barPolRef: RefObject<HTMLDivElement | null>;
  barPolValRef: RefObject<HTMLSpanElement | null>;
  isLegendOpen: boolean;
  onToggleLegend: () => void;
}

export default function WaterMetricsPanel({
  barDoRef,
  barDoValRef,
  barPhRef,
  barPhValRef,
  barBodRef,
  barBodValRef,
  barCodRef,
  barCodValRef,
  barPolRef,
  barPolValRef,
  isLegendOpen,
  onToggleLegend,
}: WaterMetricsPanelProps) {
  return (
    <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full relative">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-1 shrink-0">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FaChartBar className="text-sky-600" /> Parameter Kualitas Air
          </h2>
          <button
            onClick={onToggleLegend}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
              isLegendOpen
                ? "bg-sky-100 text-sky-700 border-sky-300"
                : "bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200"
            }`}
            title="Keterangan Parameter"
          >
            <FaCircleInfo className="text-[10px]" /> Keterangan
          </button>
        </div>

        {/* GRAFIK 5 PARAMETER AIR */}
        <div className="flex-1 flex items-end justify-between gap-1 pt-6 pb-1 px-1 min-h-[140px]">
          {/* DO */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barDoValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "80%" }}
              >
                8.00
              </span>
              <div
                ref={barDoRef}
                className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "80%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              DO
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              mg/L
            </span>
          </div>

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
              pH
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Skala
            </span>
          </div>

          {/* BOD */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barBodValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "1%" }}
              >
                1.50
              </span>
              <div
                ref={barBodRef}
                className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "1%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              BOD
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              mg/L
            </span>
          </div>

          {/* COD */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barCodValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-purple-700 whitespace-nowrap bg-purple-50 border border-purple-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "3.3%" }}
              >
                5.00
              </span>
              <div
                ref={barCodRef}
                className="w-full bg-linear-to-t from-purple-400 to-purple-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "3.3%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              COD
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              mg/L
            </span>
          </div>

          {/* Polutan */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barPolValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "0%" }}
              >
                0.00
              </span>
              <div
                ref={barPolRef}
                className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "0%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Polutan
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              mg/L
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
