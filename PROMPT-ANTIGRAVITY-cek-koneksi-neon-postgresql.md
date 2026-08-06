# PROMPT untuk Antigravity: MASIH GAGAL TOTAL — Cek Koneksi ke Neon PostgreSQL (Bukan Render Managed DB)

## Update Penting: Database yang Dipakai adalah Neon (`neon.tech`)

Info krusial yang sebelumnya belum disebutkan eksplisit: **database
production project ini pakai Neon PostgreSQL (`neon.tech`), BUKAN
Render Managed PostgreSQL**. Render di sini cuma host untuk service
backend (NestJS), sedangkan database-nya eksternal di Neon. Ini
mengubah arah diagnosa — kemungkinan besar akar masalah selama ini
ada di **koneksi antara service Render dan database Neon**, bukan di
logic kode semata.

## Kondisi Terkini (masih GAGAL TOTAL setelah "fix" sebelumnya)

Screenshot terbaru dari dashboard Siswa di production menunjukkan:
- "SOAL KUIS TERSEDIA": **0**
- "JAWABAN DISUBMIT": **0**
- "SISWA MENGERJAKAN": **0**
- Panel kuis: "Pilih kuis di sebelah kiri untuk mulai menjawab" (list
  soal kosong sama sekali)

Dan di dashboard Guru, **tombol tambah soal juga masih belum bisa**.

Artinya commit `6332418` (auto-seed `OnModuleInit` + `getOrCreate
DefaultLesson`) **TIDAK BEREFEK SAMA SEKALI** di production — bukan
cuma "kurang sempurna", tapi benar-benar seperti tidak pernah jalan.
Ini bukti kuat kemungkinan service Render bahkan **gagal connect ke
database Neon** (baik saat startup untuk seeding, maupun saat runtime
untuk request biasa), sehingga semua operasi DB diam-diam gagal atau
fallback ke state kosong.

## Tugas Diagnosa (WAJIB, urutan ini)

### 1. Cek environment variable `DATABASE_URL` di Render

- Buka Render dashboard → service backend → Environment. Pastikan
  `DATABASE_URL` (atau nama env var yang dipakai Prisma) **memang
  ter-set** dan isinya adalah connection string Neon yang BENAR
  (bukan kosong, bukan connection string lokal/placeholder yang
  ketinggalan dari development).
- Neon biasanya kasih 2 jenis connection string: **pooled** (lewat
  PgBouncer, ada `-pooler` di hostname) dan **direct/unpooled**. Cek
  connection string mana yang dipakai — kalau Prisma migration
  dijalankan pakai pooled connection padahal butuh direct (atau
  sebaliknya salah setting `directUrl` di `schema.prisma`), ini bisa
  bikin migrasi/koneksi gagal aneh. Sesuaikan dengan rekomendasi resmi
  Prisma+Neon (biasanya: `DATABASE_URL` pakai pooled buat runtime
  query, `directUrl` terpisah pakai unpooled buat migrasi).
- Pastikan connection string ada parameter `sslmode=require` (Neon
  mewajibkan SSL) — kalau tidak ada, koneksi bisa gagal total.

### 2. Cek langsung di Neon Console (jangan cuma dari sisi Render)

- Login ke Neon dashboard, buka SQL Editor project ini.
- Query manual: `SELECT COUNT(*) FROM "Quiz";` (sesuaikan nama tabel
  persis dengan skema Prisma) — apakah datanya BENAR-BENAR 0 di Neon,
  atau sebenarnya sudah ada 20 row tapi backend Render yang gagal
  connect/query ke situ?
- Cek juga apakah tabel `Quiz`, `Lesson`, dll SUDAH ADA sama sekali di
  Neon (migrasi Prisma benar-benar sudah ter-apply ke database Neon
  ini) — kalau tabelnya belum ada sama sekali, berarti migrasi belum
  pernah berhasil jalan ke database production ini.

### 3. Cek Render runtime logs saat startup & saat request masuk

- Startup logs: apakah ada error koneksi database saat service Render
  nyala (biasanya keliatan jelas kalau prisma gagal connect, misal
  error `ECONNREFUSED`, `password authentication failed`, `SSL
  required`, dll)?
- Request logs: coba akses halaman Kuis Interaktif & tombol tambah
  soal lagi, lalu LANGSUNG cek Render logs pada waktu itu juga — cari
  error asli yang muncul, jangan reproduksi lewat script/localhost.

### 4. Baru perbaiki setelah akar masalah dari Neon+Render dikonfirmasi

Kemungkinan perbaikan (pilih sesuai temuan aktual, jangan asal semua
diterapkan):
- Perbaiki `DATABASE_URL`/`directUrl` di Render Environment supaya
  cocok dengan connection string Neon yang benar.
- Jalankan migrasi Prisma manual yang mengarah eksplisit ke database
  Neon production (pastikan `DATABASE_URL` yang aktif saat command
  migrate dijalankan adalah Neon production, bukan tanpa sengaja
  ke database lain).
- Kalau koneksi sudah benar tapi ternyata `OnModuleInit` tidak
  ke-trigger atau errornya di-swallow diam-diam (try-catch tanpa log),
  tambahkan logging eksplisit supaya kejadian seperti ini kelihatan
  jelas di log Render ke depannya.

## Aturan Laporan (tetap berlaku)

JANGAN laporkan "sudah berhasil" tanpa bukti konkret: (1) hasil query
`SELECT COUNT(*)` dari Neon SQL Editor yang menunjukkan data benar
ada, (2) screenshot Render logs yang menunjukkan koneksi Neon sukses,
(3) screenshot browser production (bukan localhost) yang menunjukkan
soal kuis sudah muncul & tombol tambah soal sudah berfungsi.
