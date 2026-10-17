import { LuGraduationCap } from "react-icons/lu";

interface MainMenuPromoCardProps {
  email: string;
  displayStatus: string;
  kelas?: string;
}

export default function MainMenuPromoCard({
  email,
  displayStatus,
  kelas,
}: MainMenuPromoCardProps) {
  return (
    <div className="w-full bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col justify-between min-h-35">
      {/* Card Background elements */}
      <div className="absolute right-[-10%] top-[-25%] w-32.5 h-32.5 bg-white/10 rounded-full blur-md"></div>
      <div className="absolute right-[15%] bottom-[-20%] w-22.5 h-22.5 bg-white/5 rounded-full blur-sm"></div>
      <LuGraduationCap className="text-5xl opacity-15 absolute right-4 bottom-4 text-white" />

      <div>
        <p className="text-[10px] text-purple-200 uppercase tracking-widest font-extrabold">
          SiZat-ESD Portal
        </p>
        <h2 className="text-lg font-black text-white leading-tight mt-1 truncate">
          Media Belajar Mandiri
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[9px] text-purple-200 font-bold uppercase tracking-wide truncate">
          Siswa: {email}
        </p>
        <div className="flex gap-2 mt-1">
          <span className="inline-block text-[9px] px-3 py-1 bg-[#FF5E8C] text-white font-extrabold rounded-full shadow-sm">
            {displayStatus}
          </span>
          <span className="inline-block text-[9px] px-3 py-1 bg-white/20 text-white font-extrabold rounded-full">
            Kelas: {kelas}
          </span>
        </div>
      </div>
    </div>
  );
}
