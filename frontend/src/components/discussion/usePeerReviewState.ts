import { useState, useRef, useCallback, type FormEvent } from "react";
import {
  getPeerSubmissionsApi,
  getPeerCommentsApi,
  sendPeerCommentApi,
  deletePeerCommentApi,
} from "../../api/api";
import type {
  PeerSubmissionItem,
  PeerSubmissionsResponse,
  PeerCommentItem,
  AnnouncementItem,
} from "../../types/discussion";

export function usePeerReviewState(
  token: string | null,
  selectedAnnouncement: AnnouncementItem | null,
  showAlert: (msg: string, title?: string) => void,
  showConfirm: (msg: string, title?: string) => Promise<boolean>,
) {
  const [peerData, setPeerData] = useState<PeerSubmissionsResponse | null>(null);
  const [loadingPeer, setLoadingPeer] = useState<boolean>(false);
  const [loadedPeerFor, setLoadedPeerFor] = useState<string | null>(null);
  const [selectedPeerSub, setSelectedPeerSub] = useState<PeerSubmissionItem | null>(null);
  const [peerComments, setPeerComments] = useState<PeerCommentItem[]>([]);
  const [loadingPeerComments, setLoadingPeerComments] = useState<boolean>(false);
  const [peerCommentInput, setPeerCommentInput] = useState<string>("");
  const [sendingPeerComment, setSendingPeerComment] = useState<boolean>(false);
  const peerCommentBottomRef = useRef<HTMLDivElement | null>(null);

  const fetchPeerSubmissions = useCallback(
    async (annId: string) => {
      if (!token) return;
      setLoadingPeer(true);
      try {
        const data = await getPeerSubmissionsApi(token, annId);
        setPeerData(data);
        setLoadedPeerFor(annId);
      } catch (err: unknown) {
        console.error("Error fetching peer submissions:", err);
      } finally {
        setLoadingPeer(false);
      }
    },
    [token],
  );

  const handleOpenPeerDetail = async (sub: PeerSubmissionItem) => {
    setSelectedPeerSub(sub);
    setPeerComments([]);
    setLoadingPeerComments(true);
    try {
      if (token) {
        const comments = await getPeerCommentsApi(token, sub.id);
        setPeerComments(comments || []);
        setTimeout(() => {
          peerCommentBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (err: unknown) {
      console.error("Error fetching peer comments:", err);
    } finally {
      setLoadingPeerComments(false);
    }
  };

  const handleSendPeerComment = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!peerCommentInput.trim() || !selectedPeerSub || !token || sendingPeerComment) return;

    const content = peerCommentInput.trim();
    setPeerCommentInput("");
    setSendingPeerComment(true);

    try {
      const res = await sendPeerCommentApi(token, selectedPeerSub.id, content);
      setPeerComments((prev) => [...prev, res.comment]);

      setPeerData((prev) => {
        if (!prev) return prev;
        const updatedSubs = prev.submissions.map((s) =>
          s.id === selectedPeerSub.id
            ? { ...s, commentsCount: s.commentsCount + 1, hasReviewed: true }
            : s,
        );
        return {
          ...prev,
          myReviewedCount: res.myReviewedCount,
          isRequirementMet: res.isRequirementMet,
          submissions: updatedSubs,
        };
      });

      setSelectedPeerSub((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              hasReviewed: true,
            }
          : prev,
      );

      setTimeout(() => {
        peerCommentBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengirim komentar.";
      showAlert(errorMsg, "Gagal Mengirim");
      setPeerCommentInput(content);
    } finally {
      setSendingPeerComment(false);
    }
  };

  const handleDeletePeerComment = async (commentId: string) => {
    if (!token || !selectedPeerSub) return;
    const confirmed = await showConfirm(
      "Apakah Anda yakin ingin menghapus komentar ini?",
      "Hapus Komentar",
    );
    if (!confirmed) return;

    try {
      await deletePeerCommentApi(token, commentId);
      setPeerComments((prev) => prev.filter((c) => c.id !== commentId));
      if (selectedAnnouncement) {
        fetchPeerSubmissions(selectedAnnouncement.id);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal menghapus komentar.";
      showAlert(errorMsg, "Gagal");
    }
  };

  const resetPeerState = () => {
    setPeerData(null);
    setLoadedPeerFor(null);
    setSelectedPeerSub(null);
    setPeerComments([]);
  };

  return {
    peerData,
    loadingPeer,
    loadedPeerFor,
    setLoadedPeerFor,
    selectedPeerSub,
    setSelectedPeerSub,
    peerComments,
    loadingPeerComments,
    peerCommentInput,
    setPeerCommentInput,
    sendingPeerComment,
    peerCommentBottomRef,
    fetchPeerSubmissions,
    handleOpenPeerDetail,
    handleSendPeerComment,
    handleDeletePeerComment,
    resetPeerState,
  };
}
