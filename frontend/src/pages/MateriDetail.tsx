import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialDetailApi } from "../api/api";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiRefreshCw, FiBookOpen } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

const parseFormattedText = (text: string) => {
  if (!text) return "";
  // Escape HTML entities to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
  
  // Restore allowed tags
  html = html
    .replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/g, "<strong>$1</strong>")
    .replace(/&lt;i&gt;([\s\S]*?)&lt;\/i&gt;/g, "<em>$1</em>")
    .replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/g, "<span class='underline'>$1</span>")
    .replace(/&lt;s&gt;([\s\S]*?)&lt;\/s&gt;/g, "<del>$1</del>");

  // Restore alignment tags
  html = html
    .replace(/&lt;left&gt;([\s\S]*?)&lt;\/left&gt;/g, "<div class='text-left w-full'>$1</div>")
    .replace(/&lt;center&gt;([\s\S]*?)&lt;\/center&gt;/g, "<div class='text-center w-full'>$1</div>")
    .replace(/&lt;right&gt;([\s\S]*?)&lt;\/right&gt;/g, "<div class='text-right w-full'>$1</div>")
    .replace(/&lt;justify&gt;([\s\S]*?)&lt;\/justify&gt;/g, "<div class='text-justify w-full'>$1</div>");

  // Restore links
  html = html.replace(/&lt;a href=["']([\s\S]*?)["']&gt;([\s\S]*?)&lt;\/a&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#8C66FF] hover:underline font-bold break-all">$2</a>');

  return <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap leading-relaxed text-justify" />;
};

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  let cleanedUrl = url.trim();
  const iframeMatch = cleanedUrl.match(/src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})/i);
  if (iframeMatch) return iframeMatch[1];
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleanedUrl.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  if (cleanedUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanedUrl)) {
    return cleanedUrl;
  }
  
  return null;
};


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
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        
        <div>
          {/* Header */}
          <div className="w-full flex justify-between items-center mt-4 pb-4 border-b border-[#F0EDFF]/50">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Materi Belajar</p>
              <h1 className="text-sm font-extrabold text-[#2C2B30] truncate max-w-[300px] leading-tight">
                {loading ? "Memuat..." : material?.title}
              </h1>
            </div>
          </div>

          {/* Mode Selector */}
          {!loading && !error && material && (
            <div className="w-full flex bg-[#F0ECFF]/50 p-1.5 mt-4 border border-[#F0EDFF] rounded-2xl">
              <button
                onClick={() => setViewMode("flipbook")}
                className={`flex-1 py-2 px-3 text-center text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 rounded-xl transition-none ${
                  viewMode === "flipbook"
                    ? "bg-white text-[#8C66FF] shadow-sm"
                    : "bg-transparent text-[#9C98A6]"
                }`}
              >
                <FiBookOpen size={13} /> Mode Flipbook
              </button>
              <button
                onClick={() => setViewMode("classic")}
                className={`flex-1 py-2 px-3 text-center text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 rounded-xl transition-none ${
                  viewMode === "classic"
                    ? "bg-white text-[#8C66FF] shadow-sm"
                    : "bg-transparent text-[#9C98A6]"
                }`}
              >
                📜 Mode Klasik
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-3 py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#9C98A6]">
                  Memuat konten...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4 bg-white rounded-[24px] border border-[#FFEAEA] text-xs text-[#FF5E8C] uppercase font-bold tracking-wider shadow-sm">
                {error}
              </div>
            ) : material ? (
              viewMode === "flipbook" ? (
                <div className="flex flex-col items-center w-full">
                  {/* Progress bar */}
                  <div className="w-full bg-[#FAF9FF] border border-[#F0EDFF] h-2.5 p-0.5 mb-5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#8C66FF] h-full rounded-full transition-none"
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
                          className="absolute top-0 left-0 w-full h-full bg-white border border-[#F0EDFF] overflow-hidden rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
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
                                <div className="w-16 h-16 bg-[#F0ECFF] rounded-2xl flex justify-center items-center mb-6 shadow-inner text-[#8C66FF]">
                                  <FiBookOpen size={24} />
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold mb-2">Materi Belajar</p>
                                <h1 className="text-xl font-extrabold uppercase tracking-tight text-[#2C2B30] border-b border-[#F0EDFF] pb-4 mb-4 text-center w-full">
                                  {page.title}
                                </h1>
                                <p className="text-xs text-[#9C98A6] max-w-[280px] leading-relaxed mb-8 text-center font-medium">
                                  Gunakan tombol navigasi di bawah atau usap layar untuk membaca halaman demi halaman.
                                </p>
                                <button
                                  onClick={() => setCurrentPage(1)}
                                  className="px-6 py-3 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 transition-none cursor-pointer"
                                >
                                  Mulai Membaca
                                </button>
                              </div>
                            )}

                            {page.type === "block" && (
                              <div className="flex flex-col h-full justify-between">
                                {/* Page Header */}
                                <div className="flex justify-between items-center border-b border-[#F0EDFF]/50 pb-2 mb-4">
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#9C98A6] truncate max-w-[180px]">
                                    {material.title}
                                  </span>
                                  <span className="text-[9px] font-extrabold text-[#8C66FF] bg-[#F0ECFF] px-2 py-0.5 rounded-full">
                                    Halaman {index} / {pages.length - 2}
                                  </span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 flex flex-col justify-center overflow-y-auto py-2 pr-1">
                                  {page.block.type === "text" && (
                                    <div className="text-xs text-[#2C2B30] font-medium leading-relaxed">
                                      {parseFormattedText(page.block.textContent)}
                                    </div>
                                  )}
                                  {page.block.type === "image" && (
                                    <div className="flex flex-col gap-2.5 items-center w-full">
                                      <div className="w-full border border-[#F0EDFF] p-2 bg-white rounded-2xl overflow-hidden shadow-sm flex justify-center items-center">
                                        <img
                                          src={`${API_URL}${page.block.mediaUrl}`}
                                          alt="Visual Pendukung"
                                          className="max-h-[170px] w-auto object-contain block rounded-lg"
                                        />
                                      </div>
                                      {page.block.textContent && (
                                        <div className="text-xs text-[#2C2B30] font-medium leading-relaxed text-center px-1">
                                          {parseFormattedText(page.block.textContent)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {page.block.type === "audio" && (
                                    <div className="w-full border border-[#F0EDFF] p-4 bg-[#FAF9FF] rounded-2xl flex flex-col gap-2.5 shadow-sm text-left">
                                      <p className="text-[9px] uppercase tracking-widest font-bold text-[#9C98A6]">
                                        Audio Penjelasan
                                      </p>
                                      <audio
                                        src={`${API_URL}${page.block.mediaUrl}`}
                                        controls
                                        className="w-full custom-audio"
                                      />
                                      {page.block.textContent && (
                                        <div className="text-xs text-[#2C2B30] font-medium leading-relaxed mt-1">
                                          {parseFormattedText(page.block.textContent)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {page.block.type === "video youtube" && (
                                    <div className="flex flex-col gap-2.5 items-center w-full">
                                      {(() => {
                                        const ytId = getYoutubeId(page.block.textContent);
                                        if (ytId) {
                                          return (
                                            <div className="w-full border border-[#F0EDFF] p-2 bg-white rounded-2xl overflow-hidden shadow-sm">
                                              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                                                <iframe
                                                  src={`https://www.youtube.com/embed/${ytId}`}
                                                  title="YouTube video player"
                                                  frameBorder="0"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                  allowFullScreen
                                                  className="absolute top-0 left-0 w-full h-full"
                                                ></iframe>
                                              </div>
                                            </div>
                                          );
                                        }
                                        return (
                                          <p className="text-xs text-[#FF5E8C] font-semibold text-center">
                                            Video YouTube tidak dapat dimuat.
                                          </p>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>


                                {/* Page Footer */}
                                <div className="border-t border-[#F0EDFF]/50 pt-3 mt-4 flex justify-between items-center text-[10px] text-[#9C98A6] font-bold uppercase tracking-wider">
                                  <span>SI-ZAT ESD</span>
                                  <span>•</span>
                                </div>
                              </div>
                            )}

                            {page.type === "end" && (
                              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                                <div className="w-16 h-16 bg-[#E6F8F6] text-[#2C8578] rounded-2xl flex justify-center items-center mb-6 shadow-inner text-2xl">
                                  🎉
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold mb-2">Selesai Membaca</p>
                                <h1 className="text-lg font-black uppercase tracking-tight text-[#2C2B30] mb-2 text-center">
                                  Materi Selesai!
                                  </h1>
                                <p className="text-xs text-[#9C98A6] max-w-[280px] leading-relaxed mb-8 text-center font-medium">
                                  Anda telah menyelesaikan pembacaan materi.
                                </p>
                                <div className="flex flex-col gap-3 w-full max-w-[220px]">
                                  <button
                                    onClick={() => setCurrentPage(0)}
                                    className="w-full py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm transition-none cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <FiRefreshCw size={11} /> Baca Kembali
                                  </button>
                                  <button
                                    onClick={() => navigate("/materi")}
                                    className="w-full py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 transition-none cursor-pointer flex items-center justify-center gap-1.5"
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
                      className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-none"
                    >
                      <FiChevronLeft /> Sebelumnya
                    </button>
                    <span className="text-xs font-bold font-mono text-[#2C2B30]">
                      {currentPage} / {pages.length - 1}
                    </span>
                    <button
                      disabled={currentPage === pages.length - 1}
                      onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                      className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1.5 transition-none"
                    >
                      Selanjutnya <FiChevronRight />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 w-full text-left">
                  {/* Title */}
                  <h1 className="text-xl font-extrabold text-[#2C2B30] border-b border-[#F0EDFF]/80 pb-3 leading-tight">
                    {material.title}
                  </h1>

                  {/* Blocks Stack */}
                  <div className="flex flex-col gap-5 w-full">
                    {material.blocks.map((block: any, idx: number) => {
                      if (block.type === "text") {
                        return (
                          <div key={block.id || idx} className="bg-white rounded-[24px] p-5 border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] w-full">
                            <div className="text-xs text-[#2C2B30] font-medium leading-relaxed">
                              {parseFormattedText(block.textContent)}
                            </div>
                          </div>
                        );
                      } else if (block.type === "image") {
                        return (
                          <div key={block.id || idx} className="w-full border border-[#F0EDFF] p-2 bg-white rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center gap-3">
                            <img
                              src={`${API_URL}${block.mediaUrl}`}
                              alt="Materi Visual"
                              className="w-full h-auto object-contain block rounded-2xl"
                            />
                            {block.textContent && (
                              <div className="text-xs text-[#2C2B30] font-medium leading-relaxed text-center px-4 pb-2 w-full">
                                {parseFormattedText(block.textContent)}
                              </div>
                            )}
                          </div>
                        );
                      } else if (block.type === "audio") {
                        return (
                          <div key={block.id || idx} className="w-full border border-[#F0EDFF] p-4 bg-white rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
                            <p className="text-[9px] uppercase tracking-widest font-bold text-[#9C98A6]">
                              Audio Penjelasan
                            </p>
                            <audio
                              src={`${API_URL}${block.mediaUrl}`}
                              controls
                              className="w-full custom-audio"
                            />
                            {block.textContent && (
                              <div className="text-xs text-[#2C2B30] font-medium leading-relaxed mt-1">
                                {parseFormattedText(block.textContent)}
                              </div>
                            )}
                          </div>
                        );
                      } else if (block.type === "video youtube") {
                        return (
                          <div key={block.id || idx} className="w-full border border-[#F0EDFF] p-2 bg-white rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center gap-3">
                            {(() => {
                              const ytId = getYoutubeId(block.textContent);
                              if (ytId) {
                                return (
                                  <div className="w-full relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#F0EDFF]">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${ytId}`}
                                      title="YouTube video player"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      className="absolute top-0 left-0 w-full h-full"
                                    ></iframe>
                                  </div>
                                );
                              }
                              return (
                                <p className="text-xs text-[#FF5E8C] font-semibold text-center p-4">
                                  Video YouTube tidak dapat dimuat.
                                </p>
                              );
                            })()}
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
            className="w-full py-4 bg-white border border-[#F0EDFF] text-[#8C66FF] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2"
          >
            <FiArrowLeft /> Kembali ke Daftar
          </button>
        </div>

      </div>
    </div>
  );
}

