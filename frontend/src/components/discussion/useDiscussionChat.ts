import { useState, useRef, useCallback, type FormEvent } from "react";
import {
  getAnnouncementDiscussionsApi,
  sendAnnouncementDiscussionApi,
} from "../../api/api";
import type { DiscussionMessage, AnnouncementItem } from "../../types/discussion";

export function useDiscussionChat(
  token: string | null,
  selectedAnnouncement: AnnouncementItem | null,
  showAlert: (msg: string, title?: string) => void,
) {
  const [discussions, setDiscussions] = useState<DiscussionMessage[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState<boolean>(false);
  const [loadedDiscussionsFor, setLoadedDiscussionsFor] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const fetchDiscussions = useCallback(
    async (annId: string, force = false) => {
      if (!token) return;
      setLoadingDiscussions(true);
      try {
        const data = await getAnnouncementDiscussionsApi(token, annId, force);
        setDiscussions(data || []);
        setLoadedDiscussionsFor(annId);
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      } catch (err) {
        console.error("Error fetching discussions:", err);
      } finally {
        setLoadingDiscussions(false);
      }
    },
    [token],
  );

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedAnnouncement || !token || sendingChat) return;

    const content = chatInput.trim();
    setChatInput("");
    setSendingChat(true);

    try {
      const newMsg = await sendAnnouncementDiscussionApi(token, selectedAnnouncement.id, content);
      setDiscussions((prev) => [...prev, newMsg]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal mengirim pesan diskusi.";
      showAlert(errorMsg, "Gagal Mengirim");
      setChatInput(content);
    } finally {
      setSendingChat(false);
    }
  };

  const resetDiscussionChat = () => {
    setDiscussions([]);
    setLoadedDiscussionsFor(null);
  };

  return {
    discussions,
    setDiscussions,
    loadingDiscussions,
    loadedDiscussionsFor,
    setLoadedDiscussionsFor,
    chatInput,
    setChatInput,
    sendingChat,
    chatBottomRef,
    fetchDiscussions,
    handleSendMessage,
    resetDiscussionChat,
  };
}
