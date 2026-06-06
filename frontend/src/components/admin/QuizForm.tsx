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
    <div className="w-full flex-1 flex flex-col justify-between">
      <div className="w-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Kelola Kuis</p>
            <h1 className="text-sm font-bold uppercase tracking-wide">
              {editingQuizId ? "Edit Kuis" : "Kuis Baru"}
            </h1>
          </div>
          <button
            onClick={onCancel}
            className="px-2.5 py-1.5 border border-black text-[9px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white cursor-pointer"
          >
            Batal
          </button>
        </div>

        {/* Title Field */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider">Judul Kuis</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Masukkan judul kuis..."
            className="w-full px-3 py-2 border border-black text-xs bg-white text-black font-medium focus:outline-none"
          />
        </div>

        {/* Questions Builder */}
        <div className="mt-6 flex flex-col gap-6 max-h-[360px] overflow-y-auto pr-1">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="w-full border border-black p-4 bg-neutral-50 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Soal #{qIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(q.id)}
                  className="text-[10px] font-bold uppercase text-neutral-500 hover:text-black border-b border-transparent hover:border-black flex items-center gap-1 cursor-pointer"
                >
                  <FiTrash2 /> Hapus Soal
                </button>
              </div>

              {/* Question Text (Resizable height) */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Teks Pertanyaan (Tinggi dapat diatur/ditarik)</label>
                <textarea
                  value={q.text}
                  onChange={(e) => onQuestionTextChange(q.id, e.target.value)}
                  placeholder="Ketik soal kuis di sini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-black text-xs bg-white text-black font-medium focus:outline-none resize-y min-h-[60px]"
                />
              </div>

              {/* Multi Image Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Gambar Soal (Bisa Multi-Upload)</label>
                
                {/* Image Preview List */}
                {q.images && q.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {q.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative w-14 h-14 border border-black bg-white flex items-center justify-center overflow-hidden">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(q.id, imgIdx)}
                          className="absolute top-0 right-0 bg-black text-white hover:bg-neutral-800 cursor-pointer text-[9px] font-bold w-4 h-4 flex items-center justify-center"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Upload Button */}
                <label className="w-full py-2.5 border border-black border-dashed bg-white active:bg-neutral-50 cursor-pointer flex justify-center items-center gap-1.5 text-[10px] font-bold uppercase">
                  <FiUpload /> Pilih Gambar
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
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Jumlah Opsi Pilihan</label>
                <select
                  value={q.options.length}
                  onChange={(e) => onOptionCountChange(q.id, parseInt(e.target.value))}
                  className="border border-black px-2 py-1 text-[10px] font-bold bg-white text-black focus:outline-none"
                >
                  <option value={2}>2 Pilihan (A - B)</option>
                  <option value={3}>3 Pilihan (A - C)</option>
                  <option value={4}>4 Pilihan (A - D)</option>
                  <option value={5}>5 Pilihan (A - E)</option>
                </select>
              </div>

              {/* Options inputs */}
              <div className="flex flex-col gap-2">
                <p className="text-[9px] font-bold uppercase text-neutral-600 mb-0.5">Opsi Jawaban & Checklist Jawaban Benar</p>
                {q.options.map((opt, optIdx) => {
                  const optionLetter = String.fromCharCode(65 + optIdx);
                  const isCorrect = q.correctAnswers.includes(optIdx);
                  return (
                    <div key={optIdx} className="flex gap-2 items-center">
                      {/* Checklist box */}
                      <button
                        type="button"
                        onClick={() => onToggleCorrectAnswer(q.id, optIdx)}
                        className={`w-6 h-6 border border-black flex items-center justify-center cursor-pointer text-xs font-bold ${
                          isCorrect ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
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
                        className="flex-1 px-2.5 py-1.5 border border-black text-xs bg-white text-black focus:outline-none"
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
            className="w-full py-3 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold uppercase"
          >
            <FiPlus /> Tambah Soal
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="w-full mt-8 mb-2">
        <button
          onClick={onSave}
          className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5"
        >
          Simpan Kuis
        </button>
      </div>
    </div>
  );
}
