import { useNavigate } from "react-router-dom";
import { FaWind, FaPlay, FaPause, FaArrowRotateLeft, FaArrowLeft } from "react-icons/fa6";

interface AirHeaderProps {
  running: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
}

export default function AirHeader({
  running,
  onToggleRunning,
  onReset,
}: AirHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-1.5 flex justify-between items-center h-12 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/simulasi")}
          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-all flex items-center justify-center mr-1 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
          title="Kembali ke Pilihan Simulasi"
        >
          <FaArrowLeft className="text-xs" />
        </button>
        <FaWind className="text-sky-500 text-lg" />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">
            Simulasi Pencemaran Udara
          </h1>
          <p className="text-[10px] text-slate-500 leading-none">
            Dampak Pencemaran Udara
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRunning}
          className={`px-3 py-1 text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            running
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-sky-500 hover:bg-sky-600"
          }`}
        >
          {running ? <FaPause /> : <FaPlay />}
          <span>{running ? "Jeda" : "Mulai"}</span>
        </button>
        <button
          onClick={onReset}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md transition-all border border-slate-200 flex items-center gap-1 cursor-pointer"
        >
          <FaArrowRotateLeft className="text-[10px]" /> Reset
        </button>
      </div>
    </header>
  );
}
