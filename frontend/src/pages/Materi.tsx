import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAppBack } from "../hooks/useAppBack";
import {
  getMaterialsApi,
  deleteMaterialApi,
  reorderMaterialsApi,
} from "../api/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiBookOpen,
} from "react-icons/fi";

export default function Materi() {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Reorder State
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedMaterials, setReorderedMaterials] = useState<any[]>([]);

  const isAdmin =
    user &&
    (user.status.toLowerCase() === "admin" ||
      user.email.toLowerCase().includes("admin"));

  const loadMaterials = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMaterialsApi(token);
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadMaterials();
  }, [user, token, navigate]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      "Apakah Anda yakin ingin menghapus materi ini?",
      async () => {
        if (!token) return;
        try {
          await deleteMaterialApi(token, id);
          setMaterials(materials.filter((m) => m.id !== id));
          showAlert("Materi berhasil dihapus.", "Sukses");
        } catch (err: any) {
          showAlert(err.message || "Gagal menghapus materi.", "Gagal");
        }
      },
      "Hapus Materi",
    );
  };

  const handleStartReorder = () => {
    setReorderedMaterials([...materials]);
    setIsReordering(true);
  };

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const newItems = [...reorderedMaterials];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setReorderedMaterials(newItems);
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === reorderedMaterials.length - 1) return;
    const newItems = [...reorderedMaterials];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setReorderedMaterials(newItems);
  };

  const handleSaveReorder = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const ids = reorderedMaterials.map((m) => m.id);
      await reorderMaterialsApi(token, ids);
      setMaterials(reorderedMaterials);
      setIsReordering(false);
      showAlert("Urutan materi berhasil disimpan!", "Sukses");
    } catch (err: any) {
      showAlert(err.message || "Gagal menyimpan urutan materi", "Gagal");
    } finally {
      setLoading(false);
    }
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
                onClick={() => goBack(isAdmin ? "/admin" : "/menu")}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  Pembelajaran
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight">
                  Materi Belajar
                </h1>
              </div>
            </div>
            {isAdmin && !isReordering && (
              <div className="flex gap-2">
                <button
                  onClick={handleStartReorder}
                  className="px-3 py-2 bg-white border border-[#F0EDFF] text-[#8C66FF] text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none"
                >
                  Urutkan
                </button>
                <button
                  onClick={() => navigate("/admin/materi/new")}
                  className="px-3 py-2 bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer flex items-center gap-1 transition-none"
                >
                  <FiPlus /> Tambah
                </button>
              </div>
            )}
            {isAdmin && isReordering && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsReordering(false)}
                  className="px-3 py-2 bg-white border border-[#FFEAEA] text-[#FF5E8C] text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveReorder}
                  className="px-3 py-2 bg-linear-to-br from-[#8C66FF] to-[#6039DF] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-sm cursor-pointer transition-none"
                >
                  Simpan
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div className="mt-6 flex flex-col gap-4">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-3 py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#9C98A6]">
                  Sinkronisasi materi...
                </p>
              </div>
            ) : (isReordering ? reorderedMaterials : materials).length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-[#F0EDFF] shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-xs text-[#9C98A6] uppercase font-bold tracking-wider">
                Belum ada materi yang tersedia.
              </div>
            ) : (
              (isReordering ? reorderedMaterials : materials).map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() =>
                    !isReordering && navigate(`/materi/view/${m.id}`)
                  }
                  className={`w-full bg-white rounded-3xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#F0EDFF] flex flex-col gap-3 transition-none ${
                    isReordering ? "" : "cursor-pointer"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-[#2C2B30] tracking-wide line-clamp-2 pr-2 leading-snug">
                      {m.title}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-2">
                        {isReordering ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => handleMoveUp(idx, e)}
                              disabled={idx === 0}
                              className="w-8 h-8 rounded-lg bg-[#FAF9FF] text-[#8C66FF] disabled:opacity-30 active:bg-[#8C66FF] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none font-bold"
                              title="Naik"
                            >
                              ▲
                            </button>
                            <button
                              onClick={(e) => handleMoveDown(idx, e)}
                              disabled={idx === reorderedMaterials.length - 1}
                              className="w-8 h-8 rounded-lg bg-[#FAF9FF] text-[#8C66FF] disabled:opacity-30 active:bg-[#8C66FF] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none font-bold"
                              title="Turun"
                            >
                              ▼
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/materi/edit/${m.id}`);
                              }}
                              className="w-8 h-8 rounded-lg bg-[#FFF4EB] text-[#FF9D42] active:bg-[#FF9D42] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={(e) => handleDelete(m.id, e)}
                              className="w-8 h-8 rounded-lg bg-[#FFEAEA] text-[#FF5E8C] active:bg-[#FF5E8C] active:text-white cursor-pointer flex items-center justify-center text-xs transition-none"
                              title="Hapus"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 text-[9px] font-bold text-[#9C98A6] uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                      <FiBookOpen /> Baca Materi
                    </span>
                    <span>&bull;</span>
                    <span>Dibuat: {m.createdAt.split(" ")[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
