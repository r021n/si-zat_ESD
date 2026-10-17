import type { Quiz } from "../../../types/quiz";

export const defaultQuizzes: Quiz[] = [
  {
    id: "default-1",
    title: "Penilaian Hasil Belajar (Eutrofikasi & Pencemaran)",
    createdAt: new Date().toLocaleDateString("id-ID"),
    questions: [
      {
        id: "q-1-1",
        text: "Apa dampak utama dari fenomena eutrofikasi pada ekosistem perairan?",
        options: [
          "Meningkatnya kadar oksigen terlarut (DO) secara drastis",
          "Ledakan populasi alga (blooming) yang menutupi permukaan air",
          "Berkurangnya keasaman air sehingga biota air lebih sehat",
          "Penurunan populasi bakteri pengurai bahan organik",
          "Air menjadi lebih jernih dan aman dikonsumsi langsung",
        ],
        correctAnswers: [1], // Index 1 (B)
        images: [],
      },
      {
        id: "q-1-2",
        text: "Manakah dari gas berikut yang paling berkontribusi secara langsung pada efek rumah kaca global?",
        options: [
          "Oksigen (O2)",
          "Nitrogen (N2)",
          "Karbon Dioksida (CO2)",
          "Helium (He)",
          "Argon (Ar)",
        ],
        correctAnswers: [2], // Index 2 (C)
        images: [],
      },
      {
        id: "q-1-3",
        text: "Apa fungsi utama pemasangan catalytic converter pada knalpot kendaraan bermotor?",
        options: [
          "Meningkatkan konsumsi bahan bakar agar kendaraan lebih cepat",
          "Mengurangi emisi gas beracun seperti Karbon Monoksida (CO) menjadi CO2",
          "Mengubah gas nitrogen menjadi senyawa nitrogen organik",
          "Meredam kebisingan suara knalpot secara mekanis",
          "Menyaring partikel debu halus PM2.5 secara fisik",
        ],
        correctAnswers: [1], // Index 1 (B)
        images: [],
      },
      {
        id: "q-1-4",
        text: "Pencemaran tanah akibat logam berat seperti timbal (Pb) paling tepat ditangani secara ekologis menggunakan metode...",
        options: [
          "Pembakaran tanah tercemar dengan suhu di atas 1000 derajat Celcius",
          "Fitoremediasi menggunakan tanaman akumulator logam",
          "Penimbunan tanah tercemar langsung ke dalam dasar laut terdalam",
          "Penyiraman deterjen atau air sabun secara berkala",
          "Penutupan permukaan tanah tercemar dengan pasir kuarsa tebal",
        ],
        correctAnswers: [1], // Index 1 (B)
        images: [],
      },
      {
        id: "q-1-5",
        text: "Bagaimana cara berpikir sistem membantu dalam menyelesaikan krisis pencemaran lingkungan?",
        options: [
          "Fokus hanya pada penyelesaian jangka pendek tanpa melihat masa depan",
          "Memahami hubungan sebab-akibat yang kompleks antar-komponen lingkungan",
          "Mengabaikan aspek sosial dan berfokus pada teknologi murni",
          "Menyelesaikan masalah secara terpisah tanpa koordinasi antar sektor",
          "Mengurangi keterlibatan masyarakat dalam menjaga keseimbangan alam",
        ],
        correctAnswers: [1], // Index 1 (B)
        images: [],
      },
    ],
  },
  {
    id: "default-2",
    title: "Kuis Eksperimental Sistem Pencemaran",
    createdAt: new Date().toLocaleDateString("id-ID"),
    questions: [
      {
        id: "q-2-1",
        text: "Manakah tindakan di bawah ini yang dapat mengurangi dampak pencemaran air sekaligus tanah secara terintegrasi? (Pilih semua jawaban yang benar)",
        options: [
          "Mengurangi penggunaan plastik sekali pakai dan membuangnya ke sungai",
          "Menerapkan pertanian organik dengan pupuk alami ramah lingkungan",
          "Mendaur ulang oli bekas dan tidak membuangnya ke tanah atau saluran air",
          "Melakukan pembakaran sampah rumah tangga secara massal",
        ],
        correctAnswers: [1, 2], // Index 1 and 2 (B and C)
        images: [],
      },
    ],
  },
];
