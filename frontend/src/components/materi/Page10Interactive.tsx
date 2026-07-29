export default function Page10Interactive() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/10_polos.png"
          alt="Halaman 10"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Overlay container centered vertically & horizontally */}
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 z-10">
          <div className="w-[90%] aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-[#8C66FF]/30 bg-black flex items-center justify-center">
            <iframe
              src="https://www.youtube.com/embed/rUohhTzyATA"
              title="Media Pembelajaran Siklus Air"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
