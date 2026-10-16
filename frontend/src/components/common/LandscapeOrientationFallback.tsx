import { useNavigate } from "react-router-dom";

interface LandscapeOrientationFallbackProps {
  simulationTitle?: string;
  backPath?: string;
}

export default function LandscapeOrientationFallback({
  simulationTitle = "eko-simulasi",
  backPath = "/simulasi",
}: LandscapeOrientationFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="hidden max-lg:portrait:flex fixed inset-0 z-9999 bg-black flex-col items-center justify-center text-center p-6 text-white select-none">
      <div className="w-16 h-16 mb-4 flex items-center justify-center border border-white rounded-lg">
        <svg
          className="w-8 h-8 rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-sm font-bold mb-2 uppercase tracking-wider">
        Mode Lanskap Diperlukan
      </h2>
      <p className="text-xs text-neutral-400 max-w-70 leading-relaxed">
        Silakan putar perangkat Anda ke arah lanskap (menyamping) untuk
        mengakses {simulationTitle}.
      </p>
      <button
        onClick={() => navigate(backPath)}
        className="mt-6 px-4 py-2 border border-white bg-black text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        Kembali ke Menu
      </button>
    </div>
  );
}
