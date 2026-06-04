# Panduan Deployment Backend - Vercel

Dokumen ini berisi panduan lengkap untuk melakukan deployment bagian **backend** dari aplikasi **si-zat_ESD** ke **Vercel** sebagai Serverless Functions berdasarkan standar terbaru **Juni 2026**.

---

## 1. Prasyarat & Persiapan

Sebelum memulai, pastikan hal-hal berikut sudah siap:
1. Akun **Vercel** yang terhubung dengan akun GitHub Anda.
2. Akun **Turso Database** (SQLite cloud) dan database aktif. Anda memerlukan dua nilai:
   - `TURSO_DATABASE_URL` (contoh: `libsql://nama-db-username.turso.io`)
   - `TURSO_AUTH_TOKEN` (token otentikasi Turso Anda)
3. Aplikasi Anda sudah berada di dalam repository GitHub (monorepo).

---

## 2. Konfigurasi Code Backend (Hono)

Vercel mendukung deployment **Hono** secara **zero-configuration**. Vercel akan otomatis mengenali Hono sebagai serverless function jika ia diekspor sebagai `default export` pada file entrypoint.

Kami telah menyesuaikan [backend/src/index.ts](file:///d:/coding/order/si-zat_ESD/backend/src/index.ts) agar mendukung deployment lokal dan serverless di Vercel:

```typescript
const port = Number(process.env.PORT) || 8787

// Hanya jalankan serve() lokal jika tidak berjalan di Vercel
if (!process.env.VERCEL) {
  import('@hono/node-server').then(({ serve }) => {
    console.log(`API running on http://localhost:${port}`)
    serve({ fetch: app.fetch, port })
  }).catch(err => {
    console.error('Failed to start local server:', err)
  })
}

export default app // Ekspor default wajib untuk Vercel
```

> [!NOTE]
> Modul `@hono/node-server/vercel` yang lama kini sudah tidak digunakan lagi (deprecated). Pendekatan modern menggunakan `export default app` secara langsung jauh lebih stabil, efisien, dan otomatis terintegrasi dengan infrastruktur **Vercel Fluid Compute**.

---

## 3. Langkah Deployment via Vercel Dashboard (Rekomendasi)

Metode ini paling direkomendasikan karena otomatis melakukan re-deploy setiap kali Anda melakukan push ke branch `main`.

1. Masuk ke **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Klik tombol **Add New...** -> **Project**.
3. Cari repository Anda (`si-zat_ESD`) dan klik **Import**.
4. Pada opsi **Configure Project**, lakukan penyesuaian berikut:
   - **Project Name**: Masukkan nama backend Anda (contoh: `si-zat-backend`).
   - **Framework Preset**: Pilih **Other** (atau biarkan default).
   - **Root Directory**: Klik **Edit** dan pilih folder **`backend`** (karena ini adalah proyek monorepo).
5. Pada bagian **Build and Development Settings**:
   - Biarkan kosong (Default). Vercel akan membaca file `src/index.ts` secara otomatis menggunakan engine Node.js builder bawaan.
6. Pada bagian **Environment Variables**, tambahkan variabel berikut:
   - `TURSO_DATABASE_URL` = (URL database Turso Anda)
   - `TURSO_AUTH_TOKEN` = (Auth token database Turso Anda)
7. Klik tombol **Deploy**.
8. Tunggu hingga proses build selesai. Setelah berhasil, Anda akan mendapatkan URL backend (misalnya `https://si-zat-backend.vercel.app`).

---

## 4. Langkah Deployment via Vercel CLI (Alternatif Cepat)

Jika Anda ingin melakukan deploy langsung dari terminal komputer lokal Anda:

1. Instal Vercel CLI secara global (jika belum):
   ```bash
   npm install -g vercel
   ```
2. Lakukan login ke akun Vercel Anda:
   ```bash
   vercel login
   ```
3. Masuk ke dalam direktori `backend` di terminal Anda:
   ```bash
   cd backend
   ```
4. Jalankan perintah `vercel` untuk deployment versi development/preview:
   ```bash
   vercel
   ```
   *Ikuti petunjuk di layar terminal untuk menghubungkan proyek baru.*
5. Jalankan perintah berikut untuk menambahkan environment variables Turso Anda:
   ```bash
   vercel env add TURSO_DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   ```
6. Jalankan deployment ke production:
   ```bash
   vercel --prod
   ```
7. Terminal akan menampilkan URL live backend Anda di Vercel.

---

## 5. Konfigurasi Keamanan CORS (Opsional)

Secara default, CORS pada [backend/src/index.ts](file:///d:/coding/order/si-zat_ESD/backend/src/index.ts) telah diset ke `*` untuk memudahkan proses pengembangan:

```typescript
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
```

> [!TIP]
> Jika deployment sudah siap dan Anda ingin meningkatkan keamanan, Anda dapat mengganti `origin: '*'` menjadi domain spesifik dari frontend GitHub Pages Anda, misalnya:
> `origin: 'https://r021n.github.io'`
