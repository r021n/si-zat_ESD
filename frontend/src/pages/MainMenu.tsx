import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { verifyEnrollCodeApi } from "../api/api";
import { isAdmin } from "../utils/auth";
import MainMenuHeader from "../components/menu/MainMenuHeader";
import MainMenuPromoCard from "../components/menu/MainMenuPromoCard";
import MainMenuActivityList from "../components/menu/MainMenuActivityList";
import MainMenuStatsFooter from "../components/menu/MainMenuStatsFooter";
import LogoutModal from "../components/menu/LogoutModal";
import StatsDetailModal from "../components/menu/StatsDetailModal";
import EnrollModal from "../components/menu/EnrollModal";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
  const { user, logout, isEnrolled, enrollDeadline, setEnrolled } =
    useAuthStore();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [statsDetailModal, setStatsDetailModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleMenuClick = (menuId: string) => {
    if (onNavigate) {
      onNavigate(menuId);
    } else {
      navigate(`/${menuId}`, { state: { from: "/menu" } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleEnroll = async () => {
    if (!enrollCode.trim()) {
      setEnrollError("Masukkan kode enroll.");
      return;
    }
    setEnrollLoading(true);
    setEnrollError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Tidak terautentikasi");
      const res = await verifyEnrollCodeApi(token, enrollCode.trim());
      setEnrolled(res.deadline);
      setEnrollSuccess(true);
      setTimeout(() => {
        setIsEnrollModalOpen(false);
        setEnrollSuccess(false);
        setEnrollCode("");
      }, 1200);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memverifikasi kode enroll";
      setEnrollError(errorMsg);
    } finally {
      setEnrollLoading(false);
    }
  };

  const formatFullUsageTime = (seconds?: number) => {
    if (!seconds) return "0 detik";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (h > 0) parts.push(`${h} jam`);
    if (m > 0) parts.push(`${m} menit`);
    if (s > 0 || parts.length === 0) parts.push(`${s} detik`);

    return parts.join(" ");
  };

  const handleOpenStatsDetail = (type: "openCount" | "usageTime") => {
    if (!user) return;
    if (type === "openCount") {
      setStatsDetailModal({
        isOpen: true,
        title: "Detail Kunjungan",
        message: `Aplikasi SiZat-ESD ini telah dibuka sebanyak ${
          user.openCount ?? 0
        } kali oleh akun Anda.`,
      });
    } else {
      setStatsDetailModal({
        isOpen: true,
        title: "Detail Lama Belajar",
        message: `Total waktu belajar Anda menggunakan media interaktif ini adalah ${formatFullUsageTime(
          user.totalUsageTime,
        )}.`,
      });
    }
  };

  if (!user) return null;

  const displayName = user.nama || user.email.split("@")[0];
  const displayStatus = user.status.toUpperCase();
  const userIsAdmin = isAdmin(user);

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      {/* Decorative Blur Bubble */}
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        <div>
          <MainMenuHeader
            displayName={displayName}
            onOpenLogout={() => setIsLogoutModalOpen(true)}
          />

          <MainMenuPromoCard
            email={user.email}
            displayStatus={displayStatus}
            kelas={user.kelas}
          />

          <MainMenuActivityList
            isEnrolled={isEnrolled}
            userIsAdmin={userIsAdmin}
            onOpenEnrollModal={() => {
              setEnrollCode("");
              setEnrollError("");
              setEnrollSuccess(false);
              setIsEnrollModalOpen(true);
            }}
            onMenuClick={handleMenuClick}
          />
        </div>

        <MainMenuStatsFooter
          openCount={user.openCount}
          totalUsageTime={user.totalUsageTime}
          onOpenStatsDetail={handleOpenStatsDetail}
        />
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={handleLogout}
      />

      <StatsDetailModal
        isOpen={statsDetailModal.isOpen}
        title={statsDetailModal.title}
        message={statsDetailModal.message}
        onClose={() =>
          setStatsDetailModal((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <EnrollModal
        isOpen={isEnrollModalOpen}
        isEnrolled={isEnrolled}
        enrollDeadline={enrollDeadline}
        enrollSuccess={enrollSuccess}
        enrollLoading={enrollLoading}
        enrollError={enrollError}
        enrollCode={enrollCode}
        setEnrollCode={setEnrollCode}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setEnrollError("");
        }}
        onEnroll={handleEnroll}
      />
    </div>
  );
}
