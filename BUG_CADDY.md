# Rangkuman: Troubleshooting `203.0.113.10.sslip.io` Tidak Dapat Diakses

## 🎯 Gejala Awal

- Container `app-backend` **running & healthy** (`Up 3 hours (healthy)`)
- Fetch ke API dari luar **tidak merespon**
- Dari client/laptop: `curl -vI http://203.0.113.10.sslip.io` → **`Connection refused`**
- Dari dalam VPS: DNS resolve benar → `203.0.113.10`

## 🔍 Dugaan Awal (yang ternyata SALAH)

| Dugaan | Fakta |
|---|---|
| `sslip.io` menganggap trafik sebagai DDoS | ❌ `sslip.io` hanya DNS wildcard, tidak melihat trafik HTTP |
| `ufw` memblokir port 80/443 | ❌ `ufw status` sudah `ALLOW` untuk port yang diperlukan |
| Konfigurasi Caddyfile salah | ❌ Caddyfile sudah benar |
| URL berubah dari domain ke localhost | ❌ Itu healthcheck internal Docker, normal |
| Token JWT expired | ✅ Benar expired, tapi **bukan** penyebab situs down |

## 🧩 Alur Investigasi

### 1. Cek Container
docker compose ps
# Hasil: app-backend Up 3 hours (healthy) -> 127.0.0.1:8080->3000/tcp

Temuan: Container sehat, tapi hanya listen di 127.0.0.1:8080 (localhost saja). Ada reverse proxy di depan.

### 2. Cek Clock Server (untuk isu JWT)
docker compose exec backend date
# Bandingkan jam server dengan klaim exp token JWT

Temuan: Token expired -> memicu HTTP 500 error dari endpoint terkait. Ini masalah terpisah, bukan penyebab server down/Connection refused.

### 3. Cek Port yang Listen
sudo ss -tlnp | grep -E ':(80|443)\s'
# Hasil: KOSONG

Temuan: Tidak ada proses yang listen di port 80/443. Inilah penyebab Connection refused.

### 4. Cek Reverse Proxy
which nginx caddy traefik
# /usr/bin/caddy

sudo systemctl list-units --type=service --state=running | grep -Ei 'nginx|caddy|traefik'
# KOSONG -> Caddy tidak berjalan

sudo systemctl status caddy
# Active: failed (Result: exit-code)
# Process: ExecStart=/usr/bin/caddy ... (code=exited, status=2/INVALIDARGUMENT)

## 🎯 AKAR MASALAH

Caddy v2.11.6 mengalami crash (panic) saat runtime, bukan karena konfigurasi salah.

### Bukti dari Log
caddy[702]: net/http.(*Request).write(...)
caddy[702]: net/http/transfer.go:377
caddy[702]: net/http.(*persistConn).writeLoop(...)
caddy[702]: net/http/transport.go:2655
caddy.service: Main process exited, code=exited, status=2/INVALIDARGUMENT

### Konfirmasi Bug
- Versi terpasang: caddy v2.11.6
- Bug resmi: Caddy v2.11.6 memperkenalkan default idle read/write timeouts yang menyebabkan nil pointer dereference saat reverse proxy masih membaca request body setelah handler selesai (khususnya over HTTP/2).
- Diperbaiki di: Caddy v2.11.7
- Referensi: GitHub issue caddyserver/caddy#8101

### Kenapa Baru Crash Setelah Beberapa Hari?
Duration: 5d 15h 17min 25.923s

Konfigurasi tidak salah (kalau salah, gagal start sejak awal). Crash terjadi saat runtime karena edge case HTTP/2 terpicu oleh request tertentu. Trafik tinggi dari banyak device memperbesar peluang trigger bug, tapi bukan "DDoS dari sslip.io".

## ✅ Solusi yang Dilakukan

### Langkah 1: Restart Caddy (solusi sementara)
sudo systemctl restart caddy
sudo systemctl status caddy --no-pager
# Active: active (running)

Situs langsung bisa diakses kembali. Tapi bug masih ada, bisa crash lagi kapan saja.

### Langkah 2: Upgrade Caddy ke v2.11.7 (solusi permanen)

Backup Caddyfile dulu:
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak

Upgrade via apt:
sudo apt update
sudo apt install --only-upgrade caddy

Jika repo belum punya v2.11.7, install dari repo resmi Caddy:
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install --only-upgrade caddy

Verifikasi:
caddy version
# Harus: v2.11.7 atau lebih baru

### Langkah 3: Aktifkan Auto-Restart (pencegahan)
sudo systemctl edit caddy

