interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Memuat Sesi..." }: LoadingScreenProps) {
  return (
    <div className="w-full min-h-screen bg-white flex justify-center items-center text-black font-sans select-none">
      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-center items-center px-6 py-8 gap-4 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
