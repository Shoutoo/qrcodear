# PROMPT untuk Antigravity: Tambah Tombol "Cetak Barcode QR" di Card Preset Ekosistem

## Konteks

Di halaman Beranda/Dashboard, section "Presets Ekosistem Rantai
Makanan AR" menampilkan 4 card (Ekosistem Darat, Hutan, Laut, Sawah).
Tiap card saat ini cuma punya 1 tombol: **"Tampilkan AR Viewer"**
(langsung membuka AR viewer preset tsb).

## Tugas

Tambahkan **1 tombol baru** di tiap card preset ekosistem, di
bawah/sebelah tombol "Tampilkan AR Viewer" yang sudah ada. Tombol
baru ini untuk **cetak barcode/QR fisik** dari preset ekosistem
tersebut, supaya bisa dicetak dan discan langsung oleh siswa (pakai
kamera HP) tanpa harus buka dashboard dulu.

### Spesifikasi tombol baru

- Label: **"Cetak Barcode"** (ikon QR code / printer, styling
  secondary — outline ungu di atas putih, supaya tombol utama
  "Tampilkan AR Viewer" tetap jadi CTA primer/solid ungu).
- Posisi: tepat di bawah tombol "Tampilkan AR Viewer" yang sudah ada,
  full-width sama seperti tombol existing, jadi 1 card = 2 tombol
  stack vertikal.
- Aksi saat diklik: membuka halaman/print-view kartu QR **khusus
  untuk preset ekosistem itu** (bukan kartu per-model satuan seperti
  fitur kartu cetak QR yang sudah ada) — barcode-nya encode URL AR
  viewer preset ekosistem tsb (yang sama persis dengan link yang
  dibuka tombol "Tampilkan AR Viewer").
- Style kartu cetak: pakai desain "Wild Explorer" (background jungle
  hi-res yang sudah ada, ukuran fixed A6 10.5x14.8cm) yang sudah jadi
  standar kartu cetak project ini — cukup ganti QR target-nya ke URL
  preset ekosistem, dan judul/teks kartu jadi nama ekosistem (mis.
  "Ekosistem Darat — Scan untuk mulai AR!").

### Yang perlu dicek/disesuaikan di kode

1. Cari komponen/file yang me-render card preset ekosistem (kemungkinan
   di folder views/partials dashboard, cari string "Tampilkan AR
   Viewer" atau "Presets Ekosistem Rantai Makanan AR").
2. Cari fitur kartu cetak QR yang sudah ada (yang sudah dipakai untuk
   model-model AR satuan) — reuse komponen/template print-nya kalau
   memungkinkan, jangan bikin dari nol. Cari file terkait
   `kartu-background-jungle` atau folder print/cetak.
3. Cek apakah backend punya endpoint untuk generate QR image dari
   sebuah URL (kalau sudah ada di fitur kartu cetak existing, reuse;
   kalau belum ada untuk level preset ekosistem, tambahkan endpoint
   baru mengikuti pola endpoint kartu cetak yang sudah ada).
4. Pastikan URL yang di-encode ke QR itu URL PUBLIC yang bisa diakses
   langsung dari HP siswa (bukan route yang butuh login/auth), sama
   seperti URL yang dipakai tombol "Tampilkan AR Viewer" sekarang.

### Batasan scope

- JANGAN ubah tombol "Tampilkan AR Viewer" yang sudah ada.
- JANGAN ubah fitur kartu cetak QR per-model satuan yang sudah ada —
  ini task terpisah, cukup reuse template/style-nya kalau bisa.
- JANGAN sentuh fase-fase FASE R1-R10 rewrite EduAR Platform, ini
  task di luar urutan fase (sama seperti task kartu cetak QR
  sebelumnya).

### Setelah selesai

Kasih laporan singkat: file apa saja yang diubah/ditambah, dan
screenshot/bukti visual card dengan 2 tombol + contoh hasil kartu
cetak barcode preset ekosistem.
