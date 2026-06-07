import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialDetailApi } from "../api/api";
import { FiArrowLeft } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function MateriDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMaterialDetail = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await getMaterialDetailApi(token, id);
      setMaterial(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat detail materi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadMaterialDetail();
  }, [user, token, id, navigate]);

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        <div>
          {/* Header */}
          <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Materi Belajar</p>
              <h1 className="text-sm font-bold uppercase tracking-wide truncate max-w-[300px]">
                {loading ? "Memuat..." : material?.title}
              </h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-4 py-12 text-center">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                  Memuat konten...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 border border-black border-dashed text-xs text-red-600 uppercase font-bold">
                {error}
              </div>
            ) : material ? (
              <div className="flex flex-col gap-6">
                {/* Title */}
                <h1 className="text-2xl font-bold border-b-2 border-black pb-2 leading-tight">
                  {material.title}
                </h1>

                {/* Blocks Stack */}
                <div className="flex flex-col gap-5">
                  {material.blocks.map((block: any, idx: number) => {
                    if (block.type === "text") {
                      return (
                        <p key={block.id || idx} className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed text-justify">
                          {block.textContent}
                        </p>
                      );
                    } else if (block.type === "image") {
                      return (
                        <div key={block.id || idx} className="w-full border border-black p-1 bg-white">
                          <img
                            src={`${API_URL}${block.mediaUrl}`}
                            alt="Materi Visual"
                            className="w-full h-auto object-contain block"
                          />
                        </div>
                      );
                    } else if (block.type === "audio") {
                      return (
                        <div key={block.id || idx} className="w-full border border-black p-3 bg-neutral-50 flex flex-col gap-2">
                          <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-neutral-500">
                            Audio Penjelasan
                          </p>
                          <audio
                            src={`${API_URL}${block.mediaUrl}`}
                            controls
                            className="w-full custom-audio"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Back Button */}
        <div className="w-full mt-10 mb-2">
          <button
            onClick={() => navigate("/materi")}
            className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5 transition-none"
          >
            <FiArrowLeft /> Kembali ke Daftar
          </button>
        </div>

      </div>
    </div>
  );
}
