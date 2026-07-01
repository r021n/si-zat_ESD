import { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import MainMenu from "./pages/MainMenu";
import Onboarding from "./pages/Onboarding";
import Simulasi from "./pages/Simulasi";
import ProfileReport from "./pages/ProfileReport";
import SimulasiPencemaranAir from "./components/simulations/water_pollution";
import SimulasiEutrofikasi from "./components/simulations/eutrophication";
import SimulasiPencemaranTanah from "./components/simulations/land_pollution";
import SimulasiPencemaranUdara from "./components/simulations/air_pollution";
import { useAuthStore } from "./store/authStore";
import { recordOpenApi, recordUsageApi } from "./api/api";
import KuisMenu from "./pages/KuisMenu";
import PenilaianBerpikirSistem from "./pages/PenilaianBerpikirSistem";
import PengumpulanTugas from "./pages/PengumpulanTugas";
import Diskusi from "./pages/Diskusi";
import AdminMenu from "./pages/AdminMenu";
import AdminKuis from "./pages/AdminKuis";
import Materi from "./pages/Materi";
import MateriDetail from "./pages/MateriDetail";
import MateriEditor from "./pages/MateriEditor";
import AdminChangePassword from "./pages/AdminChangePassword";
import ProfilPengembang from "./pages/ProfilPengembang";



function LoadingScreen() {
  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-center items-center px-6 py-8 gap-4 text-center">
        {/* Retro minimalist spinner */}
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 animate-pulse">
          Memuat Sesi...
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { checkAuth, initialized, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user || !token) return;

    // 1. Record App Open
    const hasRecordedOpen = sessionStorage.getItem("tracked_open_session");
    if (!hasRecordedOpen) {
      sessionStorage.setItem("tracked_open_session", "true");
      recordOpenApi(token).catch((err) => {
        console.error("Gagal mencatat pembukaan aplikasi:", err);
        sessionStorage.removeItem("tracked_open_session");
      });
    }

    // 2. Track usage time
    let elapsedSeconds = 0;
    const intervalTime = 10; // Heartbeat interval in seconds
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        elapsedSeconds += 1;
        if (elapsedSeconds >= intervalTime) {
          const secondsToSend = elapsedSeconds;
          elapsedSeconds = 0;
          recordUsageApi(token, secondsToSend).catch((err) => {
            console.error("Gagal mencatat durasi penggunaan:", err);
            // Put it back to send next time
            elapsedSeconds += secondsToSend;
          });
        }
      }
    }, 1000);

    // Clean up on unmount or user change
    return () => {
      clearInterval(timer);
      if (elapsedSeconds > 0) {
        // Send remainder using fetch with keepalive: true
        fetch(`${API_URL}/api/auth/record-usage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ seconds: elapsedSeconds }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [user, token]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Default route renders Onboarding page */}
        <Route path="/" element={<Onboarding />} />

        {/* Auth Route (Login & Register switcher) */}
        <Route path="/auth" element={<Auth />} />

        {/* Main Menu Route */}
        <Route path="/menu" element={<MainMenu />} />

        {/* Subpages routes */}
        <Route
          path="/profile-report"
          element={<ProfileReport />}
        />
        <Route path="/profil-pengembang" element={<ProfilPengembang />} />
        <Route path="/materi" element={<Materi />} />
        <Route path="/materi/view/:id" element={<MateriDetail />} />
        <Route path="/admin/materi/new" element={<MateriEditor />} />
        <Route path="/admin/materi/edit/:id" element={<MateriEditor />} />

        {/* Simulasi routes */}
        <Route path="/simulasi" element={<Simulasi />} />
        <Route
          path="/simulasi/air"
          element={<SimulasiPencemaranAir />}
        />
        <Route
          path="/simulasi/eutrofikasi"
          element={<SimulasiEutrofikasi />}
        />
        <Route
          path="/simulasi/tanah"
          element={<SimulasiPencemaranTanah />}
        />
        <Route
          path="/simulasi/udara"
          element={<SimulasiPencemaranUdara />}
        />

        <Route path="/kuis" element={<KuisMenu />} />
        <Route path="/kuis/berpikir-sistem" element={<PenilaianBerpikirSistem />} />
        <Route path="/kuis/berpikir-sistem/tugas" element={<PengumpulanTugas />} />
        <Route path="/kuis/berpikir-sistem/diskusi" element={<Diskusi />} />
        <Route path="/admin" element={<AdminMenu />} />
        <Route path="/admin/kuis" element={<AdminKuis />} />
        <Route path="/admin/change-password" element={<AdminChangePassword />} />


        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}
