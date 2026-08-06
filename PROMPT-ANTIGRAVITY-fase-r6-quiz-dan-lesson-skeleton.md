# PROMPT ANTIGRAVITY — FASE R6: Modul Quiz (Prioritas) + Skeleton Lesson

> Lampirkan prompt ini ke Antigravity BERSAMA
> `bank-soal-kuis-ekosistem-SD.json` (20 soal siap pakai untuk seed
> data) dan `RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md` (referensi
> skema Prisma lengkap, bagian 4).

---

## Konteks

Ini **FASE R6** dari roadmap rewrite EduAR Platform — Quiz jadi
prioritas modul baru (sesuai keputusan final), TAPI karena `Quiz`
punya relasi wajib ke `Lesson` di skema Prisma, `Lesson` dibuat dulu
sebagai **skeleton** (bukan fitur authoring konten lengkap) di fase
yang sama. FASE R1-R5 (fondasi backend, migrasi data, endpoint inti,
rewiring Studio, Auth & Role) sudah berjalan/selesai sebelum fase ini.

Sesuai keputusan sebelumnya: **Kuis TIDAK terikat ketat ke satu
Lesson/ekosistem tertentu** — siswa bebas akses kuis tanpa syarat
harus scan AR dulu. Tipe soal untuk versi awal: **pilihan ganda saja**
(sesuai skema `Quiz` yang sudah ada: `question`, `options` array,
`correctAnswer`).

## ATURAN WAJIB

1. **Satu fase, satu waktu** — kerjakan urutan di bawah (skeleton
   Lesson → CRUD Quiz → UI guru → UI siswa → seed data) secara
   berurutan, checkpoint tiap bagian sebelum lanjut.
2. Endpoint Quiz/Lesson ini **baru** (belum ada di FASE R1-R5) —
   jangan sentuh/timpa endpoint yang sudah dibuat di fase-fase
   sebelumnya (Auth, Asset, Scene, Ecosystem Preset), murni nambah
   modul baru.
3. **Role-based access** wajib diterapkan sesuai pembagian yang sudah
   dikonfirmasi sebelumnya:
   - **Guru**: bisa Create/Read/Update/Delete soal Quiz, lihat rekap
     nilai semua siswa yang mengerjakan.
   - **Siswa**: hanya bisa Read (lihat & kerjakan) Quiz, submit jawaban
     (buat record `QuizAttempt`), lihat skor diri sendiri saja —
     TIDAK bisa create/edit/delete soal.
   - Terapkan proteksi ini di level endpoint (guard role), bukan cuma
     disembunyikan di UI.
4. Kalau menemukan kebutuhan field/tabel di luar skema yang sudah ada
   (`Lesson`, `Quiz`, `QuizAttempt` di dokumen roadmap bagian 4),
   laporkan ke saya dulu sebelum menambah sendiri.

## Scope Kerja

### 1. Skeleton `Lesson`
- Endpoint CRUD dasar untuk `Lesson`: `title`, terhubung ke `Project`.
  BELUM perlu field content lengkap (rich text/media) — itu menyusul
  di fase berikutnya kalau diminta.
- Guru bisa create Lesson kosong/sederhana sebagai "wadah" untuk
  quiz-quiz yang dibuatnya (karena `Quiz.lessonId` wajib).
- Untuk mempermudah alur Guru (supaya tidak wajib bikin Lesson manual
  dulu setiap kali mau bikin 1 soal), buatkan juga opsi: saat Guru
  membuat Quiz baru dan belum pilih Lesson, sistem otomatis membuatkan
  1 Lesson default/generik (misal judul "Kuis Umum") untuk menaungi
  soal-soal yang tidak dikelompokkan spesifik — laporkan pendekatan
  ini ke saya, boleh disesuaikan kalau saya minta beda.

### 2. CRUD `Quiz`
- Endpoint Create/Read/Update/Delete soal — role Guru saja yang bisa
  Create/Update/Delete.
- Endpoint List/Get soal untuk ditampilkan ke Siswa (role Siswa &
  Guru bisa Read).
- Endpoint Submit jawaban (`POST` bikin record `QuizAttempt`) — hitung
  otomatis benar/salah dengan membandingkan jawaban siswa ke
  `correctAnswer`, simpan skor.
- Endpoint untuk Guru melihat rekap semua `QuizAttempt` (siapa
  mengerjakan, skor berapa, kapan).

### 3. UI Sisi Guru — "Kelola Kuis"
- Halaman list semua soal yang sudah dibuat, tombol tambah soal baru
  (form: pertanyaan, 4 opsi jawaban, pilih mana yang benar), edit,
  hapus.
- Halaman rekap nilai: tabel siswa + skor per attempt.

### 4. UI Sisi Siswa — "Kerjakan Kuis"
- Tampilan sesuai referensi desain yang sudah ada ("Kuis Ekosistem",
  pilih soal, jawaban pilihan ganda ditampilkan, skor ditampilkan
  setelah submit).
- Setelah submit, tampilkan skor + feedback benar/salah per soal
  (instant feedback, sesuai gaya kuis edukasi anak-anak — jangan
  cuma tampilkan angka skor polos tanpa konteks).

### 5. Seed Data dari `bank-soal-kuis-ekosistem-SD.json`
- Import 20 soal di file terlampir sebagai data awal ke tabel `Quiz`.
- Field `ecosystem` di JSON itu METADATA tambahan (bukan field resmi
  di skema `Quiz` sekarang) — dipakai untuk membantu Guru
  mengelompokkan soal ke Lesson yang sesuai secara manual/semi-manual
  saat seeding (misal: buat 4 Lesson skeleton dulu — "Ekosistem
  Umum", "Ekosistem Hutan", "Ekosistem Darat", "Ekosistem Laut",
  "Ekosistem Sawah" — lalu tiap soal di-assign `lessonId` sesuai field
  `ecosystem`-nya). Kalau menurutmu field `ecosystem` sebaiknya jadi
  kolom resmi di skema `Quiz`/`Lesson` (bukan cuma dipakai saat seed
  lalu dibuang), usulkan ke saya dulu sebelum mengubah skema.
- Jalankan sebagai Prisma seed script terpisah (`prisma/seed-quiz.ts`
  atau ditambahkan ke seed script yang sudah ada), BUKAN insert manual
  sekali pakai yang tidak bisa dijalankan ulang.

## Yang TIDAK Boleh Berubah

- ❌ Endpoint/modul dari FASE R1-R5 yang sudah jalan (Auth, Asset,
  Scene, Ecosystem Preset).
- ❌ Skema Prisma di luar `Lesson`/`Quiz`/`QuizAttempt` yang memang
  scope fase ini.

## Bukti yang Harus Dilaporkan

1. Screenshot UI "Kelola Kuis" (sisi Guru) — list soal + form tambah
   soal.
2. Screenshot UI "Kerjakan Kuis" (sisi Siswa) — proses jawab + hasil
   skor setelah submit.
3. Konfirmasi 20 soal dari `bank-soal-kuis-ekosistem-SD.json` berhasil
   masuk ke database (screenshot query/list soal ter-seed).
4. Konfirmasi role-guard endpoint: coba akses endpoint Create/Update/
   Delete Quiz pakai akun STUDENT — harus ditolak (403), laporkan
   hasil test ini secara eksplisit.
5. Test end-to-end pakai 2 akun test (STUDENT & TEACHER dari FASE
   sebelumnya): Guru bikin soal baru → Siswa bisa lihat & jawab →
   Guru bisa lihat rekap nilai siswa tsb.

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek sebelum
dianggap final.
