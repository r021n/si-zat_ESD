export interface SlideItem {
  id: number;
  type: "video" | "image";
  src: string;
}

export interface Page4InteractiveProps {
  selectedOption: string | null;
  setSelectedOption: (opt: string) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export interface Page17InteractiveProps {
  selectedOption: string | null;
  setSelectedOption: (opt: string) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export interface Page7InteractiveProps {
  assignments: Record<string, string | null>;
  setAssignments: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export interface Page14InteractiveProps {
  assignments: Record<string, string | null>;
  setAssignments: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  isSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export interface MateriIndexDrawerProps {
  show: boolean;
  onClose: () => void;
  maxUnlockedIndex: number;
  currentPage: number;
  slides: SlideItem[];
  onJumpToPage: (index: number) => void;
  onResetProgress: () => void;
}
