import { useState, useEffect } from "react";
import {
  getTaskDiscussionsApi,
  getOverallContributorsApi,
} from "../../api/api";
import type { ContributorData } from "../../types/discussion";
import type { TaskSubmission, Message } from "./types";

export function usePortofolioContributors(
  token: string | null,
  selectedSubmission: TaskSubmission | null,
  messages: Message[],
) {
  const [isContributorModalOpen, setIsContributorModalOpen] = useState<boolean>(false);
  const [contributorModalType, setContributorModalType] = useState<"overall" | "task">("overall");
  const [contributorModalTaskTitle, setContributorModalTaskTitle] = useState<string>("");
  const [contributorModalSubmissionId, setContributorModalSubmissionId] = useState<string>("");
  const [loadingContributors, setLoadingContributors] = useState<boolean>(false);
  const [contributorsData, setContributorsData] = useState<ContributorData[]>([]);
  const [contributorsError, setContributorsError] = useState<string | null>(null);

  const handleShowTaskContributors = (submissionId: string, taskTitle: string) => {
    setContributorModalType("task");
    setContributorModalSubmissionId(submissionId);
    setContributorModalTaskTitle(taskTitle);
    setIsContributorModalOpen(true);
  };

  const handleShowOverallContributors = () => {
    setContributorModalType("overall");
    setContributorModalSubmissionId("");
    setContributorModalTaskTitle("Keseluruhan");
    setIsContributorModalOpen(true);
  };

  useEffect(() => {
    if (!isContributorModalOpen) return;

    let active = true;

    const fetchContributors = async () => {
      setLoadingContributors(true);
      setContributorsError(null);
      setContributorsData([]);

      try {
        if (contributorModalType === "overall") {
          const data = await getOverallContributorsApi(token || "");
          if (!active) return;
          const formatted = data.map((item: { name: string; studentClass?: string; count: number }) => ({
            name: item.name,
            detail: `Kelas ${item.studentClass || "-"}`,
            count: item.count,
          }));
          setContributorsData(formatted);
        } else {
          let dataToProcess: Array<{ senderRole?: string; senderName?: string; content?: string }> = [];
          if (
            selectedSubmission &&
            selectedSubmission.id === contributorModalSubmissionId &&
            messages.length > 0
          ) {
            dataToProcess = messages;
          } else {
            dataToProcess = await getTaskDiscussionsApi(token || "", contributorModalSubmissionId);
          }
          if (!active) return;

          const counts: Record<string, { name: string; count: number }> = {};
          dataToProcess.forEach((comment) => {
            const role = comment.senderRole?.toLowerCase();
            const content = comment.content || "";
            if (role === "siswa" && content.trim().length > 45 && comment.senderName) {
              const key = comment.senderName;
              if (!counts[key]) {
                counts[key] = { name: comment.senderName, count: 0 };
              }
              counts[key].count++;
            }
          });

          const sorted = Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .map((item) => ({
              name: item.name,
              count: item.count,
            }));

          setContributorsData(sorted);
        }
      } catch (err: unknown) {
        if (!active) return;
        console.error(err);
        const errorMsg =
          err instanceof Error ? err.message : "Gagal memuat data kontributor.";
        setContributorsError(errorMsg);
      } finally {
        if (active) {
          setLoadingContributors(false);
        }
      }
    };

    fetchContributors();

    return () => {
      active = false;
    };
  }, [
    isContributorModalOpen,
    contributorModalType,
    contributorModalSubmissionId,
    token,
    selectedSubmission,
    messages,
  ]);

  return {
    isContributorModalOpen,
    setIsContributorModalOpen,
    contributorModalType,
    contributorModalTaskTitle,
    loadingContributors,
    contributorsData,
    contributorsError,
    handleShowTaskContributors,
    handleShowOverallContributors,
  };
}
