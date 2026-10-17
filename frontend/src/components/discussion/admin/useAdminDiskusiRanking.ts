import { useState } from "react";
import { getAnnouncementDiscussionsApi } from "../../../api/api";
import type {
  AnnouncementItem,
  DiscussionMessage,
  RankedStudent,
} from "../../../types/discussion";

const countWords = (text: string) => {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
};

export function useAdminDiskusiRanking(
  token: string | null,
  showAlert: (msg: string, title?: string) => void,
) {
  const [rankingAnnouncement, setRankingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [rankingMessages, setRankingMessages] = useState<DiscussionMessage[]>([]);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(false);

  const handleOpenRanking = async (ann: AnnouncementItem) => {
    if (!token) return;
    setRankingAnnouncement(ann);
    setLoadingRanking(true);
    try {
      const data = await getAnnouncementDiscussionsApi(token, ann.id);
      setRankingMessages(data || []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal memuat pesan diskusi.";
      showAlert(errorMsg, "Gagal Membuka Ranking");
    } finally {
      setLoadingRanking(false);
    }
  };

  const calculateAdminRanking = (): RankedStudent[] => {
    const studentMessages = rankingMessages.filter(
      (msg) => (msg.senderRole || "").toLowerCase() === "siswa",
    );

    const map: Record<string, RankedStudent> = {};

    studentMessages.forEach((msg) => {
      const wCount = countWords(msg.content);
      const isValid = wCount > 4;

      const key = `${msg.userId}_${msg.senderName}`;
      if (!map[key]) {
        map[key] = {
          userId: msg.userId,
          name: msg.senderName,
          studentClass: msg.studentClass || "Siswa",
          validCommentsCount: 0,
          totalCommentsCount: 0,
        };
      }

      map[key].totalCommentsCount++;
      if (isValid) {
        map[key].validCommentsCount++;
      }
    });

    return Object.values(map)
      .filter((s) => s.validCommentsCount > 0)
      .sort((a, b) => b.validCommentsCount - a.validCommentsCount);
  };

  const rankedStudents = calculateAdminRanking();

  return {
    rankingAnnouncement,
    setRankingAnnouncement,
    loadingRanking,
    rankedStudents,
    handleOpenRanking,
  };
}
