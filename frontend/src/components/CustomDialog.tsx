import { createContext, useContext, useState, type ReactNode } from "react";
import { FiAlertCircle, FiHelpCircle, FiEdit3 } from "react-icons/fi";

type DialogType = "alert" | "confirm" | "prompt";

interface DialogConfig {
  type: DialogType;
  message: ReactNode;
  title?: string;
  defaultValue?: string;
  resolve: (value: any) => void;
}

interface CustomDialogContextType {
  showAlert: (message: ReactNode, title?: string) => Promise<void>;
  showConfirm: (message: ReactNode, title?: string) => Promise<boolean>;
  showPrompt: (
    message: ReactNode,
    defaultValue?: string,
    title?: string,
  ) => Promise<string | null>;
}

const CustomDialogContext = createContext<CustomDialogContextType | undefined>(
  undefined,
);

export function CustomDialogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const [inputValue, setInputValue] = useState("");

  const showAlert = (message: ReactNode, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      setConfig({ type: "alert", message, title, resolve });
    });
  };

  const showConfirm = (
    message: ReactNode,
    title?: string,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({ type: "confirm", message, title, resolve });
    });
  };

  const showPrompt = (
    message: ReactNode,
    defaultValue = "",
    title?: string,
  ): Promise<string | null> => {
    setInputValue(defaultValue);
    return new Promise((resolve) => {
      setConfig({ type: "prompt", message, defaultValue, title, resolve });
    });
  };

  const handleClose = (value: any) => {
    if (config) {
      config.resolve(value);
      setConfig(null);
      setInputValue("");
    }
  };

  return (
    <CustomDialogContext.Provider
      value={{ showAlert, showConfirm, showPrompt }}
    >
      {children}

      {config && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-90 max-h-[90vh] bg-white rounded-[28px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-scale-in border border-[#F0EDFF] flex flex-col items-center gap-4 text-center">
            {/* Icon representation */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F5F3FF] shrink-0">
              {config.type === "alert" && (
                <FiAlertCircle size={28} className="text-[#8C66FF]" />
              )}
              {config.type === "confirm" && (
                <FiHelpCircle size={28} className="text-[#FF5E8C]" />
              )}
              {config.type === "prompt" && (
                <FiEdit3 size={28} className="text-[#8C66FF]" />
              )}
            </div>

            {/* Title / Description */}
            <div className="flex flex-col gap-1.5 w-full min-h-0 flex-1 overflow-hidden">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#9C98A6] shrink-0">
                {config.title || (
                  <>
                    {config.type === "alert" && "Pemberitahuan"}
                    {config.type === "confirm" && "Konfirmasi"}
                    {config.type === "prompt" && "Masukkan Teks"}
                  </>
                )}
              </h3>
              <div className="text-sm font-medium text-[#2C2B30] leading-relaxed whitespace-pre-line px-1 text-center w-full overflow-y-auto flex-1 pr-1">
                {config.message}
              </div>
            </div>

            {/* Input Field for Prompt */}
            {config.type === "prompt" && (
              <div className="w-full mt-1 shrink-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F3FF] text-[#2C2B30] border-2 border-transparent focus:border-[#8C66FF] rounded-xl focus:outline-none text-sm font-medium shadow-sm transition-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClose(inputValue);
                    if (e.key === "Escape") handleClose(null);
                  }}
                />
              </div>
            )}

            {/* Actions Buttons */}
            <div className="flex gap-3 w-full mt-2 shrink-0">
              {config.type === "confirm" && (
                <>
                  <button
                    onClick={() => handleClose(false)}
                    className="flex-1 py-3 px-4 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-none hover:bg-[#FFF5F5] active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleClose(true)}
                    className="flex-1 py-3 px-4 bg-[#8C66FF] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-none hover:bg-[#7a53f0] active:scale-95"
                  >
                    Ya
                  </button>
                </>
              )}

              {config.type === "prompt" && (
                <>
                  <button
                    onClick={() => handleClose(null)}
                    className="flex-1 py-3 px-4 bg-white border border-[#F0EDFF] text-[#9C98A6] font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-none hover:bg-neutral-50 active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleClose(inputValue)}
                    className="flex-1 py-3 px-4 bg-[#8C66FF] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-none hover:bg-[#7a53f0] active:scale-95"
                  >
                    Simpan
                  </button>
                </>
              )}

              {config.type === "alert" && (
                <button
                  onClick={() => handleClose(undefined)}
                  className="w-full py-3 px-4 bg-[#8C66FF] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-none hover:bg-[#7a53f0] active:scale-95"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomDialog() {
  const context = useContext(CustomDialogContext);
  if (!context) {
    throw new Error(
      "useCustomDialog must be used within a CustomDialogProvider",
    );
  }
  return context;
}
