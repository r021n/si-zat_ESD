import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import unsLogo from "../assets/uns_logo.webp";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/menu", { replace: true });
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate("/menu");
  };

  if (user) return null; // Avoid rendering login/register briefly before redirecting

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2B2927] font-sans overflow-hidden relative">
      {/* Decorative Shapes for premium aesthetic */}
      <div className="absolute top-[-5%] left-[-15%] w-[250px] h-[250px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[220px] h-[220px] bg-[#FFEAEA] rounded-full filter blur-xl opacity-50"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10 relative">
        {/* Top Header Row */}
        <div className="w-full flex justify-between items-center mt-2 mb-2 z-20">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
              Media Pembelajaran
            </p>
            <h1 className="text-xl font-extrabold text-[#8C66FF] leading-tight mt-0.5">
              SI-ZAT
            </h1>
          </div>
          {/* Logo UNS Card */}
          <div className="h-12 px-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
            <img
              src={unsLogo}
              alt="UNS Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <div className="w-full bg-white rounded-[32px] px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-5 relative z-10 my-auto">
          {/* Segment Control / Tabs (matches Storage/Cloudes in mockup) */}
          <div className="flex bg-[#F5F3FF] p-1 rounded-full w-full mb-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-full cursor-pointer transition-none ${
                mode === "login"
                  ? "bg-[#FF5E8C] text-white shadow-sm"
                  : "text-[#9C98A6]"
              }`}
            >
              MASUK
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-full cursor-pointer transition-none ${
                mode === "register"
                  ? "bg-[#FF5E8C] text-white shadow-sm"
                  : "text-[#9C98A6]"
              }`}
            >
              DAFTAR
            </button>
          </div>

          {/* Render Form */}
          {mode === "login" ? (
            <Login
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setMode("register")}
            />
          ) : (
            <Register
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
