import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

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
    <div className="w-full min-h-screen bg-gradient-to-b from-[#8C66FF] to-[#D4C5FF] flex justify-center items-center text-[#2B2927] font-sans overflow-hidden relative">
      {/* Decorative Bubbles */}
      <div className="absolute top-[-5%] left-[-15%] w-[250px] h-[250px] bg-[#A285FF] rounded-full filter blur-2xl opacity-60"></div>
      <div className="absolute bottom-[-5%] right-[-10%] w-[220px] h-[220px] bg-[#9570FF] rounded-full filter blur-xl opacity-40"></div>

      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-center px-6 py-6 z-10">
        <div className="w-full bg-white rounded-[32px] px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col gap-5">
          
          {/* Header Section inside Card */}
          <div className="text-center mb-1">
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#8C66FF] to-[#FF5E8C] bg-clip-text text-transparent uppercase tracking-wider">
              SI-ZAT
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#9C98A6] mt-0.5">
              Education for Sustainable Development
            </p>
          </div>

          {/* Segment Control / Tabs (matches Storage/Cloudes in mockup) */}
          <div className="flex bg-[#F5F3FF] p-1 rounded-full w-full mb-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-full cursor-pointer transition-none ${
                mode === "login"
                  ? "bg-gradient-to-r from-[#FF5E8C] to-[#8C66FF] text-white shadow-sm"
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
                  ? "bg-gradient-to-r from-[#FF5E8C] to-[#8C66FF] text-white shadow-sm"
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

