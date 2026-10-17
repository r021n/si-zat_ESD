import { useState, useEffect, useMemo } from "react";
import type { PuzzleData } from "./QuizPuzzleComponent";

export const PAIR_COLORS = [
  { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700" },
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700" },
];

function shuffleArray<T extends { pairId: string; text: string }>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (
    arr.length > 1 &&
    arr.every((item, idx) => item.pairId === array[idx].pairId)
  ) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export function useQuizPuzzle(data: PuzzleData) {
  const [shuffledRight, setShuffledRight] = useState<
    { pairId: string; text: string }[]
  >([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (data?.pairs && data.pairs.length > 0) {
      const rights = data.pairs.map((p) => ({ pairId: p.id, text: p.right }));
      setShuffledRight(shuffleArray(rights));
    }
  }, [data?.pairs]);

  const handleSelectLeft = (pairId: string) => {
    if (submitted) return;
    if (matchedPairs[pairId]) {
      const newMatches = { ...matchedPairs };
      delete newMatches[pairId];
      setMatchedPairs(newMatches);
      setSelectedLeftId(null);
      return;
    }
    setSelectedLeftId(pairId);
  };

  const handleSelectRight = (rightPairId: string) => {
    if (submitted || !selectedLeftId) return;

    const existingLeft = Object.keys(matchedPairs).find(
      (k) => matchedPairs[k] === rightPairId,
    );

    const newMatches = { ...matchedPairs };
    if (existingLeft) {
      delete newMatches[existingLeft];
    }

    newMatches[selectedLeftId] = rightPairId;
    setMatchedPairs(newMatches);
    setSelectedLeftId(null);
  };

  const isAllMatched =
    data?.pairs?.length > 0 &&
    Object.keys(matchedPairs).length === data.pairs.length;

  const correctCount = useMemo(() => {
    let count = 0;
    Object.entries(matchedPairs).forEach(([leftId, rightId]) => {
      if (leftId === rightId) count++;
    });
    return count;
  }, [matchedPairs]);

  const isFullyCorrect =
    data?.pairs?.length > 0 && correctCount === data.pairs.length;

  const handleSubmit = () => {
    if (!isAllMatched) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setMatchedPairs({});
    setSelectedLeftId(null);
    setSubmitted(false);
    if (data?.pairs) {
      const rights = data.pairs.map((p) => ({ pairId: p.id, text: p.right }));
      setShuffledRight(shuffleArray(rights));
    }
  };

  const getPairColor = (leftId: string) => {
    const pairIndex = data.pairs.findIndex((p) => p.id === leftId);
    return PAIR_COLORS[pairIndex % PAIR_COLORS.length];
  };

  return {
    shuffledRight,
    selectedLeftId,
    matchedPairs,
    submitted,
    isAllMatched,
    correctCount,
    isFullyCorrect,
    handleSelectLeft,
    handleSelectRight,
    handleSubmit,
    handleReset,
    getPairColor,
  };
}
