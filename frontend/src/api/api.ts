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

export async function getQuizzesApi(token: string) {
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
  return data;
}

export async function createQuizApi(token: string, quizData: any) {
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

export async function getMaterialsApi(token: string) {
  const response = await fetch(`${API_URL}/api/materi`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil data materi");
  }
  return data;
}

export async function getMaterialDetailApi(token: string, id: string) {
  const response = await fetch(`${API_URL}/api/materi/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil detail materi");
  }
  return data;
}

export async function createMaterialApi(token: string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/materi`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal membuat materi");
  }
  return data;
}

export async function updateMaterialApi(token: string, id: string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/materi/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal memperbarui materi");
  }
  return data;
}

export async function reorderMaterialsApi(token: string, ids: string[]) {
  const response = await fetch(`${API_URL}/api/materi/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ ids })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengubah urutan materi");
  }
  return data;
}

export async function deleteMaterialApi(token: string, id: string) {
  const response = await fetch(`${API_URL}/api/materi/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal menghapus materi");
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

export async function getAccessStatusApi() {
  const response = await fetch(`${API_URL}/api/access/status`, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Gagal mengambil status akses aplikasi");
  }
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




