import { FiArrowLeft } from "react-icons/fi";
import { LuMessageSquare, LuClock, LuInfo, LuUsers } from "react-icons/lu";
import { useRuangDiskusi } from "../components/discussion/useRuangDiskusi";
import AnnouncementListView from "../components/discussion/AnnouncementListView";
import AnnouncementInfoTab from "../components/discussion/AnnouncementInfoTab";
import DiscussionChatTab from "../components/discussion/DiscussionChatTab";
import PeerReviewTab from "../components/discussion/PeerReviewTab";
import SubmissionHistoryTab from "../components/discussion/SubmissionHistoryTab";
import ZoomImageModal from "../components/discussion/ZoomImageModal";

export default function RuangDiskusi() {
  const {
    paramAnnouncementId,
    navigate,
    goBack,
    user,
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
  } = useRuangDiskusi();

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-between px-6 py-6 z-10">
        {!selectedAnnouncement ? (
          <AnnouncementListView
            onBack={() => goBack("/menu")}
            onRefresh={() => fetchAnnouncements(true)}
            loadingList={loadingList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredAnnouncements={filteredAnnouncements}
            onSelectAnnouncement={(id) => handleSelectAnnouncement(id)}
          />
        ) : (
          <div className="w-full flex-1 flex flex-col h-full">
            {/* Top Bar inside Detail */}
            <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-[#F0EDFF]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedAnnouncement(null);
                    if (paramAnnouncementId) navigate("/ruang-diskusi");
                  }}
                  className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F0EDFF] text-[#8C66FF] shadow-xs active:scale-95 transition-transform shrink-0 cursor-pointer"
                  title="Kembali ke Daftar"
                >
                  <FiArrowLeft size={18} />
                </button>
                <h2 className="text-base font-extrabold text-[#2C2B30]">Detail Tugas</h2>
              </div>
            </div>

            {/* 4 Tabs Bar */}
            <div className="w-full grid grid-cols-4 bg-white p-1 rounded-2xl border border-[#F0EDFF] shadow-xs mb-3">
              <button
                onClick={() => setActiveTab("informasi")}
                className={`py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "informasi"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuInfo size={13} />
                <span>Info</span>
              </button>

              <button
                onClick={openDiskusiTab}
                className={`py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 relative cursor-pointer ${
                  activeTab === "diskusi"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuMessageSquare size={13} />
                <span>Diskusi</span>
                {discussionCount > 0 && (
                  <span
                    className={`text-[8px] px-1 py-0.2 rounded-full font-black ${
                      activeTab === "diskusi" ? "bg-white text-[#8C66FF]" : "bg-[#F0ECFF] text-[#8C66FF]"
                    }`}
                  >
                    {discussionCount}
                  </span>
                )}
              </button>

              <button
                onClick={openTemanTab}
                className={`py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 relative cursor-pointer ${
                  activeTab === "teman"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuUsers size={13} />
                <span>Teman</span>
                {peerData?.isRequirementMet ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                ) : peerData && peerData.myReviewedCount > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                ) : null}
              </button>

              <button
                onClick={() => openRiwayatTab()}
                className={`py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "riwayat"
                    ? "bg-[#8C66FF] text-white shadow-xs"
                    : "text-[#9C98A6] hover:text-[#2C2B30]"
                }`}
              >
                <LuClock size={13} />
                <span>Tugas</span>
                {hasSubmission && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>}
              </button>
            </div>

            {/* TAB CONTENT 1: INFORMASI */}
            {activeTab === "informasi" && (
              <AnnouncementInfoTab
                announcement={selectedAnnouncement}
                hasSubmission={hasSubmission}
                onOpenRiwayatTab={openRiwayatTab}
                parseListItems={parseListItems}
              />
            )}

            {/* TAB CONTENT 2: FORUM DISKUSI */}
            {activeTab === "diskusi" && (
              <DiscussionChatTab
                user={user}
                discussions={discussions}
                loadingDiscussions={loadingDiscussions}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                sendingChat={sendingChat}
                onSendMessage={handleSendMessage}
                chatBottomRef={chatBottomRef}
                formatChatTime={formatChatTime}
              />
            )}

            {/* TAB CONTENT 3: TUGAS TEMAN & PEER REVIEW */}
            {activeTab === "teman" && (
              <PeerReviewTab
                user={user}
                peerData={peerData}
                loadingPeer={loadingPeer}
                selectedPeerSub={selectedPeerSub}
                onSelectPeerSub={(sub) => (sub ? handleOpenPeerDetail(sub) : setSelectedPeerSub(null))}
                peerComments={peerComments}
                loadingPeerComments={loadingPeerComments}
                peerCommentInput={peerCommentInput}
                onPeerCommentInputChange={setPeerCommentInput}
                sendingPeerComment={sendingPeerComment}
                onSendPeerComment={handleSendPeerComment}
                onDeletePeerComment={handleDeletePeerComment}
                onOpenRiwayatTab={openRiwayatTab}
                onZoomImage={setZoomImageUrl}
                peerCommentBottomRef={peerCommentBottomRef}
              />
            )}

            {/* TAB CONTENT 4: RIWAYAT / KUMPULKAN TUGAS */}
            {activeTab === "riwayat" && (
              <SubmissionHistoryTab
                loadingSubmission={loadingSubmission}
                mySubmission={mySubmission}
                showSubmissionForm={showSubmissionForm}
                onSetShowSubmissionForm={setShowSubmissionForm}
                taskAnswer={taskAnswer}
                onTaskAnswerChange={setTaskAnswer}
                imagePreviewUrl={imagePreviewUrl}
                onClearImage={handleClearImage}
                compressingImage={compressingImage}
                onImageSelect={handleImageSelect}
                submittingTask={submittingTask}
                onSubmitTask={handleSubmitTask}
                onDeleteSubmission={handleDeleteSubmission}
                onPrepareEditSubmission={handlePrepareEditSubmission}
                onZoomImage={setZoomImageUrl}
              />
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      <ZoomImageModal zoomImageUrl={zoomImageUrl} onClose={() => setZoomImageUrl(null)} />
    </div>
  );
}
