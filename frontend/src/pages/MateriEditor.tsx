import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialDetailApi, createMaterialApi, updateMaterialApi } from "../api/api";
import { FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiSave, FiX, FiType, FiImage, FiMusic } from "react-icons/fi";

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

  return <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap text-justify leading-relaxed" />;
};

interface Block {
  id: string;
  type: "text" | "image" | "audio";
  textContent: string;
  file: File | null;
  mediaUrl?: string;
  keepExisting: boolean;
}

export default function MateriEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const isEditMode = !!id;
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const showAlert = (message: string, title = "Info", onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = "Konfirmasi") => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm,
    });
  };

  // Redirect non-admins
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const isAdmin = user.status.toLowerCase() === "admin" || user.email.toLowerCase().includes("admin");
    if (!isAdmin) {
      navigate("/menu");
    }
  }, [user, navigate]);

  // Load existing material if editing
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const data = await getMaterialDetailApi(token, id);
        setTitle(data.title);
        const mappedBlocks = data.blocks.map((b: any) => ({
          id: b.id,
          type: b.type,
          textContent: b.textContent || "",
          file: null,
          mediaUrl: b.mediaUrl,
          keepExisting: true
        }));
        setBlocks(mappedBlocks);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat detail materi untuk diedit.");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchMaterial();
    }
  }, [token, id, isEditMode]);

  const addTextBlock = () => {
    const newBlock: Block = {
      id: `blk-text-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "text",
      textContent: "",
      file: null,
      keepExisting: false
    };
    setBlocks([...blocks, newBlock]);
  };

  const addImageBlock = () => {
    const newBlock: Block = {
      id: `blk-img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "image",
      textContent: "",
      file: null,
      keepExisting: false
    };
    setBlocks([...blocks, newBlock]);
  };

  const addAudioBlock = () => {
    const newBlock: Block = {
      id: `blk-aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "audio",
      textContent: "",
      file: null,
      keepExisting: false
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockText = (blockId: string, text: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId ? { ...b, textContent: text } : b))
    );
  };

  const insertFormat = (blockId: string, tag: "b" | "i" | "u" | "s") => {
    const textarea = document.getElementById(`textarea-${blockId}`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = `<${tag}>${selectedText}</${tag}>`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    updateBlockText(blockId, newText);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tag.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  };

  const handleFileUpload = (blockId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setBlocks(prev =>
      prev.map(b => (b.id === blockId ? { ...b, file, keepExisting: false } : b))
    );
  };

  const removeFile = (blockId: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === blockId ? { ...b, file: null, mediaUrl: undefined, keepExisting: false } : b))
    );
  };

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showAlert("Judul materi harus diisi!", "Peringatan");
      return;
    }

    if (blocks.length === 0) {
      showAlert("Materi harus memiliki minimal 1 blok konten!", "Peringatan");
      return;
    }

    // Verify all media blocks have files
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "text" && !b.textContent.trim()) {
        showAlert(`Konten teks pada blok #${i + 1} tidak boleh kosong.`, "Peringatan");
        return;
      }
      if (b.type !== "text" && !b.file && (!b.keepExisting || !b.mediaUrl)) {
        showAlert(`Harap unggah file media untuk blok ${b.type === "image" ? "Gambar" : "Audio"} #${i + 1}.`, "Peringatan");
        return;
      }
    }

    if (!token) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);

      const blocksPayload = blocks.map(b => {
        const payloadBlock: any = {
          id: b.id,
          type: b.type
        };
        if (b.type === "text") {
          payloadBlock.textContent = b.textContent;
        } else {
          if (b.file) {
            payloadBlock.fileKey = `file_${b.id}`;
          } else if (b.keepExisting && b.mediaUrl) {
            payloadBlock.keepExisting = true;
          }
        }
        return payloadBlock;
      });

      formData.append("blocks", JSON.stringify(blocksPayload));

      blocks.forEach(b => {
        if (b.file) {
          formData.append(`file_${b.id}`, b.file);
        }
      });

      if (isEditMode && id) {
        await updateMaterialApi(token, id, formData);
        showAlert("Materi berhasil diperbarui!", "Sukses", () => navigate("/materi"));
      } else {
        await createMaterialApi(token, formData);
        showAlert("Materi baru berhasil dibuat!", "Sukses", () => navigate("/materi"));
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || "Gagal menyimpan materi.", "Gagal");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    showConfirm(
      "Batal mengedit dan buang semua perubahan?",
      () => {
        navigate("/materi");
      },
      "Batal Edit"
    );
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
              <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Panel Admin</p>
              <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
                {isEditMode ? "Edit Materi" : "Buat Materi"}
              </h1>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-full bg-[#FFEAEA] text-[#FF5E8C] cursor-pointer flex items-center justify-center text-xs transition-none shadow-sm"
              title="Batal"
            >
              <FiX />
            </button>
          </div>

          {/* Editor Area */}
          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-3 py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#9C98A6]">
                  Memuat data...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4 bg-white rounded-[24px] border border-[#FFEAEA] text-xs text-[#FF5E8C] uppercase font-bold tracking-wider shadow-sm">
                {error}
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full text-left">
                {/* Large Title Input */}
                <input
                  type="text"
                  placeholder="Judul Materi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-extrabold border-b border-[#F0EDFF] w-full focus:outline-none focus:border-[#8C66FF] py-2 placeholder-neutral-400 text-[#2C2B30] bg-transparent"
                />

                {/* Blocks List */}
                <div className="flex flex-col gap-5 max-h-[360px] overflow-y-auto pr-1">
                  {blocks.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white rounded-[24px] border border-dashed border-[#F0EDFF] text-[10px] text-[#9C98A6] uppercase font-bold tracking-wider">
                      Konten Kosong. Gunakan tombol di bawah untuk menambah blok.
                    </div>
                  ) : (
                    blocks.map((block, index) => (
                      <div key={block.id} className="w-full bg-white rounded-[24px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-3 relative">
                        {/* Block Action Bar */}
                        <div className="flex items-center justify-between border-b border-[#F0EDFF]/50 pb-2 mb-1">
                          <span className="font-bold text-[9px] uppercase tracking-widest text-[#9C98A6] flex items-center gap-1.5">
                            {block.type === "text" && <FiType className="text-xs text-[#8C66FF]" />}
                            {block.type === "image" && <FiImage className="text-xs text-[#FF9D42]" />}
                            {block.type === "audio" && <FiMusic className="text-xs text-[#D95276]" />}
                            Blok {block.type.toUpperCase()} #{index + 1}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveBlock(index, "up")}
                              disabled={index === 0}
                              className="w-7 h-7 rounded-lg bg-[#FAF9FF] text-[#8C66FF] disabled:opacity-30 active:bg-[#8C66FF] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none"
                              title="Pindahkan Ke Atas"
                            >
                              <FiArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(index, "down")}
                              disabled={index === blocks.length - 1}
                              className="w-7 h-7 rounded-lg bg-[#FAF9FF] text-[#8C66FF] disabled:opacity-30 active:bg-[#8C66FF] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none"
                              title="Pindahkan Ke Bawah"
                            >
                              <FiArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="w-7 h-7 rounded-lg bg-[#FFEAEA] text-[#FF5E8C] active:bg-[#FF5E8C] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none"
                              title="Hapus Blok"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Block Content Inputs */}
                        {block.type === "text" ? (
                          <div className="flex flex-col gap-2.5 w-full">
                            {/* Formatting Toolbar */}
                            <div className="flex gap-1.5 p-1 bg-[#FAF9FF] border border-[#F0EDFF] rounded-xl self-start">
                              <button
                                type="button"
                                onClick={() => insertFormat(block.id, "b")}
                                className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] font-extrabold text-xs rounded-lg flex items-center justify-center transition-none cursor-pointer"
                                title="Tebal (Bold)"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onClick={() => insertFormat(block.id, "i")}
                                className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] italic font-bold text-xs rounded-lg flex items-center justify-center transition-none cursor-pointer"
                                title="Miring (Italic)"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onClick={() => insertFormat(block.id, "u")}
                                className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] underline font-bold text-xs rounded-lg flex items-center justify-center transition-none cursor-pointer"
                                title="Garis Bawah (Underline)"
                              >
                                U
                              </button>
                              <button
                                type="button"
                                onClick={() => insertFormat(block.id, "s")}
                                className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] line-through font-bold text-xs rounded-lg flex items-center justify-center transition-none cursor-pointer"
                                title="Coret (Strikethrough)"
                              >
                                S
                              </button>
                            </div>
                            <textarea
                              id={`textarea-${block.id}`}
                              placeholder="Tulis paragraf materi di sini..."
                              value={block.textContent}
                              onChange={(e) => updateBlockText(block.id, e.target.value)}
                              className="w-full min-h-[90px] p-3 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] font-medium focus:outline-none focus:border-[#8C66FF] focus:bg-white resize-y text-xs leading-relaxed rounded-xl transition-none"
                            />
                            {/* Real-time Preview */}
                            {block.textContent.trim() && (
                              <div className="border border-[#F0EDFF] p-3 bg-[#FAF9FF] rounded-xl text-left">
                                <p className="text-[8px] font-bold text-[#9C98A6] uppercase tracking-wider mb-1.5">Live Preview:</p>
                                <div className="text-xs text-[#2C2B30] font-medium">
                                  {parseFormattedText(block.textContent)}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {/* Preview */}
                            {(block.file || (block.keepExisting && block.mediaUrl)) ? (
                              <div className="border border-[#F0EDFF] p-3 bg-[#FAF9FF] rounded-xl flex flex-col gap-2 shadow-sm text-left">
                                <p className="text-[8px] font-bold text-[#9C98A6] uppercase tracking-wider">Preview Media:</p>
                                {block.type === "image" ? (
                                  <img
                                    src={block.file ? URL.createObjectURL(block.file) : `${API_URL}${block.mediaUrl}`}
                                    alt="Preview"
                                    className="max-h-[120px] object-contain mx-auto rounded-lg"
                                  />
                                ) : (
                                  <audio
                                    src={block.file ? URL.createObjectURL(block.file) : `${API_URL}${block.mediaUrl}`}
                                    controls
                                    className="w-full custom-audio scale-95"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(block.id)}
                                  className="w-full mt-1 py-2 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[9px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
                                >
                                  Ganti File
                                </button>
                              </div>
                            ) : (
                              /* File Selector */
                              <div className="border border-dashed border-[#F0EDFF] p-4 bg-[#FAF9FF] rounded-xl text-center flex flex-col gap-2">
                                <p className="text-[10px] text-[#9C98A6] font-bold uppercase tracking-wider">
                                  Belum ada file {block.type === "image" ? "Gambar" : "Audio"} terpilih
                                </p>
                                <label className="mx-auto px-4 py-2 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none">
                                  Pilih File
                                  <input
                                    type="file"
                                    accept={block.type === "image" ? "image/*" : "audio/*"}
                                    onChange={(e) => handleFileUpload(block.id, e.target.files)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Blocks Adder Control Bar */}
                <div className="flex gap-2 justify-center py-4 border-t border-b border-[#F0EDFF]/50 mt-2">
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#8C66FF] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Teks
                  </button>
                  <button
                    type="button"
                    onClick={addImageBlock}
                    className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#FF9D42] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Gambar
                  </button>
                  <button
                    type="button"
                    onClick={addAudioBlock}
                    className="flex-1 py-3 bg-white border border-[#F0EDFF] text-[#D95276] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Audio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="w-full mt-6 mb-2 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-4 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-xs rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiX /> Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-4 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiSave /> {saving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>

      </div>

      {/* Styled custom modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-[340px] bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">{modal.title}</h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">{modal.message}</p>
            </div>
            <div className="flex gap-2.5 mt-2">
              {modal.type === "confirm" && (
                <button
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  setModal(prev => ({ ...prev, isOpen: false }));
                  if (modal.onConfirm) modal.onConfirm();
                }}
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

