# 🖱️ Bug Baru: Tombol "Mode AR" Tidak Bisa Diklik

## 1. Gejala

Setelah rangkaian perubahan Tahap 1 (rotate) dan Tahap 2 (pinch-zoom guarded), tombol **"Mode AR"** di halaman viewer sekarang **tidak merespons klik/tap sama sekali**.

## 2. Dugaan Root Cause (untuk diagnosa dulu, jangan langsung tulis kode)

Listener gestur sentuh untuk rotate (Tahap 1) dan pinch-zoom (Tahap 2) kemungkinan dipasang di level global (`window` atau `document`), bukan dibatasi hanya ke area canvas/scene AR saja. Kalau listener itu memanggil `e.preventDefault()` atau `e.stopPropagation()` secara luas pada event `touchstart`/`touchmove`, itu bisa **ikut memblokir event klik/tap ke elemen UI lain di halaman yang sama**, termasuk tombol "Mode AR".

## 3. Langkah Wajib

1. **Diagnosa dulu**: cek console browser saat mencoba tap tombol "Mode AR" — apakah event click terdaftar sampai ke handler tombol atau berhenti di tengah jalan (ketutup listener lain)?
2. **Cek scope listener touch dari Tahap 1 & 2**: apakah dipasang di `window`/`document` (global, ke seluruh halaman) atau sudah dibatasi ke elemen canvas/scene AR saja (`#ar-canvas`, `a-scene`, dsb)? Kalau masih global, ini kemungkinan besar akar masalahnya.
3. **Perbaikan yang diharapkan**: batasi listener rotate & pinch-zoom supaya HANYA aktif saat event terjadi di dalam area canvas/scene AR, bukan di seluruh halaman — supaya tombol UI lain (Mode AR, 3D View, dll) tetap bisa menerima klik normal.
4. **Pastikan tidak ada `preventDefault()`/`stopPropagation()` yang dipanggil secara tidak sengaja untuk elemen di luar canvas AR.**
5. Laporkan dulu ke user penyebab pasti & rencana perbaikan sebelum eksekusi, seperti pola Tahap 1 & 2 sebelumnya.

## 4. Aturan Wajib

- Jangan sampai perbaikan ini merusak lagi rotate 360° (Tahap 1) atau pinch-zoom (Tahap 2) yang sudah/sedang stabil — cek ketiganya sekaligus setelah perbaikan.
- Commit terpisah khusus untuk fix ini.
- Sebelum push ke `main`, pastikan tidak ada error console.
- Setelah deploy, tunggu verifikasi fisik user: tombol Mode AR bisa diklik normal, DAN rotate/pinch masih berfungsi seperti sebelumnya.
- Dilarang lapor "berhasil" tanpa bukti pengujian fisik nyata untuk ketiga hal ini sekaligus (klik tombol, rotate, zoom).
