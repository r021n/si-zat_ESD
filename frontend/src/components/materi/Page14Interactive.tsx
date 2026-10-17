import { useState } from "react";
import type { Page14InteractiveProps } from "./types";
import { PAGE14_PUZZLE_ITEMS, PAGE14_PUZZLE_SLOTS } from "./constants";
import Page14Board from "./Page14Board";
import Page14Dock from "./Page14Dock";

export default function Page14Interactive({
  assignments,
  setAssignments,
  isSubmitted,
  onSubmit,
  onReset,
}: Page14InteractiveProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  const assignedItemIds = Object.values(assignments).filter(
    Boolean,
  ) as string[];
  const unassignedItems = PAGE14_PUZZLE_ITEMS.filter(
    (item) => !assignedItemIds.includes(item.id),
  );

  const handleAssign = (slotId: string, itemId: string) => {
    if (isSubmitted) return;

    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === itemId) next[key] = null;
      });
      next[slotId] = itemId;
      return next;
    });

    setSelectedLeftId(null);
  };

  const handleSlotClick = (slotId: string) => {
    if (isSubmitted) return;
    if (selectedLeftId) {
      handleAssign(slotId, selectedLeftId);
    } else if (assignments[slotId]) {
      const currentItem = assignments[slotId];
      setAssignments((prev) => ({ ...prev, [slotId]: null }));
      setSelectedLeftId(currentItem);
    }
  };

  const allAssigned = Object.values(assignments).every((v) => v !== null);

  const isAllCorrect =
    isSubmitted &&
    PAGE14_PUZZLE_SLOTS.every(
      (slot) => assignments[slot.id] === slot.correctItemId,
    );

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden select-none">
      <div className="relative max-h-full max-w-full aspect-9/16 flex items-center justify-center">
        <img
          src="/materi/14_polos.png"
          alt="Halaman 14"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        <Page14Board
          assignments={assignments}
          isSubmitted={isSubmitted}
          selectedLeftId={selectedLeftId}
          onSlotClick={handleSlotClick}
        />

        <Page14Dock
          assignedItemIds={assignedItemIds}
          selectedLeftId={selectedLeftId}
          unassignedItemsCount={unassignedItems.length}
          allAssigned={allAssigned}
          isSubmitted={isSubmitted}
          isAllCorrect={isAllCorrect}
          onSelectLeft={setSelectedLeftId}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </div>
    </div>
  );
}
