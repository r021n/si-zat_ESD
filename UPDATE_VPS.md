# Panduan Update Backend di VPS (Docker)

Dokumen ini menjelaskan cara **meng-update backend** yang berjalan di VPS menggunakan **Docker Compose** (`backend/Dockerfile` + `backend/compose.yaml`) setelah kode di-repo berubah.

> Catatan: panduan deploy awal ke Vercel ada di [DEPLOY_BACKEND.md](./DEPLOY_BACKEND.md), dan deploy frontend ke GitHub Pages ada di [DEPLOY_FRONTEND.md](./DEPLOY_FRONTEND.md). Dokumen ini khusus untuk **update berkala backend di VPS**.

---

## 1. Arsitektur Singkat

- Backend adalah aplikasi **Hono + Node.js** yang di-build jadi image `si-zat-esd-backend:latest` dan berjalan sebagai container `si-zat-backend`.
- Port container `3000` di-publish ke **`127.0.0.1:8080`** di VPS (hanya bisa diakses lokal VPS — di depannya biasanya ada reverse proxy seperti Nginx/Caddy yang meneruskan traffic HTTPS).
- Database **Turso (libsql)** berada di cloud — data **tidak** disimpan di container, jadi update/rebuild container aman terhadap data.
- Health check endpoint: `GET /api/health` (dipakai Docker healthcheck dan verifikasi pasca-deploy).

---

## 2. Prasyarat di VPS

1. **Docker** dan plugin **Docker Compose** sudah terpasang:
   ```bash
   docker --version
   docker compose version
   ```
2. Kode repo `si-zat_ESD` sudah pernah di-clone di VPS (misalnya di `/opt/si-zat_ESD`).
3. File **`backend/.env`** sudah ada di VPS (tidak ikut git — harus disalin manual sekali saat awal deploy) dan berisi minimal:
   ```
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=...
   JWT_SECRET=...
   ```
4. (Jika repo VPS di-clone via SSH) kunci SSH/deploy key sudah terpasang supaya `git pull` bisa jalan tanpa interaksi.

---

## 3. Update Rutin (Kode Berubah)

Ini langkah standar setelah ada commit baru di `main` (misalnya update fitur kuis, KKM, dll.):

```bash
# 1. Masuk ke folder repo di VPS
cd /opt/si-zat_ESD

# 2. Ambil kode terbaru
git pull origin main

# 3. Masuk ke folder backend & rebuild image + restart container
cd backend
docker compose up -d --build --wait

# 4. Verifikasi
docker compose ps                # pastikan status: healthy (bukan unhealthy/restarting)
docker compose logs --tail=50 backend
curl -s http://127.0.0.1:8080/api/health
```

Penjelasan flag:
- `--build` — build ulang image dari kode terbaru sebelum start.
- `-d` — jalan di background.
- `--wait` — tunggu container benar-benar **healthy** sebelum command selesai (healthcheck jalan tiap 30 detik, start-period 15 detik).

> Downtime: `docker compose up -d --build` akan menghentikan container lama lalu memulai yang baru — biasanya hanya beberapa detik.

Jika ada perubahan dependency (`backend/package.json` / `package-lock.json`), tidak perlu langkah tambahan — `npm ci` sudah dijalankan otomatis saat build image.

---

## 4. Jika Ada Perubahan Database (Schema)

Backend **tidak menjalankan migration otomatis** saat start. Perubahan schema (penambahan kolom/tabel di `backend/src/db/schema.ts`, seperti kolom `kkm` di tabel `quizzes`) harus diterapkan ke Turso secara terpisah **dari mesin yang punya `backend/.env`** (misalnya komputer lokal):

```bash
cd backend
npm ci            # sekali saja, jika dependencies berubah
npm run db:push   # sinkronkan schema.ts ke database Turso
```

Urutan yang disarankan:
1. Jalankan `npm run db:push` dari lokal (atau VPS yang punya `.env`) **sebelum** atau **bersamaan** dengan update container.
2. Lalu update container seperti langkah di §3.

