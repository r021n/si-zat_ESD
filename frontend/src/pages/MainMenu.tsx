import { useNavigate } from "react-router-dom";

interface MainMenuProps {
  onNavigate?: (menu: string) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const navigate = useNavigate();
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

  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans">
      {/* Container Mobile Portrait (constrained to typical mobile width, centered on screen) */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-center px-6 py-8">
        
        {/* Menu Buttons Stack */}
        <div className="w-full flex flex-col gap-4">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu.id)}
              className="w-full py-4 px-5 border border-black bg-white text-black text-left font-medium active:bg-black active:text-white transition-colors duration-100 text-sm tracking-wide"
            >
              {menu.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
