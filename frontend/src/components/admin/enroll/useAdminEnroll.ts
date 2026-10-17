import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import {
  getEnrollConfigApi,
  generateEnrollCodeApi,
  getEnrollListApi,
  revokeEnrollApi,
} from "../../../api/api";
import { useCustomDialog } from "../../CustomDialog";
import { isAdmin } from "../../../utils/auth";
import { useDebounce } from "../../../hooks/useDebounce";

export interface EnrollStudent {
  id: number;
  email: string;
  nama: string;
  kelas: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
}

export function useAdminEnroll() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { showConfirm } = useCustomDialog();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentCode, setCurrentCode] = useState("");
  const [currentDeadline, setCurrentDeadline] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [enrollList, setEnrollList] = useState<EnrollStudent[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "enrolled" | "not-enrolled"
  >("all");
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterStatus]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) return;
      const [configRes, listRes] = await Promise.all([
        getEnrollConfigApi(token),
        getEnrollListApi(token),
      ]);
      if (configRes.status === "success" && configRes.config) {
        setCurrentCode(configRes.config.code);
        setCurrentDeadline(configRes.config.deadline);
      }
      if (listRes.status === "success") {
        setEnrollList(listRes.list || []);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memuat data enroll";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate(!user ? "/auth" : "/menu");
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleGenerate = async () => {
    if (!newDeadline) {
      setError("Deadline harus diisi.");
      return;
    }

    const confirm = await showConfirm(
      "Semua enrollment siswa akan di-reset saat kode baru dibuat. Lanjutkan?",
    );
    if (!confirm) return;

    setGenerating(true);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await generateEnrollCodeApi(token, newDeadline);
      if (res.status === "success") {
        setCurrentCode(res.code);
        setCurrentDeadline(res.deadline);
        setNewDeadline("");
        setSuccessMsg("Kode enroll baru berhasil dibuat.");
        const listRes = await getEnrollListApi(token);
        if (listRes.status === "success") {
          setEnrollList(listRes.list || []);
        }
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal membuat kode enroll baru";
      setError(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (userId: number, name: string) => {
    const confirm = await showConfirm(
      `Enrollment untuk ${name} akan dicabut. Lanjutkan?`,
    );
    if (!confirm) return;

    setRevokingId(userId);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await revokeEnrollApi(token, userId);
      if (res.status === "success") {
        setEnrollList((prev) =>
          prev.map((s) =>
            s.id === userId ? { ...s, isEnrolled: false, enrolledAt: null } : s,
          ),
        );
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mencabut enrollment";
      setError(errorMsg);
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setSuccessMsg("Kode berhasil disalin!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const isExpired = currentDeadline
    ? new Date() > new Date(currentDeadline)
    : false;

  const enrolledCount = enrollList.filter((s) => s.isEnrolled).length;
  const filteredList = enrollList.filter((s) => {
    if (filterStatus === "enrolled" && !s.isEnrolled) return false;
    if (filterStatus === "not-enrolled" && s.isEnrolled) return false;
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      const nama = (s.nama || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      const kelas = (s.kelas || "").toLowerCase();
      return nama.includes(q) || email.includes(q) || kelas.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return {
    loading,
    generating,
    error,
    successMsg,
    currentCode,
    currentDeadline,
    newDeadline,
    setNewDeadline,
    enrollList,
    enrolledCount,
    filterStatus,
    setFilterStatus,
    revokingId,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    PAGE_SIZE,
    filteredList,
    totalPages,
    paginatedList,
    isExpired,
    handleGenerate,
    handleRevoke,
    handleCopyCode,
  };
}
