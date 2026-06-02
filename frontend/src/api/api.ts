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
