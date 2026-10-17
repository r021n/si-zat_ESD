import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { LuAward } from "react-icons/lu";
import { useAppBack } from "../hooks/useAppBack";
import { usePenilaianBerpikirSistem } from "../components/portofolio/usePenilaianBerpikirSistem";
import PortofolioSubmissionsList from "../components/portofolio/PortofolioSubmissionsList";
import PortofolioChatThread from "../components/portofolio/PortofolioChatThread";
import PortofolioUploadForm from "../components/portofolio/PortofolioUploadForm";
import PortofolioHistoryView from "../components/portofolio/PortofolioHistoryView";
import PortofolioContributorModal from "../components/portofolio/PortofolioContributorModal";

export default function PenilaianBerpikirSistem() {
  const goBack = useAppBack();
  const {
    displayName,
    isAdmin,
    activeView,
    setActiveView,
    submissions,
    loadingSubmissions,
    fetchSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    isTaskCollapsed,
    setIsTaskCollapsed,
    messages,
    newMessage,
    setNewMessage,
    loadingMessages,
    chatEndRef,
    handleSendMessage,
    title,
    setTitle,
    answer,
    setAnswer,
    fileName,
    compressing,
    originalSize,
    compressedSize,
    handleFileChange,
    handleClearFile,
    handleSubmit,
    handleDelete,
    mySubmissions,
    isContributorModalOpen,
    setIsContributorModalOpen,
    contributorModalType,
    contributorModalTaskTitle,
    loadingContributors,
    contributorsData,
    contributorsError,
    handleShowTaskContributors,
    handleShowOverallContributors,
  } = usePenilaianBerpikirSistem();

  return (
    <div className="w-full h-screen max-h-screen bg-[#FAF9FF] flex justify-center items-center text-[#2C2B30] font-sans select-none overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-50 h-50 bg-[#E9E4FF] rounded-full filter blur-2xl opacity-50"></div>

      <div className="w-full max-w-107.5 h-full max-h-screen flex flex-col justify-between px-6 py-6 z-10 overflow-hidden">
        {/* Top Header Section */}
        <div>
          <div className="w-full flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => {
                  if (activeView === "list") {
                    goBack("/menu");
                  } else if (activeView === "detail") {
                    setSelectedSubmission(null);
                    setActiveView("list");
                  } else {
                    setActiveView("list");
                  }
                }}
                className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none shrink-0"
                title="Kembali"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[#9C98A6] font-bold">
                  {activeView === "list" && "Evaluasi Pembelajaran"}
                  {activeView === "detail" && "Forum Diskusi"}
                  {activeView === "upload" && "Pengumpulan Tugas"}
                  {activeView === "history" && "Riwayat Pengumpulan"}
                </p>
                <h1 className="text-xl font-extrabold text-[#2C2B30] leading-tight mt-0.5 truncate">
                  {activeView === "list" && "Berpikir Sistem"}
                  {activeView === "detail" && "Diskusi Tugas"}
                  {activeView === "upload" && "Kirim Tugas"}
                  {activeView === "history" && "Tugas Saya"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeView === "list" && (
                <button
                  onClick={() => fetchSubmissions(true)}
                  disabled={loadingSubmissions}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none"
                  title="Segarkan data"
                >
                  <FiRefreshCw size={16} className={loadingSubmissions ? "animate-spin" : ""} />
                </button>
              )}

              {activeView === "list" && isAdmin && (
                <button
                  onClick={handleShowOverallContributors}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EDFF] text-[#8C66FF] cursor-pointer active:bg-neutral-50 transition-none"
                  title="Kontributor Terbanyak (Keseluruhan)"
                >
                  <LuAward size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View switching content container */}
        <div className="w-full flex-1 flex flex-col justify-start my-2 overflow-hidden">
          {activeView === "list" && (
            <PortofolioSubmissionsList
              submissions={submissions}
              loadingSubmissions={loadingSubmissions}
              mySubmissionsCount={mySubmissions.length}
              isAdmin={isAdmin}
              onSelectSubmission={(sub) => {
                setSelectedSubmission(sub);
                setActiveView("detail");
              }}
              onGoToUpload={() => setActiveView("upload")}
              onGoToHistory={() => setActiveView("history")}
              onDeleteSubmission={handleDelete}
              onShowTaskContributors={handleShowTaskContributors}
            />
          )}

          {activeView === "detail" && selectedSubmission && (
            <PortofolioChatThread
              submission={selectedSubmission}
              isTaskCollapsed={isTaskCollapsed}
              onToggleCollapse={setIsTaskCollapsed}
              isAdmin={isAdmin}
              onDeleteSubmission={handleDelete}
              messages={messages}
              loadingMessages={loadingMessages}
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              displayName={displayName}
              chatEndRef={chatEndRef}
            />
          )}

          {activeView === "upload" && (
            <PortofolioUploadForm
              title={title}
              onTitleChange={setTitle}
              answer={answer}
              onAnswerChange={setAnswer}
              fileName={fileName}
              compressing={compressing}
              originalSize={originalSize}
              compressedSize={compressedSize}
              onFileChange={handleFileChange}
              onClearFile={handleClearFile}
              onSubmit={handleSubmit}
              onCancel={() => setActiveView("list")}
            />
          )}

          {activeView === "history" && (
            <PortofolioHistoryView
              mySubmissions={mySubmissions}
              onDeleteSubmission={handleDelete}
            />
          )}
        </div>

        {/* Contributor Modal */}
        <PortofolioContributorModal
          isOpen={isContributorModalOpen}
          onClose={() => setIsContributorModalOpen(false)}
          type={contributorModalType}
          taskTitle={contributorModalTaskTitle}
          loading={loadingContributors}
          error={contributorsError}
          contributors={contributorsData}
        />
      </div>
    </div>
  );
}
