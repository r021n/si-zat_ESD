import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAppBack } from "../../hooks/useAppBack";
import { useCustomDialog } from "../CustomDialog";
import {
  getAnnouncementsApi,
  getAnnouncementDetailApi,
} from "../../api/api";
import type {
  AnnouncementItem,
} from "../../types/discussion";
import { useDebounce } from "../../hooks/useDebounce";
import { useDiscussionChat } from "./useDiscussionChat";
import { usePeerReviewState } from "./usePeerReviewState";
import { useSubmissionTask } from "./useSubmissionTask";
import { parseListItems, formatChatTime } from "./discussionUtils";

export function useRuangDiskusi() {
  const { id: paramAnnouncementId } = useParams();
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { user, token } = useAuthStore();
  const { showAlert, showConfirm } = useCustomDialog();

  // Announcements List State
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Selected Announcement Detail
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"informasi" | "diskusi" | "teman" | "riwayat">("informasi");

  // Fullscreen Image Modal
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(
    async (force = false) => {
      if (!token) return;
      setLoadingList(true);
      try {
        const data = await getAnnouncementsApi(token, force);
        setAnnouncementsList(data || []);
      } catch (err: unknown) {
        console.error("Error fetching announcements:", err);
      } finally {
        setLoadingList(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Hook 1: Discussion Chat
  const {
    discussions,
    loadingDiscussions,
    loadedDiscussionsFor,
    chatInput,
    setChatInput,
    sendingChat,
    chatBottomRef,
    fetchDiscussions,
    handleSendMessage,
    resetDiscussionChat,
  } = useDiscussionChat(token, selectedAnnouncement, showAlert);

  // Hook 2: Peer Review
  const {
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
  } = usePeerReviewState(token, selectedAnnouncement, showAlert, showConfirm);

  // Hook 3: Submissions
  const {
    mySubmission,
    setMySubmission,
    loadingSubmission,
    loadedSubmissionsFor,
    setLoadedSubmissionsFor,
    taskAnswer,
    setTaskAnswer,
    imagePreviewUrl,
    compressingImage,
    submittingTask,
    showSubmissionForm,
    setShowSubmissionForm,
    fetchSubmissions,
    handleImageSelect,
    handleClearImage,
    handleSubmitTask,
    handleDeleteSubmission,
    handlePrepareEditSubmission,
    resetSubmissionState,
  } = useSubmissionTask(
    token,
    selectedAnnouncement,
    setSelectedAnnouncement,
    fetchAnnouncements,
    setLoadedPeerFor,
    showAlert,
    showConfirm,
  );

  const ensureDiscussionsLoaded = useCallback(() => {
    if (!selectedAnnouncement) return;
    if (loadedDiscussionsFor === selectedAnnouncement.id) return;
    fetchDiscussions(selectedAnnouncement.id);
  }, [selectedAnnouncement, loadedDiscussionsFor, fetchDiscussions]);

  const ensureSubmissionsLoaded = useCallback(() => {
    if (!token || !selectedAnnouncement) return;
    if (loadedSubmissionsFor === selectedAnnouncement.id) return;
    if (!mySubmission && !selectedAnnouncement.mySubmission) {
      setMySubmission(null);
      setLoadedSubmissionsFor(selectedAnnouncement.id);
      return;
    }
    fetchSubmissions(selectedAnnouncement.id);
  }, [token, selectedAnnouncement, loadedSubmissionsFor, mySubmission, fetchSubmissions, setMySubmission, setLoadedSubmissionsFor]);

  const handleSelectAnnouncement = useCallback(
    async (annId: string, force = false) => {
      if (!token) return;

      const fromList = announcementsList.find((a) => a.id === annId);
      if (fromList && !force) {
        setSelectedAnnouncement(fromList);
        setActiveTab("informasi");
        setShowSubmissionForm(false);
        resetDiscussionChat();
        resetSubmissionState();
        resetPeerState();
        return;
      }

      try {
        const detail = await getAnnouncementDetailApi(token, annId, force);
        setSelectedAnnouncement(detail);
        setActiveTab("informasi");
        setShowSubmissionForm(false);
        resetDiscussionChat();
        setMySubmission(detail.mySubmission ?? null);
        setLoadedSubmissionsFor(annId);
        resetPeerState();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Gagal memuat detail diskusi.";
        showAlert(errorMsg, "Gagal Membuka");
      }
    },
    [token, announcementsList, showAlert, resetDiscussionChat, resetSubmissionState, resetPeerState, setMySubmission, setLoadedSubmissionsFor, setShowSubmissionForm],
  );

  const selectAnnouncementRef = useRef(handleSelectAnnouncement);
  useEffect(() => {
    selectAnnouncementRef.current = handleSelectAnnouncement;
  }, [handleSelectAnnouncement]);

  useEffect(() => {
    if (paramAnnouncementId && token && !loadingList) {
      selectAnnouncementRef.current(paramAnnouncementId);
    }
  }, [paramAnnouncementId, token, loadingList]);

  const filteredAnnouncements = announcementsList.filter((item) => {
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.problem.toLowerCase().includes(q);
    }
    return true;
  });

  const hasSubmission = !!(mySubmission || selectedAnnouncement?.mySubmission);
  const discussionCount =
    selectedAnnouncement && loadedDiscussionsFor === selectedAnnouncement.id
      ? discussions.length
      : (selectedAnnouncement?.discussionsCount ?? discussions.length);

  const openDiskusiTab = () => {
    setActiveTab("diskusi");
    ensureDiscussionsLoaded();
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const openRiwayatTab = (showForm = false) => {
    setActiveTab("riwayat");
    if (showForm) setShowSubmissionForm(true);
    ensureSubmissionsLoaded();
  };

  const openTemanTab = () => {
    setActiveTab("teman");
    setSelectedPeerSub(null);
    if (!selectedAnnouncement) return;
    if (loadedPeerFor !== selectedAnnouncement.id) {
      fetchPeerSubmissions(selectedAnnouncement.id);
    }
  };

  return {
    paramAnnouncementId,
    navigate,
    goBack,
    user,
    token,
    loadingList,
    searchQuery,
    setSearchQuery,
    filteredAnnouncements,
    fetchAnnouncements,
    selectedAnnouncement,
    setSelectedAnnouncement,
    handleSelectAnnouncement,
    activeTab,
    setActiveTab,
    openDiskusiTab,
    openTemanTab,
    openRiwayatTab,
    discussions,
    loadingDiscussions,
    chatInput,
    setChatInput,
    sendingChat,
    chatBottomRef,
    handleSendMessage,
    peerData,
    loadingPeer,
    selectedPeerSub,
    setSelectedPeerSub,
    peerComments,
    loadingPeerComments,
    peerCommentInput,
    setPeerCommentInput,
    sendingPeerComment,
    peerCommentBottomRef,
    handleOpenPeerDetail,
    handleSendPeerComment,
    handleDeletePeerComment,
    mySubmission,
    loadingSubmission,
    taskAnswer,
    setTaskAnswer,
    imagePreviewUrl,
    compressingImage,
    submittingTask,
    showSubmissionForm,
    setShowSubmissionForm,
    handleImageSelect,
    handleClearImage,
    handleSubmitTask,
    handleDeleteSubmission,
    handlePrepareEditSubmission,
    zoomImageUrl,
    setZoomImageUrl,
    parseListItems,
    formatChatTime,
    hasSubmission,
    discussionCount,
  };
}
