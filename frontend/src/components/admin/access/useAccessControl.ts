import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { getAccessSettingsApi, updateAccessSettingsApi } from "../../../api/api";
import { useCustomDialog } from "../../CustomDialog";
import type { ScheduleItem } from "../../../types/access";
import { isAdmin } from "../../../utils/auth";

export function useAccessControl() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { showConfirm } = useCustomDialog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isLocked, setIsLocked] = useState(false);
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) return;
      const res = await getAccessSettingsApi(token);
      if (res && res.status === "success") {
        setIsLocked(res.settings.isLocked);
        setIsScheduleEnabled(res.settings.isScheduleEnabled);
        setSchedules(res.settings.schedules || []);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memuat konfigurasi kontrol akses";
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
    fetchSettings();
  }, [user, navigate, fetchSettings]);

  const handleDeleteSchedule = async (id: string) => {
    const confirmDelete = await showConfirm(
      "Apakah Anda yakin ingin menghapus jadwal ini?",
    );
    if (confirmDelete) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleAddScheduleItem = (newSchedule: ScheduleItem) => {
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      if (!token) return;
      const res = await updateAccessSettingsApi(token, {
        isLocked,
        isScheduleEnabled,
        schedules,
      });
      if (res && res.status === "success") {
        setSuccessMsg("Pengaturan berhasil disimpan.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menyimpan perubahan.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMsg,
    isLocked,
    setIsLocked,
    isScheduleEnabled,
    setIsScheduleEnabled,
    schedules,
    handleDeleteSchedule,
    handleAddScheduleItem,
    handleSaveChanges,
  };
}
