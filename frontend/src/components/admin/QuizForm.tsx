import { FiX, FiUpload, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  images: string[];
}

interface QuizFormProps {
  editingQuizId: string | null;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onQuestionTextChange: (id: string, text: string) => void;
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
  onOptionCountChange,
  onOptionTextChange,
  onToggleCorrectAnswer,
  onImageUpload,
  onRemoveImage,
  onSave,
  onCancel
}: QuizFormProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-4 pb-4 border-b border-[#F0EDFF]/50 flex-shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Kelola Kuis</p>
            <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
              {editingQuizId ? "Edit Kuis" : "Kuis Baru"}
            </h1>
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-[#FFEAEA] text-[#FF5E8C] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none"
          >
            Batal
          </button>
        </div>

        {/* Title Field */}
        <div className="mt-4 flex flex-col gap-1.5 flex-shrink-0">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#9C98A6]">Judul Kuis</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Masukkan judul kuis..."
            className="w-full p-4 border border-[#F0EDFF] bg-white text-[#2C2B30] text-xs font-bold focus:outline-none focus:border-[#8C66FF] transition-none rounded-2xl"
          />
        </div>

        {/* Questions Builder */}
        <div className="mt-6 flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="w-full bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#F0EDFF]/50 pb-2">
                <span className="text-xs font-extrabold text-[#8C66FF] uppercase tracking-wider">Soal #{qIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(q.id)}
                  className="text-[9px] font-extrabold uppercase text-[#FF5E8C] hover:text-[#FF5E8C]/80 flex items-center gap-1 cursor-pointer transition-none"
                >
                  <FiTrash2 className="text-[11px]" /> Hapus Soal
                </button>
              </div>

              {/* Question Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6]">Teks Pertanyaan (Tinggi dapat diatur)</label>
                <textarea
                  value={q.text}
                  onChange={(e) => onQuestionTextChange(q.id, e.target.value)}
                  placeholder="Ketik soal kuis di sini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#F0EDFF] text-xs bg-[#FAF9FF] text-[#2C2B30] font-medium focus:outline-none focus:border-[#8C66FF] focus:bg-white resize-y min-h-[70px] rounded-xl transition-none"
                />
              </div>

              {/* Multi Image Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6]">Gambar Soal</label>
                
                {/* Image Preview List */}
                {q.images && q.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    {q.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative w-14 h-14 rounded-xl border border-[#F0EDFF] bg-white flex items-center justify-center overflow-hidden shadow-sm">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(q.id, imgIdx)}
                          className="absolute top-0 right-0 bg-[#FF5E8C] text-white cursor-pointer text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-bl-lg transition-none"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Upload Button */}
                <label className="w-full py-3 border border-dashed border-[#8C66FF]/30 bg-[#FAF9FF] text-[#8C66FF] hover:bg-white cursor-pointer flex justify-center items-center gap-1.5 text-[10px] font-extrabold uppercase rounded-xl transition-none shadow-sm">
                  <FiUpload className="text-xs" /> Pilih Gambar
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onImageUpload(q.id, e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option Count Selector */}
              <div className="flex justify-between items-center bg-[#FAF9FF] p-3 rounded-xl border border-[#F0EDFF]">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6]">Jumlah Opsi Pilihan</label>
                <select
                  value={q.options.length}
                  onChange={(e) => onOptionCountChange(q.id, parseInt(e.target.value))}
                  className="border border-[#F0EDFF] px-2.5 py-1 text-[10px] font-extrabold bg-white text-[#2C2B30] focus:outline-none rounded-lg cursor-pointer"
                >
                  <option value={2}>2 Pilihan (A - B)</option>
                  <option value={3}>3 Pilihan (A - C)</option>
                  <option value={4}>4 Pilihan (A - D)</option>
                  <option value={5}>5 Pilihan (A - E)</option>
                </select>
              </div>

              {/* Options inputs */}
              <div className="flex flex-col gap-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#9C98A6] mb-0.5">Opsi Jawaban & Checklist Jawaban Benar</p>
                {q.options.map((opt, optIdx) => {
                  const optionLetter = String.fromCharCode(65 + optIdx);
                  const isCorrect = q.correctAnswers.includes(optIdx);
                  return (
                    <div key={optIdx} className="flex gap-2 items-center">
                      {/* Checklist box */}
                      <button
                        type="button"
                        onClick={() => onToggleCorrectAnswer(q.id, optIdx)}
                        className={`w-8 h-8 rounded-xl border border-[#F0EDFF] flex items-center justify-center cursor-pointer text-xs font-black transition-none ${
                          isCorrect 
                            ? "bg-[#2C8578] text-white border-[#2C8578]" 
                            : "bg-white text-[#9C98A6]"
                        }`}
                        title="Tandai sebagai jawaban benar"
                      >
                        {isCorrect ? <FiCheck /> : optionLetter}
                      </button>

                      {/* Option Input */}
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => onOptionTextChange(q.id, optIdx, e.target.value)}
                        placeholder={`Opsi ${optionLetter}...`}
                        className="flex-1 px-3 py-2 border border-[#F0EDFF] text-xs bg-white text-[#2C2B30] font-bold focus:outline-none focus:border-[#8C66FF] rounded-xl transition-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={onAddQuestion}
            className="w-full py-4 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
          >
            <FiPlus /> Tambah Soal
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="w-full mt-6 mb-2">
        <button
          onClick={onSave}
          className="w-full py-4 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2"
        >
          Simpan Kuis
        </button>
      </div>
    </div>
  );
}

