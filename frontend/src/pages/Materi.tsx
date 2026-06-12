import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMaterialsApi, deleteMaterialApi } from "../api/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiBookOpen,
} from "react-icons/fi";

export default function Materi() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus materi ini?",
    );
    if (!confirmDelete || !token) return;
    try {
      await deleteMaterialApi(token, id);
      setMaterials(materials.filter((m) => m.id !== id));
      alert("Materi berhasil dihapus.");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus materi.");
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        <div>
          {/* Header */}
          <div className="w-full flex justify-between items-center mt-4 border-b border-black pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                Pembelajaran
              </p>
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Materi Belajar
              </h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/materi/new")}
                className="px-2.5 py-1.5 border border-black text-[9px] font-bold uppercase tracking-wider bg-white active:bg-black active:text-white cursor-pointer flex items-center gap-1 transition-none"
              >
                <FiPlus /> Tambah Materi
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-6 flex flex-col gap-4">
            {loading ? (
              <div className="w-full flex flex-col justify-center items-center gap-4 py-12 text-center">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                  Sinkronisasi materi...
                </p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-12 border border-black border-dashed text-xs text-neutral-500 uppercase font-bold">
                Belum ada materi yang tersedia.
              </div>
            ) : (
              materials.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate(`/materi/view/${m.id}`)}
                  className="w-full border border-black p-4 bg-white cursor-pointer hover:bg-neutral-50 flex flex-col gap-2 transition-none"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xs uppercase tracking-wide line-clamp-2 pr-2">
                      {m.title}
                    </h3>
                    {isAdmin && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/materi/edit/${m.id}`);
                          }}
                          className="p-1.5 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer text-xs transition-none"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={(e) => handleDelete(m.id, e)}
                          className="p-1.5 border border-black bg-white text-black active:bg-black active:text-white cursor-pointer text-xs transition-none"
                          title="Hapus"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 text-[9px] font-mono text-neutral-500 uppercase font-bold mt-1">
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

        {/* Back Button */}
        <div className="w-full mt-8 mb-2">
          <button
            onClick={() => navigate(isAdmin ? "/admin" : "/menu")}
            className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black cursor-pointer flex items-center justify-center gap-1.5 transition-none"
          >
            <FiArrowLeft /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
