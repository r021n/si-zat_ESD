import type { RefObject } from "react";
import { FaChartBar, FaCircleInfo } from "react-icons/fa6";

interface AirMetricsPanelProps {
  barAqiRef: RefObject<HTMLDivElement | null>;
  barAqiValRef: RefObject<HTMLSpanElement | null>;
  barPm25Ref: RefObject<HTMLDivElement | null>;
  barPm25ValRef: RefObject<HTMLSpanElement | null>;
  barCo2Ref: RefObject<HTMLDivElement | null>;
  barCo2ValRef: RefObject<HTMLSpanElement | null>;
  barCoRef: RefObject<HTMLDivElement | null>;
  barCoValRef: RefObject<HTMLSpanElement | null>;
  barO2Ref: RefObject<HTMLDivElement | null>;
  barO2ValRef: RefObject<HTMLSpanElement | null>;
  isLegendOpen: boolean;
  onToggleLegend: () => void;
}

export default function AirMetricsPanel({
  barAqiRef,
  barAqiValRef,
  barPm25Ref,
  barPm25ValRef,
  barCo2Ref,
  barCo2ValRef,
  barCoRef,
  barCoValRef,
  barO2Ref,
  barO2ValRef,
  isLegendOpen,
  onToggleLegend,
}: AirMetricsPanelProps) {
  return (
    <section className="col-span-4 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-full relative">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-1 shrink-0">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FaChartBar className="text-sky-600" /> Kualitas Udara (Real-time)
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

        {/* GRAFIK 5 PARAMETER UDARA */}
        <div className="flex-1 flex items-end justify-between gap-1 pt-6 pb-1 px-1 min-h-[140px]">
          {/* AQI */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barAqiValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "5%" }}
              >
                20
              </span>
              <div
                ref={barAqiRef}
                className="w-full bg-linear-to-t from-emerald-400 to-emerald-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "5%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              AQI
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Indeks
            </span>
          </div>

          {/* PM2.5 */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barPm25ValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-sky-700 whitespace-nowrap bg-sky-50 border border-sky-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "5%" }}
              >
                12
              </span>
              <div
                ref={barPm25Ref}
                className="w-full bg-linear-to-t from-sky-400 to-sky-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "5%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              PM 2.5
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              µg/m³
            </span>
          </div>

          {/* CO2 */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barCo2ValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-amber-700 whitespace-nowrap bg-amber-50 border border-amber-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "39%" }}
              >
                390
              </span>
              <div
                ref={barCo2Ref}
                className="w-full bg-linear-to-t from-amber-400 to-amber-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "39%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              CO₂
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              ppm
            </span>
          </div>

          {/* CO */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barCoValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-rose-700 whitespace-nowrap bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "3%" }}
              >
                1.5
              </span>
              <div
                ref={barCoRef}
                className="w-full bg-linear-to-t from-rose-400 to-rose-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "3%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              CO
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              ppm
            </span>
          </div>

          {/* O2 */}
          <div className="flex flex-col items-center h-full justify-end w-1/5 relative">
            <div className="relative w-7 sm:w-9 flex-1 bg-slate-100/60 rounded-md flex flex-col justify-end overflow-visible border border-slate-200/40">
              <span
                ref={barO2ValRef}
                className="absolute left-1/2 -translate-x-1/2 text-[9px] font-extrabold font-mono text-teal-700 whitespace-nowrap bg-teal-50 border border-teal-200 px-1 py-0.2 rounded shadow-sm"
                style={{ bottom: "84%" }}
              >
                21.0%
              </span>
              <div
                ref={barO2Ref}
                className="w-full bg-linear-to-t from-teal-400 to-teal-500 rounded-b-md rounded-t-sm shadow-sm"
                style={{ height: "84%" }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-slate-600 mt-1.5 uppercase text-center">
              O₂
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-tight text-center">
              Kadar %
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
