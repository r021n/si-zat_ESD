const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login gagal");
  }
  return data;
}

export async function registerApi(email: string, kelas: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, kelas, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registrasi gagal");
  }
  return data;
}

export async function loginWithGoogleApi(idToken: string, kelas?: string) {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken, kelas }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal autentikasi Google");
  }
  return data;
}

export async function getMeApi(token: string) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil data profil");
  }
  return data;
}

export async function updateProfileApi(
  token: string,
  profileData: { kelas: string; nama: string }
) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memperbarui profil");
  }
  return data;
}

// --- In-Memory Caching Helper ---
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let quizzesCache: CacheItem<any> | null = null;
let accessStatusCache: CacheItem<any> | null = null;

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds for quizzes
const ACCESS_STATUS_TTL_MS = 15 * 1000; // 15 seconds for access status

export function clearQuizzesCache() {
  quizzesCache = null;
}

export function clearAccessStatusCache() {
  accessStatusCache = null;
}

export async function getQuizzesApi(token: string, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && quizzesCache && (now - quizzesCache.timestamp < DEFAULT_TTL_MS)) {
    return quizzesCache.data;
  }

  const response = await fetch(`${API_URL}/api/quiz`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil kuis");
  }
  quizzesCache = { data, timestamp: now };
  return data;
}

export async function createQuizApi(token: string, quizData: any) {
  clearQuizzesCache();
  const response = await fetch(`${API_URL}/api/quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(quizData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal membuat kuis");
  }
  return data;
}

export async function updateQuizApi(token: string, id: string, quizData: any) {
  clearQuizzesCache();
  const response = await fetch(`${API_URL}/api/quiz/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(quizData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memperbarui kuis");
  }
  return data;
}

export async function deleteQuizApi(token: string, id: string) {
  clearQuizzesCache();
  const response = await fetch(`${API_URL}/api/quiz/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menghapus kuis");
  }
  return data;
}

export async function submitQuizAnswersApi(
  token: string,
  id: string,
  answersData: { answers: any; score: number; createdAt?: string; duration?: number }
) {
  const response = await fetch(`${API_URL}/api/quiz/${id}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(answersData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengirimkan jawaban kuis");
  }
  return data;
}

export async function getQuizSubmissionsApi(token: string, id: string) {
  const response = await fetch(`${API_URL}/api/quiz/${id}/submissions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil respon kuis");
  }
  return data;
}

export async function getMySubmissionsApi(token: string) {
  const response = await fetch(`${API_URL}/api/quiz/my-submissions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil riwayat kuis");
  }
  return data;
}


export async function getTaskSubmissionsApi(token: string) {
  const response = await fetch(`${API_URL}/api/tasks/submissions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil daftar tugas");
  }
  return data;
}

export async function createTaskSubmissionApi(token: string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/tasks/submissions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengumpulkan tugas");
  }
  return data;
}

export async function deleteTaskSubmissionApi(token: string, id: string) {
  const response = await fetch(`${API_URL}/api/tasks/submissions/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menghapus tugas");
  }
  return data;
}

export async function getTaskDiscussionsApi(token: string, submissionId: string) {
  const response = await fetch(`${API_URL}/api/tasks/submissions/${submissionId}/discussions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memuat diskusi");
  }
  return data;
}

export async function getOverallContributorsApi(token: string) {
  const response = await fetch(`${API_URL}/api/tasks/discussions/overall-contributors`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memuat data kontributor diskusi");
  }
  return data;
}

export async function sendTaskDiscussionApi(token: string, submissionId: string, content: string) {
  const response = await fetch(`${API_URL}/api/tasks/submissions/${submissionId}/discussions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengirimkan pesan diskusi");
  }
  return data;
}

export async function recordOpenApi(token: string) {
  const response = await fetch(`${API_URL}/api/auth/record-open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mencatat pembukaan aplikasi");
  }
  return data;
}

export async function recordUsageApi(token: string, seconds: number) {
  const response = await fetch(`${API_URL}/api/auth/record-usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ seconds })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mencatat durasi penggunaan");
  }
  return data;
}

