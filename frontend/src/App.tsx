import { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";
import MainMenu from "./pages/MainMenu";
import { useAuthStore } from "./store/authStore";

// Reusable minimal subpage to demonstrate working navigation
function SubPage({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-center items-center px-6 py-8 gap-6 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider">{title}</h2>
        <button
          onClick={() => navigate("/menu")}
          className="px-4 py-2 border border-black bg-white text-black text-xs font-bold uppercase tracking-widest active:bg-black active:text-white transition-colors duration-100 cursor-pointer"
        >
          Kembali ke Menu
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-center items-center px-6 py-8 gap-4 text-center">
        {/* Retro minimalist spinner */}
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 animate-pulse">Memuat Sesi...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { checkAuth, initialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Default route redirects to Auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* Auth Route (Login & Register switcher) */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Main Menu Route */}
        <Route path="/menu" element={<MainMenu />} />
        
        {/* Subpages routes */}
        <Route path="/profile-report" element={<SubPage title="Profil & Report Hasil Belajar" />} />
        <Route path="/materi" element={<SubPage title="Materi" />} />
        <Route path="/simulasi" element={<SubPage title="Simulasi" />} />
        <Route path="/kuis" element={<SubPage title="Kuis" />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}
