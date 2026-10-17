interface QuizSummaryCardsProps {
  totalSubmissions: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
}

export default function QuizSummaryCards({
  totalSubmissions,
  avgScore,
  highestScore,
  lowestScore,
}: QuizSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0">
      <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Siswa Menjawab
        </span>
        <span className="text-2xl md:text-3xl font-black text-[#8C66FF]">
          {totalSubmissions}
        </span>
      </div>
      <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Nilai Rata-Rata
        </span>
        <span className="text-2xl md:text-3xl font-black text-[#2C8578]">
          {avgScore}
        </span>
      </div>
      <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Nilai Tertinggi
        </span>
        <span className="text-2xl md:text-3xl font-black text-[#8C66FF]">
          {highestScore}
        </span>
      </div>
      <div className="bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] text-center flex flex-col gap-1">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
          Nilai Terendah
        </span>
        <span className="text-2xl md:text-3xl font-black text-[#D95276]">
          {lowestScore}
        </span>
      </div>
    </div>
  );
}
