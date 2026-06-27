import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialDetailApi } from "../api/api";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiRefreshCw, FiBookOpen } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function MateriDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flipbook states
  const [viewMode, setViewMode] = useState<"flipbook" | "classic">("flipbook");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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

  // Construct pages list
  const pages: any[] = [];
  if (material) {
    pages.push({ type: "cover", title: material.title });
    material.blocks.forEach((block: any) => {
      pages.push({ type: "block", block: block });
    });
    pages.push({ type: "end", title: material.title });
  }

  // Keyboard navigation for flipbook
  useEffect(() => {
    if (viewMode !== "flipbook" || pages.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, pages.length]);

  // Touch handlers for swiping pages
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swipe left -> Next Page
      setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
    } else if (diff < -50) {
      // Swipe right -> Prev Page
      setCurrentPage((prev) => Math.max(0, prev - 1));
    }
    setTouchStart(null);
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans overflow-x-hidden">
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

          {/* Mode Selector */}
          {!loading && !error && material && (
            <div className="w-full flex bg-white p-1 mt-4 border border-black">
              <button
                onClick={() => setViewMode("flipbook")}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 border transition-none ${
                  viewMode === "flipbook"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-transparent hover:bg-neutral-100"
                }`}
              >
                <FiBookOpen size={13} /> Mode Flipbook
              </button>
              <button
                onClick={() => setViewMode("classic")}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 border transition-none ${
                  viewMode === "classic"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-transparent hover:bg-neutral-100"
                }`}
              >
                📜 Mode Klasik
              </button>
            </div>
          )}

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
              viewMode === "flipbook" ? (
                <div className="flex flex-col items-center w-full">
                  {/* Progress bar */}
                  <div className="w-full bg-white border border-black h-2.5 p-0.5 mb-5">
                    <div 
                      className="bg-black h-full"
                      style={{ width: `${(currentPage / (pages.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* 3D Book Container */}
                  <div 
                    className="w-full h-[470px] relative select-none"
                    style={{ perspective: "1500px" }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {pages.map((page, index) => {
                      const isFlipped = index < currentPage;
                      const isCurrent = index === currentPage;
                      const isNext = index === currentPage + 1;
                      
                      let zIndex = 0;
                      if (isCurrent) {
                        zIndex = 20;
                      } else if (isFlipped) {
                        zIndex = index;
                      } else {
                        zIndex = pages.length - index;
                      }

                      // Only render immediate neighbors to optimize performance
                      const shouldRender = isCurrent || isFlipped || isNext || index === currentPage - 1;
                      if (!shouldRender) return null;

                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 w-full h-full bg-white border border-black overflow-hidden"
                          style={{
                            transformOrigin: "left center",
                            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.8s",
                            transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
                            backfaceVisibility: "hidden",
                            zIndex: zIndex,
                            pointerEvents: isCurrent ? "auto" : "none",
                          }}
                        >
                          {/* Page Internal Content */}
                          <div className="w-full h-full p-6 flex flex-col justify-between bg-white relative">
                            {page.type === "cover" && (
                              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                                <div className="w-16 h-16 bg-white border border-black flex justify-center items-center mb-6">
                                  <FiBookOpen size={24} className="text-black" />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Materi Belajar</p>
                                <h1 className="text-xl font-bold uppercase tracking-tight text-black border-b border-black pb-4 mb-4">
                                  {page.title}
                                </h1>
                                <p className="text-xs text-black max-w-[280px] leading-relaxed mb-8">
                                  Gunakan tombol navigasi di bawah atau usap layar untuk membaca halaman demi halaman.
                                </p>
                                <button
                                  onClick={() => setCurrentPage(1)}
                                  className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider text-xs border border-black hover:bg-white hover:text-black transition-none rounded-none cursor-pointer"
                                >
                                  Mulai Membaca
                                </button>
                              </div>
                            )}

                            {page.type === "block" && (
                              <div className="flex flex-col h-full justify-between">
                                {/* Page Header */}
                                <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-black truncate max-w-[180px]">
                                    {material.title}
                                  </span>
                                  <span className="text-[9px] font-bold text-black">
                                    Halaman {index} dari {pages.length - 2}
                                  </span>
                                </div>

                                {/* Main Content (Scrollable if overflow) */}
                                <div className="flex-1 flex flex-col justify-center overflow-y-auto py-2 pr-1">
                                  {page.block.type === "text" && (
                                    <p className="text-sm text-black whitespace-pre-wrap leading-relaxed text-justify">
                                      {page.block.textContent}
                                    </p>
                                  )}
                                  {page.block.type === "image" && (
                                    <div className="w-full border border-black p-1 bg-white flex justify-center items-center">
                                      <img
                                        src={`${API_URL}${page.block.mediaUrl}`}
                                        alt="Visual Pendukung"
                                        className="max-h-[240px] w-auto object-contain block"
                                      />
                                    </div>
                                  )}
                                  {page.block.type === "audio" && (
                                    <div className="w-full border border-black p-3 bg-neutral-50 flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-neutral-500">
                                          Audio Penjelasan
                                        </span>
                                      </div>
                                      <audio
                                        src={`${API_URL}${page.block.mediaUrl}`}
                                        controls
                                        className="w-full custom-audio"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Page Footer */}
                                <div className="border-t border-black pt-3 mt-4 flex justify-between items-center text-[10px] text-black font-mono">
                                  <span>SI-ZAT ESD</span>
                                  <span>•</span>
                                </div>
                              </div>
                            )}

                            {page.type === "end" && (
                              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                                <div className="w-16 h-16 bg-white border border-black flex justify-center items-center mb-6">
                                  <span className="text-2xl">🎉</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Selesai Membaca</p>
                                <h1 className="text-lg font-bold uppercase tracking-tight text-black mb-4">
                                  Materi Selesai!
                                </h1>
                                <p className="text-xs text-black max-w-[280px] leading-relaxed mb-8">
                                  Anda telah menyelesaikan pembacaan materi.
                                </p>
                                <div className="flex flex-col gap-3 w-full max-w-[220px]">
                                  <button
                                    onClick={() => setCurrentPage(0)}
                                    className="w-full py-2.5 bg-white text-black border border-black font-bold uppercase tracking-wider text-[10px] hover:bg-neutral-100 transition-none rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <FiRefreshCw size={11} /> Baca Kembali
                                  </button>
                                  <button
                                    onClick={() => navigate("/materi")}
                                    className="w-full py-2.5 bg-black text-white border border-black font-bold uppercase tracking-wider text-[10px] hover:bg-white hover:text-black transition-none rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <FiArrowLeft size={11} /> Kembali ke Daftar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Flipbook Navigation Controls */}
                  <div className="flex justify-between items-center w-full mt-6 gap-4">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      className="flex-1 py-2.5 border border-black text-black font-bold uppercase tracking-wider text-xs hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black cursor-pointer rounded-none flex items-center justify-center gap-1.5 transition-none"
                    >
                      <FiChevronLeft /> Sebelumnya
                    </button>
                    <span className="text-xs font-bold font-mono text-black">
                      {currentPage} / {pages.length - 1}
                    </span>
                    <button
                      disabled={currentPage === pages.length - 1}
                      onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                      className="flex-1 py-2.5 bg-black text-white font-bold uppercase tracking-wider text-xs border border-black hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-white cursor-pointer rounded-none flex items-center justify-center gap-1.5 transition-none"
                    >
                      Selanjutnya <FiChevronRight />
                    </button>
                  </div>
                </div>
              ) : (
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
              )
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
