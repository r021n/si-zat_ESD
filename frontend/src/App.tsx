import { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CustomDialogProvider } from "./components/CustomDialog";
import { useAuthStore } from "./store/authStore";

// Hooks
import { useRouteTracker } from "./hooks/useRouteTracker";
import { useAppBackButton } from "./hooks/useAppBackButton";
import { useHeartbeatTracker } from "./hooks/useHeartbeatTracker";

// Guards & Common UI
import ProtectedRoute from "./components/guards/ProtectedRoute";
import AdminRoute from "./components/guards/AdminRoute";
import AccessGuard from "./components/guards/AccessGuard";
import EnrollGuard from "./components/guards/EnrollGuard";
import LoadingScreen from "./components/common/LoadingScreen";

// Pages
import Auth from "./pages/Auth";
import MainMenu from "./pages/MainMenu";
import Onboarding from "./pages/Onboarding";
import Simulasi from "./pages/Simulasi";
import ProfileReport from "./pages/ProfileReport";
import SimulasiPencemaranAir from "./components/simulations/water_pollution";
import SimulasiEutrofikasi from "./components/simulations/eutrophication";
import SimulasiPencemaranTanah from "./components/simulations/land_pollution";
import SimulasiPencemaranUdara from "./components/simulations/air_pollution";
import KuisMenu from "./pages/KuisMenu";
import PenilaianBerpikirSistem from "./pages/PenilaianBerpikirSistem";
import AdminMenu from "./pages/AdminMenu";
import AdminKuis from "./pages/AdminKuis";
import Materi from "./pages/Materi";
import AdminChangePassword from "./pages/AdminChangePassword";
import ProfilPengembang from "./pages/ProfilPengembang";
import AdminAccessControl from "./pages/AdminAccessControl";
import Locked from "./pages/Locked";
import EnrollPage from "./pages/EnrollPage";
import AdminEnroll from "./pages/AdminEnroll";
import RuangDiskusi from "./pages/RuangDiskusi";
import AdminDiskusi from "./pages/AdminDiskusi";

function AppListeners() {
  useRouteTracker();
  useAppBackButton();
  useHeartbeatTracker();
  return null;
}

function AppContent() {
  const { checkAuth, initialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!initialized) {
    return <LoadingScreen message="Memuat Sesi..." />;
  }

  return (
    <Router>
      <AppListeners />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/locked" element={<Locked />} />

        {/* Protected Routes (Require Authentication & Access Status Check) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AccessGuard />}>
            {/* Student & Shared Pages */}
            <Route path="/menu" element={<MainMenu />} />
            <Route path="/profile-report" element={<ProfileReport />} />
            <Route path="/profil-pengembang" element={<ProfilPengembang />} />
            <Route path="/enroll" element={<EnrollPage />} />

            {/* Routes requiring enrollment */}
            <Route element={<EnrollGuard />}>
              <Route path="/materi" element={<Materi />} />
              <Route path="/simulasi" element={<Simulasi />} />
              <Route path="/simulasi/air" element={<SimulasiPencemaranAir />} />
              <Route path="/simulasi/eutrofikasi" element={<SimulasiEutrofikasi />} />
              <Route path="/simulasi/tanah" element={<SimulasiPencemaranTanah />} />
              <Route path="/simulasi/udara" element={<SimulasiPencemaranUdara />} />
              <Route path="/kuis" element={<KuisMenu />} />
              <Route path="/kuis/berpikir-sistem" element={<PenilaianBerpikirSistem />} />
              <Route path="/ruang-diskusi" element={<RuangDiskusi />} />
              <Route path="/ruang-diskusi/:id" element={<RuangDiskusi />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminMenu />} />
              <Route path="/admin/kuis" element={<AdminKuis />} />
              <Route path="/admin/change-password" element={<AdminChangePassword />} />
              <Route path="/admin/access-control" element={<AdminAccessControl />} />
              <Route path="/admin/enrollment" element={<AdminEnroll />} />
              <Route path="/admin/diskusi" element={<AdminDiskusi />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <CustomDialogProvider>
      <AppContent />
    </CustomDialogProvider>
  );
}
