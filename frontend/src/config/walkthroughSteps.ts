export type WalkthroughStepId =
  | 'promo-card'
  | 'menu-enroll'
  | 'menu-materi'
  | 'menu-simulasi'
  | 'menu-kuis'
  | 'menu-ruang-diskusi'
  | 'menu-berpikir-sistem'
  | 'menu-profile-report'
  | 'menu-profil-pengembang'
  | 'menu-admin'
  | 'stats-footer'
  | 'help-button';

export interface WalkthroughStep {
  id: WalkthroughStepId;
  targetSelector: string;
  badge: string;
  title: string;
  description: string;
  tip?: string;
  preferredPosition?: 'top' | 'bottom';
}

export const WALKTHROUGH_STORAGE_KEY_PREFIX = 'sizat_walkthrough_seen_';

export function getWalkthroughStorageKey(userId?: number | string | null): string {
  return `${WALKTHROUGH_STORAGE_KEY_PREFIX}${userId ?? 'guest'}`;
}

export function hasSeenWalkthrough(
  userId?: number | string | null,
  storage?: Pick<Storage, 'getItem'>
): boolean {
  try {
    const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) return false;
    return store.getItem(getWalkthroughStorageKey(userId)) === 'true';
  } catch {
    return false;
  }
}

export function setSeenWalkthrough(
  userId?: number | string | null,
  storage?: Pick<Storage, 'setItem'>
): void {
  try {
    const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!store) return;
    store.setItem(getWalkthroughStorageKey(userId), 'true');
  } catch {
    // Ignore storage quota or access errors safely
  }
}

