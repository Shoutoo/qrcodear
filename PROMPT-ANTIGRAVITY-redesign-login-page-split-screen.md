# PROMPT untuk Antigravity: Redesign Login Page (Layout Split-Screen)

## Konteks

User kirim gambar referensi desain login page (dari project sekolah
lain, bahasa Turki — HANYA dipakai sebagai acuan LAYOUT & STRUKTUR
visual, BUKAN untuk isi teks/field-nya). Struktur referensi:

- Layout split-screen 2 kolom, full-height, rounded card besar.
- **Kolom kiri**: background warna solid brand, logo outline putih di
  atas, headline welcome text 2-3 baris di bawah logo, dan di bagian
  bawah ada 1 ilustrasi/objek 3D dekoratif (cluster beberapa elemen
  bertumpuk, gaya isometric/3D render soft).
- **Kolom kanan**: background putih, judul besar "GIRIŞ YAP" (=
  "Login"/"Masuk"), lalu form vertikal (dropdown/field-field, garis
  underline tipis sebagai pemisah antar field, bukan box border
  penuh), tombol submit full-width warna solid brand, link kecil di
  bawah tombol.

Login page ini yang akan jadi **halaman pertama** dibuka saat website
diakses (bukan landing page dashboard), baru setelah login sukses user
diarahkan ke dashboard Guru atau Siswa sesuai role akun.

## Tugas

Redesign halaman login existing project ("Magic AR Edu" / EduAR
Platform) mengikuti STRUKTUR LAYOUT referensi di atas, tapi:

### 1. Sesuaikan warna & style ke CSS global project (WAJIB)

JANGAN pakai warna biru-teal dari referensi. Pakai design token/CSS
variable yang SUDAH ADA di project (cek file CSS global/theme yang
sudah dipakai navbar & dashboard — warna utama ungu/indigo seperti di
navbar "Beranda & Analytics", aksen kuning/gold seperti tombol
"Daftar Siswa/Guru"). Font, radius, shadow style juga ikut yang sudah
dipakai di komponen lain (navbar, card preset ekosistem), supaya
konsisten satu design system, bukan tempel gaya baru.

### 2. Sesuaikan isi teks

- Logo & branding: pakai logo "Magic AR Edu" yang sudah ada (bukan
  logo globe dari referensi).
- Headline kolom kiri: ganti jadi kalimat welcome yang relevan ke
  platform ini, misalnya soal AR & pembelajaran interaktif rantai
  makanan/ekosistem (bukan "Eğitim Otomasyon Programı"). Buat 2-3
  varian kalimat pendek, pilih yang paling pas nada project ini.
- Judul form kanan: "MASUK" (bukan "GİRİŞ YAP").
- Field form: **JANGAN ikut field referensi apa adanya** — referensi
  itu sistem Turki yang pakai T.C Kimlik Numarası + dropdown "Giriş
  Türü"/"Giriş Yöntemi", itu TIDAK relevan untuk project ini. Cek dulu
  field & logic login yang SUDAH ADA & SUDAH JALAN di FASE R5 (email/
  username + password, JWT) — cukup pakai field yang sudah ada itu,
  cuma re-style tampilannya mengikuti struktur visual referensi (judul
  besar di atas, tiap field pakai underline style bukan box border,
  tombol submit full-width solid, link "Lupa Password" kecil di
  bawah). JANGAN ubah logic auth yang sudah berfungsi, ini murni
  redesign visual/CSS + markup, bukan ganti alur login.

### 3. Ilustrasi/objek di kolom kiri bawah

Cluster ilustrasi 3D di referensi (topi wisuda, buku, tablet, dst)
JANGAN dipakai apa adanya — itu generic education icons, tidak related
ke AR. Buat ilustrasi baru pakai AI image generation (pola sama
seperti sebelumnya waktu generate background kartu cetak "Wild
Explorer" pakai Stitch AI), dengan brief:

> Ilustrasi 3D isometric, gaya soft/glossy toy-like (konsisten dengan
> model 3D "cute toy" yang sudah dipakai di preset ekosistem project
> ini), cluster beberapa objek bertumpuk yang merepresentasikan AR +
> edukasi ekosistem: HP/tablet menampilkan objek AR melayang di
> atasnya (mis. hewan kecil bergaya toy), QR code, dan 1-2 elemen
> alam (daun/pohon kecil) sebagai nuansa "ekosistem". Warna ikut
> palette brand project (ungu + kuning/gold sebagai aksen), background
> transparan supaya menyatu ke panel kiri.

Setelah gambar digenerate, pasang di posisi kiri-bawah panel (sama
seperti posisi objek di referensi), pastikan tidak menutupi teks
headline di atasnya.

### Batasan scope

- JANGAN ubah logic/endpoint auth yang sudah jalan (FASE R5) — murni
  redesign tampilan.
- JANGAN ubah alur redirect setelah login (tetap ke dashboard sesuai
  role Guru/Siswa seperti sekarang).
- Kalau ada field dropdown "Giriş Türü"/"Giriş Yöntemi" yang ternyata
  memang dibutuhkan project ini (mis. milih login sebagai Guru/Siswa),
  cek dulu — TAPI setahu saya role sudah otomatis ditentukan dari akun
  saat login, jadi kemungkinan besar dropdown ini TIDAK perlu
  ditambahkan. Konfirmasi dulu logic yang sudah ada sebelum menambah
  field baru.

### Setelah selesai

Kasih laporan singkat: file yang diubah, source ilustrasi AI yang
dipakai (simpan asetnya di folder yang sama dengan asset lain), dan
screenshot hasil halaman login baru (desktop + mobile, karena harus
tetap responsive seperti navbar yang sudah diperbaiki sebelumnya).
