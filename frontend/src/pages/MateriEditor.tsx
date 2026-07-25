import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCustomDialog } from "../components/CustomDialog";
import { useAppBack } from "../hooks/useAppBack";
import {
  getMaterialDetailApi,
  createMaterialApi,
  updateMaterialApi,
} from "../api/api";
import {
  FiArrowLeft,
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiPlus,
  FiSave,
  FiType,
  FiImage,
  FiMusic,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiLink,
  FiYoutube,
  FiCheck,
  FiHelpCircle,
  FiLayers,
  FiList,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

const markupToHtml = (markup: string): string => {
  if (!markup) return "";
  let html = markup
    .replace(/<b>([\s\S]*?)<\/b>/g, "<strong>$1</strong>")
    .replace(/<i>([\s\S]*?)<\/i>/g, "<em>$1</em>")
    .replace(/<u>([\s\S]*?)<\/u>/g, "<u>$1</u>")
    .replace(/<s>([\s\S]*?)<\/s>/g, "<strike>$1</strike>")
    .replace(/<left>([\s\S]*?)<\/left>/g, "<div class='text-left'>$1</div>")
    .replace(
      /<center>([\s\S]*?)<\/center>/g,
      "<div class='text-center'>$1</div>",
    )
    .replace(/<right>([\s\S]*?)<\/right>/g, "<div class='text-right'>$1</div>")
    .replace(
      /<justify>([\s\S]*?)<\/justify>/g,
      "<div class='text-justify'>$1</div>",
    )
    .replace(/<a href=["']([\s\S]*?)["']>(.*?)<\/a>/g, '<a href="$1">$2</a>')
    .replace(/\n/g, "<br />");
  return html;
};

const htmlToMarkup = (html: string): string => {
  if (!html) return "";
  let doc = new DOMParser().parseFromString(html, "text/html");
  const nodeToMarkup = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      let tagName = el.tagName.toLowerCase();
      let inner = Array.from(el.childNodes).map(nodeToMarkup).join("");

      if (tagName === "br") {
        return "\n";
      }
      if (tagName === "b" || tagName === "strong") {
        return `<b>${inner}</b>`;
      }
      if (tagName === "i" || tagName === "em") {
        return `<i>${inner}</i>`;
      }
      if (tagName === "u") {
        return `<u>${inner}</u>`;
      }
      if (tagName === "s" || tagName === "strike" || tagName === "del") {
        return `<s>${inner}</s>`;
      }
      if (tagName === "a") {
        const href = el.getAttribute("href") || "";
        return `<a href="${href}">${inner}</a>`;
      }
      const align = el.style.textAlign || el.getAttribute("align") || "";
      if (
        align === "center" ||
        el.classList.contains("text-center") ||
        tagName === "center"
      ) {
        return `<center>${inner}</center>`;
      }
      if (align === "right" || el.classList.contains("text-right")) {
        return `<right>${inner}</right>`;
      }
      if (align === "justify" || el.classList.contains("text-justify")) {
        return `<justify>${inner}</justify>`;
      }
      if (align === "left" || el.classList.contains("text-left")) {
        return `<left>${inner}</left>`;
      }
      if (tagName === "div" || tagName === "p") {
        return inner + "\n";
      }
      return inner;
    }
    return "";
  };

  let markup = Array.from(doc.body.childNodes).map(nodeToMarkup).join("");
  return markup.replace(/\n\n+/g, "\n").trim();
};

const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  let cleanedUrl = url.trim();
  const iframeMatch = cleanedUrl.match(
    /src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([\w-]{11})/i,
  );
  if (iframeMatch) return iframeMatch[1];

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleanedUrl.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  if (cleanedUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanedUrl)) {
    return cleanedUrl;
  }

  return null;
};

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  minHeightClass?: string;
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeightClass = "min-h-[120px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { showPrompt } = useCustomDialog();

  useEffect(() => {
    if (editorRef.current) {
      const currentMarkup = htmlToMarkup(editorRef.current.innerHTML);
      if (currentMarkup !== value) {
        editorRef.current.innerHTML = markupToHtml(value);
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markup = htmlToMarkup(html);
      onChange(markup);
    }
  };

  const applyFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleLink = async () => {
    const url = await showPrompt(
      "Masukkan URL tautan (contoh: https://google.com):",
      "https://",
      "Tambah Link",
    );
    if (url) {
      applyFormat("createLink", url);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 border border-[#F0EDFF] bg-white rounded-2xl p-2.5 shadow-sm text-left">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 items-center pb-2 border-b border-[#F0EDFF]">
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center font-bold text-xs transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Tebal (Bold)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center italic text-xs transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Miring (Italic)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyFormat("underline")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center underline text-xs transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Garis Bawah (Underline)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => applyFormat("strikeThrough")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center line-through text-xs transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Coret (Strikethrough)"
        >
          S
        </button>
        <div className="w-px h-5 bg-[#F0EDFF] mx-1" />
        <button
          type="button"
          onClick={() => applyFormat("justifyLeft")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Rata Kiri"
        >
          <FiAlignLeft size={12} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("justifyCenter")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Rata Tengah"
        >
          <FiAlignCenter size={12} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("justifyRight")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Rata Kanan"
        >
          <FiAlignRight size={12} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("justifyFull")}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Rata Kanan-Kiri (Justify)"
        >
          <FiAlignJustify size={12} />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="w-7 h-7 bg-white text-[#2C2B30] border border-[#F0EDFF] rounded-lg flex items-center justify-center transition-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
          title="Tautkan Link (Insert Link)"
        >
          <FiLink size={12} />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .wysiwyg-editor:empty:before {
          content: attr(data-placeholder);
          color: #9C98A6;
          font-style: italic;
        }
      `,
        }}
      />
      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className={`wysiwyg-editor w-full ${minHeightClass} p-3 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] font-medium focus:outline-none focus:border-[#8C66FF] focus:bg-white text-xs leading-relaxed rounded-xl transition-none overflow-y-auto text-justify`}
      />
    </div>
  );
}

interface Block {
  id: string;
  type: "text" | "image" | "audio" | "video youtube" | "quiz_mcq" | "quiz_puzzle" | "quiz_sequence";
  textContent: string;
  file: File | null;
  mediaUrl?: string;
  keepExisting: boolean;
}

export default function MateriEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useAppBack();
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

  const showAlert = (
    message: string,
    title = "Info",
    onConfirm?: () => void,
  ) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm,
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title = "Konfirmasi",
  ) => {
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
    const isAdmin =
      user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin");
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
          keepExisting: true,
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
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const addImageBlock = () => {
    const newBlock: Block = {
      id: `blk-img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "image",
      textContent: "",
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const addAudioBlock = () => {
    const newBlock: Block = {
      id: `blk-aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "audio",
      textContent: "",
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const addYoutubeBlock = () => {
    const newBlock: Block = {
      id: `blk-yt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "video youtube",
      textContent: "",
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  // Add Quiz Blocks
  const addQuizMcqBlock = () => {
    const newBlock: Block = {
      id: `blk-qmcq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "quiz_mcq",
      textContent: JSON.stringify({
        question: "",
        options: ["", ""],
        correctIndex: 0,
        explanation: "",
      }),
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const addQuizPuzzleBlock = () => {
    const newBlock: Block = {
      id: `blk-qpuz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "quiz_puzzle",
      textContent: JSON.stringify({
        instruction: "Cocokkan pasangan istilah di bawah ini!",
        pairs: [
          { id: `p-${Date.now()}-1`, left: "", right: "" },
          { id: `p-${Date.now()}-2`, left: "", right: "" },
        ],
      }),
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const addQuizSequenceBlock = () => {
    const newBlock: Block = {
      id: `blk-qseq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "quiz_sequence",
      textContent: JSON.stringify({
        instruction: "Urutkan tahapan-tahapan di bawah ini dengan benar!",
        items: ["", ""],
        explanation: "",
      }),
      file: null,
      keepExisting: false,
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockText = (blockId: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, textContent: text } : b)),
    );
  };

  const handleFileUpload = (blockId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, file, keepExisting: false } : b,
      ),
    );
  };

  const removeFile = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, file: null, mediaUrl: undefined, keepExisting: false }
          : b,
      ),
    );
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
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

    // Verify all media & quiz blocks have valid inputs
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "text" && !b.textContent.trim()) {
        showAlert(
          `Konten teks pada blok #${i + 1} tidak boleh kosong.`,
          "Peringatan",
        );
        return;
      }
      if (b.type === "video youtube") {
        if (!b.textContent.trim()) {
          showAlert(
            `URL atau Kode Embed Video YouTube pada blok #${
              i + 1
            } tidak boleh kosong.`,
            "Peringatan",
          );
          return;
        }
        if (!getYoutubeId(b.textContent)) {
          showAlert(
            `Format URL Video YouTube pada blok #${i + 1} tidak valid.`,
            "Peringatan",
          );
          return;
        }
      }

      // Quiz MCQ Validation
      if (b.type === "quiz_mcq") {
        try {
          const mcq = JSON.parse(b.textContent || "{}");
          if (!mcq.question || !mcq.question.trim()) {
            showAlert(`Pertanyaan pada Kuis Pilihan Ganda #${i + 1} tidak boleh kosong.`, "Peringatan");
            return;
          }
          if (!mcq.options || mcq.options.length < 2 || mcq.options.some((o: string) => !o.trim())) {
            showAlert(`Semua pilihan jawaban pada Kuis Pilihan Ganda #${i + 1} harus diisi (minimal 2 pilihan).`, "Peringatan");
            return;
          }
        } catch {
          showAlert(`Data Kuis Pilihan Ganda #${i + 1} tidak valid.`, "Peringatan");
          return;
        }
      }

      // Quiz Puzzle Validation
      if (b.type === "quiz_puzzle") {
        try {
          const puz = JSON.parse(b.textContent || "{}");
          if (!puz.pairs || puz.pairs.length < 2) {
            showAlert(`Kuis Pasangan Puzzle #${i + 1} harus memiliki minimal 2 pasang kepingan.`, "Peringatan");
            return;
          }
          for (let pIdx = 0; pIdx < puz.pairs.length; pIdx++) {
            const p = puz.pairs[pIdx];
            if (!p.left?.trim() || !p.right?.trim()) {
              showAlert(`Pasangan #${pIdx + 1} pada Kuis Puzzle #${i + 1} tidak boleh ada yang kosong.`, "Peringatan");
              return;
            }
          }
        } catch {
          showAlert(`Data Kuis Puzzle #${i + 1} tidak valid.`, "Peringatan");
          return;
        }
      }

      // Quiz Sequence Validation
      if (b.type === "quiz_sequence") {
        try {
          const seq = JSON.parse(b.textContent || "{}");
          if (!seq.items || seq.items.length < 2 || seq.items.some((it: string) => !it.trim())) {
            showAlert(`Semua tahapan pada Kuis Urutan #${i + 1} harus diisi (minimal 2 langkah).`, "Peringatan");
            return;
          }
        } catch {
          showAlert(`Data Kuis Urutan #${i + 1} tidak valid.`, "Peringatan");
          return;
        }
      }

      if (
        b.type === "image" || b.type === "audio"
      ) {
        if (!b.file && (!b.keepExisting || !b.mediaUrl)) {
          showAlert(
            `Harap unggah file media untuk blok ${
              b.type === "image" ? "Gambar" : "Audio"
            } #${i + 1}.`,
            "Peringatan",
          );
          return;
        }
      }
    }

    if (!token) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);

      const blocksPayload = blocks.map((b) => {
        const payloadBlock: any = {
          id: b.id,
          type: b.type,
          textContent: b.textContent,
        };
        if (b.type === "image" || b.type === "audio") {
          if (b.file) {
            payloadBlock.fileKey = `file_${b.id}`;
          } else if (b.keepExisting && b.mediaUrl) {
            payloadBlock.keepExisting = true;
          }
        }
        return payloadBlock;
      });

      formData.append("blocks", JSON.stringify(blocksPayload));

      blocks.forEach((b) => {
        if (b.file) {
          formData.append(`file_${b.id}`, b.file);
        }
      });

      if (isEditMode && id) {
        await updateMaterialApi(token, id, formData);
        showAlert("Materi berhasil diperbarui!", "Sukses", () =>
          navigate("/materi"),
        );
      } else {
        await createMaterialApi(token, formData);
        showAlert("Materi baru berhasil dibuat!", "Sukses", () =>
          navigate("/materi"),
        );
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
        goBack("/materi");
      },
      "Batal Edit",
    );
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        <div>
          {/* Header */}
          <div className="w-full flex justify-between items-center mt-4 pb-4 border-b border-[#F0EDFF]/50">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
                title="Batal"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  Panel Admin
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5">
                  {isEditMode ? "Edit Materi" : "Buat Materi"}
                </h1>
              </div>
            </div>
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
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-[#FFEAEA] text-xs text-[#FF5E8C] uppercase font-bold tracking-wider shadow-sm">
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
                <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-1">
                  {blocks.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-[#F0EDFF] text-[10px] text-[#9C98A6] uppercase font-bold tracking-wider">
                      Konten Kosong. Gunakan tombol di bawah untuk menambah
                      blok materi atau kuis interaktif.
                    </div>
                  ) : (
                    blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="w-full bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-3 relative"
                      >
                        {/* Block Action Bar */}
                        <div className="flex items-center justify-between border-b border-[#F0EDFF]/50 pb-2 mb-1">
                          <span className="font-bold text-[9px] uppercase tracking-widest text-[#9C98A6] flex items-center gap-1.5">
                            {block.type === "text" && (
                              <FiType className="text-xs text-[#8C66FF]" />
                            )}
                            {block.type === "image" && (
                              <FiImage className="text-xs text-[#FF9D42]" />
                            )}
                            {block.type === "audio" && (
                              <FiMusic className="text-xs text-[#D95276]" />
                            )}
                            {block.type === "video youtube" && (
                              <FiYoutube className="text-xs text-[#FF0000]" />
                            )}
                            {block.type === "quiz_mcq" && (
                              <FiHelpCircle className="text-xs text-[#8C66FF]" />
                            )}
                            {block.type === "quiz_puzzle" && (
                              <FiLayers className="text-xs text-[#8C66FF]" />
                            )}
                            {block.type === "quiz_sequence" && (
                              <FiList className="text-xs text-[#8C66FF]" />
                            )}
                            Blok {block.type.toUpperCase().replace("_", " ")} #{index + 1}
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

                        {/* Block Content Editors */}
                        {block.type === "text" ? (
                          <RichTextEditor
                            value={block.textContent}
                            onChange={(val) => updateBlockText(block.id, val)}
                            placeholder="Tulis paragraf materi di sini..."
                            minHeightClass="min-h-[120px]"
                          />
                        ) : block.type === "video youtube" ? (
                          <div className="flex flex-col gap-2.5 w-full text-left">
                            <div className="flex flex-col gap-1 w-full">
                              <span className="font-bold text-[9px] uppercase tracking-widest text-[#9C98A6]">
                                Link Video YouTube / Embed Code:
                              </span>
                              <input
                                type="text"
                                value={block.textContent}
                                onChange={(e) =>
                                  updateBlockText(block.id, e.target.value)
                                }
                                placeholder="Paste URL YouTube (contoh: https://www.youtube.com/watch?v=...) atau kode embed..."
                                className="w-full p-3 border border-[#F0EDFF] bg-[#FAF9FF] text-[#2C2B30] font-medium focus:outline-none focus:border-[#8C66FF] focus:bg-white text-xs rounded-xl transition-none"
                              />
                            </div>

                            {/* YouTube Preview */}
                            {(() => {
                              const ytId = getYoutubeId(block.textContent);
                              if (ytId) {
                                return (
                                  <div className="border border-[#F0EDFF] p-3 bg-[#FAF9FF] rounded-xl flex flex-col gap-2 shadow-sm">
                                    <p className="text-[8px] font-bold text-[#9C98A6] uppercase tracking-wider">
                                      Preview Video:
                                    </p>
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#F0EDFF] bg-black">
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
                              } else if (block.textContent.trim()) {
                                return (
                                  <p className="text-[9px] text-[#FF5E8C] font-extrabold uppercase tracking-wider">
                                    Format URL/Embed Code YouTube tidak valid.
                                  </p>
                                );
                              }
                              return (
                                <p className="text-[9px] text-[#9C98A6] font-bold uppercase tracking-wider">
                                  Silakan tempel URL YouTube untuk melihat
                                  preview.
                                </p>
                              );
                            })()}
                          </div>
                        ) : block.type === "quiz_mcq" ? (
                          /* Editor for Quiz MCQ */
                          {...(() => {
                            let mcqData = { question: "", options: ["", ""], correctIndex: 0, explanation: "" };
                            try {
                              if (block.textContent) mcqData = { ...mcqData, ...JSON.parse(block.textContent) };
                            } catch {}

                            const updateMcq = (newData: any) => {
                              updateBlockText(block.id, JSON.stringify(newData));
                            };

                            return (
                              <div className="flex flex-col gap-3 w-full text-left bg-[#FAF9FF] border border-[#F0EDFF] p-3.5 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#8C66FF]">
                                    Pertanyaan Kuis:
                                  </span>
                                  <input
                                    type="text"
                                    value={mcqData.question}
                                    onChange={(e) => updateMcq({ ...mcqData, question: e.target.value })}
                                    placeholder="Tuliskan soal / pertanyaan kuis..."
                                    className="w-full p-2.5 bg-white border border-[#F0EDFF] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8C66FF]"
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#9C98A6]">
                                      Pilihan Jawaban (Tandai Jawaban Benar):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateMcq({ ...mcqData, options: [...mcqData.options, ""] })}
                                      className="text-[9px] font-bold text-[#8C66FF] flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                      <FiPlus size={10} /> Tambah Opsi
                                    </button>
                                  </div>

                                  {mcqData.options.map((opt: string, oIdx: number) => (
                                    <div key={oIdx} className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => updateMcq({ ...mcqData, correctIndex: oIdx })}
                                        className={`w-6 h-6 rounded-lg border text-[10px] font-bold flex items-center justify-center shrink-0 cursor-pointer ${
                                          mcqData.correctIndex === oIdx
                                            ? "bg-[#2C8578] text-white border-[#2C8578]"
                                            : "bg-white border-[#F0EDFF] text-[#9C98A6]"
                                        }`}
                                        title={mcqData.correctIndex === oIdx ? "Jawaban Benar" : "Jadikan Jawaban Benar"}
                                      >
                                        {mcqData.correctIndex === oIdx ? <FiCheck size={12} /> : String.fromCharCode(65 + oIdx)}
                                      </button>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...mcqData.options];
                                          newOpts[oIdx] = e.target.value;
                                          updateMcq({ ...mcqData, options: newOpts });
                                        }}
                                        placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}...`}
                                        className="flex-1 p-2 bg-white border border-[#F0EDFF] rounded-xl text-xs focus:outline-none focus:border-[#8C66FF]"
                                      />
                                      {mcqData.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOpts = mcqData.options.filter((_, idx) => idx !== oIdx);
                                            const newCorrect = mcqData.correctIndex >= newOpts.length ? 0 : mcqData.correctIndex;
                                            updateMcq({ ...mcqData, options: newOpts, correctIndex: newCorrect });
                                          }}
                                          className="text-[#FF5E8C] p-1.5 hover:bg-[#FFEAEA] rounded-lg transition-all cursor-pointer"
                                        >
                                          <FiTrash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#9C98A6]">
                                    Penjelasan / Pembahasan (Opsional):
                                  </span>
                                  <textarea
                                    value={mcqData.explanation}
                                    onChange={(e) => updateMcq({ ...mcqData, explanation: e.target.value })}
                                    placeholder="Penjelasan mengapa jawaban tersebut benar..."
                                    rows={2}
                                    className="w-full p-2.5 bg-white border border-[#F0EDFF] rounded-xl text-xs focus:outline-none focus:border-[#8C66FF]"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        ) : block.type === "quiz_puzzle" ? (
                          /* Editor for Quiz Puzzle Pairs */
                          {...(() => {
                            let puzzleData = { instruction: "", pairs: [] as { id: string; left: string; right: string }[] };
                            try {
                              if (block.textContent) puzzleData = { ...puzzleData, ...JSON.parse(block.textContent) };
                            } catch {}

                            const updatePuzzle = (newData: any) => {
                              updateBlockText(block.id, JSON.stringify(newData));
                            };

                            return (
                              <div className="flex flex-col gap-3 w-full text-left bg-[#FAF9FF] border border-[#F0EDFF] p-3.5 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#8C66FF]">
                                    Instruksi Kuis Puzzle:
                                  </span>
                                  <input
                                    type="text"
                                    value={puzzleData.instruction}
                                    onChange={(e) => updatePuzzle({ ...puzzleData, instruction: e.target.value })}
                                    placeholder="Contoh: Cocokkan istilah zat dan sifatnya di bawah ini!"
                                    className="w-full p-2.5 bg-white border border-[#F0EDFF] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8C66FF]"
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#9C98A6]">
                                      Daftar Pasangan Puzzle (Kiri 🧩 Kanan):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updatePuzzle({
                                          ...puzzleData,
                                          pairs: [
                                            ...puzzleData.pairs,
                                            { id: `p-${Date.now()}-${Math.random()}`, left: "", right: "" },
                                          ],
                                        })
                                      }
                                      className="text-[9px] font-bold text-[#8C66FF] flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                      <FiPlus size={10} /> Tambah Pasangan
                                    </button>
                                  </div>

                                  {puzzleData.pairs.map((pair, pIdx) => (
                                    <div key={pair.id || pIdx} className="flex flex-col gap-2 bg-white p-3 border border-[#F0EDFF] rounded-xl shadow-xs">
                                      <div className="flex justify-between items-center pb-1 border-b border-[#F0EDFF]/60">
                                        <span className="text-[10px] font-extrabold text-[#8C66FF]">
                                          Pasangan #{pIdx + 1}
                                        </span>
                                        {puzzleData.pairs.length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newPairs = puzzleData.pairs.filter((_, idx) => idx !== pIdx);
                                              updatePuzzle({ ...puzzleData, pairs: newPairs });
                                            }}
                                            className="text-[#FF5E8C] text-[10px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                          >
                                            <FiTrash2 size={11} /> Hapus
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <input
                                          type="text"
                                          value={pair.left}
                                          onChange={(e) => {
                                            const newPairs = [...puzzleData.pairs];
                                            newPairs[pIdx].left = e.target.value;
                                            updatePuzzle({ ...puzzleData, pairs: newPairs });
                                          }}
                                          placeholder="Kolom A (Istilah)..."
                                          className="w-full p-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-lg text-xs focus:outline-none focus:border-[#8C66FF]"
                                        />
                                        <input
                                          type="text"
                                          value={pair.right}
                                          onChange={(e) => {
                                            const newPairs = [...puzzleData.pairs];
                                            newPairs[pIdx].right = e.target.value;
                                            updatePuzzle({ ...puzzleData, pairs: newPairs });
                                          }}
                                          placeholder="Kolom B (Pasangan)..."
                                          className="w-full p-2 bg-[#FAF9FF] border border-[#F0EDFF] rounded-lg text-xs focus:outline-none focus:border-[#8C66FF]"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        ) : block.type === "quiz_sequence" ? (
                          /* Editor for Quiz Sequence Ordering */
                          {...(() => {
                            let seqData = { instruction: "", items: [] as string[], explanation: "" };
                            try {
                              if (block.textContent) seqData = { ...seqData, ...JSON.parse(block.textContent) };
                            } catch {}

                            const updateSeq = (newData: any) => {
                              updateBlockText(block.id, JSON.stringify(newData));
                            };

                            return (
                              <div className="flex flex-col gap-3 w-full text-left bg-[#FAF9FF] border border-[#F0EDFF] p-3.5 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#8C66FF]">
                                    Instruksi Kuis Urutan:
                                  </span>
                                  <input
                                    type="text"
                                    value={seqData.instruction}
                                    onChange={(e) => updateSeq({ ...seqData, instruction: e.target.value })}
                                    placeholder="Contoh: Urutkan proses sublimasi dengan benar!"
                                    className="w-full p-2.5 bg-white border border-[#F0EDFF] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8C66FF]"
                                  />
                                </div>

                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#9C98A6]">
                                      Daftar Tahapan (Tulis dalam Urutan Benar):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateSeq({ ...seqData, items: [...seqData.items, ""] })}
                                      className="text-[9px] font-bold text-[#8C66FF] flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                      <FiPlus size={10} /> Tambah Tahap
                                    </button>
                                  </div>

                                  {seqData.items.map((it: string, sIdx: number) => (
                                    <div key={sIdx} className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg bg-[#8C66FF] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                        {sIdx + 1}
                                      </span>
                                      <input
                                        type="text"
                                        value={it}
                                        onChange={(e) => {
                                          const newItems = [...seqData.items];
                                          newItems[sIdx] = e.target.value;
                                          updateSeq({ ...seqData, items: newItems });
                                        }}
                                        placeholder={`Langkah/Tahap ke-${sIdx + 1}...`}
                                        className="flex-1 p-2 bg-white border border-[#F0EDFF] rounded-xl text-xs focus:outline-none focus:border-[#8C66FF]"
                                      />
                                      {seqData.items.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newItems = seqData.items.filter((_, idx) => idx !== sIdx);
                                            updateSeq({ ...seqData, items: newItems });
                                          }}
                                          className="text-[#FF5E8C] p-1.5 hover:bg-[#FFEAEA] rounded-lg cursor-pointer"
                                        >
                                          <FiTrash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-[#9C98A6]">
                                    Penjelasan / Catatan (Opsional):
                                  </span>
                                  <textarea
                                    value={seqData.explanation}
                                    onChange={(e) => updateSeq({ ...seqData, explanation: e.target.value })}
                                    placeholder="Penjelasan urutan proses yang benar..."
                                    rows={2}
                                    className="w-full p-2.5 bg-white border border-[#F0EDFF] rounded-xl text-xs focus:outline-none focus:border-[#8C66FF]"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        ) : (
                          /* Image or Audio Block Editor */
                          <div className="flex flex-col gap-2">
                            {/* Preview */}
                            {block.file ||
                            (block.keepExisting && block.mediaUrl) ? (
                              <div className="border border-[#F0EDFF] p-3 bg-[#FAF9FF] rounded-xl flex flex-col gap-2 shadow-sm text-left">
                                <p className="text-[8px] font-bold text-[#9C98A6] uppercase tracking-wider">
                                  Preview Media:
                                </p>
                                {block.type === "image" ? (
                                  <img
                                    src={
                                      block.file
                                        ? URL.createObjectURL(block.file)
                                        : `${API_URL}${block.mediaUrl}`
                                    }
                                    alt="Preview"
                                    className="max-h-30 object-contain mx-auto rounded-lg"
                                  />
                                ) : (
                                  <audio
                                    src={
                                      block.file
                                        ? URL.createObjectURL(block.file)
                                        : `${API_URL}${block.mediaUrl}`
                                    }
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
                                  Belum ada file{" "}
                                  {block.type === "image" ? "Gambar" : "Audio"}{" "}
                                  terpilih
                                </p>
                                <label className="mx-auto px-4 py-2 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none">
                                  Pilih File
                                  <input
                                    type="file"
                                    accept={
                                      block.type === "image"
                                        ? "image/*"
                                        : "audio/*"
                                    }
                                    onChange={(e) =>
                                      handleFileUpload(block.id, e.target.files)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}

                            {/* Caption/Description Editor */}
                            <div className="flex flex-col gap-2 mt-2 w-full">
                              <span className="font-bold text-[9px] uppercase tracking-widest text-[#9C98A6]">
                                Keterangan / Teks Pendukung (Opsional):
                              </span>
                              <RichTextEditor
                                value={block.textContent}
                                onChange={(val) =>
                                  updateBlockText(block.id, val)
                                }
                                placeholder={`Tulis keterangan/deskripsi ${
                                  block.type === "image" ? "gambar" : "audio"
                                } di sini...`}
                                minHeightClass="min-h-[80px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Blocks Adder Control Bar */}
                <div className="flex flex-col gap-2.5 py-4 border-t border-b border-[#F0EDFF]/50 mt-2">
                  <span className="font-extrabold text-[9px] uppercase tracking-widest text-[#9C98A6]">
                    Tambah Blok Konten:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="py-2.5 px-3 bg-white border border-[#F0EDFF] text-[#8C66FF] text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#FAF9FF]"
                    >
                      <FiPlus /> Teks
                    </button>
                    <button
                      type="button"
                      onClick={addImageBlock}
                      className="py-2.5 px-3 bg-white border border-[#F0EDFF] text-[#FF9D42] text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#FAF9FF]"
                    >
                      <FiPlus /> Gambar
                    </button>
                    <button
                      type="button"
                      onClick={addAudioBlock}
                      className="py-2.5 px-3 bg-white border border-[#F0EDFF] text-[#D95276] text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#FAF9FF]"
                    >
                      <FiPlus /> Audio
                    </button>
                    <button
                      type="button"
                      onClick={addYoutubeBlock}
                      className="py-2.5 px-3 bg-white border border-[#F0EDFF] text-[#FF3333] text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#FAF9FF]"
                    >
                      <FiYoutube size={12} /> YouTube
                    </button>
                  </div>

                  <span className="font-extrabold text-[9px] uppercase tracking-widest text-[#8C66FF] mt-1">
                    Tambah Kuis Interaktif:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={addQuizMcqBlock}
                      className="py-2.5 px-2 bg-[#F0ECFF] border border-[#8C66FF]/30 text-[#8C66FF] text-[9px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#8C66FF] hover:text-white transition-all"
                    >
                      <FiHelpCircle size={11} /> Pilihan Ganda
                    </button>
                    <button
                      type="button"
                      onClick={addQuizPuzzleBlock}
                      className="py-2.5 px-2 bg-[#F0ECFF] border border-[#8C66FF]/30 text-[#8C66FF] text-[9px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#8C66FF] hover:text-white transition-all"
                    >
                      <FiLayers size={11} /> Pasangan
                    </button>
                    <button
                      type="button"
                      onClick={addQuizSequenceBlock}
                      className="py-2.5 px-2 bg-[#F0ECFF] border border-[#8C66FF]/30 text-[#8C66FF] text-[9px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#8C66FF] hover:text-white transition-all"
                    >
                      <FiList size={11} /> Urutkan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="w-full mt-6 mb-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full py-4 bg-gradient-to-br from-[#8C66FF] to-[#6039DF] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer transition-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiSave /> {saving ? "Menyimpan..." : "Simpan Materi"}
          </button>
        </div>
      </div>

      {/* Styled custom modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-6 backdrop-blur-xs">
          <div className="w-full max-w-85 bg-white rounded-[28px] p-6 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C2B30] tracking-wide uppercase">
                {modal.title}
              </h3>
              <p className="text-xs text-[#9C98A6] font-medium mt-2 leading-relaxed">
                {modal.message}
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              {modal.type === "confirm" && (
                <button
                  onClick={() =>
                    setModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="flex-1 py-3 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm cursor-pointer transition-none flex items-center justify-center"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  setModal((prev) => ({ ...prev, isOpen: false }));
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
