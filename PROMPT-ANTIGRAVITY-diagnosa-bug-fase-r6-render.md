# PROMPT untuk Antigravity: Diagnosa Bug FASE R6 di Render (Soal Tidak Tampil + Internal Server Error saat Tambah Soal)

## Konteks

FASE R6 (Quiz + skeleton Lesson) sudah dieksekusi. Bank soal 20
pertanyaan (`bank-soal-kuis-ekosistem-SD.json`) sudah dimasukkan.
Tapi ada 2 masalah, KEDUANYA diuji & dikonfirmasi terjadi di **Render
(production)**, bukan cuma asumsi lokal:

1. Soal-soal dari bank soal itu **tidak tampil** di halaman Kuis
   Interaktif (tabel daftar soal di panel "Kelola Soal & Rekap Nilai
   Siswa" kosong).
2. Saat guru coba **tambah soal baru manual** lewat form (isi
   pertanyaan + 4 pilihan + jawaban benar, klik "Simpan Soal Baru"),
   muncul popup **"Internal server error"**.

User TIDAK tahu apakah versi lokal bermasalah juga atau tidak — yang
penting untuk diperbaiki adalah versi **Render**, karena itu yang
dipakai untuk testing.

## Tugas: DIAGNOSA DULU (jangan asal fix), baru perbaiki

### 1. Cek kenapa bank soal tidak tampil

- Cek: apakah proses seed/import `bank-soal-kuis-ekosistem-SD.json`
  kemarin benar-benar menulis ke **database production yang dipakai
  Render** (bukan cuma ke database lokal/dev di komputer development,
  yang mana kalau beda, otomatis tidak akan kelihatan di Render sama
  sekali)? Cek `DATABASE_URL` yang dipakai saat proses seed dijalankan
  vs `DATABASE_URL` yang dipakai service Render.
- Query langsung ke database production (via Prisma Studio atau query
  manual) untuk cek: apakah tabel soal kuis memang kosong, atau
  datanya ADA tapi endpoint GET/frontend-nya yang gagal nampilin
  (misal query salah filter, atau relasi ke Lesson yang belum ke-set
  bikin soal ke-exclude dari hasil query)?
- Laporkan temuan pastinya: data kosong di DB, atau data ada tapi
  gagal ditampilkan.

### 2. Cek root cause "Internal server error" saat tambah soal

- Ambil **log error asli** dari Render (Render dashboard → Logs) pada
  saat request tambah soal itu terjadi — cari stack trace/error
  message spesifiknya, JANGAN cuma menebak dari luar.
- Kemungkinan dugaan awal (WAJIB dikonfirmasi via log, bukan langsung
  diasumsikan benar): karena skema `Quiz` punya relasi WAJIB ke
  `Lesson` (sesuai keputusan arsitektur FASE R6), endpoint create-soal
  mungkin butuh `lessonId` yang valid, tapi form di frontend tidak
  mengirim `lessonId` sama sekali (lihat form di screenshot: cuma ada
  field Pertanyaan Soal + 4 Pilihan + Jawaban Benar, tidak ada pilihan
  Lesson) — kalau backend mewajibkan relasi ini tapi frontend tidak
  menyediakannya, otomatis gagal insert ke DB dan lempar 500.
- Cek juga kemungkinan lain: migrasi Prisma belum ter-apply dengan
  benar di database production Render (skema tabel Quiz/Lesson belum
  sinkron dengan kode terbaru), atau environment variable lain yang
  hilang di Render.

## Perbaikan (setelah root cause dikonfirmasi dari log/data asli)

- Kalau ternyata karena `lessonId` wajib tapi tidak ada Lesson
  default: putuskan salah satu — (a) buat 1 Lesson skeleton default
  otomatis saat sistem pertama kali jalan supaya semua soal baru bisa
  nempel ke situ, atau (b) buat backend generate/pakai Lesson default
  otomatis di endpoint create-soal kalau `lessonId` tidak dikirim.
  Pilih yang paling minim dampak ke skema yang sudah ada, tapi
  laporkan pilihan mana yang diambil & kenapa.
- Kalau ternyata karena data seed salah nyambung ke DB (bukan
  production), jalankan ulang proses seed KHUSUS ke database
  production Render, verifikasi datanya sungguhan masuk (query count
  setelah seed).
- Kalau ada migrasi Prisma yang belum ter-apply di Render, jalankan
  migrasi yang tertinggal, verifikasi skema tabel di production sudah
  sinkron.

## Batasan scope

- JANGAN ubah bank soal JSON-nya, itu sudah final.
- JANGAN ubah desain UI form tambah soal kecuali memang perlu nambah
  field (misal pilih Lesson) untuk menyelesaikan root cause di atas —
  kalau perlu nambah field, buat sesederhana mungkin (misal dropdown
  Lesson yang otomatis cuma ada 1 pilihan/default kalau memang cuma 1
  Lesson skeleton yang ada sekarang).

## Setelah selesai

Laporkan: (1) root cause pasti masalah 1 & 2 dari log/data asli
(bukan dugaan), (2) fix yang diterapkan, (3) bukti di Render (bukan
lokal): screenshot daftar soal sudah tampil isi 20 soal dari bank
soal, dan screenshot berhasil tambah soal baru tanpa error.
