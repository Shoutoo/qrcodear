# PROMPT ANTIGRAVITY — Dashboard Role-Based (Guru/Siswa) + Aktivasi Register + Seed Akun Test

## Konteks

Modul Auth & Role (FASE R5) sedang berjalan. Sekarang perlu: (1)
dashboard yang tampilannya beda untuk role GURU vs SISWA, (2) tombol
"Daftar Siswa/Guru" di landing page disambungkan ke database
sungguhan (saat ini kemungkinan belum berfungsi/masih dummy), (3)
2 akun test siap pakai (1 STUDENT, 1 TEACHER) untuk saya coba login.

## ATURAN WAJIB

1. Tetap pakai skema `Role` yang sudah ada di Prisma (`STUDENT`,
   `TEACHER`, `ADMIN`) — jangan bikin enum/role baru tanpa konfirmasi.
2. Auth tetap pakai JWT sesuai keputusan yang sudah final (access
   token + refresh token via tabel `RefreshToken`).
3. Satu fase, satu waktu — kerjakan 3 task di bawah berurutan
   (Dashboard split → Register aktif → Seed akun test), laporkan tiap
   task selesai sebelum lanjut ke task berikutnya.
4. Kalau UI dashboard yang sekarang ada ternyata satu halaman
   campur-aduk untuk semua role, JANGAN duplikat seluruh halaman jadi
   2 file terpisah membabi buta — pisahkan komponen yang beda per
   role secara modular (conditional render berdasarkan `role` dari
   JWT/session), supaya bagian yang SAMA (header, styling dasar) tidak
   ke-duplikat dan susah maintain ke depannya.

## Scope Kerja

### 1. Dashboard Role-Based
Pisahkan tampilan dashboard berdasarkan role user yang login, sesuai
pembagian berikut (sudah dikonfirmasi):

| Fitur | Guru | Siswa |
|---|---|---|
| Beranda & Analytics | Agregat semua kelas/siswa | Progres pribadi saja |
| AR Studio | Akses penuh (create/edit) | Tidak ada akses menu ini |
| Kuis Interaktif | Kelola soal + rekap nilai siswa | Kerjakan kuis + skor sendiri |
| Unity Assemblr | Akses create/edit project | Viewer AR saja |
| Activity Log | Log semua siswa di kelasnya | Log diri sendiri saja |
| Class Management | Kelola kelas & siswa | Lihat kelas yang diikuti |

Implementasi: setelah login, redirect/render dashboard sesuai `role`
dari JWT payload. Menu navigasi (yang sekarang isinya "Beranda &
Analytics", "AR Studio", "Kuis Interaktif", "Unity Assemblr",
"Activity Log") HARUS filter item mana yang tampil sesuai role di
tabel atas — Siswa tidak boleh melihat/mengakses menu "AR Studio" dan
"Unity Assemblr" sama sekali (bukan cuma disembunyikan di UI, tapi
endpoint API terkait juga harus di-protect role-nya, cek ulang guard/
middleware auth-nya).

### 2. Aktivasi Tombol Register
Tombol "Daftar Siswa/Guru" di landing page disambungkan ke endpoint
register sungguhan (modul Auth FASE R5):
- Form input minimal: nama, email, password, pilihan role
  (STUDENT/TEACHER).
- **Akun GURU langsung aktif begitu daftar** (tidak perlu approval
  Admin dulu) — ini sudah diputuskan final, jangan ditanyakan lagi ke
  user, langsung terapkan begini. Sama seperti akun STUDENT, langsung
  bisa login setelah register berhasil.
- Setelah submit sukses: user baru tersimpan di tabel `User` (password
  di-hash, jangan simpan plain text), lalu diarahkan ke halaman
  login atau langsung login otomatis (JWT + refresh token ter-generate)
  — pilih salah satu, laporkan yang dipilih.
- Validasi dasar: email tidak boleh duplikat, password minimal
  panjang tertentu (laporkan aturan validasi yang dipakai).

### 3. Seed 2 Akun Test
Buat script seed (Prisma seed script, `prisma/seed.ts` atau sejenis)
yang membuat 2 akun:
- 1 akun role **STUDENT**
- 1 akun role **TEACHER**

Password harus SAYA yang tentukan sendiri saat ini bukan di-generate
acak tanpa dilaporkan — pakai password sederhana untuk keperluan testing
(contoh: `Test1234!`), dan **laporkan email + password kedua akun ini
dengan jelas** di akhir (bukan disembunyikan di file yang harus saya
cari sendiri).

## Yang TIDAK Boleh Diasumsikan Sendiri

- ❌ Field tambahan di form register di luar nama/email/password/role
  (misal NISN, NIP, nama sekolah) — kalau menurutmu perlu, usulkan ke
  saya, jangan langsung ditambahkan sendiri.

## Bukti yang Harus Dilaporkan

1. Screenshot dashboard Guru vs dashboard Siswa berdampingan, terlihat
   jelas menu yang beda sesuai tabel di atas.
2. Konfirmasi endpoint API yang di-protect role-nya (bukan cuma UI
   yang disembunyikan) — sebutkan endpoint mana saja.
3. Bukti register berhasil membuat user baru di database (screenshot
   query/record baru di tabel `User`).
4. **Email + password 2 akun test (STUDENT & TEACHER)** ditulis jelas
   di laporan akhir.

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek/coba login
sendiri sebelum dianggap final.
