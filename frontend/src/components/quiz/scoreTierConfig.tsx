import React from "react";
import { LuSprout, LuMountain, LuCircleCheck, LuSparkles } from "react-icons/lu";

export type ScoreTierKey = "pemula" | "pemberani" | "tangguh" | "hebat" | "luar_biasa";

export type PrimaryActionType = "open_material" | "view_review";
export type SecondaryActionType = "retake" | "view_review" | "back_to_lobby";

export interface ScoreTierConfig {
  key: ScoreTierKey;
  predicate: string;
  badgeText: string;
  statusLabel: string;
  passedKKM: boolean;
  headline: string;
  renderIcon: (className?: string) => React.ReactNode;
  theme: {
    headerBg: string;
    iconCircleBg: string;
    iconColor: string;
    badgePillBg: string;
    badgePillText: string;
    barFillColor: string;
    barEmptyColor: string;
    alertBg: string;
    alertTextColor: string;
  };
  getAlertContent: (
    correct: number,
    total: number,
    score: number,
    kkmQuestions: number,
    kkmScore: number
  ) => React.ReactNode;
  getDescriptionContent: (correct: number, total: number) => React.ReactNode;
  primaryAction: {
    label: string;
    actionType: PrimaryActionType;
  };
  secondaryAction: {
    label: string;
    actionType: SecondaryActionType;
  };
}

