import { useNavigate } from "react-router-dom";
import type { Quiz } from "../../types/quiz";
import { getScoreTier, type PrimaryActionType, type SecondaryActionType } from "./scoreTierConfig";
import QuizScoreSegmentedBar from "./QuizScoreSegmentedBar";

interface QuizScoreResultCardProps {
  quiz: Quiz;
  score: number;
  correct: number;
  total: number;
  onViewReview: () => void;
  onBackToLobby: () => void;
}

export default function QuizScoreResultCard({
  quiz,
  score,
  correct,
  total,
  onViewReview,
  onBackToLobby,
}: QuizScoreResultCardProps) {
  const navigate = useNavigate();

  // Derive target questions and score threshold for KKM
  // In the DB/admin, quiz.kkm is typically an integer score (0-100, e.g. 70 or 75)
  // If quiz.kkm is not specified, default to 75% of total questions (12 for 16-question quiz)
  const rawKkm = quiz.kkm;
  let kkmQuestions: number;
  let kkmScore: number;

  if (typeof rawKkm === "number" && rawKkm > 0) {
    if (rawKkm <= total) {
      // If entered as number of questions (e.g. 12)
      kkmQuestions = rawKkm;
      kkmScore = Math.round((kkmQuestions / total) * 100);
    } else {
      // If entered as a percentage score out of 100 (e.g. 70 or 75)
      kkmScore = rawKkm;
      kkmQuestions = Math.min(total, Math.ceil((kkmScore / 100) * total));
    }
  } else {
    // Default 12 questions for 16 questions (75%)
    kkmQuestions = Math.min(total, Math.ceil(total * 0.75));
    kkmScore = Math.round((kkmQuestions / total) * 100);
  }

  const tier = getScoreTier(correct, total, kkmQuestions);

  const handlePrimaryAction = (actionType: PrimaryActionType) => {
    switch (actionType) {
      case "open_material":
        navigate("/materi");
        break;
      case "view_review":
        onViewReview();
        break;
    }
  };

  const handleSecondaryAction = (actionType: SecondaryActionType) => {
    switch (actionType) {
      case "view_review":
        onViewReview();
        break;
      case "back_to_lobby":
        onBackToLobby();
        break;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Outer Card with 2-part structure matching design mockup */}
      <div className="w-full bg-white rounded-[28px] overflow-hidden shadow-xl shadow-purple-900/5 border border-[#F0EDFF] flex flex-col">
        {/* Upper Themed Header Section */}
        <div className={`w-full ${tier.theme.headerBg} pt-6 pb-6 px-5 flex flex-col items-center text-center transition-colors duration-300`}>
          {/* Centered Circular Icon Badge */}
          <div
            className={`w-14 h-14 rounded-full ${tier.theme.iconCircleBg} shadow-sm flex items-center justify-center mb-3.5`}
          >
            {tier.renderIcon(tier.theme.iconColor)}
          </div>

          {/* Badge Chips Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span
              className={`${tier.theme.badgePillBg} ${tier.theme.badgePillText} text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs`}
            >
              {tier.badgeText}
            </span>

            {tier.passedKKM && (
              <span className="bg-[#5B21B6] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                LEWAT KKM
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight leading-snug px-2 mt-1">
            {tier.headline}
          </h2>
        </div>

        {/* Lower White Body Section */}
        <div className="p-5 sm:p-6 bg-white flex flex-col gap-4">
          {/* Segmented Progress Bar */}
          <QuizScoreSegmentedBar
            correct={correct}
            total={total}
            score={score}
            kkmQuestions={kkmQuestions}
            kkmScore={kkmScore}
            barFillColor={tier.theme.barFillColor}
            barEmptyColor={tier.theme.barEmptyColor}
          />

          {/* Alert / Highlight Callout Box */}
          <div
            className={`rounded-2xl p-4 text-[11.5px] sm:text-xs font-semibold leading-relaxed ${tier.theme.alertBg} ${tier.theme.alertTextColor} border border-black/5`}
          >
            {tier.getAlertContent(correct, total, score, kkmQuestions, kkmScore)}
          </div>

          {/* Narrative Evaluation Paragraph */}
          <p className="text-[11.5px] sm:text-xs text-[#64748B] font-medium leading-relaxed text-left">
            {tier.getDescriptionContent(correct, total)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => handlePrimaryAction(tier.primaryAction.actionType)}
              className="w-full py-3.5 bg-[#6E38F7] hover:bg-[#5D2EE0] text-white font-extrabold uppercase tracking-wider text-[11px] rounded-full shadow-md shadow-purple-200 cursor-pointer transition-all flex items-center justify-center active:scale-[0.99]"
            >
              {tier.primaryAction.label}
            </button>

            <button
              onClick={() => handleSecondaryAction(tier.secondaryAction.actionType)}
              className="w-full py-3.5 bg-white border border-[#D8CCFD] hover:bg-[#FAF9FF] text-[#6E38F7] font-extrabold uppercase tracking-wider text-[11px] rounded-full shadow-xs cursor-pointer transition-all flex items-center justify-center active:scale-[0.99]"
            >
              {tier.secondaryAction.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