export async function getSiswaUsersApi(token: string) {
  const response = await fetch(`${API_URL}/api/auth/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil daftar siswa");
  }
  return data;
}

export async function changeSiswaPasswordApi(token: string, id: number, newPassword: string) {
  const response = await fetch(`${API_URL}/api/auth/users/${id}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ password: newPassword })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengubah password siswa");
  }
  return data;
}

export async function recordMenuClickApi(token: string, menuKey: string) {
  const response = await fetch(`${API_URL}/api/analytics/record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ menuKey })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mencatat kunjungan menu");
  }
  return data;
}

export async function getMenuAnalyticsApi(token: string) {
  const response = await fetch(`${API_URL}/api/analytics`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil data analitik menu");
  }
  return data;
}

export async function getSiswaAnalyticsApi(token: string, userId: number) {
  const response = await fetch(`${API_URL}/api/analytics/user/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil data analitik menu siswa");
  }
  return data;
}

export async function getAccessStatusApi(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && accessStatusCache && (now - accessStatusCache.timestamp < ACCESS_STATUS_TTL_MS)) {
    return accessStatusCache.data;
  }

  const response = await fetch(`${API_URL}/api/access/status`, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil status akses aplikasi");
  }
  accessStatusCache = { data, timestamp: now };
  return data;
}

export async function getAccessSettingsApi(token: string) {
  const response = await fetch(`${API_URL}/api/access/settings`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil konfigurasi akses");
  }
  return data;
}

export async function updateAccessSettingsApi(token: string, settingsData: { isLocked: boolean; isScheduleEnabled: boolean; schedules: any[] }) {
  clearAccessStatusCache();
  const response = await fetch(`${API_URL}/api/access/settings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(settingsData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menyimpan konfigurasi akses");
  }
  return data;
}

export async function getMateriProgressApi(token: string) {
  const response = await fetch(`${API_URL}/api/materi/progress`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil progress materi");
  }
  return data;
}

export async function updateMateriProgressApi(
  token: string,
  progress: { lastPage: number; maxUnlockedIndex?: number }
) {
  const response = await fetch(`${API_URL}/api/materi/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(progress)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menyimpan progress materi");
  }
  return data;
}

export async function resetMateriProgressApi(token: string) {
  const response = await fetch(`${API_URL}/api/materi/progress/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mereset progress materi");
  }
  return data;
}

// --- Enrollment API ---

export async function getEnrollStatusApi(token: string) {
  const response = await fetch(`${API_URL}/api/enroll/status`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memeriksa status enroll");
  }
  return data;
}

export async function verifyEnrollCodeApi(token: string, code: string) {
  const response = await fetch(`${API_URL}/api/enroll/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memverifikasi kode enroll");
  }
  return data;
}

export async function getEnrollConfigApi(token: string) {
  const response = await fetch(`${API_URL}/api/enroll/config`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil konfigurasi enroll");
  }
  return data;
}

export async function generateEnrollCodeApi(token: string, deadline: string) {
  const response = await fetch(`${API_URL}/api/enroll/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ deadline })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal membuat kode enroll baru");
  }
  return data;
}

export async function getEnrollListApi(token: string) {
  const response = await fetch(`${API_URL}/api/enroll/list`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil daftar enroll");
  }
  return data;
}

export async function revokeEnrollApi(token: string, userId: number) {
  const response = await fetch(`${API_URL}/api/enroll/revoke/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mencabut enrollment");
  }
  return data;
}

// --- Ruang Diskusi / Announcement APIs with In-Memory Caching ---

let announcementsCache: CacheItem<any> | null = null;
const announcementDetailCache = new Map<string, CacheItem<any>>();
const announcementDiscussionsCache = new Map<string, CacheItem<any>>();
const announcementSubmissionsCache = new Map<string, CacheItem<any>>();

const ANNOUNCEMENT_TTL_MS = 60 * 1000; // 60s
const DISCUSSION_TTL_MS = 8 * 1000;    // 8s (fast chat cache)
const SUBMISSION_TTL_MS = 30 * 1000;   // 30s

