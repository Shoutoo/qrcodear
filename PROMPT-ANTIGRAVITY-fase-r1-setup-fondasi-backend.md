# PROMPT ANTIGRAVITY — FASE R1: Setup Fondasi Backend Baru (EduAR Platform)

> Tempel prompt ini ke Antigravity. Lampirkan juga
> `RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md` (versi terbaru, sudah
> ada keputusan final di bagian 1 & 8) sebagai referensi arsitektur
> lengkap.

---

## Konteks

Project **AR Edu QR** (Node.js/Express + file JSON) sedang di-rewrite
besar menjadi **EduAR Platform** (NestJS + PostgreSQL + Prisma +
Cloudflare R2), mengikuti roadmap 10 fase (FASE R1–R10) di
`RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md`. Ini adalah **FASE R1 —
Setup Fondasi Backend Baru**, fase paling awal. Tugas ini HANYA
membangun fondasi (skeleton project, koneksi DB, koneksi storage),
**BELUM ada logic bisnis/endpoint fitur apapun**.

## ATURAN WAJIB — Baca Sebelum Mulai

1. **JANGAN sentuh project lama sama sekali.** Project NestJS baru
   dibuat di folder **terpisah** (misal `server-v2/` atau repo/folder
   baru di luar `server/` yang sekarang) — bukan menimpa atau
   memodifikasi file apapun di dalam `server/` (Express lama). Project
   lama harus tetap bisa jalan seperti biasa sepanjang FASE R1 ini
   dikerjakan.
2. **Satu fase, satu waktu.** Kerjakan HANYA scope FASE R1 di bawah.
   Jangan mulai bikin endpoint API, migrasi data (itu FASE R2), atau
   modul auth (FASE R5) — sekalipun kelihatan "gampang sekalian
   dikerjakan sekarang". Kalau ketemu hal di luar scope yang menurutmu
   penting, catat di laporan akhir, jangan langsung dikerjakan.
3. **Tunjukkan bukti, lalu berhenti.** Setelah checklist di bawah
   selesai, laporkan buktinya (lihat bagian "Bukti yang Harus
   Dilaporkan") dan **tunggu konfirmasi eksplisit dari user** sebelum
   lanjut ke FASE R2. Jangan lanjut sendiri.
4. Kalau ada keputusan teknis yang tidak jelas dari dokumen rencana
   (misal versi Node/NestJS spesifik, nama field yang ambigu), **tanya
   ke user**, jangan menebak sendiri lalu jalan terus.

## Scope Kerja FASE R1

### 1. Init Project NestJS
- Buat project NestJS baru di folder terpisah (lihat Aturan #1).
- Setup struktur modular standar NestJS (siap untuk nanti diisi
  modul-modul: Auth, Project, Asset, Scene, Lesson, Quiz, Class, dst
  — tapi modul-modul ini BELUM dibuat isinya di fase ini, cukup
  folder/struktur dasar NestJS-nya).
- Setup environment config (`.env` + validasi env, pakai
  `@nestjs/config`) untuk: `DATABASE_URL`, kredensial R2 (lihat poin
  3), `JWT_SECRET` (disiapkan sebagai env var walau belum dipakai di
  fase ini — akan dipakai di FASE R5).

### 2. Setup PostgreSQL + Prisma
- Install & konfigurasi Prisma di project NestJS baru.
- Tulis schema Prisma sesuai **bagian 4** di
  `RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md` (schema sudah lengkap di
  dokumen itu — termasuk model `User`, `RefreshToken`, `Project`,
  `Asset`, `Scene`, `EcosystemPreset`, `PublishedExperience`,
  `Lesson`, `Quiz`, `QuizAttempt`, `Class`, `ClassEnrollment`). Salin
  apa adanya, jangan diubah strukturnya kecuali menemukan error teknis
  saat migration — kalau begitu, laporkan perubahan yang terpaksa
  dilakukan.
- Jalankan `prisma migrate dev` (migration pertama) ke database
  PostgreSQL development (bisa lokal/Docker Postgres dulu untuk
  development, belum perlu provision Postgres di Render pada fase
  ini kecuali user sudah siapkan).
- Setup Prisma Client agar bisa di-inject sebagai service NestJS
  (`PrismaService` pola standar).

### 3. Setup Koneksi Cloudflare R2
- Buat service/module kecil untuk koneksi ke Cloudflare R2 (S3-
  compatible API — pakai `@aws-sdk/client-s3` dengan endpoint custom
  R2, BUKAN library AWS-specific yang tidak kompatibel S3-generic).
- Env var yang dibutuhkan: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL_BASE`
  (kalau pakai custom domain/public bucket URL).
- Buat 2 helper function dasar saja untuk fase ini: `uploadFile(key,
  buffer, contentType)` dan `deleteFile(key)`. Endpoint upload asset
  yang sebenarnya (dipanggil dari Studio) itu FASE R3/R4, bukan di
  sini — cukup helper-nya siap dipakai nanti.
- **Kalau kredensial R2 (bucket, API token) belum ada**, laporkan ke
  user bahwa ini perlu dibuat dulu di dashboard Cloudflare sebelum
  langkah ini bisa diverifikasi dengan test-upload sungguhan — jangan
  pakai kredensial palsu/placeholder yang di-hardcode.

### 4. Test Koneksi End-to-End
- Buat 1 script/endpoint sementara (boleh dihapus lagi setelah
  verifikasi, atau ditandai jelas sebagai "temporary test") untuk:
  - Test koneksi Prisma → Postgres: query sederhana (misal
    `SELECT 1` via Prisma atau `prisma.user.count()` ke tabel kosong).
  - Test koneksi R2: upload 1 file dummy kecil (misal file `.txt`
    berisi teks test), lalu cek file tersebut bisa diakses via URL
    publik/CDN, lalu hapus lagi file test tersebut.

## Bukti yang Harus Dilaporkan

Setelah selesai, laporkan ke user dengan:
1. Struktur folder project NestJS baru (output `tree`/listing
   singkat).
2. Screenshot/log hasil `prisma migrate dev` yang sukses (semua tabel
   ter-generate tanpa error).
3. Screenshot/log hasil test koneksi Postgres (query sukses).
4. Screenshot/log hasil test upload-download-delete file dummy ke R2
   (termasuk URL file test yang sempat bisa diakses).
5. Konfirmasi eksplisit: **"Project Express lama di folder `server/`
   masih utuh tidak tersentuh"** — sebutkan ini secara eksplisit di
   laporan, bukan diasumsikan.
6. List env var apa saja yang dibutuhkan (tanpa isi value rahasianya)
   supaya user tahu apa yang perlu disiapkan di `.env` production
   nanti (termasuk saat provision Postgres di Render).

## Yang TIDAK Boleh Dikerjakan di Fase Ini (reminder)

- ❌ Endpoint API bisnis apapun (assets, scenes, publish, dst) — itu
  FASE R3.
- ❌ Script migrasi data dari JSON lama — itu FASE R2.
- ❌ Logic auth/JWT/login — itu FASE R5 (env var `JWT_SECRET` cukup
  disiapkan, belum dipakai).
- ❌ Mengubah/menyentuh apapun di folder `server/` (project Express
  lama) atau `client/index.html`, `studio/`, `ar-viewer.html`.
- ❌ Deploy ke production/Render — fase ini scope development lokal
  dulu, kecuali user minta lain.

Setelah semua checklist di atas selesai dan bukti dilaporkan, **STOP**
dan tunggu instruksi user untuk lanjut ke FASE R2 (Migrasi Data).
