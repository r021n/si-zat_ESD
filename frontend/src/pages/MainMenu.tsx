import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const menus = [
    { id: "profile-report", label: "Profil & Report Hasil Belajar" },
    { id: "materi", label: "Materi" },
    { id: "simulasi", label: "Simulasi" },
    { id: "kuis", label: "Kuis" },
  ];

  const handleMenuClick = (menuId: string) => {
    if (onNavigate) {
      onNavigate(menuId);
    } else {
      navigate(`/${menuId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) return null;

  // Formatting display texts
  const displayName = user.nama || user.email.split("@")[0];
  const displayStatus = user.status.toUpperCase();

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Selamat datang,</p>
          <h1 className="text-xl font-bold truncate leading-tight uppercase tracking-wide">{displayName}</h1>
          <p className="text-xs text-neutral-600 truncate mb-1">{user.email}</p>
          
          <div className="flex gap-2 mt-1">
            <span className="inline-block text-[9px] font-mono uppercase border border-black px-2 py-0.5 bg-black text-white font-bold">
              {displayStatus}
            </span>
            <span className="inline-block text-[9px] font-mono uppercase border border-black px-2 py-0.5 bg-white text-black font-bold">
              Kelas: {user.kelas}
            </span>
          </div>
        </div>

        {/* Menu Buttons Stack */}
        <div className="w-full flex flex-col gap-4 my-auto">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu.id)}
              className="w-full py-4 px-5 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-colors duration-100 text-sm tracking-wide hover:bg-neutral-50 cursor-pointer"
            >
              {menu.label}
            </button>
          ))}
        </div>

        {/* Footer Section with Logout */}
        <div className="w-full mt-8 mb-2">
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-black bg-black text-white font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors duration-150 cursor-pointer"
          >
            Keluar
          </button>
        </div>

      </div>
    </div>
  );
}
