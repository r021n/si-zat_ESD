import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TaskSubmission {
  id: string;
  title: string;
  answer: string;
  fileName: string;
  submittedAt: string;
}

export default function PengumpulanTugas() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  
  // Form state
  const [title, setTitle] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    const cached = localStorage.getItem("sizat_task_submissions");
    if (cached) {
      try {
        setSubmissions(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !answer.trim()) {
      alert("Mohon isi judul dan jawaban tugas.");
      return;
    }

    const newSubmission: TaskSubmission = {
      id: Date.now().toString(),
      title: title.trim(),
      answer: answer.trim(),
      fileName: fileName || "Tidak ada berkas terlampir",
      submittedAt: new Date().toLocaleString("id-ID")
    };

    const updated = [newSubmission, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("sizat_task_submissions", JSON.stringify(updated));

    // Reset form
    setTitle("");
    setAnswer("");
    setFileName("");
    alert("Tugas berhasil dikumpulkan!");
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus pengumpulan tugas ini?");
    if (!confirmDelete) return;

    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem("sizat_task_submissions", JSON.stringify(updated));
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Berpikir Sistem</p>
            <h1 className="text-sm font-bold uppercase tracking-wide">Pengumpulan Tugas</h1>
          </div>
          <button 
            onClick={() => navigate("/kuis/berpikir-sistem")}
            className="px-2.5 py-1 border border-black text-[10px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white transition-none cursor-pointer"
          >
            Kembali
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col gap-6 py-6 overflow-y-auto max-h-[70vh] custom-scroll">
          
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 border border-black p-4 bg-neutral-50">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1">
              Form Pengumpulan
            </h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-neutral-600">Judul Tugas</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Analisis Lingkungan Udara"
                className="w-full p-2 border border-black text-xs font-medium focus:outline-none focus:bg-neutral-100 transition-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-neutral-600">Jawaban / Analisis Deskriptif</label>
              <textarea 
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tuliskan analisis berpikir sistem Anda..."
                className="w-full p-2 border border-black text-xs font-medium focus:outline-none focus:bg-neutral-100 resize-none transition-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-neutral-600">Unggah Lampiran (Opsional)</label>
              <div className="w-full relative border border-black bg-white p-2 flex justify-between items-center text-xs">
                <span className="truncate max-w-[200px] text-neutral-500 font-medium">
                  {fileName || "Pilih berkas..."}
                </span>
                <label className="cursor-pointer border border-black px-2 py-0.5 font-bold uppercase text-[9px] active:bg-black active:text-white transition-none">
                  Cari
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 mt-2 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-none cursor-pointer"
            >
              Kirim Tugas
            </button>
          </form>

          {/* List of Submissions */}
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1">
              Riwayat Pengumpulan ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 border border-dashed border-neutral-300">
                Belum ada tugas yang dikumpulkan.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="w-full p-3 border border-black flex flex-col gap-2 bg-white">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold uppercase tracking-wide leading-tight truncate max-w-[200px]">
                        {sub.title}
                      </h3>
                      <button 
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="text-[9px] font-bold uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-black transition-none cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed font-serif whitespace-pre-wrap">
                      {sub.answer}
                    </p>

                    <div className="h-[1px] bg-neutral-200 w-full my-0.5"></div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                      <span className="truncate max-w-[150px]">📎 {sub.fileName}</span>
                      <span>⏱ {sub.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Info */}
        <div className="w-full text-center mt-4">
          <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
            SI-ZAT ESD &bull; Berpikir Sistem
          </p>
        </div>

      </div>
    </div>
  );
}
