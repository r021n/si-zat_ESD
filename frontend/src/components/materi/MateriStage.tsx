import { useEffect, useRef } from "react";
import Page4Interactive from "./Page4Interactive";
import Page7Interactive from "./Page7Interactive";
import Page10Interactive from "./Page10Interactive";
import Page14Interactive from "./Page14Interactive";
import Page17Interactive from "./Page17Interactive";
import type { MateriSlide } from "./types";

interface MateriStageProps {
  currentPage: number;
  currentSlide: MateriSlide;
  page4Selected: string | null;
  setPage4Selected: (val: string | null) => void;
  page4Submitted: boolean;
  onSubmitPage4: () => void;
  onResetPage4: () => void;
  page7Assignments: Record<string, string | null>;
  setPage7Assignments: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  page7Submitted: boolean;
  onSubmitPage7: () => void;
  onResetPage7: () => void;
  page14Assignments: Record<string, string | null>;
  setPage14Assignments: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  page14Submitted: boolean;
  onSubmitPage14: () => void;
  onResetPage14: () => void;
  page17Selected: string | null;
  setPage17Selected: (val: string | null) => void;
  page17Submitted: boolean;
  onSubmitPage17: () => void;
  onResetPage17: () => void;
}

export default function MateriStage({
  currentPage,
  currentSlide,
  page4Selected,
  setPage4Selected,
  page4Submitted,
  onSubmitPage4,
  onResetPage4,
  page7Assignments,
  setPage7Assignments,
  page7Submitted,
  onSubmitPage7,
  onResetPage7,
  page14Assignments,
  setPage14Assignments,
  page14Submitted,
  onSubmitPage14,
  onResetPage14,
  page17Selected,
  setPage17Selected,
  page17Submitted,
  onSubmitPage17,
  onResetPage17,
}: MateriStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (currentSlide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentPage, currentSlide.type]);

  if (currentPage === 3) {
    return (
      <Page4Interactive
        selectedOption={page4Selected}
        setSelectedOption={setPage4Selected}
        isSubmitted={page4Submitted}
        onSubmit={onSubmitPage4}
        onReset={onResetPage4}
      />
    );
  }

  if (currentPage === 6) {
    return (
      <Page7Interactive
        assignments={page7Assignments}
        setAssignments={setPage7Assignments}
        isSubmitted={page7Submitted}
        onSubmit={onSubmitPage7}
        onReset={onResetPage7}
      />
    );
  }

  if (currentPage === 9) {
    return <Page10Interactive />;
  }

  if (currentPage === 13) {
    return (
      <Page14Interactive
        assignments={page14Assignments}
        setAssignments={setPage14Assignments}
        isSubmitted={page14Submitted}
        onSubmit={onSubmitPage14}
        onReset={onResetPage14}
      />
    );
  }

  if (currentPage === 16) {
    return (
      <Page17Interactive
        selectedOption={page17Selected}
        setSelectedOption={setPage17Selected}
        isSubmitted={page17Submitted}
        onSubmit={onSubmitPage17}
        onReset={onResetPage17}
      />
    );
  }

  if (currentSlide.type === "video") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          key={currentSlide.src}
          src={currentSlide.src}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
      <img
        src={currentSlide.src}
        alt={`Halaman ${currentPage + 1}`}
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );
}
