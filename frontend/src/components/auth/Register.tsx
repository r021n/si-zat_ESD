import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { LuEye, LuEyeOff } from "react-icons/lu";

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }
    
    try {
      await register(email, kelas, password);
      alert("Registrasi berhasil!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email Input */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
        />
      </div>

      {/* Kelas Input */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1">
          Kelas
        </label>
        <input
          type="text"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          required
          className="w-full px-4 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1">
          Password
        </label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-4 pr-16 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-[#8C66FF] cursor-pointer flex items-center justify-center transition-none focus:outline-none"
          >
            {showPassword ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#9C98A6] pl-1">
          Konfirmasi Password
        </label>
        <div className="relative flex items-center">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-4 pr-16 py-3.5 bg-[#F5F3FF] text-[#2C2B30] border-0 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#8C66FF] text-sm font-medium shadow-sm transition-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 text-[#8C66FF] cursor-pointer flex items-center justify-center transition-none focus:outline-none"
          >
            {showConfirmPassword ? <LuEyeOff className="text-lg" /> : <LuEye className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-4 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-[0_6px_16px_rgba(255,94,140,0.2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-none"
      >
        {loading ? "Mendaftar..." : "Daftar"}
      </button>
    </form>
  );
}

