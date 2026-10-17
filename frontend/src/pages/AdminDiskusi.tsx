import AnnouncementForm from "../components/admin/AnnouncementForm";
import ZoomImageModal from "../components/discussion/ZoomImageModal";
import AdminTopicListView from "../components/discussion/admin/AdminTopicListView";
import AdminTopicSubmissionsView from "../components/discussion/admin/AdminTopicSubmissionsView";
import AdminGradingModal from "../components/discussion/admin/AdminGradingModal";
import AdminAnswerPreviewModal from "../components/discussion/admin/AdminAnswerPreviewModal";
import AdminLeaderboardModal from "../components/discussion/admin/AdminLeaderboardModal";
import { useAdminDiskusi, SUBMISSION_PAGE_SIZE } from "../components/discussion/admin/useAdminDiskusi";

export default function AdminDiskusi() {
  const {
    goBack,
    loadingList,
    searchQuery,
    setSearchQuery,
    filteredAnnouncements,
    isFormOpen,
    setIsFormOpen,
    editingAnnouncement,
    setEditingAnnouncement,
    selectedForSubmissions,
    setSelectedForSubmissions,
    loadingSubmissions,
    searchSubmissionQuery,
    setSearchSubmissionQuery,
    submissionFilterStatus,
    setSubmissionFilterStatus,
    submissionSort,
    setSubmissionSort,
    submissionPage,
    setSubmissionPage,
    showTopicDetails,
    setShowTopicDetails,
    gradingSubmission,
    setGradingSubmission,
    gradeScore,
    setGradeScore,
    gradeFeedback,
    setGradeFeedback,
    savingGrade,
    viewingAnswerSub,
    setViewingAnswerSub,
    rankingAnnouncement,
    setRankingAnnouncement,
    loadingRanking,
    zoomImageUrl,
    setZoomImageUrl,
    fetchAnnouncements,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleSaveAnnouncement,
    handleDeleteAnnouncement,
    handleOpenSubmissions,
    handleOpenGradingModal,
    handleSaveGrade,
    handleOpenRanking,
    rankedStudents,
    totalSubmissionsCount,
    gradedCount,
    ungradedCount,
    sortedSubmissions,
    totalSubmissionPages,
    paginatedSubmissions,
  } = useAdminDiskusi();

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8 overflow-x-hidden">
      {/* Decorative Blur Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 md:w-96 md:h-96 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 md:w-96 md:h-96 bg-[#FFF9E6] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Main Responsive Desktop & Mobile Container */}
      <div className="w-full min-w-0 max-w-107.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-4 sm:px-6 md:px-8 py-4 md:py-6 z-10 transition-all duration-300">
        {!selectedForSubmissions ? (
          <AdminTopicListView
            onBack={() => goBack("/admin")}
            onRefresh={() => fetchAnnouncements(true)}
            loadingList={loadingList}
            onCreateClick={handleOpenCreateForm}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredAnnouncements={filteredAnnouncements}
            onEditAnnouncement={handleOpenEditForm}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onOpenSubmissions={(ann) => handleOpenSubmissions(ann)}
            onOpenRanking={handleOpenRanking}
            onZoomImage={setZoomImageUrl}
          />
        ) : (
          <AdminTopicSubmissionsView
            announcement={selectedForSubmissions}
            onBack={() => setSelectedForSubmissions(null)}
            onRefresh={() => handleOpenSubmissions(selectedForSubmissions, true)}
            loadingSubmissions={loadingSubmissions}
            showTopicDetails={showTopicDetails}
            onToggleTopicDetails={() => setShowTopicDetails(!showTopicDetails)}
            searchSubmissionQuery={searchSubmissionQuery}
            onSearchSubmissionChange={setSearchSubmissionQuery}
            submissionFilterStatus={submissionFilterStatus}
            onFilterStatusChange={setSubmissionFilterStatus}
            totalSubmissionsCount={totalSubmissionsCount}
            gradedCount={gradedCount}
            ungradedCount={ungradedCount}
            submissionSort={submissionSort}
            onSortChange={setSubmissionSort}
            sortedSubmissions={sortedSubmissions}
            paginatedSubmissions={paginatedSubmissions}
            submissionPage={submissionPage}
            totalSubmissionPages={totalSubmissionPages}
            pageSize={SUBMISSION_PAGE_SIZE}
            onPageChange={setSubmissionPage}
            onOpenGrading={handleOpenGradingModal}
            onOpenAnswerPreview={setViewingAnswerSub}
            onZoomImage={setZoomImageUrl}
          />
        )}
      </div>

      {/* FULLSCREEN FORM */}
      {isFormOpen && (
        <AnnouncementForm
          initialData={editingAnnouncement}
          onSave={handleSaveAnnouncement}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAnnouncement(null);
          }}
        />
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <AdminGradingModal
          submission={gradingSubmission}
          gradeScore={gradeScore}
          onGradeScoreChange={setGradeScore}
          gradeFeedback={gradeFeedback}
          onGradeFeedbackChange={setGradeFeedback}
          savingGrade={savingGrade}
          onSaveGrade={handleSaveGrade}
          onClose={() => setGradingSubmission(null)}
          onZoomImage={setZoomImageUrl}
        />
      )}

      {/* ANSWER PREVIEW MODAL */}
      {viewingAnswerSub && (
        <AdminAnswerPreviewModal
          submission={viewingAnswerSub}
          onClose={() => setViewingAnswerSub(null)}
          onOpenGrading={handleOpenGradingModal}
          onZoomImage={setZoomImageUrl}
        />
      )}

      {/* LEADERBOARD MODAL */}
      {rankingAnnouncement && (
        <AdminLeaderboardModal
          announcement={rankingAnnouncement}
          rankedStudents={rankedStudents}
          loadingRanking={loadingRanking}
          onClose={() => setRankingAnnouncement(null)}
        />
      )}

      {/* ZOOM IMAGE MODAL */}
      <ZoomImageModal zoomImageUrl={zoomImageUrl} onClose={() => setZoomImageUrl(null)} />
    </div>
  );
}
