import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LuGlobe, LuLeaf, LuApple, LuBookOpen, LuGamepad, LuPenTool, LuChartBar } from "react-icons/lu";
import unsLogo from "../assets/uns_logo.webp";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleStart = () => {
    if (user) {
      navigate("/menu");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2B2927] font-sans select-none overflow-hidden relative">
      {/* Decorative Shapes for premium aesthetic */}
      <div className="absolute top-[-5%] left-[-15%] w-[250px] h-[250px] bg-[#E9E4FF] rounded-full filter blur-2xl opacity-65"></div>
      <div className="absolute top-[40%] right-[-20%] w-[200px] h-[200px] bg-[#FFF0E0] rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[180px] h-[180px] bg-[#FFEAEA] rounded-full filter blur-2xl opacity-60"></div>
      
      {/* Container Mobile Portrait */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between px-6 py-6 z-10 relative">
        
        {/* Top Header Row */}
        <div className="w-full flex justify-between items-center mt-2 mb-2 z-20">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">Media Pembelajaran</p>
            <h1 className="text-xl font-extrabold text-[#8C66FF] leading-tight mt-0.5">SI-ZAT</h1>
          </div>
          {/* Logo UNS Card */}
          <div className="h-12 px-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF]">
            <img src={unsLogo} alt="UNS Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>
        
        {/* Top Illustration Section */}
        <div className="w-full flex-grow flex flex-col items-center justify-center my-6">
          {/* Mockup Folder / School items illustration using CSS */}
          <div className="relative w-52 h-44 flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute top-2 right-4 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
            <div className="absolute bottom-2 left-6 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
            
            {/* The main Folder Container */}
            <div className="w-44 h-32 bg-[#FFD066] rounded-[24px] relative shadow-lg flex items-center justify-center">
              {/* Folder tab */}
              <div className="absolute -top-3 left-4 w-16 h-4 bg-[#FFD066] rounded-t-xl"></div>
              
              {/* Inserted documents */}
              <div className="absolute -top-6 left-8 w-24 h-12 bg-[#FF85A2] rounded-t-lg transform -rotate-6 shadow-sm flex items-end justify-center pb-2 text-[9px] text-white font-bold uppercase tracking-wider">
                SI-ZAT
              </div>
              <div className="absolute -top-4 right-10 w-20 h-10 bg-[#66E0FF] rounded-t-lg transform rotate-3 shadow-sm"></div>
              
              {/* Foreground detail - clean folder front */}
              <div className="absolute inset-0 bg-[#FFC33A] rounded-[24px] shadow-inner flex flex-col items-center justify-center p-4">
                <LuGlobe className="text-4xl text-[#735100]" />
                <div className="mt-2 text-[10px] font-extrabold text-[#735100] tracking-widest uppercase bg-white/40 px-2 py-0.5 rounded-full">
                  ESD MEDIA
                </div>
              </div>
            </div>
            
            {/* Small decorative plant container */}
            <div className="absolute -bottom-2 -left-2 bg-white p-2.5 rounded-2xl shadow-md flex items-center justify-center transform -rotate-12">
              <LuLeaf className="text-xl text-[#2C8578]" />
            </div>
            
            {/* Small floating apple or flower */}
            <div className="absolute -top-4 -right-1 bg-white p-2.5 rounded-full shadow-md flex items-center justify-center transform rotate-12">
              <LuApple className="text-xl text-[#D95276]" />
            </div>
          </div>
        </div>

        {/* Bottom Content Card */}
        <div className="w-full bg-white rounded-[36px] px-6 py-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex flex-col gap-5 text-center">
          
          {/* Logo / Header inside the card */}
          <div>
            <h1 className="text-3xl font-black text-[#8C66FF] uppercase tracking-wider">
              SI-ZAT
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#9C98A6] mt-1">
              Education for Sustainable Development
            </p>
          </div>

          <p className="text-xs text-[#7E7A8A] px-2 leading-relaxed">
            Media pembelajaran interaktif untuk memahami dampak zat pencemar di sekitar kita demi bumi yang berkelanjutan.
          </p>

          {/* Grid list of contents */}
          <div className="grid grid-cols-2 gap-3 my-1">
            <div className="p-3 bg-[#F3EFFF] text-[#6B52D9] rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <LuBookOpen className="text-xl mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Materi</span>
            </div>
            <div className="p-3 bg-[#E6F8F6] text-[#2C8578] rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <LuGamepad className="text-xl mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Simulasi</span>
            </div>
            <div className="p-3 bg-[#FFEBF0] text-[#D95276] rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <LuPenTool className="text-xl mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Kuis</span>
            </div>
            <div className="p-3 bg-[#FFF5EC] text-[#D97724] rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <LuChartBar className="text-xl mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Laporan</span>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="w-full mt-1">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-[0_8px_20px_rgba(255,94,140,0.3)] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Mulai Belajar</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

