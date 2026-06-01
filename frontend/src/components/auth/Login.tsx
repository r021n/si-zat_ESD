import { useState, type FormEvent } from "react";

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login submit:", { email, password });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-wider uppercase">Login</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-black">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-black text-black bg-white focus:outline-none focus:bg-black focus:text-white transition-colors duration-150 text-sm"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-black">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-3 pr-16 py-2 border border-black text-black bg-white focus:outline-none focus:bg-black focus:text-white transition-colors duration-150 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 px-2 py-1 text-xs font-mono border border-black bg-white text-black active:bg-black active:text-white hover:bg-neutral-100 transition-colors"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 py-3 border border-black bg-white text-black font-bold uppercase tracking-wider text-sm active:bg-black active:text-white transition-colors duration-100"
        >
          Masuk
        </button>
      </form>

      {/* Switch Link */}
      <div className="text-center mt-2">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-xs uppercase tracking-wider border-b border-black font-bold pb-0.5 hover:opacity-75 transition-opacity"
        >
          Belum punya akun? Daftar
        </button>
      </div>
    </div>
  );
}