export function clearAnnouncementsCache() {
  announcementsCache = null;
  announcementDetailCache.clear();
  announcementDiscussionsCache.clear();
  announcementSubmissionsCache.clear();
}

export async function getAnnouncementsApi(token: string, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && announcementsCache && (now - announcementsCache.timestamp < ANNOUNCEMENT_TTL_MS)) {
    return announcementsCache.data;
  }

  const response = await fetch(`${API_URL}/api/announcements`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil daftar topik diskusi");
  }
  announcementsCache = { data: data.data, timestamp: now };
  return data.data;
}

export async function getAnnouncementDetailApi(token: string, id: string, forceRefresh = false) {
  const now = Date.now();
  const cached = announcementDetailCache.get(id);
  if (!forceRefresh && cached && (now - cached.timestamp < ANNOUNCEMENT_TTL_MS)) {
    return cached.data;
  }

  const response = await fetch(`${API_URL}/api/announcements/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil detail topik diskusi");
  }
  announcementDetailCache.set(id, { data: data.data, timestamp: now });
  return data.data;
}

export async function createAnnouncementApi(token: string, body: {
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
}) {
  clearAnnouncementsCache();
  const response = await fetch(`${API_URL}/api/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal membuat topik diskusi");
  }
  return data;
}

export async function updateAnnouncementApi(token: string, id: string, body: {
  title: string;
  problem: string;
  question: string;
  taskInfo: string;
  instruction: string;
}) {
  clearAnnouncementsCache();
  const response = await fetch(`${API_URL}/api/announcements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memperbarui topik diskusi");
  }
  return data;
}

export async function deleteAnnouncementApi(token: string, id: string) {
  clearAnnouncementsCache();
  const response = await fetch(`${API_URL}/api/announcements/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menghapus topik diskusi");
  }
  return data;
}

export async function getAnnouncementDiscussionsApi(token: string, id: string, forceRefresh = false) {
  const now = Date.now();
  const cached = announcementDiscussionsCache.get(id);
  if (!forceRefresh && cached && (now - cached.timestamp < DISCUSSION_TTL_MS)) {
    return cached.data;
  }

  const response = await fetch(`${API_URL}/api/announcements/${id}/discussions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memuat diskusi");
  }
  announcementDiscussionsCache.set(id, { data: data.data, timestamp: now });
  return data.data;
}

export async function sendAnnouncementDiscussionApi(token: string, id: string, content: string) {
  announcementDiscussionsCache.delete(id);
  const response = await fetch(`${API_URL}/api/announcements/${id}/discussions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengirim pesan diskusi");
  }
  return data.data;
}

export async function getAnnouncementSubmissionsApi(token: string, id: string, forceRefresh = false) {
  const now = Date.now();
  const cached = announcementSubmissionsCache.get(id);
  if (!forceRefresh && cached && (now - cached.timestamp < SUBMISSION_TTL_MS)) {
    return cached.data;
  }

  const response = await fetch(`${API_URL}/api/announcements/${id}/submissions`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil pengumpulan tugas");
  }
  announcementSubmissionsCache.set(id, { data: data.data, timestamp: now });
  return data.data;
}

export async function submitAnnouncementTaskApi(token: string, id: string, formData: FormData) {
  announcementsCache = null;
  announcementDetailCache.delete(id);
  announcementSubmissionsCache.delete(id);
  const response = await fetch(`${API_URL}/api/announcements/${id}/submissions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengumpulkan tugas");
  }
  return data;
}

export async function deleteAnnouncementSubmissionApi(token: string, submissionId: string) {
  clearAnnouncementsCache();
  const response = await fetch(`${API_URL}/api/announcements/submissions/${submissionId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menghapus tugas");
  }
  return data;
}

export async function gradeAnnouncementSubmissionApi(
  token: string,
  submissionId: string,
  grade: number,
  feedback?: string
) {
  clearAnnouncementsCache();
  const response = await fetch(`${API_URL}/api/announcements/submissions/${submissionId}/grade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ grade, feedback })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menyimpan nilai");
  }
  return data;
}


