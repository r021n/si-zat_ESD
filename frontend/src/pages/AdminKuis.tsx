import { useAppBack } from "../hooks/useAppBack";
import QuizList from "../components/admin/QuizList";
import QuizForm from "../components/admin/QuizForm";
import QuizAnalysis from "../components/admin/QuizAnalysis";
import { useAdminKuis } from "../components/admin/quiz/useAdminKuis";

export default function AdminKuis() {
  const goBack = useAppBack();
  const {
    user,
    mode,
    setMode,
    quizzes,
    setQuizzes,
    submissions,
    loading,
    editingQuizId,
    quizTitle,
    setQuizTitle,
    questions,
    selectedQuiz,
    setSelectedQuiz,
    modal,
    closeModal,
    showConfirm,
    handleCreateNewQuiz,
    handleEditQuiz,
    handleDeleteQuiz,
    handleDeleteSubmission,
    handleOpenAnalysis,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionTextChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    handleOptionTextChange,
    handleToggleCorrectAnswer,
    handleImageUpload,
    handleRemoveImage,
    handleSaveQuiz,
  } = useAdminKuis();

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9FF] flex justify-center items-start text-[#2C2B30] font-sans select-none relative py-4 md:py-8">
      {/* Decorative Blur Bubble */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#E9E4FF] rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#FFEBF0] rounded-full filter blur-3xl opacity-40"></div>
      </div>

      {/* Container Responsive Desktop & Mobile */}
      <div className="w-full max-w-107.5 md:max-w-5xl lg:max-w-6xl min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] my-auto flex flex-col justify-between px-6 py-6 md:py-6 z-10 transition-all duration-300">
        {loading ? (
          <div className="w-full flex-1 flex flex-col justify-center items-center gap-3 text-center py-24">
            <div className="w-8 h-8 border-3 border-[#8C66FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] md:text-xs uppercase font-black tracking-widest text-[#9C98A6] animate-pulse">
              Sinkronisasi data server...
            </p>
          </div>
        ) : (
          <>
            {mode === "LIST" && (
              <QuizList
                quizzes={quizzes}
                submissions={submissions}
                onCreateNewQuiz={handleCreateNewQuiz}
                onOpenAnalysis={handleOpenAnalysis}
                onEditQuiz={handleEditQuiz}
                onDeleteQuiz={handleDeleteQuiz}
                onBack={() => goBack("/admin")}
              />
            )}

            {mode === "FORM" && (
              <QuizForm
                editingQuizId={editingQuizId}
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
                questions={questions}
                onAddQuestion={handleAddQuestion}
                onRemoveQuestion={handleRemoveQuestion}
                onQuestionTextChange={handleQuestionTextChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                onOptionCountChange={handleOptionCountChange}
                onOptionTextChange={handleOptionTextChange}
                onToggleCorrectAnswer={handleToggleCorrectAnswer}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                onSave={handleSaveQuiz}
                onCancel={() => {
                  showConfirm(
                    "Batal mengedit dan buang perubahan?",
                    () => {
                      setMode("LIST");
                    },
                    "Batal Edit",
                  );
                }}
              />
            )}

            {mode === "ANALYSIS" && selectedQuiz && (
              <QuizAnalysis
                selectedQuiz={selectedQuiz}
                submissions={submissions}
                onDeleteSubmission={handleDeleteSubmission}
                onKkmChange={(kkm) => {
                  setSelectedQuiz((prev) => (prev ? { ...prev, kkm } : prev));
                  setQuizzes((prev) =>
                    prev.map((q) =>
                      q.id === selectedQuiz.id ? { ...q, kkm } : q,
                    ),
                  );
                }}
                onClose={() => {
                  setMode("LIST");
                  setSelectedQuiz(null);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Styled custom modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 md:p-6 backdrop-blur-xs">
          <div className="w-full max-w-85 md:max-w-md bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-[#F0EDFF] flex flex-col gap-4 animate-none select-none text-left">
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-[#2C2B30] tracking-wide uppercase">
                {modal.title}
              </h3>
              <p className="text-xs md:text-sm text-[#9C98A6] font-medium mt-2 leading-relaxed">
                {modal.message}
              </p>
            </div>
            <div className="flex gap-2.5 mt-2">
              {modal.type === "confirm" && (
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 bg-white border border-[#FFEAEA] text-[#FF5E8C] font-extrabold uppercase tracking-wider text-[10px] md:text-xs rounded-full shadow-sm cursor-pointer hover:bg-[#FFEAEA] transition-colors flex items-center justify-center"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  closeModal();
                  if (modal.onConfirm) modal.onConfirm();
                }}
                className="flex-1 py-3 bg-[#8C66FF] text-white font-extrabold uppercase tracking-wider text-[10px] md:text-xs rounded-full shadow-md shadow-purple-100 cursor-pointer hover:bg-[#7b55f0] transition-colors flex items-center justify-center"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
