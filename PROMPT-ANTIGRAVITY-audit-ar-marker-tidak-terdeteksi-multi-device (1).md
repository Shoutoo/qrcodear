# 🔍 Prompt Audit: Marker AR Tidak Terdeteksi Sama Sekali (Wajib Kompatibel Lintas Device)

## 1. Konteks & Riwayat

Sebelumnya sudah dibuat laporan perbaikan (commit `bbd98e5`) yang mengklaim 5 root cause sudah ditemukan dan diperbaiki:
1. Konflik dual Three.js (bundel MindAR lama vs `three.min.js` eksternal)
2. Video kamera tertutup karena MindAR memaksa `z-index: -2`
3. Tag `<script type="importmap">` diletakkan setelah `<script type="module">`
4. Bentrok WebGL context & `getUserMedia` antara `<model-viewer>` dan `<a-scene>` berjalan bersamaan
5. Placeholder hotspot `slot-0` s.d. `slot-5` terhapus tidak sengaja

Solusi yang diklaim sudah diterapkan: lazy injection `<a-scene>` (baru di-inject saat tombol Mode AR diklik), eksplisit `getUserMedia` handshake, restore hotspot template, dan sistem multi-anchor `all-presets.mind` (4 anchor: darat/hutan/laut/sawah).

**Hasil verifikasi fisik user di HP:**
- ✅ Label 3D View sudah muncul kembali
- ✅ Kamera sudah normal, tidak layar hitam lagi
- ❌ **Masalah inti BELUM teratasi**: user sudah melakukan trial-and-error sendiri — awalnya coba arahkan kamera ke seluruh kartu, lalu dikerucutkan khusus ke area **QR Code saja** (karena QR Code itu yang seharusnya jadi trigger model 3D muncul). Hasilnya tetap **nihil total** — bukan cincin/indikator merah "kartu salah", tapi benar-benar tidak ada reaksi visual apa pun saat kamera didekatkan ke QR Code.

**⚠️ TEMUAN PENTING — perlu dikonfirmasi ke kode sebelum audit lanjut:**

Dari screenshot pengujian user, UI aplikasi yang berjalan LIVE saat ini **tidak menunjukkan mekanisme MindAR image-anchor** (cincin hijau/merah) seperti yang diklaim di laporan sebelumnya. Yang terlihat justru:
- Kotak panduan kuning putus-putus yang mengarah spesifik ke **area QR Code saja** (bukan ke seluruh ilustrasi kartu)
- Teks status statis "AR Siap — arahkan kamera ke QR Code kartu"
- Domain yang diakses: `codear.onrender.com` di screenshot pengujian (address bar sempat terpotong) — **domain production yang benar sudah dikonfirmasi user: `https://qrcodear.onrender.com/`**, ini deployment yang sama, bukan deployment terpisah

**Ini mengindikasikan mekanisme sebenarnya adalah QR-CODE DECODE** (kemungkinan pakai library seperti jsQR atau ZXing yang membaca konten QR code, lalu memicu load model 3D berdasarkan hasil decode) — **BUKAN** full-image anchor tracking MindAR (`all-presets.mind`) seperti yang dijelaskan di 5 root cause & solusi sebelumnya.

**Langkah pertama sebelum audit lanjut**: Antigravity WAJIB mengonfirmasi ke kode sumber, bukan berasumsi — apakah sistem AR untuk kartu preset ekosistem ini benar-benar pakai MindAR image-target, QR-code decode murni, atau kombinasi keduanya (misal QR-code dipakai sebagai lapisan validasi "kartu benar" sebelum MindAR anchor jalan). Kesalahan asumsi ini bisa membuat seluruh audit MindAR sebelumnya salah sasaran.

**Catatan tambahan soal metode tes**: sejauh ini user BELUM punya kartu hasil cetak fisik — semua pengujian dilakukan dengan kamera HP diarahkan ke gambar kartu di layar laptop. Scan QR dari layar-ke-kamera secara teknis rawan gagal karena efek moiré (interferensi pixel layar vs sensor kamera), jadi ada kemungkinan kecil hasil nihil ini sebagian dipengaruhi metode tes, bukan murni bug kode — tapi kemungkinan besar bug kode tetap harus dicek dulu (lihat checklist di bawah), terutama karena user sudah coba spesifik ke area QR dan tetap nihil.

## 2. Requirement Baru yang Wajib Dipenuhi

