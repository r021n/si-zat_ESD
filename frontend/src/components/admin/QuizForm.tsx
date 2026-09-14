import {
  FiX,
  FiUpload,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
  questionType?: string;
}

interface QuizFormProps {
  editingQuizId: string | null;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onQuestionTextChange: (id: string, text: string) => void;
  onQuestionTypeChange: (id: string, type: string) => void;
  onOptionCountChange: (id: string, count: number) => void;
  onOptionTextChange: (id: string, optIdx: number, text: string) => void;
  onToggleCorrectAnswer: (id: string, optIdx: number) => void;
  onImageUpload: (id: string, files: FileList | null) => void;
  onRemoveImage: (id: string, imgIdx: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuizForm({
  editingQuizId,
  quizTitle,
  setQuizTitle,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionTextChange,
  onQuestionTypeChange,
  onOptionCountChange,
  onOptionTextChange,
  onToggleCorrectAnswer,
  onImageUpload,
  onRemoveImage,
  onSave,
  onCancel,
}: QuizFormProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-2 md:mt-0 pb-4 border-b border-[#F0EDFF]/70 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onCancel}
              className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 hover:bg-[#FAF9FF] transition-colors shrink-0"
              title="Batal"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#9C98A6] font-bold">
                Editor Kuis
              </p>
              <h1 className="text-xl md:text-2xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                {editingQuizId ? "Edit Kuis" : "Kuis Baru"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs font-bold text-[#9C98A6] bg-white px-3 py-1.5 rounded-full border border-[#F0EDFF]">
              {questions.length} Butir Soal
            </span>
            <button
              onClick={onSave}
              className="hidden md:flex px-5 py-2.5 bg-[#8C66FF] text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors items-center gap-2"
            >
              Simpan Kuis
            </button>
          </div>
        </div>

        {/* Title Field */}
        <div className="mt-4 flex flex-col gap-1.5 shrink-0 bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#9C98A6]">
            Judul Kuis
          </label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Masukkan judul kuis..."
            className="w-full p-3.5 md:p-4 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] text-xs md:text-sm font-bold focus:outline-none focus:border-[#8C66FF] focus:bg-white transition-colors rounded-xl md:rounded-2xl"
          />
        </div>

        {/* Questions Builder */}
        <div className="mt-4 md:mt-6 flex-1 flex flex-col gap-6 overflow-y-auto pr-1 no-scrollbar">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] md:shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#F0EDFF] flex flex-col gap-4 md:gap-5"
            >
              {/* Question Card Header */}
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#F0EDFF]/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-[#F0ECFF] text-[#8C66FF] rounded-full text-xs font-black uppercase tracking-wider">
                    Soal #{qIdx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {/* Option Count Selector in Header for desktop */}
                  <div className="flex items-center gap-1.5 bg-[#FAF9FF] px-2.5 py-1 rounded-xl border border-[#F0EDFF]">
                    <span className="text-[9px] md:text-[10px] font-bold text-[#9C98A6]">Opsi:</span>
                    <select
                      value={q.options.length}
                      onChange={(e) =>
                        onOptionCountChange(q.id, parseInt(e.target.value))
                      }
                      className="text-[10px] md:text-xs font-extrabold bg-transparent text-[#2C2B30] focus:outline-none cursor-pointer"
                    >
                      <option value={2}>2 (A-B)</option>
                      <option value={3}>3 (A-C)</option>
                      <option value={4}>4 (A-D)</option>
                      <option value={5}>5 (A-E)</option>
                    </select>
                  </div>

                  {/* Question Type Selector in Header for desktop */}
                  <div className="flex items-center gap-1.5 bg-[#FAF9FF] px-2.5 py-1 rounded-xl border border-[#F0EDFF]">
                    <span className="text-[9px] md:text-[10px] font-bold text-[#9C98A6]">Tipe:</span>
                    <select
                      value={q.questionType || "C1"}
                      onChange={(e) => onQuestionTypeChange(q.id, e.target.value)}
                      className="text-[10px] md:text-xs font-extrabold bg-transparent text-[#2C2B30] focus:outline-none cursor-pointer"
                    >
                      <option value="C1">C1 (Mengingat)</option>
                      <option value="C2">C2 (Memahami)</option>
                      <option value="C3">C3 (Menerapkan)</option>
                      <option value="C4">C4 (Menganalisis)</option>
                      <option value="C5">C5 (Mengevaluasi)</option>
                      <option value="C6">C6 (Menciptakan)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(q.id)}
                    className="text-[9px] md:text-[10px] font-extrabold uppercase text-[#FF5E8C] hover:bg-[#FFEAEA] px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FiTrash2 className="text-xs" /> <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>

              {/* Responsive Question Body - 2 Columns on Desktop */}
              <div className="w-full flex flex-col md:grid md:grid-cols-12 md:gap-6 md:items-start">
                {/* Left Column: Question Text & Images */}
                <div className="flex flex-col gap-3.5 md:col-span-6">
                  {/* Question Text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                      Teks Pertanyaan
                    </label>
                    <textarea
                      value={q.text}
                      onChange={(e) => onQuestionTextChange(q.id, e.target.value)}
                      placeholder="Ketik soal kuis di sini..."
                      rows={4}
                      className="w-full p-3.5 border border-[#F0EDFF] text-xs md:text-sm bg-[#FAF9FF] text-[#2C2B30] font-medium focus:outline-none focus:border-[#8C66FF] focus:bg-white resize-y min-h-[100px] rounded-2xl transition-colors"
                    />
                  </div>

                  {/* Multi Image Upload */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                      Gambar Soal (Opsional)
                    </label>

                    {/* Image Preview List */}
                    {q.images && q.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1.5">
                        {q.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative w-16 h-16 rounded-xl border border-[#F0EDFF] bg-white flex items-center justify-center overflow-hidden shadow-xs"
                          >
                            <img
                              src={img}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveImage(q.id, imgIdx)}
                              className="absolute top-0 right-0 bg-[#FF5E8C] text-white cursor-pointer text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-bl-lg hover:bg-red-600 transition-colors"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom Upload Button */}
                    <label className="w-full py-3 border border-dashed border-[#8C66FF]/40 bg-[#FAF9FF] text-[#8C66FF] hover:bg-white cursor-pointer flex justify-center items-center gap-2 text-[10px] md:text-xs font-extrabold uppercase rounded-xl transition-colors shadow-xs">
                      <FiUpload className="text-xs md:text-sm" /> Pilih Gambar
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onImageUpload(q.id, e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Right Column: Options Inputs */}
                <div className="flex flex-col gap-2 mt-4 md:mt-0 md:col-span-6">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">
                      Opsi Jawaban & Checklist Jawaban Benar
                    </p>
                    <span className="text-[9px] text-[#2C8578] font-bold">
                      {q.correctAnswers.length} Benar
                    </span>
                  </div>

                  {q.options.map((opt, optIdx) => {
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    const isCorrect = q.correctAnswers.includes(optIdx);
                    return (
                      <div key={optIdx} className="flex gap-2 items-center">
                        {/* Checklist box */}
                        <button
                          type="button"
                          onClick={() => onToggleCorrectAnswer(q.id, optIdx)}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl border flex items-center justify-center cursor-pointer text-xs md:text-sm font-black transition-all shrink-0 ${
                            isCorrect
                              ? "bg-[#2C8578] text-white border-[#2C8578] shadow-xs"
                              : "bg-white text-[#9C98A6] border-[#F0EDFF] hover:border-[#8C66FF]/40"
                          }`}
                          title="Tandai sebagai jawaban benar"
                        >
                          {isCorrect ? <FiCheck /> : optionLetter}
                        </button>

                        {/* Option Input */}
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            onOptionTextChange(q.id, optIdx, e.target.value)
                          }
                          placeholder={`Opsi ${optionLetter}...`}
                          className={`flex-1 px-3.5 py-2.5 border text-xs md:text-sm font-bold focus:outline-none rounded-xl transition-colors ${
                            isCorrect
                              ? "bg-[#E6F8F6]/40 border-[#2C8578]/50 text-[#2C2B30] focus:border-[#2C8578]"
                              : "bg-white border-[#F0EDFF] text-[#2C2B30] focus:border-[#8C66FF]"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={onAddQuestion}
            className="w-full py-4 bg-white border border-dashed border-[#8C66FF]/40 text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-xs cursor-pointer hover:bg-[#FAF9FF] transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus size={16} /> Tambah Butir Soal
          </button>
        </div>
      </div>

      {/* Save Button for Mobile & Desktop bottom */}
      <div className="w-full mt-4 mb-2">
        <button
          onClick={onSave}
          className="w-full py-4 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center gap-2"
        >
          Simpan Kuis
        </button>
      </div>
    </div>
  );
}
