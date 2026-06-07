import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialDetailApi, createMaterialApi, updateMaterialApi } from "../api/api";
import { FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiSave, FiX, FiType, FiImage, FiMusic } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

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
      alert("Judul materi harus diisi!");
      return;
    }

    if (blocks.length === 0) {
      alert("Materi harus memiliki minimal 1 blok konten!");
      return;
    }

    // Verify all media blocks have files
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "text" && !b.textContent.trim()) {
        alert(`Konten teks pada blok #${i + 1} tidak boleh kosong.`);
        return;
      }
      if (b.type !== "text" && !b.file && (!b.keepExisting || !b.mediaUrl)) {
        alert(`Harap unggah file media untuk blok ${b.type === "image" ? "Gambar" : "Audio"} #${i + 1}.`);
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
        alert("Materi berhasil diperbarui!");
      } else {
        await createMaterialApi(token, formData);
        alert("Materi baru berhasil dibuat!");
      }
      navigate("/materi");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menyimpan materi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Batal mengedit dan buang semua perubahan?")) {
      navigate("/materi");
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        <div>
          {/* Header */}
          <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Panel Admin</p>
              <h1 className="text-sm font-bold uppercase tracking-wide">
                {isEditMode ? "Edit Materi" : "Buat Materi"}
              </h1>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer text-xs transition-none"
              title="Batal"
            >
              <FiX />
            </button>
          </div>

          {/* Editor Area */}
          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-4 py-12 text-center">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                  Memuat data...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 border border-black border-dashed text-xs text-red-600 uppercase font-bold">
                {error}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Large Title Input (Notion Style) */}
                <input
                  type="text"
                  placeholder="Judul Materi..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold border-b border-black w-full focus:outline-none py-1 placeholder-neutral-400"
                />

                {/* Blocks List */}
                <div className="flex flex-col gap-5">
                  {blocks.length === 0 ? (
                    <div className="text-center py-8 border border-neutral-300 border-dashed text-[10px] text-neutral-500 uppercase font-bold">
                      Konten Kosong. Gunakan tombol di bawah untuk menambah blok.
                    </div>
                  ) : (
                    blocks.map((block, index) => (
                      <div key={block.id} className="w-full border border-black p-3 bg-white flex flex-col gap-2 relative">
                        {/* Block Action Bar */}
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-1 text-xs">
                          <span className="font-mono text-[9px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                            {block.type === "text" && <FiType />}
                            {block.type === "image" && <FiImage />}
                            {block.type === "audio" && <FiMusic />}
                            Blok {block.type.toUpperCase()} #{index + 1}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveBlock(index, "up")}
                              disabled={index === 0}
                              className="p-1 border border-neutral-300 hover:border-black disabled:opacity-30 disabled:hover:border-neutral-300 bg-white text-black active:bg-black active:text-white cursor-pointer transition-none"
                              title="Pindahkan Ke Atas"
                            >
                              <FiArrowUp size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(index, "down")}
                              disabled={index === blocks.length - 1}
                              className="p-1 border border-neutral-300 hover:border-black disabled:opacity-30 disabled:hover:border-neutral-300 bg-white text-black active:bg-black active:text-white cursor-pointer transition-none"
                              title="Pindahkan Ke Bawah"
                            >
                              <FiArrowDown size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="p-1 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer ml-1.5 transition-none"
                              title="Hapus Blok"
                            >
                              <FiTrash2 size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Block Content Inputs */}
                        {block.type === "text" ? (
                          <textarea
                            placeholder="Tulis paragraf materi di sini..."
                            value={block.textContent}
                            onChange={(e) => updateBlockText(block.id, e.target.value)}
                            className="w-full min-h-[90px] p-2 border border-neutral-300 focus:border-black focus:outline-none resize-y text-xs leading-relaxed"
                          />
                        ) : (
                          <div className="flex flex-col gap-2">
                            {/* Preview */}
                            {(block.file || (block.keepExisting && block.mediaUrl)) ? (
                              <div className="border border-neutral-300 p-2 bg-neutral-50 flex flex-col gap-2">
                                <p className="text-[8px] font-mono text-neutral-500 uppercase">Preview Media:</p>
                                {block.type === "image" ? (
                                  <img
                                    src={block.file ? URL.createObjectURL(block.file) : `${API_URL}${block.mediaUrl}`}
                                    alt="Preview"
                                    className="max-h-[120px] object-contain mx-auto"
                                  />
                                ) : (
                                  <audio
                                    src={block.file ? URL.createObjectURL(block.file) : `${API_URL}${block.mediaUrl}`}
                                    controls
                                    className="w-full scale-90"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(block.id)}
                                  className="py-1 border border-black text-[9px] uppercase font-bold bg-white active:bg-black active:text-white cursor-pointer transition-none"
                                >
                                  Ganti File
                                </button>
                              </div>
                            ) : (
                              /* File Selector */
                              <div className="border border-neutral-300 border-dashed p-4 bg-neutral-50 text-center flex flex-col gap-2">
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                  Belum ada file {block.type === "image" ? "Gambar" : "Audio"} terpilih
                                </p>
                                <label className="mx-auto px-4 py-1.5 border border-black bg-white text-[9px] uppercase font-bold active:bg-black active:text-white cursor-pointer">
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

                {/* Blocks Adder Control Bar (Notion Style) */}
                <div className="flex gap-2 justify-center py-4 border-t border-b border-black mt-2">
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="flex-1 py-2 border border-black text-[10px] uppercase tracking-wider font-bold bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Teks
                  </button>
                  <button
                    type="button"
                    onClick={addImageBlock}
                    className="flex-1 py-2 border border-black text-[10px] uppercase tracking-wider font-bold bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Gambar
                  </button>
                  <button
                    type="button"
                    onClick={addAudioBlock}
                    className="flex-1 py-2 border border-black text-[10px] uppercase tracking-wider font-bold bg-white text-black active:bg-black active:text-white cursor-pointer flex items-center justify-center gap-1 transition-none"
                  >
                    <FiPlus /> Audio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="w-full mt-10 mb-2 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-3 border border-black bg-white text-black font-bold uppercase tracking-wider text-xs active:bg-black active:text-white disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-none"
          >
            <FiX /> Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs active:bg-white active:text-black disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-none"
          >
            <FiSave /> {saving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>

      </div>
    </div>
  );
}