export function getWalkthroughSteps(isAdmin: boolean, isEnrolled = false): WalkthroughStep[] {
  const rawSteps: Omit<WalkthroughStep, 'badge'>[] = [];

  // 1. Kartu Profil & Status
  rawSteps.push({
    id: 'promo-card',
    targetSelector: '[data-walkthrough="promo-card"]',
    title: isAdmin ? 'Profil & Hak Akses' : 'Profil & Status Siswa',
    description: isAdmin
      ? 'Menampilkan identitas dan peran Anda sebagai Administrator / Guru di portal SiZat-ESD.'
      : 'Menampilkan identitas, kelas, dan status aktivasi keanggotaan Anda di portal belajar.',
    tip: isAdmin ? 'Hak akses penuh ke seluruh modul' : 'Pastikan identitas kelas sudah sesuai',
    preferredPosition: 'bottom',
  });

  // Jika siswa belum enroll dan bukan admin, tampilkan langkah tombol Enroll
  if (!isEnrolled && !isAdmin) {
    rawSteps.push({
      id: 'menu-enroll',
      targetSelector: '[data-walkthrough="menu-enroll"]',
      title: 'Enroll Modul Belajar',
      description:
        'Masukkan kode enroll yang diberikan oleh guru Anda untuk membuka akses ke materi, simulasi, dan tes.',
      tip: 'Minta kode enroll kepada guru pengajar',
      preferredPosition: 'bottom',
    });
  }

  // Jika sudah enroll atau merupakan admin, tampilkan modul pembelajaran lengkap
  if (isEnrolled || isAdmin) {
    rawSteps.push(
      {
        id: 'menu-materi',
        targetSelector: '[data-walkthrough="menu-materi"]',
        title: 'Modul Materi',
        description:
          'Pelajari konsep pencemaran zat dan dampak lingkungan secara terstruktur dan komprehensif.',
        tip: 'Baca materi dengan teliti sebelum mencoba kuis',
        preferredPosition: 'bottom',
      },
      {
        id: 'menu-simulasi',
        targetSelector: '[data-walkthrough="menu-simulasi"]',
        title: 'Laboratorium Simulasi',
        description:
          'Eksperimen interaktif untuk mengamati dampak zat pencemar pada ekosistem air, udara, dan tanah.',
        tip: 'Ubah parameter dan amati perubahannya secara realtime',
        preferredPosition: 'bottom',
      },
      {
        id: 'menu-kuis',
        targetSelector: '[data-walkthrough="menu-kuis"]',
        title: 'Tes Hasil Belajar',
        description:
          'Kuis evaluasi pilihan ganda untuk menguji tingkat pemahaman materi yang telah dipelajari.',
        tip: 'Perhatikan batas waktu pengerjaan dan KKM',
        preferredPosition: 'top',
      },
      {
        id: 'menu-ruang-diskusi',
        targetSelector: '[data-walkthrough="menu-ruang-diskusi"]',
        title: 'Ruang Diskusi & Tugas',
        description:
          'Forum interaktif untuk berdiskusi bersama guru dan rekan kelas serta mengirimkan tugas.',
        tip: 'Aktif berdiskusi dan periksa umpan balik dari guru',
        preferredPosition: 'top',
      },
      {
        id: 'menu-berpikir-sistem',
        targetSelector:
          '[data-walkthrough="menu-berpikir-sistem"], [data-walkthrough="menu-kuis-berpikir-sistem"]',
        title: 'Tes Berpikir Sistem',
        description:
          'Asesmen khusus untuk menguji keterampilan analisis berpikir sistem ESD terhadap isu lingkungan.',
        tip: 'Hubungkan sebab-akibat masalah lingkungan dengan baik',
        preferredPosition: 'top',
      }
    );
  }

  // Modul umum: Profil & Report dan Profil Pengembang
  rawSteps.push(
    {
      id: 'menu-profile-report',
      targetSelector: '[data-walkthrough="menu-profile-report"]',
      title: 'Profil & Report',
      description:
        'Lihat rekapitulasi pencapaian nilai kuis, riwayat pengumpulan tugas, dan evaluasi hasil belajar.',
      tip: 'Pantau grafik perkembangan nilaimu di sini',
      preferredPosition: 'top',
    },
    {
      id: 'menu-profil-pengembang',
      targetSelector: '[data-walkthrough="menu-profil-pengembang"]',
      title: 'Profil Pengembang',
      description:
        'Informasi pengembang media pembelajaran interaktif SiZat-ESD dari Universitas Sebelas Maret (UNS).',
      tip: 'Kenali tim pengembang di balik media belajar ini',
      preferredPosition: 'top',
    }
  );

  // Jika admin/guru, tambahkan langkah Admin Panel
  if (isAdmin) {
    rawSteps.push({
      id: 'menu-admin',
      targetSelector: '[data-walkthrough="menu-admin"]',
      title: 'Admin Panel & Kontrol',
      description:
        'Pusat kendali guru untuk mengelola bank kuis, susunan materi, jadwal tes, dan kode enroll kelas.',
      tip: 'Hanya dapat diakses oleh akun guru dan administrator',
      preferredPosition: 'top',
    });
  }

  // Statistik Belajar Footer
  rawSteps.push({
    id: 'stats-footer',
    targetSelector: '[data-walkthrough="stats-footer"]',
    title: 'Statistik Belajar',
    description:
      'Pantau keaktifan belajar Anda melalui data jumlah kunjungan dan akumulasi lama waktu belajar.',
    tip: 'Klik kartu statistik untuk melihat detail lebih lengkap',
    preferredPosition: 'top',
  });

  // Tombol Panduan (Langkah Penutup)
  rawSteps.push({
    id: 'help-button',
    targetSelector: '[data-walkthrough="help-button"]',
    title: 'Buka Panduan Kapan Saja',
    description:
      'Jika sewaktu-waktu Anda ingin mengulang atau melihat kembali panduan menu ini, tekan tombol tanda tanya ini.',
    tip: 'Tombol panduan selalu tersedia di pojok kanan atas',
    preferredPosition: 'bottom',
  });

  // Format badge dengan nomor langkah yang jelas
  const totalSteps = rawSteps.length;
  return rawSteps.map((step, idx) => ({
    ...step,
    badge: `Langkah ${idx + 1} dari ${totalSteps}`,
  }));
}
