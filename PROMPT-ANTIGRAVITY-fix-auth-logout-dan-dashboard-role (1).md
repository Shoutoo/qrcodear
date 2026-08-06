# PROMPT ANTIGRAVITY — Perbaikan Logic Auth (Logout dkk) + Fix Dashboard Role-Based Belum Berubah

## Konteks

Login & register sudah berfungsi (dari task sebelumnya). Tapi ada 2
masalah yang perlu diperbaiki:

1. **Logic auth masih minim** — belum ada tombol logout dan
   kelengkapan session-handling standar seperti aplikasi pada umumnya.
2. **Dashboard Guru vs Siswa belum ada perbedaan** — padahal task
   sebelumnya sudah minta pemisahan dashboard berdasarkan role, tapi
   setelah dicoba, tampilannya masih sama untuk kedua role. Ini
   kemungkinan task sebelumnya belum benar-benar dieksekusi/selesai,
   atau ada bug di logic pengecekan role.

## ATURAN WAJIB

1. **Untuk masalah #2 (dashboard belum beda): diagnosa dulu, jangan
   langsung nulis ulang dari nol.** Kemungkinan penyebab yang perlu
   dicek satu-satu:
   - Apakah `role` user memang ke-include di payload JWT saat login?
     (cek response login, decode token-nya, pastikan field `role` ada
     dan isinya benar sesuai akun yang dipakai)
   - Apakah frontend benar-benar membaca `role` dari token/session dan
     dipakai untuk conditional render, atau kodenya cuma nulis
     komentar/rencana tapi belum ada conditional logic-nya sama
     sekali (kemungkinan besar task sebelumnya cuma sebagian
     dikerjakan)?
   - Coba login pakai 2 akun test (STUDENT & TEACHER) yang sudah
     di-seed, screenshot payload JWT masing-masing untuk MEMBUKTIKAN
     role-nya beda dulu, baru lanjut cek kenapa UI tidak mengikuti.
   Laporkan temuan tiap langkah SEBELUM menerapkan fix.
2. Satu masalah, satu waktu — selesaikan diagnosa+fix dashboard role
   dulu, baru lanjut ke perbaikan logic auth (logout dkk), jangan
   dikerjakan bersamaan tercampur.
3. Tetap pakai JWT + refresh token sesuai arsitektur yang sudah final
   (tabel `RefreshToken`), jangan ganti ke session-based.

## Bagian 1: Fix Dashboard Role-Based

Setelah diagnosa (Aturan Wajib #1) dan ketemu root cause, terapkan
fix supaya dashboard BENAR-BENAR beda sesuai pembagian yang sudah
dikonfirmasi sebelumnya:

| Fitur | Guru | Siswa |
|---|---|---|
| Beranda & Analytics | Agregat semua kelas/siswa | Progres pribadi saja |
| AR Studio | Akses penuh (create/edit) | Tidak ada akses menu ini |
| Kuis Interaktif | Kelola soal + rekap nilai siswa | Kerjakan kuis + skor sendiri |
| Unity Assemblr | Akses create/edit project | Viewer AR saja |
| Activity Log | Log semua siswa di kelasnya | Log diri sendiri saja |
| Class Management | Kelola kelas & siswa | Lihat kelas yang diikuti |

Catatan: modul Quiz/Lesson (FASE R6) MEMANG belum dikerjakan — jadi
untuk baris "Kuis Interaktif" di tabel ini, cukup pastikan MENU-nya
sudah membedakan (misal label "Kelola Kuis" untuk Guru vs "Kerjakan
Kuis" untuk Siswa, atau disembunyikan dulu kalau fiturnya belum ada
sama sekali) — isi fungsional penuhnya menyusul FASE R6, bukan
tanggung jawab task ini.

## Bagian 2: Perbaikan Logic Auth

Tambahkan kelengkapan standar berikut:

1. **Tombol Logout** — hapus token (access token dari storage
   frontend, revoke refresh token di database dengan set
   `revoked = true` pada record `RefreshToken` terkait), redirect ke
   halaman login/landing.
2. **Persist session** — kalau user refresh halaman, tetap dalam
   keadaan login (baca token dari storage yang dipilih, verifikasi
   masih valid, jangan minta login ulang tiap refresh).
3. **Auto-refresh access token** — kalau access token expired tapi
   refresh token masih valid, otomatis request token baru di
   background (bukan langsung logout paksa user).
4. **Redirect otomatis kalau belum login** — kalau user coba akses
   halaman dashboard tanpa token valid, redirect ke halaman login
   (protected route guard di sisi frontend), JANGAN biarkan halaman
   kosong/error tanpa arahan jelas.
5. **Redirect otomatis kalau sudah login** — kalau user yang sudah
   login coba buka halaman login/register lagi, langsung arahkan ke
   dashboard sesuai role-nya (bukan ditampilkan form login lagi).
6. **Handle refresh token expired/invalid** — kalau refresh token juga
   sudah tidak valid (misal sudah lama tidak buka app), logout paksa
   dengan pesan jelas ("Sesi berakhir, silakan login kembali"), bukan
   error teknis mentah yang membingungkan user awam (target user app
   ini termasuk guru yang belum tentu paham teknis).
7. **Indikator user yang sedang login** — tampilkan nama/role user
   yang sedang login di UI (misal di header/navbar), supaya user tahu
   akun mana yang aktif — penting khususnya untuk testing pakai 2 akun
   berbeda (STUDENT vs TEACHER).

## Yang TIDAK Boleh Berubah

- ❌ Skema Prisma (`User`, `RefreshToken`) — pakai struktur yang sudah
  ada, jangan tambah field baru kecuali benar-benar dibutuhkan dan
  dilaporkan alasannya.
- ❌ Endpoint Auth yang sudah berfungsi (login/register) — perbaikan
  ini nambah kelengkapan, bukan menulis ulang dari nol.
- ❌ Modul di luar Auth & Dashboard (Asset, Scene, Ecosystem Preset
  dari fase sebelumnya).

## Bukti yang Harus Dilaporkan

1. **Untuk Bagian 1**: laporan diagnosa (root cause kenapa dashboard
   belum beda), lalu screenshot dashboard Guru vs Siswa berdampingan
   setelah fix — harus keliatan jelas bedanya.
2. **Untuk Bagian 2**: screenshot/demo tiap poin (1-7) — minimal
   screenshot tombol logout berhasil (redirect ke login), screenshot
   refresh halaman tetap login, dan screenshot indikator user aktif
   di header.
3. Test ulang pakai 2 akun test (STUDENT & TEACHER): login-logout-
   login lagi pakai akun beda, pastikan tidak ada data/session
   "nyangkut" dari akun sebelumnya.

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek/coba sendiri
sebelum dianggap final.
