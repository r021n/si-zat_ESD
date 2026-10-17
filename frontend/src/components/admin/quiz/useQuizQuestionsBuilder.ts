import { useState } from "react";
import type { Question } from "../../../types/quiz";

export function useQuizQuestionsBuilder(showAlert: (msg: string, title?: string) => void) {
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      text: "",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      correctAnswers: [0],
      images: [],
      questionType: "C1",
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      showAlert("Kuis harus memiliki minimal 1 soal.", "Peringatan");
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, text } : q)),
    );
  };

  const handleQuestionTypeChange = (questionId: string, questionType: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, questionType } : q)),
    );
  };

  const handleOptionCountChange = (questionId: string, newCount: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          let currentOptions = [...q.options];
          if (newCount > currentOptions.length) {
            const letters = ["A", "B", "C", "D", "E"];
            while (currentOptions.length < newCount) {
              const letter = letters[currentOptions.length];
              currentOptions.push(`Pilihan ${letter}`);
            }
          } else if (newCount < currentOptions.length) {
            currentOptions = currentOptions.slice(0, newCount);
          }

          const correctAnswers = q.correctAnswers.filter((idx) => idx < newCount);
          const finalCorrectAnswers = correctAnswers.length === 0 ? [0] : correctAnswers;

          return {
            ...q,
            options: currentOptions,
            correctAnswers: finalCorrectAnswers,
          };
        }
        return q;
      }),
    );
  };

  const handleOptionTextChange = (questionId: string, optIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optIdx] = text;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const handleToggleCorrectAnswer = (questionId: string, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const isSelected = q.correctAnswers.includes(optIdx);
          let newCorrect: number[];
          if (isSelected) {
            if (q.correctAnswers.length <= 1) {
              showAlert("Harus ada minimal 1 jawaban benar.", "Peringatan");
              return q;
            }
            newCorrect = q.correctAnswers.filter((idx) => idx !== optIdx);
          } else {
            newCorrect = [...q.correctAnswers, optIdx].sort();
          }
          return { ...q, correctAnswers: newCorrect };
        }
        return q;
      }),
    );
  };

  const handleImageUpload = (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const readPromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((base64Images) => {
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                images: [...(q.images || []), ...base64Images],
              };
            }
            return q;
          }),
        );
      })
      .catch((err) => {
        console.error(err);
        showAlert("Gagal membaca gambar.", "Gagal");
      });
  };

  const handleRemoveImage = (questionId: string, imgIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            images: q.images.filter((_, i) => i !== imgIdx),
          };
        }
        return q;
      }),
    );
  };

  return {
    questions,
    setQuestions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionTextChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    handleOptionTextChange,
    handleToggleCorrectAnswer,
    handleImageUpload,
    handleRemoveImage,
  };
}
