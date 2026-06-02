import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; kelas: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/auth");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

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
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-8">
        
        {/* Header Section */}
        <div className="w-full flex flex-col gap-1 mt-6 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Selamat datang,</p>
          <h1 className="text-lg font-bold truncate">{user.email}</h1>
          <span className="inline-block self-start text-[10px] font-mono uppercase border border-black px-2 py-0.5 mt-1 bg-black text-white">
            Kelas: {user.kelas}
          </span>
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