Isi:
[Service]
Restart=on-failure
RestartSec=3s

Lalu:
sudo systemctl daemon-reload
sudo systemctl restart caddy

Jika Caddy crash lagi, systemd otomatis menyalakannya dalam 3 detik.

### Langkah 4: Verifikasi dari Luar Server
curl -vI http://203.0.113.10.sslip.io
# Harus: tidak ada "Connection refused"

## 📋 Caddyfile (Sudah Benar, Tidak Perlu Diubah)

203.0.113.10.sslip.io {
    reverse_proxy 127.0.0.1:8080
}

## ⚠️ Masalah Sisa (Belum Diselesaikan)

### Isu JWT Expired -> HTTP 500

Log menunjukkan:
Error recording usage: JwtTokenExpired: token expired
[RESPONSE] <-- POST /api/endpoint - ERROR (Status: 500)

Masalah: Handler melempar 500 saat token expired, seharusnya 401.

Dampak ke frontend:
- Frontend tidak bisa membedakan "token expired" dari "server error"
- Tidak bisa trigger refresh token otomatis
- Jika fetch tanpa timeout -> tampak "tidak merespon" selamanya

Perbaikan yang disarankan di backend:
try {
  const payload = await verify(token, SECRET)
  // ...
} catch (e) {
  if (e instanceof JwtTokenExpired) {
    return c.json({ error: 'token_expired' }, 401)
  }
  return c.json({ error: 'invalid_token' }, 401)
}

Frontend juga perlu penanganan timeout & interceptor:
const res = await fetch(url, {
  ...opts,
  signal: AbortSignal.timeout(10_000),  // timeout 10 detik
})
if (res.status === 401) {
  await refreshToken()
  return retryWithNewToken()
}

Observasi tambahan: Perlu cek apakah frontend melakukan duplicate request (misal pemanggilan API di lifecycle komponen/hook React tanpa cleanup/dependency yang tepat).

## 🧠 Pelajaran Penting

1. sslip.io bukan penyebab masalah jaringan. Layanan ini hanya DNS wildcard yang meng-encode IP di nama domain. Batasan yang ada di sslip.io hanya kuota pembuatan sertifikat SSL (Let's Encrypt), bukan pembatasan koneksi.
2. Connection refused != timeout. Connection refused berarti koneksi mencapai host server tapi port target tidak memiliki service yang listen. Timeout berarti paket tidak sampai atau di-drop firewall.
3. status=2/INVALIDARGUMENT pada Caddy = panic runtime. Bukan selalu berarti argumen CLI salah, melainkan indikasi Go runtime panic.
4. Durasi uptime di systemctl status sangat informatif. Uptime beberapa hari membuktikan konfigurasi awal sudah valid; akar masalah berada pada bug edge-case runtime.
5. Firewall berlapis. Aturan firewall OS (ufw) dan security group/cloud firewall harus selaras.
6. Reverse proxy yang mati = situs down meskipun container backend sehat. Selalu pastikan web server listening pada port 80/443.

## 📊 Timeline Investigasi

| Tahap | Aksi | Temuan |
|---|---|---|
| 1 | Cek log backend | JWT expired -> 500 error (masalah terpisah) |
| 2 | Cek clock server | Waktu server sinkron, token validasi berjalan normal |
| 3 | Cek port 80/443 | Kosong -> akar masalah Connection refused |
| 4 | Cek reverse proxy | Caddy status failed dengan status=2 |
| 5 | Baca stack trace | Runtime panic di modul HTTP transport |
| 6 | Cek versi Caddy | v2.11.6 -> versi teridentifikasi bug upstream |
| 7 | Restart Caddy | Service pulih sementara |
| 8 | Mitigasi permanen | Upgrade ke v2.11.7 + konfigurasi auto-restart systemd |

## ✅ Status Akhir

- ✅ Akses layanan kembali normal
- ✅ Penyebab ditemukan: Caddy v2.11.6 bug HTTP/2 panic
- ⏳ Tindak Lanjut: Upgrade versi Caddy ke v2.11.7
- ⏳ Tindak Lanjut: Perbaiki exception handling auth JWT (500 -> 401)
- ⏳ Tindak Lanjut: Audit duplikasi pemanggilan API di sisi frontend

## 📚 Referensi

- GitHub Issue: caddyserver/caddy#8101 (crash HTTP/2 reverse proxy)
- Caddy Release Notes: v2.11.7 patch release
- Hono JWT: hono/dist/utils/jwt/jwt.js - JwtTokenExpired handling