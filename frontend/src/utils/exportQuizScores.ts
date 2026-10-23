import * as XLSX from "xlsx";
import type { Submission } from "../types/quiz";
import { formatDurationFriendly } from "./time";

interface ExportQuizScoresOptions {
  quizTitle: string;
  submissions: Submission[];
  totalQuestions: number;
  kkmActive: boolean;
  kkmValue: number | null;
}

/**
 * SRP: Modul ini bertanggung jawab khusus untuk mengubah data pengerjaan siswa
 * ke dalam format worksheet Excel dan memicu unduhan file .xlsx.
 */
export function exportQuizScoresToExcel({
  quizTitle,
  submissions,
  totalQuestions,
  kkmActive,
  kkmValue,
}: ExportQuizScoresOptions): void {
  if (!submissions || submissions.length === 0) {
    return;
  }

  // 1. Transformasi data submission ke baris tabel Excel (KISS & DRY)
  const rows = submissions.map((sub, index) => {
    const answeredCount = Object.keys(sub.answers || {}).filter(
      (qId) => sub.answers[qId] && sub.answers[qId].length > 0,
    ).length;
    const emptyCount = Math.max(0, totalQuestions - answeredCount);

    let kkmStatus = "-";
    if (kkmActive && kkmValue !== null) {
      kkmStatus = sub.score >= kkmValue ? "Tuntas" : "Di Bawah KKM";
    }

    const submittedAt = sub.createdAt
      ? new Date(sub.createdAt).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

    return {
      No: index + 1,
      "Nama Siswa": sub.studentName || "-",
      Kelas: sub.studentClass || "-",
      "Asal Sekolah": sub.studentSchool || "-",
      Durasi: formatDurationFriendly(sub.duration),
      "Soal Terisi": answeredCount,
      "Soal Kosong": emptyCount,
      "Pelanggaran (Keluar App)": sub.violationCount ?? 0,
      "Skor Akhir": sub.score,
      "Status KKM": kkmStatus,
      "Waktu Selesai": submittedAt,
    };
  });

  // 2. Buat worksheet dan workbook Excel
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Atur lebar kolom agar rapi saat dibuka di Excel
  worksheet["!cols"] = [
    { wch: 6 },  // No
    { wch: 28 }, // Nama Siswa
    { wch: 12 }, // Kelas
    { wch: 24 }, // Asal Sekolah
    { wch: 18 }, // Durasi
    { wch: 14 }, // Soal Terisi
    { wch: 14 }, // Soal Kosong
    { wch: 26 }, // Pelanggaran
    { wch: 12 }, // Skor Akhir
    { wch: 16 }, // Status KKM
    { wch: 22 }, // Waktu Selesai
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Nilai");

  // 3. Sanitasi nama file dan trigger download
  const sanitizedTitle = quizTitle
    .replace(/[/\\?%*:|"<>]/g, "_")
    .trim()
    .slice(0, 50);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Nilai_${sanitizedTitle || "Kuis"}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
