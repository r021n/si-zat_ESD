import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { 
  getTaskSubmissionsApi, 
  createTaskSubmissionApi, 
  deleteTaskSubmissionApi 
} from "../api/api";

interface TaskSubmission {
  id: string;
  userId: number;
  studentName: string;
  studentClass: string;
  title: string;
  answer: string;
  fileName: string;
  submittedAt: string;
}

// Canvas-based image compression helper
function compressImage(file: File, maxSizeBytes: number = 200 * 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file); // Fallback to original if not an image
      return;
    }
    
    if (file.size <= maxSizeBytes) {
      resolve(file); // No compression needed
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Downscale image dimensions if too large to limit memory
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // Fallback
                return;
              }

              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                resolve(blob);
              } else {
                quality -= 0.1;
                // If quality is low, also scale down resolution
                if (quality < 0.5) {
                  canvas.width = Math.round(canvas.width * 0.85);
                  canvas.height = Math.round(canvas.height * 0.85);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                attemptCompression();
              }
            },
            "image/jpeg",
            quality
          );
        };

        attemptCompression();
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function PengumpulanTugas() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form state
  const [title, setTitle] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  
  // Compressing indicators
  const [compressing, setCompressing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await getTaskSubmissionsApi(token || "");
        setSubmissions(data);
      } catch (err) {
        console.error("Gagal memuat riwayat tugas:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setOriginalSize((selectedFile.size / 1024).toFixed(1) + " KB");
      setCompressing(true);
      
      try {
        const compressed = await compressImage(selectedFile);
        setFileBlob(compressed);
        setCompressedSize((compressed.size / 1024).toFixed(1) + " KB");
      } catch (err) {
        console.error("Gagal mengompresi gambar:", err);
        setFileBlob(selectedFile); // Fallback
        setCompressedSize((selectedFile.size / 1024).toFixed(1) + " KB");
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !answer.trim()) {
      alert("Mohon isi judul dan jawaban tugas.");
      return;
    }

    if (compressing) {
      alert("Sedang mengompresi gambar, mohon tunggu sebentar...");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("answer", answer.trim());
      
      if (fileBlob) {
        // Safe upload file name, ensure it is .jpg
        const uploadName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        formData.append("file", fileBlob, uploadName);
        formData.append("fileName", uploadName);
      } else {
        formData.append("fileName", "Tidak ada berkas terlampir");
      }

      const response = await createTaskSubmissionApi(token || "", formData);
      
      // Update local state list
      setSubmissions([response.submission, ...submissions]);

      // Reset form
      setTitle("");
      setAnswer("");
      setFileName("");
      setFileBlob(null);
      setOriginalSize("");
      setCompressedSize("");
      alert("Tugas berhasil dikumpulkan!");
    } catch (err: any) {
      alert(err.message || "Gagal mengumpulkan tugas.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus pengumpulan tugas ini?");
    if (!confirmDelete) return;

    try {
      await deleteTaskSubmissionApi(token || "", id);
      setSubmissions(submissions.filter((s) => s.id !== id));
      alert("Tugas berhasil dihapus!");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus tugas.");
    }
  };

  // Filter history to only show this user's submissions
  const mySubmissions = submissions.filter((sub) => sub.userId === user?.id);

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
              <label className="text-[10px] font-bold uppercase text-neutral-600">Unggah Lampiran Gambar (Opsional)</label>
              <div className="w-full relative border border-black bg-white p-2 flex justify-between items-center text-xs">
                <span className="truncate max-w-[200px] text-neutral-500 font-medium">
                  {compressing ? "Mengompresi..." : fileName || "Pilih gambar..."}
                </span>
                <label className="cursor-pointer border border-black px-2 py-0.5 font-bold uppercase text-[9px] active:bg-black active:text-white transition-none">
                  Cari
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                    disabled={compressing}
                  />
                </label>
              </div>
              {compressedSize && (
                <p className="text-[9px] font-mono text-green-600 mt-0.5">
                  Ukuran: {originalSize} &rarr; {compressedSize} (&lt; 200 KB)
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={compressing}
              className={`w-full py-2.5 mt-2 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-none cursor-pointer ${compressing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {compressing ? "Memproses Lampiran..." : "Kirim Tugas"}
            </button>
          </form>

          {/* List of Submissions */}
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-1">
              Riwayat Pengumpulan Saya ({mySubmissions.length})
            </h2>

            {loading ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 border border-dashed border-neutral-300">
                Memuat riwayat pengumpulan...
              </p>
            ) : mySubmissions.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 border border-dashed border-neutral-300">
                Belum ada tugas yang Anda kumpulkan.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {mySubmissions.map((sub) => (
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

                    {/* Thumbnail Image Preview if exists */}
                    {sub.fileName && sub.fileName !== "Tidak ada berkas terlampir" && (
                      <div className="mt-2 border border-neutral-300 overflow-hidden max-h-[140px] bg-neutral-50 flex justify-center items-center rounded-none">
                        <img 
                          src={`${API_URL}/api/tasks/submissions/${sub.id}/image`}
                          alt={sub.title}
                          className="max-h-[140px] w-auto object-contain"
                          onError={(e) => {
                            // Hide image on load error
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

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

