import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useCustomDialog } from "../CustomDialog";

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const { showAlert } = useCustomDialog();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      await showAlert(err.message || "Email atau password salah.");
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-4 bg-[#FF5E8C] text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-[0_6px_16px_rgba(255,94,140,0.2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-none"
      >
        {loading ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}

