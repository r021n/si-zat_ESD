# Panduan Deployment Frontend - GitHub Pages (GitHub Actions)

Dokumen ini berisi panduan lengkap untuk melakukan deployment bagian **frontend** dari aplikasi **si-zat_ESD** ke **GitHub Pages** menggunakan **GitHub Actions** berdasarkan standar terbaru **Juni 2026**.

---

## 1. Prasyarat & Persiapan

Sebelum memulai, pastikan hal-hal berikut sudah siap:
1. Akun **GitHub** dan sebuah repository untuk proyek ini (misalnya `https://github.com/r021n/si-zat_ESD`).
2. Kode lokal sudah terhubung ke repository GitHub tersebut (`origin` remote).
3. Backend Anda sudah berhasil di-deploy (misalnya ke Vercel) dan Anda memiliki URL API backend yang aktif (misalnya `https://si-zat-backend.vercel.app`).

---

## 2. Konfigurasi Router (React Router v7)

Aplikasi ini menggunakan `HashRouter` (`src/App.tsx`). 
> [!NOTE]
> Penggunaan `HashRouter` adalah pilihan terbaik untuk GitHub Pages karena semua rute internal dikelola setelah tanda `#` di URL (contoh: `https://username.github.io/repo/#/auth`). Hal ini mencegah terjadinya error **404 Not Found** saat halaman di-refresh di server statis seperti GitHub Pages tanpa memerlukan file `404.html` tambahan.

---

## 3. Konfigurasi Vite (`vite.config.ts`)

Karena GitHub Pages secara default men-host situs di subpath repository (contoh: `https://r021n.github.io/si-zat_ESD/`), kita perlu menyesuaikan `base` path pada Vite agar file aset (JS, CSS, gambar) dapat dimuat dengan benar.

Kami telah memperbarui [vite.config.ts](file:///d:/coding/order/si-zat_ESD/frontend/vite.config.ts) dengan konfigurasi dinamis berikut:

```typescript
base: process.env.NODE_ENV === 'production' ? '/si-zat_ESD/' : '/',
```

> [!TIP]
> Jika di kemudian hari Anda menggunakan **Custom Domain** (misalnya `https://domainanda.com`), Anda dapat menghapus atau mengubah konfigurasi `base` kembali ke `'/'`.

---

## 4. Konfigurasi Workflow GitHub Actions

Untuk melakukan deployment otomatis setiap kali Anda melakukan `push` ke branch `main`, buat file workflow GitHub Actions di root proyek Anda pada jalur berikut:
📂 `.github/workflows/deploy.yml`

Berikut adalah isi file konfigurasi workflow yang optimal untuk struktur monorepo proyek ini:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches:
      - main # Trigger deployment saat push ke branch main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json'

      - name: Install Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Frontend
        working-directory: ./frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }} # Diambil dari GitHub Secrets
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Build Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 5. Pengaturan pada Dashboard GitHub

Ikuti langkah-langkah berikut di dashboard repository GitHub Anda:

### A. Mengaktifkan GitHub Actions untuk Pages
1. Masuk ke halaman repository Anda di GitHub: `https://github.com/r021n/si-zat_ESD`.
2. Klik tab **Settings** di bagian atas.
3. Pada menu bilah samping kiri (sidebar), klik **Pages** (di bawah bagian *Code and automation*).
4. Di bagian **Build and deployment** -> **Source**, pilih **GitHub Actions** dari menu dropdown (jangan gunakan *Deploy from a branch*).

### B. Menambahkan URL API Backend ke GitHub Secrets
1. Masih di menu **Settings**, klik **Secrets and variables** -> **Actions** di sidebar kiri.
2. Di tab *Secrets*, klik tombol **New repository secret**.
3. Isi kolom **Name** dengan: `VITE_API_URL`.
4. Isi kolom **Secret** dengan URL API backend Anda (contoh: `https://si-zat-backend.vercel.app`).
5. Klik **Add secret**.
   > [!IMPORTANT]
   > Nilai `VITE_API_URL` tidak boleh diakhiri dengan tanda slash (`/`). Contoh yang benar: `https://si-zat-backend.vercel.app`.

---

## 6. Cara Deploy

1. Lakukan commit untuk perubahan di atas ke git lokal Anda:
   ```bash
   git add .
   git commit -m "chore: configure vite and add deployment workflow"
   ```
2. Lakukan push ke GitHub:
   ```bash
   git push origin main
   ```
3. Buka tab **Actions** di repository GitHub Anda untuk melihat proses pembangunan (build) dan deployment berjalan.
4. Setelah selesai, URL live Anda akan muncul di bagian bawah hasil job (misalnya: `https://r021n.github.io/si-zat_ESD/`).