export function getScoreTier(correct: number, _total: number = 16, _kkmQuestions: number = 12): ScoreTierConfig {
  // 0–3: Pemula
  if (correct <= 3) {
    return {
      key: "pemula",
      predicate: "Pemula",
      badgeText: "PEMULA DI TES INI",
      statusLabel: "Belum Mencapai",
      passedKKM: false,
      headline: "Yuk, coba lagi ya",
      renderIcon: (cls = "text-[#334155]") => <LuSprout size={28} className={cls} />,
      theme: {
        headerBg: "bg-[#EDF2F7]",
        iconCircleBg: "bg-white",
        iconColor: "text-[#334155]",
        badgePillBg: "bg-white",
        badgePillText: "text-[#475569]",
        barFillColor: "bg-[#475569]",
        barEmptyColor: "bg-[#E6ECF3]",
        alertBg: "bg-[#F1F4F8]",
        alertTextColor: "text-[#334155]",
      },
      getAlertContent: () => (
        <span>Jawaban benarmu masih sedikit banget dan masih jauh dari target KKM.</span>
      ),
      getDescriptionContent: () => (
        <span>
          Pelajari kembali materinya, kemudian coba kerjakan ulang soal-soalnya lebih cermat. Tetap
          semangat, kamu pasti bisa meningkatkan hasilnya!
        </span>
      ),
      primaryAction: {
        label: "BUKA MATERI",
        actionType: "open_material",
      },
      secondaryAction: {
        label: "KERJAKAN ULANG",
        actionType: "retake",
      },
    };
  }

  // 4–7: Pemberani
  if (correct <= 7) {
    return {
      key: "pemberani",
      predicate: "Pemberani",
      badgeText: "PEMBERANI DI TES INI",
      statusLabel: "Belum Mencapai",
      passedKKM: false,
      headline: "Belum sampai KKM, tapi masih bisa dikejar",
      renderIcon: (cls = "text-[#92400E]") => <LuSprout size={28} className={cls} />,
      theme: {
        headerBg: "bg-[#FEF0E1]",
        iconCircleBg: "bg-white",
        iconColor: "text-[#92400E]",
        badgePillBg: "bg-white",
        badgePillText: "text-[#92400E]",
        barFillColor: "bg-[#C25E00]",
        barEmptyColor: "bg-[#EAEBF2]",
        alertBg: "bg-[#FFF6EE]",
        alertTextColor: "text-[#9A3412]",
      },
      getAlertContent: (corr, _tot, _sc, targetKkmQuestions) => {
        const remaining = Math.max(1, targetKkmQuestions - corr);
        return (
          <span>
            Kurang <strong className="font-extrabold text-[#7C2D12]">{remaining} soal lagi</strong>{" "}
            untuk sampai KKM.
          </span>
        );
      },
      getDescriptionContent: () => (
        <span>
          Masih ada beberapa bagian yang perlu diperbaiki. Coba baca kembali materinya lalu kerjakan
          ulang dengan lebih teliti!
        </span>
      ),
      primaryAction: {
        label: "BUKA MATERI",
        actionType: "open_material",
      },
      secondaryAction: {
        label: "LIHAT JAWABANKU",
        actionType: "view_review",
      },
    };
  }

  // 8–11: Tangguh
  if (correct <= 11) {
    return {
      key: "tangguh",
      predicate: "Tangguh",
      badgeText: "TANGGUH DI TES INI",
      statusLabel: "Hampir Mencapai",
      passedKKM: false,
      headline: "Dikit lagi nih!",
      renderIcon: (cls = "text-[#0E7490]") => <LuMountain size={28} className={cls} />,
      theme: {
        headerBg: "bg-[#DCF0F4]",
        iconCircleBg: "bg-white",
        iconColor: "text-[#0E7490]",
        badgePillBg: "bg-white",
        badgePillText: "text-[#0E7490]",
        barFillColor: "bg-[#0E7490]",
        barEmptyColor: "bg-[#EAEBF2]",
        alertBg: "bg-[#E6F5F6]",
        alertTextColor: "text-[#0E7490]",
      },
      getAlertContent: (corr, _tot, _sc, targetKkmQuestions) => {
        const remaining = Math.max(1, targetKkmQuestions - corr);
        return (
          <span>
            Kurang <strong className="font-extrabold text-[#155E75]">{remaining} soal lagi</strong>{" "}
            buat sampai KKM!
          </span>
        );
      },
      getDescriptionContent: () => (
        <span>
          Sebagian besar materi sudah kamu kuasai. Silakan tinjau kembali{" "}
          <strong className="font-bold text-[#1E293B]">soal yang masih belum tepat</strong>, karena
          hasil tersebut dapat membantu mengetahui bagian materi yang masih perlu dipahami lebih
          lanjut.
        </span>
      ),
      primaryAction: {
        label: "LIHAT JAWABANKU",
        actionType: "view_review",
      },
      secondaryAction: {
        label: "KERJAKAN ULANG",
        actionType: "retake",
      },
    };
  }

  // 12–14: Hebat
  if (correct <= 14) {
    return {
      key: "hebat",
      predicate: "Hebat",
      badgeText: "HEBAT DI TES INI",
      statusLabel: "Mencapai",
      passedKKM: true,
      headline: "Kamu lewat KKM!",
      renderIcon: (cls = "text-[#6D28D9]") => <LuCircleCheck size={28} className={cls} />,
      theme: {
        headerBg: "bg-[#EBE5FF]",
        iconCircleBg: "bg-white",
        iconColor: "text-[#6D28D9]",
        badgePillBg: "bg-white",
        badgePillText: "text-[#6D28D9]",
        barFillColor: "bg-[#6E38F7]",
        barEmptyColor: "bg-[#EAEBF2]",
        alertBg: "bg-[#F3EFFE]",
        alertTextColor: "text-[#5B21B6]",
      },
      getAlertContent: (corr, _tot, scoreVal, targetKkmQuestions) => (
        <span>
          Nilaimu <strong className="font-extrabold text-[#5B21B6]">{scoreVal}</strong>,{" "}
          {corr === targetKkmQuestions ? "pas di KKM. Mantap!" : "lewat KKM. Mantap!"}
        </span>
      ),
      getDescriptionContent: () => (
        <span>
          Masih ada beberapa soal yang belum tepat. Pelajari kembali bagian materi yang belum
          dipahami, lalu coba lagi!
        </span>
      ),
      primaryAction: {
        label: "LIHAT JAWABANKU",
        actionType: "view_review",
      },
      secondaryAction: {
        label: "KERJAKAN ULANG",
        actionType: "retake",
      },
    };
  }

  // 15–16: Luar Biasa
  return {
    key: "luar_biasa",
    predicate: "Luar Biasa",
    badgeText: "LUAR BIASA DI TES INI",
    statusLabel: "Melampaui",
    passedKKM: true,
    headline: "Keren banget!",
    renderIcon: (cls = "text-[#6D28D9]") => <LuSparkles size={28} className={cls} />,
    theme: {
      headerBg: "bg-[#EAE4FE]",
      iconCircleBg: "bg-white",
      iconColor: "text-[#6D28D9]",
      badgePillBg: "bg-white",
      badgePillText: "text-[#6D28D9]",
      barFillColor: "bg-[#6E38F7]",
      barEmptyColor: "bg-[#EAEBF2]",
      alertBg: "bg-[#F3EFFE]",
      alertTextColor: "text-[#5B21B6]",
    },
    getAlertContent: (corr, totalCount, scoreVal) => (
      <span>
        Nilaimu <strong className="font-extrabold text-[#5B21B6]">{scoreVal}</strong>, jauh di atas
        KKM. {corr === totalCount ? "Semua kamu jawab benar!" : "Hampir semua kamu jawab benar!"}
      </span>
    ),
    getDescriptionContent: (corr, totalCount) => {
      const wrongCount = Math.max(0, totalCount - corr);
      if (wrongCount === 0) {
        return (
          <span>
            Sempurna! Seluruh soal berhasil kamu jawab dengan benar tanpa cela. Pertahankan
            prestasimu dan terus asah pemahamanmu!
          </span>
        );
      }
      return (
        <span>
          Hanya tersisa{" "}
          <strong className="font-bold text-[#1E293B]">{wrongCount} soal yang perlu diperbaiki</strong>
          . Tinjau kembali jawabanmu dan pahami bagian yang masih keliru!
        </span>
      );
    },
    primaryAction: {
      label: "LIHAT JAWABANKU",
      actionType: "view_review",
    },
    secondaryAction: {
      label: "KEMBALI KE DAFTAR TES",
      actionType: "back_to_lobby",
    },
  };
}
