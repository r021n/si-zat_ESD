import unsLogo from "../../assets/uns_logo.webp";

interface MainMenuHeaderProps {
  displayName: string;
  onOpenLogout: () => void;
}

export default function MainMenuHeader({
  displayName,
  onOpenLogout,
}: MainMenuHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center mt-4 mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
          Selamat datang,
        </p>
        <h1 className="text-xl font-extrabold truncate text-[#2C2B30] leading-tight mt-0.5">
          Hi, {displayName}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Logo UNS Card */}
        <div className="h-12 px-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
          <img
            src={unsLogo}
            alt="UNS Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={onOpenLogout}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#FFEAEA] text-[#FF5E8C] cursor-pointer transition-none"
          title="Keluar Sesi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
