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
  answersData: { answers: any; score: number; createdAt?: string }
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
