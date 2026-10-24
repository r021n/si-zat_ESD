# 📋 Panduan & Skenario Testing Fitur Kuis dan Ruang Diskusi
**Aplikasi Pembelajaran Si-Zat ESD**  
*Dokumen ini disusun untuk memudahkan pengujian fungsionalitas end-to-end secara sistematis, terstruktur, dan tuntas.*

---

## 📑 Daftar Isi
1. [Prasyarat & Persiapan Lingkungan Uji](#-prasyarat--persiapan-lingkungan-uji)
2. [Matriks Rute & Peran Pengguna](#-matriks-rute--peran-pengguna)
3. [Skenario 1: Kuis Siswa – Lobby, Timer & Sistem Anti-Cheat](#skenario-1-kuis-siswa--lobby-timer--sistem-anti-cheat)
4. [Skenario 2: Kuis Siswa – Gamifikasi Skor & Review Jawaban](#skenario-2-kuis-siswa--gamifikasi-skor--review-jawaban)
5. [Skenario 3: Admin Kuis – Pembuat Soal (CRUD & Taksonomi Bloom)](#skenario-3-admin-kuis--pembuat-soal-crud--taksonomi-bloom)
6. [Skenario 4: Admin Kuis – Analisis Butir Soal, KKM & Export Excel](#skenario-4-admin-kuis--analisis-butir-soal-kkm--export-excel)
7. [Skenario 5: Ruang Diskusi Siswa – Info Topik & Forum Obrolan Real-Time](#skenario-5-ruang-diskusi-siswa--info-topik--forum-obrolan-real-time)
8. [Skenario 6: Ruang Diskusi Siswa – Pengumpulan Tugas & Kompresi Gambar](#skenario-6-ruang-diskusi-siswa--pengumpulan-tugas--kompresi-gambar)
9. [Skenario 7: Ruang Diskusi Siswa – Peer Review (Karya Teman)](#skenario-7-ruang-diskusi-siswa--peer-review-karya-teman)
10. [Skenario 8: Admin Diskusi – Pembuatan Topik, Penilaian & Leaderboard](#skenario-8-admin-diskusi--pembuatan-topik-penilaian--leaderboard)
11. [Skenario 9: Tes Berpikir Sistem – Portofolio & Thread Khusus](#skenario-9-tes-berpikir-sistem--portofolio--thread-khusus)
12. [Skenario 10: Uji Batas & Keamanan (Edge Cases & Validation)](#skenario-10-uji-batas--keamanan-edge-cases--validation)
13. [Lembar Catatan Pengujian (Testing Log)](#-lembar-catatan-pengujian-testing-log)

---

## 🛠 Prasyarat & Persiapan Lingkungan Uji

Sebelum memulai pengujian, pastikan:
1. Backend dan frontend sudah berjalan (misal: frontend di `http://localhost:5173` atau mode Capacitor/Android).
2. Siapkan minimal **2 Akun Siswa** (untuk menguji fitur *Peer Review* antar teman) dan **1 Akun Admin/Guru**.
   - **Akun Siswa A** (contoh: Ahmad / Siswa Kelas VII-A)
   - **Akun Siswa B** (contoh: Budi / Siswa Kelas VII-A)
   - **Akun Guru/Admin** (Role: `ADMIN`)
3. Akun siswa sudah ter-enroll (jika mode enrollment aktif) agar dapat mengakses modul materi, kuis, dan diskusi.

---

## 🗺 Matriks Rute & Peran Pengguna

| Fitur | Peran | URL / Rute | File Komponen Utama |
| :--- | :--- | :--- | :--- |
| **Kuis (Tes Hasil Belajar)** | Siswa | `#/kuis` | `src/pages/KuisMenu.tsx` |
| **Kelola & Analisis Kuis** | Admin | `#/admin/kuis` | `src/pages/AdminKuis.tsx` |
| **Ruang Diskusi & Tugas** | Siswa | `#/ruang-diskusi` | `src/pages/RuangDiskusi.tsx` |
| **Kelola Diskusi & Grading** | Admin | `#/admin/diskusi` | `src/pages/AdminDiskusi.tsx` |
| **Tes Berpikir Sistem (Portofolio)** | Siswa & Admin | `#/kuis/berpikir-sistem` | `src/pages/PenilaianBerpikirSistem.tsx` |

---

## Skenario 1: Kuis Siswa – Lobby, Timer & Sistem Anti-Cheat

* **Target Komponen**: `QuizLobbyView.tsx`, `QuizActivePlayerView.tsx`, `useQuizAntiCheat.ts`
* **Akun**: Siswa A
* **Rute**: `#/kuis`

### Langkah-Langkah:
1. Masuk ke halaman `#/kuis`.
2. Periksa daftar kuis pada Lobby. Pastikan kuis yang belum dikerjakan menampilkan ikon pensil dan jumlah butir soal.
3. Klik salah satu kuis yang belum pernah dikerjakan.
4. **Verifikasi Timer**: Periksa indikator waktu di bagian header (`MM:SS`). Pastikan detik bertambah secara normal.
5. **Uji Fitur Anti-Cheat (Deteksi Pindah Aplikasi / Tab)**:
   - Jika di browser: Buka tab baru di browser atau minimize jendela selama minimal 3 detik, kemudian kembali ke tab kuis.
   - Jika di aplikasi Android: Tekan tombol Home / beralih ke aplikasi lain, lalu buka kembali aplikasi.
   - **Hasil yang Diharapkan**:
     - Muncul modal peringatan: *"PERINGATAN! Anda terdeteksi meninggalkan aplikasi kuis..."*.
     - Di bawah timer muncul badge merah: *"Peringatan: Terdeteksi keluar aplikasi [1x]"*.
6. Ulangi perpindahan tab sekali lagi. Pastikan counter pelanggaran bertambah menjadi `2x`.
7. **Uji Konfirmasi Tombol Kembali (Back Button)**:
   - Klik tombol "Keluar" di pojok kanan atas atau tekan tombol back hardware/browser.
   - **Hasil yang Diharapkan**: Muncul konfirmasi pembatalan. Jika dibatalkan (*Batal*), pengerjaan tes tetap berlanjut tanpa reset progres.

---

## Skenario 2: Kuis Siswa – Gamifikasi Skor & Review Jawaban

* **Target Komponen**: `QuizScoreResultCard.tsx`, `QuizScoreSegmentedBar.tsx`, `QuizScoreReviewView.tsx`, `scoreTierConfig.tsx`
* **Akun**: Siswa A
* **Rute**: `#/kuis`

### Langkah-Langkah:
1. Lanjutkan pengerjaan kuis dari Skenario 1.
2. Jawab soal-soal yang ada:
   - Soal tipe pilihan ganda tunggal (Single Choice).
   - Soal tipe pilihan ganda majemuk (Multiple Choice: *"Pilih semua opsi yang benar"*).
3. Biarkan salah satu soal tidak terisi, lalu klik **"Kirim Jawaban"**.
   - **Hasil yang Diharapkan**: Muncul dialog konfirmasi: *"Anda belum menjawab semua soal. Apakah yakin ingin mengirimkan jawaban?"*.
4. Lakukan submit jawaban secara final.
5. **Verifikasi Kartu Skor Gamifikasi**:
   - Periksa apakah tingkatan predikat tampil sesuai dengan perolehan skor:
     - `0–3 Benar`  : **Pemula** (Tombol: *Buka Materi* / *Kerjakan Ulang*)
     - `4–7 Benar`  : **Pemberani** (Tombol: *Buka Materi* / *Kerjakan Ulang*)
     - `8–11 Benar` : **Tangguh** (Tombol: *Lihat Review* / *Buka Materi*)
     - `12–15 Benar`: **Hebat** (Badge: `LEWAT KKM`, Tombol: *Lihat Review* / *Selesai*)
     - `16/16 Benar`: **Luar Biasa** (Badge: `LEWAT KKM`, Nilai Sempurna)
   - Periksa tampilan Segmented Progress Bar.
6. Klik tombol **"Lihat Review Jawaban"**:
   - Periksa ringkasan durasi pengerjaan dan rasio soal terisi vs kosong.
   - Periksa per butir soal: apakah menampilkan perbandingan antara *Jawaban Anda* vs *Jawaban Benar* serta badge status `BENAR [✓]` atau `SALAH [✗]`.
7. Kembali ke Lobby Kuis (`#/kuis`):
   - Pastikan kuis tersebut kini memiliki badge hijau **"Selesai"** beserta angka skor akhir.
   - Coba klik kuis tersebut kembali. Sistem harus mencegah pengerjaan ulang dan menampilkan pesan bahwa kuis hanya dapat dikerjakan 1 kali.
8. Klik ikon **Jam (Riwayat)** di kanan atas:
   - Pastikan riwayat tes tercatat dengan tanggal pengerjaan, durasi menit/detik, dan skor.

---

## Skenario 3: Admin Kuis – Pembuat Soal (CRUD & Taksonomi Bloom)

* **Target Komponen**: `AdminKuis.tsx`, `QuizForm.tsx`, `useQuizQuestionsBuilder.ts`
* **Akun**: Guru / Admin
* **Rute**: `#/admin/kuis`

### Langkah-Langkah:
1. Login dengan akun Admin dan buka menu `#/admin/kuis`.
2. Klik tombol **"Kuis Baru"** untuk membuka editor kuis.
3. Masukkan **Judul Kuis**, contoh: `Uji Coba Sistem Pencemaran Air`.
4. Tambahkan butir pertanyaan:
   - Ketik teks soal pada textarea pertanyaan.
   - Ubah pilihan **Tipe Taksonomi Bloom** (misal pilih `C4 (Menganalisis)`).
   - Ubah pilihan **Jumlah Opsi** (uji dropdown 2 opsi, 3 opsi, 4 opsi, dan 5 opsi A–E).
   - Isi teks setiap opsi jawaban (A, B, C, D).
   - Tentukan kunci jawaban dengan mengklik tombol centang opsi (uji coba memilih 1 kunci jawaban, atau lebih dari 1 kunci untuk tipe majemuk).
5. **Uji Upload Multi-Gambar Soal**:
   - Klik area upload gambar dan pilih file foto ilustrasi.
   - Pastikan foto ter-render pada thumbnail pratinjau.
   - Uji tombol silang (`X`) pada gambar untuk menghapus foto tertentu.
6. Klik tombol **"Simpan Kuis"**:
   - Pastikan kuis berhasil tersimpan dan langsung muncul pada daftar kuis admin.
7. Uji tombol **"Edit"**:
   - Ubah judul kuis atau tambahkan 1 butir soal baru, lalu simpan ulang.
8. Uji tombol **"Hapus Kuis"**:
   - Buat satu kuis dummy lalu klik hapus. Pastikan konfirmasi penghapusan berfungsi dan kuis terhapus dari daftar.

---

## Skenario 4: Admin Kuis – Analisis Butir Soal, KKM & Export Excel

* **Target Komponen**: `QuizAnalysis.tsx`, `QuizSummaryCards.tsx`, `QuizKkmSettingCard.tsx`, `QuizStudentScoreTable.tsx`, `QuizItemAnalysisGrid.tsx`, `exportQuizScores.ts`
* **Akun**: Guru / Admin
* **Rute**: `#/admin/kuis`

### Langkah-Langkah:
1. Buka kuis yang telah dikerjakan oleh siswa pada Skenario 1 & 2, lalu klik tombol **"Analisis"**.
2. **Verifikasi Kartu Statistik Ringkasan**:
   - Periksa nilai *Total Pengumpulan*, *Nilai Rata-rata*, *Nilai Tertinggi*, dan *Nilai Terendah*.
3. **Uji Pengaturan KKM Dinamis**:
   - Masukkan nilai KKM baru pada kolom KKM (contoh: `75`), lalu klik **"Simpan KKM"**.
   - Periksa apakah muncul notifikasi/badge jumlah siswa yang berada *"di bawah KKM 75"*.
   - Uji tombol **"Hapus KKM"** dan pastikan status KKM kembali dinonaktifkan.
4. **Uji Tab "Daftar Skor" (Tabel Nilai Siswa)**:
   - Ketik nama siswa pada kotak pencarian (*Search*). Pastikan filter instan berjalan.
   - Ganti dropdown pengurutan:
     - *Nilai Tertinggi*
     - *Nilai Terendah*
     - *Pelanggaran Terbanyak* (periksa apakah siswa dengan pelanggaran anti-cheat berada di posisi teratas).
   - Klik salah satu baris siswa untuk membuka modal **Lembar Jawaban Siswa**:
     - Pastikan rincian jawaban anak, jawaban kunci, status tuntas, dan jumlah pelanggaran tampil lengkap.
5. **Uji Ekspor Excel (.xlsx)**:
   - Klik tombol hijau **"Export Excel"**.
   - Buka file spreadsheet yang terunduh (`Nilai_[JudulKuis]_[Tanggal].xlsx`).
   - Pastikan kolom-kolom berikut terisi rapi:
     - *No, Nama Siswa, Kelas, Asal Sekolah, Durasi, Soal Terisi, Soal Kosong, Pelanggaran (Keluar App), Skor Akhir, Status KKM, Waktu Selesai*.
6. **Uji Tab "Analisis Soal" (Item Analysis / Psikometrik)**:
   - Beralih ke tab *"Analisis Soal"*.
   - Periksa persentase **Akurasi (%)** tiap nomor soal.
   - Periksa grafik batang **Daya Pengecoh (Distractor Analysis)**:
     - Kunci jawaban berwarna hijau `[✓]`.
     - Opsi pengecoh lainnya berwarna ungu dengan jumlah siswa dan persentase yang memilih opsi tersebut.
   - Ganti filter urutan soal ke *Akurasi Terburuk* dan pastikan soal dengan tingkat kesalahan tertinggi berada di urutan awal.

---

## Skenario 5: Ruang Diskusi Siswa – Info Topik & Forum Obrolan Real-Time

* **Target Komponen**: `RuangDiskusi.tsx`, `AnnouncementInfoTab.tsx`, `DiscussionChatTab.tsx`
* **Akun**: Siswa A & Guru/Admin
* **Rute**: `#/ruang-diskusi`

### Langkah-Langkah:
1. Login sebagai Siswa A dan buka `#/ruang-diskusi`.
2. Pada Lobby Topik, pastikan daftar topik tugas muncul dengan thumbnail dan status (`Berlangsung` / `Terkumpul` / `Nilai: XX`).
3. Pilih salah satu topik diskusi.
4. **Verifikasi Tab 1: Info Topik**:
   - Pastikan gambar cover banner tampil (klik gambar untuk menguji modal zoom fullscreen).
   - Baca deskripsi permasalahan, butir-butir pertanyaan dengan penomoran, dan petunjuk teknis pengerjaan.
5. **Verifikasi Tab 2: Diskusi (Forum Obrolan)**:
   - Klik tab **"Diskusi"**.
   - Ketik pesan pertanyaan atau argumen di input chat bawah, lalu kirim.
   - Pastikan pesan langsung muncul di sisi kanan (bubble ungu untuk pesan sendiri) disertai timestamp dan centang.
   - Login di jendela/browser lain menggunakan akun Guru/Admin, lalu kirim balasan pesan di topik yang sama.
   - Kembali ke akun Siswa A: Pastikan pesan dari Guru tampil di sisi kiri dengan label badge khusus bertuliskan **"Guru"** berwarna ungu.

---

## Skenario 6: Ruang Diskusi Siswa – Pengumpulan Tugas & Kompresi Gambar

* **Target Komponen**: `SubmissionHistoryTab.tsx`, `useRuangDiskusi.ts`
* **Akun**: Siswa A
* **Rute**: `#/ruang-diskusi/:id`

### Langkah-Langkah:
1. Pada topik diskusi yang sedang dibuka, beralih ke **Tab 4: Tugas** (atau klik shortcut *"Kumpulkan Tugas"*).
2. Ketikkan jawaban esai pada area teks jawaban.
3. **Uji Upload & Kompresi Foto**:
   - Klik *"Lampirkan Foto"*.
   - Pilih file gambar berukuran besar (misal 2 MB – 5 MB).
   - Perhatikan indikator *"Memproses..."*: Sistem akan mengompresi gambar di sisi klien sebelum diupload.
   - Pastikan thumbnail pratinjau foto muncul di atas tombol submit.
4. Klik tombol **"Kirim Tugas"**.
5. Setelah berhasil terkirim, pastikan tampilan berubah menjadi kartu riwayat pengumpulan:
   - Status: *"Menunggu Penilaian"* (ikon kuning).
   - Menampilkan teks jawaban lengkap dan thumbnail foto lampiran (klik untuk zoom).
   - Terdapat tombol *"Perbarui"* dan *"Hapus"*.
6. **Uji Edit Jawaban**:
   - Klik *"Perbarui"*, ubah sebagian teks jawaban, lalu klik *"Simpan Perubahan"*.
   - Pastikan jawaban ter-update dengan tanggal/waktu yang sesuai.

---

## Skenario 7: Ruang Diskusi Siswa – Peer Review (Karya Teman)

* **Target Komponen**: `PeerReviewTab.tsx`
* **Akun**: Siswa A & Siswa B
* **Rute**: `#/ruang-diskusi/:id`

### Langkah-Langkah:
1. **Uji Syarat Akses Sebelum Mengumpulkan Tugas**:
   - Login menggunakan **Siswa B** yang belum mengumpulkan tugas pada topik tersebut.
   - Buka **Tab 3: Teman**.
   - **Hasil yang Diharapkan**: Daftar karya teman terkunci dan menampilkan pesan:  
     *"Kumpulkan Tugas Anda Dahulu - Setelah mengumpulkan tugas di tab Tugas, Anda dapat melihat dan mengulas hasil pekerjaan teman sekelas."*
2. **Kumpulkan Tugas untuk Siswa B**:
   - Pindah ke Tab Tugas, kirim jawaban esai untuk Siswa B.
3. **Uji Peer Review Setelah Tugas Terkumpul**:
   - Kembali ke Tab Teman pada akun Siswa B.
   - Pastikan kini muncul daftar karya teman sekelas (termasuk karya Siswa A).
   - Periksa badge target ulasan di kanan atas: `Review: 0/2 Selesai`.
4. Buka kartu karya milik Siswa A:
   - Baca esai jawaban Siswa A dan klik lampiran gambarnya.
   - Di bagian komentar masukan bawah, ketik feedback ulasan, contoh: *"Argumen nomor 2 sangat jelas dan logis!"*.
   - Klik tombol kirim komentar.
5. Kembali ke daftar karya teman:
   - Pastikan karya Siswa A kini memiliki badge hijau **"Sudah Direview"**.
   - Pastikan counter target ulasan bertambah menjadi `Review: 1/2 Selesai`.
6. Buka kembali komentar yang baru dikirim oleh Siswa B:
   - Uji tombol **"Hapus"** pada komentar milik sendiri. Pastikan komentar dapat dihapus dan counter ulasan berkurang kembali.

---

## Skenario 8: Admin Diskusi – Pembuatan Topik, Penilaian & Leaderboard

* **Target Komponen**: `AdminDiskusi.tsx`, `AdminTopicListView.tsx`, `AdminTopicSubmissionsView.tsx`, `AdminGradingModal.tsx`, `AdminLeaderboardModal.tsx`, `useAdminDiskusiRanking.ts`
* **Akun**: Guru / Admin
* **Rute**: `#/admin/diskusi`

### Langkah-Langkah:
1. Login dengan akun Admin dan buka menu `#/admin/diskusi`.
2. **Uji Pembuatan Topik Diskusi Baru**:
   - Klik tombol **"Buat Topik Baru"**.
   - Isi Judul Topik, Deskripsi Masalah, dan Petunjuk Pengerjaan.
   - Gunakan fitur tambah butir pertanyaan dinamis (tambahkan minimal 2 pertanyaan).
   - Lampirkan foto banner topik, lalu klik simpan.
   - Pastikan topik baru langsung muncul di daftar topik diskusi.
3. **Uji Pemeriksaan & Penilaian Tugas Siswa**:
   - Klik tombol **"Tugas Siswa"** pada topik yang telah dikerjakan Siswa A dan B.
   - Periksa kartu counter: *Total Pengumpulan*, *Sudah Dinilai*, dan *Belum Dinilai*.
   - Gunakan filter status: Klik tab *"Belum Dinilai"*.
   - Klik tombol pratinjau mata untuk membaca esai lengkap dan melihat foto lampiran anak.
   - Klik tombol nilai untuk membuka modal **Penilaian**:
     - Masukkan Nilai Angka (contoh: `88`).
     - Masukkan Catatan Evaluasi / Feedback Guru, contoh: *"Analisis sistem pencemarannya sangat komprehensif, pertahankan!"*.
     - Klik **"Simpan Nilai"**.
   - Pastikan status siswa berubah menjadi dinilai dengan badge hijau.
4. **Verifikasi Sisi Siswa**:
   - Login kembali sebagai Siswa A, buka tab Tugas pada topik tersebut.
   - Pastikan nilai `Nilai: 88/100` dan catatan guru sudah tampil.
5. **Uji Leaderboard Keaktifan Siswa (Ranking Diskusi)**:
   - Kembali ke akun Admin pada `#/admin/diskusi`.
   - Klik ikon **Piala (Ranking)** pada kartu topik.
   - **Verifikasi Algoritma Validitas**:
     - Sistem hanya menghitung komentar siswa dengan **panjang lebih dari 4 kata** sebagai argumen valid.
     - Periksa peringkat 1, 2, dan 3 dengan medali Emas 🥇, Perak 🥈, dan Perunggu 🥉.
     - Pastikan jumlah argumen valid terhitung dengan akurat.

---

## Skenario 9: Tes Berpikir Sistem – Portofolio & Thread Khusus

* **Target Komponen**: `PenilaianBerpikirSistem.tsx`, `PortofolioUploadForm.tsx`, `PortofolioChatThread.tsx`, `PortofolioHistoryView.tsx`, `PortofolioContributorModal.tsx`
* **Akun**: Siswa & Admin
* **Rute**: `#/kuis/berpikir-sistem`

### Langkah-Langkah:
1. Login sebagai Siswa dan buka menu utama `#/kuis/berpikir-sistem`.
2. Klik tombol **"Kirim Tugas"**:
   - Masukkan Judul Tugas Berpikir Sistem.
   - Ketikkan analisis keterkaitan komponen masalah lingkungan.
   - Lampirkan diagram/bagan alir sebab-akibat.
   - Klik kirim.
3. Buka tab **"Tugas Saya"**: Pastikan portofolio yang baru saja diunggah tercatat di riwayat.
4. Buka tugas tersebut untuk masuk ke **Thread Diskusi Portofolio**:
   - Periksa panel detail tugas (uji tombol ciutkan / tampilkan detail tugas).
   - Kirim pesan diskusi di kolom obrolan khusus tugas tersebut.
5. Login sebagai Siswa lain atau Admin, buka portofolio yang sama, lalu kirim komentar evaluasi.
6. (Khusus Admin) Pada daftar tugas utama, klik ikon penghargaan (`LuAward`):
   - Periksa modal **Kontributor Terbanyak** untuk melihat daftar siswa yang paling banyak memberikan sumbangsih ide/solusi.

---

## Skenario 10: Uji Batas & Keamanan (Edge Cases & Validation)

| Kasus Uji | Tindakan Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- |
| **Kuis Double Submit** | Siswa menembak API submit kuis dua kali atau refresh cepat saat tombol kirim ditekan. | Sistem memblokir pengerjaan kedua dengan peringatan kuis sudah pernah diselesaikan (Error 409). |
| **Kuis Input Kosong** | Admin membuat soal kuis tanpa mengisi teks pertanyaan atau tanpa menentukan kunci jawaban. | Tombol simpan memvalidasi bahwa setiap butir soal wajib memiliki teks dan minimal 1 kunci jawaban benar. |
| **Batas Nilai KKM** | Admin memasukkan nilai KKM berupa teks, angka negatif (`-5`), atau lebih dari 100 (`120`). | Muncul pesan error validasi: *"KKM harus berupa angka bulat antara 0 dan 100"*. |
| **File Non-Gambar** | Siswa mencoba mengunggah file non-gambar (misal `.exe` atau `.pdf`) pada lampiran tugas diskusi. | File picker membatasi hanya format gambar (`image/*`) dan input memvalidasi ekstensi file. |
| **Chat Tanpa Teks** | Mengklik tombol kirim chat dengan input kosong atau hanya spasi. | Tombol kirim disabled / tidak mengirim payload kosong ke server. |
| **Hapus Tugas Berelasi** | Admin menghapus kuis atau topik diskusi yang sudah memiliki submission siswa. | Muncul modal konfirmasi peringatan bahaya sebelum eksekusi penghapusan. |

---

## 📝 Lembar Catatan Pengujian (Testing Log)

Gunakan tabel di bawah ini untuk mencatat hasil pengujian manual:

| No | Modul / Skenario | Status (`PASS` / `FAIL`) | Catatan / Temuan Kendala | Tanggal Uji | Penguji |
| :-: | :--- | :---: | :--- | :---: | :---: |
| 1 | Kuis Siswa: Timer & Anti-Cheat | | | | |
| 2 | Kuis Siswa: Gamifikasi & Review | | | | |
| 3 | Admin Kuis: Form Builder Soal | | | | |
| 4 | Admin Kuis: Analisis Butir & Excel | | | | |
| 5 | Diskusi Siswa: Info & Obrolan | | | | |
| 6 | Diskusi Siswa: Upload & Kompresi | | | | |
| 7 | Diskusi Siswa: Peer Review Gate | | | | |
| 8 | Admin Diskusi: Penilaian & Ranking | | | | |
| 9 | Portofolio Berpikir Sistem | | | | |
| 10 | Uji Batas & Keamanan | | | | |