Solusi akhir **harus bisa diakses dan berfungsi di SEMUA jenis device** siswa/guru yang mungkin dipakai di kelas — bukan cuma 1 HP tertentu. Ini mencakup minimal:
- Berbagai merek & seri Android (low-end sampai flagship), berbagai versi Chrome/WebView
- iOS (Safari) — MindAR dan getUserMedia punya banyak perbedaan perilaku antara Chrome Android dan Safari iOS, ini wajib dicek terpisah, jangan asumsikan sama
- Berbagai ukuran layar & resolusi kamera

Jangan menganggap "sudah jalan di 1 device" sebagai bukti selesai. Kalau ada keterbatasan device tertentu yang tidak bisa didukung (misal HP sangat lawas), itu harus dilaporkan eksplisit ke user, bukan disembunyikan.

## 3. Checklist Diagnosa Wajib (harus dijalankan berurutan, dengan bukti nyata — bukan asumsi)

0. **Konfirmasi dulu mekanisme aslinya**: buka kode sumber halaman AR viewer preset ekosistem, temukan library/fungsi apa yang benar-benar dipakai untuk mendeteksi kartu (QR-code decoder seperti jsQR/ZXing? MindAR image-target? kombinasi?). Laporkan nama library, versi, dan alur logikanya secara eksplisit sebelum lanjut ke langkah berikutnya — JANGAN berasumsi dari laporan sebelumnya.
1. **Cek console browser** via remote debug (`chrome://inspect` untuk Android, Web Inspector untuk iOS Safari) saat halaman AR dibuka dan saat kamera diarahkan ke QR Code. Screenshot/salin semua error yang muncul, termasuk log apa pun dari proses decode (kalau ada console.log di kode untuk tiap frame yang dicoba di-decode).
2. **Cek apakah loop decode benar-benar berjalan**: pastikan fungsi yang membaca frame video dari kamera (biasanya lewat `<canvas>` + `getImageData`, lalu dilempar ke jsQR/ZXing) benar-benar dipanggil berulang (misal via `requestAnimationFrame`). Kalau loop ini berhenti/tidak pernah start, status UI bisa saja tetap menampilkan teks statis "AR Siap" padahal tidak ada proses decode aktif di baliknya — ini kandidat kuat kenapa reaksi selalu nihil.
3. **Cek tab Network**: pastikan tidak ada request penting yang gagal (library decoder QR, aset model 3D, endpoint API validasi kartu) — screenshot semua request yang statusnya bukan 200.
4. **Isolasi masalah kualitas visual vs kode**: user BELUM punya kartu cetak fisik, baru tes lewat layar laptop. Sebagai kontrol cepat dan gratis: coba scan QR yang sama pakai APLIKASI KAMERA BAWAAN HP (bukan lewat browser AR). Kalau kamera bawaan HP BERHASIL baca QR itu dari layar, berarti QR-nya secara fisik terbaca — jadi masalah murni ada di decoder aplikasi AR (bug kode). Kalau kamera bawaan JUGA gagal, sarankan user tes ulang dengan kartu cetak fisik sebelum lanjut audit kode lebih dalam.
5. **Cek ukuran & resolusi QR di kode**: pastikan region-of-interest (kotak kuning panduan) yang dipakai untuk crop area decode benar-benar align dengan posisi QR di frame kamera, dan resolusi crop-nya cukup tinggi untuk didecode (QR yang di-downscale terlalu kecil bisa gagal didecode walau terlihat jelas oleh mata).
6. **Uji lintas device**: ulangi tes di minimal 1 device Android lain (merek/versi beda) dan 1 device iOS (Safari), catat hasilnya masing-masing secara terpisah. Domain production yang benar untuk audit: `https://qrcodear.onrender.com/`.

## 4. Aturan Wajib

- **Dilarang melaporkan "sudah berhasil" tanpa bukti nyata** dari pengujian fisik di device sungguhan (screenshot/video hasil scan, bukan cuma "kode sudah di-commit & di-deploy").
- Kalau ditemukan root cause, jelaskan secara eksplisit APA buktinya (log console, hasil network tab, dll) — bukan dugaan.
- Kalau solusi hanya bisa menjangkau sebagian device, laporkan device mana yang masih bermasalah dan kenapa.
- Setelah perbaikan diterapkan, wajib dites ulang di URL Render production (bukan localhost) sebelum dilaporkan selesai.

## 5. Deliverable yang Diharapkan

- Laporan hasil dari 6 langkah checklist di atas, masing-masing dengan bukti konkret
- Root cause final yang terkonfirmasi (bukan multi-kemungkinan lagi)
- Perbaikan kode yang diterapkan + commit hash
- Hasil pengujian ulang di minimal 2 jenis device/browser berbeda, dengan bukti (screenshot/video)
