import type { RefObject } from "react";
import { FaChartBar, FaCircleInfo } from "react-icons/fa6";

interface EutroMetricsPanelProps {
  barNutRef: RefObject<HTMLDivElement | null>;
  barNutValRef: RefObject<HTMLSpanElement | null>;
  barAlgRef: RefObject<HTMLDivElement | null>;
  barAlgValRef: RefObject<HTMLSpanElement | null>;
  barDoRef: RefObject<HTMLDivElement | null>;
  barDoValRef: RefObject<HTMLSpanElement | null>;
  barBodRef: RefObject<HTMLDivElement | null>;
  barBodValRef: RefObject<HTMLSpanElement | null>;
  isLegendOpen: boolean;
  onToggleLegend: () => void;
}

export default function EutroMetricsPanel({
  barNutRef,
  barNutValRef,
  barAlgRef,
  barAlgValRef,
  barDoRef,
  barDoValRef,
  barBodRef,
  barBodValRef,
  isLegendOpen,
  onToggleLegend,
}: EutroMetricsPanelProps) {
  return (
    <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full relative">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-1 shrink-0">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FaChartBar className="text-emerald-600" /> Parameter Ekologi Danau
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

        {/* GRAFIK 4 PARAMETER */}
        <div className="flex-1 flex items-end justify-around gap-1.5 pt-6 pb-1 px-1 min-h-[140px]">
          {/* Nutrien */}
          <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
            <div className="relative w-8 sm:w-10 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barNutValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "8%" }}
              >
                2.0 ppm
              </span>
              <div
                ref={barNutRef}
                className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "8%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Nutrien N&P
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Penyubur
            </span>
          </div>

          {/* Alga */}
          <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
            <div className="relative w-8 sm:w-10 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barAlgValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-green-700 whitespace-nowrap bg-green-50 border border-green-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "10%" }}
              >
                10%
              </span>
              <div
                ref={barAlgRef}
                className="w-full bg-linear-to-t from-green-400 to-green-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "10%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Populasi Alga
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Densitas
            </span>
          </div>

          {/* DO */}
          <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
            <div className="relative w-8 sm:w-10 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barDoValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "80%" }}
              >
                8.0 mg/L
              </span>
              <div
                ref={barDoRef}
                className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "80%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Oksigen (DO)
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Terlarut
            </span>
          </div>

          {/* BOD */}
          <div className="flex flex-col items-center h-full justify-end w-1/4 relative">
            <div className="relative w-8 sm:w-10 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barBodValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "6.7%" }}
              >
                1.0 mg/L
              </span>
              <div
                ref={barBodRef}
                className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "6.7%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              Kadar BOD
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Beban Organik
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
