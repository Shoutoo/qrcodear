# PROMPT ANTIGRAVITY — Redesign Login Page + Fix Navbar Numpuk (Responsive)

## Konteks

Mulai fase pengembangan **UI/UX** dulu sebelum lanjut FASE R6 (Quiz).
Dua task terpisah tapi saling terkait secara visual:

1. **Navbar numpuk** — dari screenshot, menu navigasi ("Beranda &
   Analytics", "AR Studio", "Kuis Interaktif", "Unity Assemblr",
   "Activity Log") plus tombol "Masuk"/"Daftar Siswa/Guru" semua
   berjejer sejajar tanpa strategi responsif, jadi kelihatan sempit/
   numpuk terutama di layar lebih kecil. Ini akan makin parah di
   dashboard Guru/Siswa nanti karena JUMLAH menu beda per role (lihat
   task fix dashboard role sebelumnya) — kalau navbar-nya fixed/tidak
   fleksibel, tampilannya bisa makin berantakan tergantung role yang
   login.
2. **Login page perlu didesain lebih baik** — belum ada acuan visual
   spesifik, jadi ikuti prinsip UI/UX standar yang baik (detail di
   bawah), selaras dengan branding yang sudah ada (warna ungu-kuning,
   ikon logo "Magic AR Edu").

## ATURAN WAJIB

1. **Scope task ini HANYA visual/layout (CSS/komponen UI)**, jangan
   sentuh logic auth (login/register/logout/JWT) yang sudah diperbaiki
   di task sebelumnya — cukup bungkus ulang tampilannya, endpoint dan
   flow autentikasi tetap sama persis.
2. Navbar yang diperbaiki harus tetap **konsisten dipakai di semua
   halaman** (landing page, dashboard Guru, dashboard Siswa) — jangan
   bikin 3 komponen navbar terpisah yang beda-beda, buat 1 komponen
   navbar reusable yang otomatis menyesuaikan isi menu berdasarkan
   role (sesuai pembagian menu Guru/Siswa yang sudah dikonfirmasi
   sebelumnya) dan otomatis responsif berapa pun jumlah item menunya.
3. Test di beberapa lebar layar (desktop besar, laptop biasa ~1366px,
   tablet, mobile) — jangan cuma dicek di 1 ukuran layar saja.

## Scope Kerja

### 1. Fix Navbar (Responsive)
- **Breakpoint desktop lebar**: semua menu tampil sejajar seperti
  sekarang, TAPI kasih spacing yang cukup (jangan mepet-mepet), dan
  batasi lebar maksimum container navbar supaya tidak terlalu
  melebar/renggang di layar sangat besar.
- **Breakpoint medium (tablet/laptop kecil)**: kalau menu mulai tidak
  muat sejajar, kelompokkan menu yang kurang prioritas ke dalam
  dropdown "Lainnya"/ikon titik tiga, sisakan 2-3 menu paling penting
  tetap terlihat langsung.
- **Breakpoint mobile**: ubah jadi hamburger menu (ikon garis tiga),
  menu muncul sebagai dropdown/drawer saat diklik, bukan dipaksa
  muat sejajar horizontal.
- **Tombol Masuk/Daftar** (untuk yang belum login) atau **indikator
  user + tombol Logout** (untuk yang sudah login, sesuai task
  sebelumnya) tetap harus selalu terlihat/mudah diakses di semua
  breakpoint, jangan ikut ke-collapse ke hamburger menu.
- Pastikan navbar tidak "numpuk" berapa pun jumlah item menu-nya
  (ingat: Guru dan Siswa punya jumlah menu berbeda sesuai pembagian
  role) — pakai `flex-wrap`/overflow handling yang benar, bukan lebar
  fixed yang gampang overflow.

### 2. Redesign Login Page
Prinsip desain yang perlu diikuti:
- **Layout terpusat** — card login di tengah layar, tidak nempel ke
  pinggir/menyatu dengan background polos, kasih sedikit elemen visual
  brand (misal aksen warna ungu-kuning dari logo, atau ilustrasi
  ringan bertema edukasi/AR) di sisi kosong supaya tidak terasa
  kosong/generik.
- **Form jelas & mudah dipakai**:
  - Input email & password dengan label jelas (bukan cuma placeholder
    yang hilang saat diketik).
  - Toggle show/hide password (ikon mata).
  - Tombol submit dengan loading state jelas (spinner/disabled saat
    proses submit, supaya user tidak mengklik berkali-kali).
  - Pesan error yang jelas & ramah kalau login gagal (bukan pesan
    error teknis mentah dari API).
- **Navigasi terkait**: link "Belum punya akun? Daftar di sini"
  mengarah ke halaman register, dan sebaliknya di halaman register ada
  link balik ke login.
- **Branding konsisten**: pakai warna & logo yang sama dengan navbar
  ("Magic AR Edu", ungu sebagai warna utama, kuning sebagai aksen),
  supaya terasa satu kesatuan produk, bukan halaman terpisah yang
  beda gaya.
- **Redirect otomatis**: kalau user yang sudah login coba buka
  `/login`, langsung arahkan ke dashboard sesuai role (perilaku ini
  seharusnya sudah ada dari task perbaikan auth sebelumnya — pastikan
  masih berfungsi setelah redesign visual ini, jangan sampai rusak).

## Yang TIDAK Boleh Berubah

- ❌ Logic/flow autentikasi (endpoint login/register/logout, JWT,
  refresh token) — ini murni redesign visual.
- ❌ Pembagian menu Guru vs Siswa yang sudah dikonfirmasi — redesign
  navbar ini soal LAYOUT/RESPONSIVE-nya, bukan mengubah menu APA SAJA
  yang tampil per role.

## Bukti yang Harus Dilaporkan

1. Screenshot navbar di 4 lebar layar berbeda (desktop besar, laptop
   ~1366px, tablet, mobile) — untuk akun Guru DAN akun Siswa (total
   8 screenshot, atau minimal cukup mewakili tiap kombinasi penting).
2. Screenshot login page baru (desktop & mobile).
3. Konfirmasi redirect otomatis (user sudah login → buka `/login` →
   auto ke dashboard) masih berfungsi setelah redesign.
4. Konfirmasi logic auth tidak ada yang berubah/rusak (test login-
   logout sekali lagi pakai 2 akun test).

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek sebelum
dianggap final. Setelah task UI/UX ini beres, baru lanjut ke FASE R6
(Quiz).