> [!IMPORTANT]
> - Perubahan schema harus bersifat **additive** (menambah kolom/tabel baru, nullable) agar aman terhadap data lama. `db:push` akan menolak/meminta konfirmasi jika ada perubahan yang menghapus data.
> - Pastikan `schema.ts` selalu mencerminkan tabel yang benar-benar ada di DB (termasuk tabel `materials` & `material_blocks`) supaya `db:push` tidak berusaha menghapus tabel yang tidak didefinisikan.
> - Kode lama yang berjalan bersamaan dengan schema baru biasanya aman untuk perubahan additive (kolom baru nullable).

---

## 5. Jika `.env` di VPS Perlu Ditambah/Ubah

`.env` tidak ikut git. Jika ada variabel env baru (atau nilainya berubah):

```bash
nano /opt/si-zat_ESD/backend/.env   # edit sesuai kebutuhan
cd /opt/si-zat_ESD/backend
docker compose up -d --build --wait  # restart agar env baru terbaca
```

`env_file` di `compose.yaml` dibaca ulang setiap container dibuat ulang, jadi cukup `up -d` (tidak perlu build ulang jika kode tidak berubah):
```bash
docker compose up -d --force-recreate
```

---

## 6. Troubleshooting

| Gejala | Cek / Solusi |
|---|---|
| Container `unhealthy` | `docker compose logs backend` — biasanya env kurang/Turso tidak terjangkau. Cek isi `.env`. |
| Build gagal di `npm ci` | `docker compose build --no-cache backend` (paksa tanpa cache), cek `package-lock.json` tidak korup. |
| Perubahan kode tidak masuk | Pastikan `git pull` berhasil dan benar-benar commit terbaru; lalu `docker compose build --no-cache` dan `up -d`. |
| Port 8080 bentrok / proxy 502 | Cek `docker compose ps`, `curl http://127.0.0.1:8080/api/health` langsung di VPS, lalu cek konfigurasi reverse proxy. |
| Mau lihat isi container | `docker compose exec backend sh` |

Membersihkan image lama agar hemat disk:
```bash
docker image prune -f
```

---

## 7. Rollback (Jika Update Bermasalah)

```bash
cd /opt/si-zat_ESD

# Lihat commit sebelumnya
git log --oneline -5

# Kembali ke versi sebelumnya (ganti <commit> dengan hash commit lama)
git checkout <commit>

cd backend
docker compose up -d --build --wait
```

Setelah stabil, kembali ke `main`:
```bash
cd /opt/si-zat_ESD && git checkout main && git pull origin main
cd backend && docker compose up -d --build --wait
```

Tips: sebelum update penting, beri tag image lama agar rollback bisa cepat tanpa rebuild:
```bash
docker tag si-zat-esd-backend:latest si-zat-esd-backend:backup-$(date +%Y%m%d)
```

---

## 8. Alternatif: Build Image di Lokal (VPS Tanpa Akses Git / Build Lambat)

Jika VPS tidak bisa `git pull` (atau build di VPS lambat), build image di komputer lokal lalu transfer:

```bash
# Di komputer lokal
cd backend
docker build -t si-zat-esd-backend:latest .
docker save si-zat-esd-backend:latest | gzip > si-zat-backend.tar.gz
scp si-zat-backend.tar.gz user@vps:/tmp/

# Di VPS
docker load < /tmp/si-zat-backend.tar.gz
cd /opt/si-zat_ESD/backend
docker compose up -d --wait
```

Cara lain yang lebih rapi: push image ke registry (Docker Hub/GHCR) lalu di VPS cukup `docker compose pull && docker compose up -d --wait`.

---

## 9. Catatan Frontend

Frontend di-host di **GitHub Pages** dan di-deploy **otomatis** oleh GitHub Actions setiap push ke `main` (lihat [DEPLOY_FRONTEND.md](./DEPLOY_FRONTEND.md)) — tidak perlu diapa-apakan di VPS.

Yang perlu diperhatikan hanya:
- Jika **URL backend** berubah (misalnya ganti domain VPS), update nilai secret `VITE_API_URL` di GitHub **dan** lakukan rebuild frontend (re-run workflow / push perubahan kosong), karena nilai itu di-bake saat build.
- Jika menambah variabel env frontend (`VITE_*`), tambahkan ke GitHub Secrets dan pastikan di-pass di `.github/workflows/deploy.yml`.
