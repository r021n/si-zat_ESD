import { useState, useEffect } from "react";
import { LOCAL_STORAGE_KEY } from "./constants";

export function useMateriInteractiveState(
  maxUnlockedIndex: number,
  setMaxUnlockedIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  const [page4Selected, setPage4Selected] = useState<string | null>(() => {
    return localStorage.getItem("sizat_materi_p4_selected") || null;
  });

  const [page4Submitted, setPage4Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p4_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 4;
  });

  const [page7Assignments, setPage7Assignments] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem("sizat_materi_p7_assignments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_e) {
        // ignore JSON parse error
      }
    }
    return { "slot-padat": null, "slot-cair": null, "slot-gas": null };
  });

  const [page7Submitted, setPage7Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p7_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 7;
  });

  const [page14Assignments, setPage14Assignments] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem("sizat_materi_p14_assignments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_e) {
        // ignore JSON parse error
      }
    }
    return {
      "slot-menguap": null,
      "slot-mencair": null,
      "slot-menyublim": null,
      "slot-mengembun": null,
    };
  });

  const [page14Submitted, setPage14Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p14_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 14;
  });

  const [page17Selected, setPage17Selected] = useState<string | null>(() => {
    return localStorage.getItem("sizat_materi_p17_selected") || null;
  });

  const [page17Submitted, setPage17Submitted] = useState<boolean>(() => {
    const saved = localStorage.getItem("sizat_materi_p17_submitted");
    if (saved === "true") return true;
    const savedMax = localStorage.getItem(LOCAL_STORAGE_KEY);
    const maxIdx = savedMax ? parseInt(savedMax, 10) : 0;
    return maxIdx >= 17;
  });

  useEffect(() => {
    if (page4Selected) localStorage.setItem("sizat_materi_p4_selected", page4Selected);
    else localStorage.removeItem("sizat_materi_p4_selected");
  }, [page4Selected]);

  useEffect(() => {
    if (page4Submitted) localStorage.setItem("sizat_materi_p4_submitted", "true");
    else localStorage.removeItem("sizat_materi_p4_submitted");
  }, [page4Submitted]);

  useEffect(() => {
    localStorage.setItem("sizat_materi_p7_assignments", JSON.stringify(page7Assignments));
  }, [page7Assignments]);

  useEffect(() => {
    if (page7Submitted) localStorage.setItem("sizat_materi_p7_submitted", "true");
    else localStorage.removeItem("sizat_materi_p7_submitted");
  }, [page7Submitted]);

  useEffect(() => {
    localStorage.setItem("sizat_materi_p14_assignments", JSON.stringify(page14Assignments));
  }, [page14Assignments]);

  useEffect(() => {
    if (page14Submitted) localStorage.setItem("sizat_materi_p14_submitted", "true");
    else localStorage.removeItem("sizat_materi_p14_submitted");
  }, [page14Submitted]);

  useEffect(() => {
    if (page17Selected) localStorage.setItem("sizat_materi_p17_selected", page17Selected);
    else localStorage.removeItem("sizat_materi_p17_selected");
  }, [page17Selected]);

  useEffect(() => {
    if (page17Submitted) localStorage.setItem("sizat_materi_p17_submitted", "true");
    else localStorage.removeItem("sizat_materi_p17_submitted");
  }, [page17Submitted]);

  const handleSubmitPage4 = () => {
    if (!page4Selected) return;
    setPage4Submitted(true);
    if (maxUnlockedIndex < 4) setMaxUnlockedIndex(4);
  };

  const handleSubmitPage7 = () => {
    const allAssigned = Object.values(page7Assignments).every((v) => v !== null);
    if (!allAssigned) return;
    setPage7Submitted(true);
    if (maxUnlockedIndex < 7) setMaxUnlockedIndex(7);
  };

  const handleSubmitPage14 = () => {
    const allAssigned = Object.values(page14Assignments).every((v) => v !== null);
    if (!allAssigned) return;
    setPage14Submitted(true);
    if (maxUnlockedIndex < 14) setMaxUnlockedIndex(14);
  };

  const handleSubmitPage17 = () => {
    if (!page17Selected) return;
    setPage17Submitted(true);
    if (maxUnlockedIndex < 17) setMaxUnlockedIndex(17);
  };

  const resetInteractiveState = () => {
    setPage4Selected(null);
    setPage4Submitted(false);
    setPage7Assignments({ "slot-padat": null, "slot-cair": null, "slot-gas": null });
    setPage7Submitted(false);
    setPage14Assignments({
      "slot-menguap": null,
      "slot-mencair": null,
      "slot-menyublim": null,
      "slot-mengembun": null,
    });
    setPage14Submitted(false);
    setPage17Selected(null);
    setPage17Submitted(false);

    localStorage.removeItem("sizat_materi_p4_selected");
    localStorage.removeItem("sizat_materi_p4_submitted");
    localStorage.removeItem("sizat_materi_p7_assignments");
    localStorage.removeItem("sizat_materi_p7_submitted");
    localStorage.removeItem("sizat_materi_p14_assignments");
    localStorage.removeItem("sizat_materi_p14_submitted");
    localStorage.removeItem("sizat_materi_p17_selected");
    localStorage.removeItem("sizat_materi_p17_submitted");
  };

  return {
    page4Selected,
    setPage4Selected,
    page4Submitted,
    setPage4Submitted,
    handleSubmitPage4,
    page7Assignments,
    setPage7Assignments,
    page7Submitted,
    setPage7Submitted,
    handleSubmitPage7,
    page14Assignments,
    setPage14Assignments,
    page14Submitted,
    setPage14Submitted,
    handleSubmitPage14,
    page17Selected,
    setPage17Selected,
    page17Submitted,
    setPage17Submitted,
    handleSubmitPage17,
    resetInteractiveState,
  };
}
