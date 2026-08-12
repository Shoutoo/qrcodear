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
- ❌ **Masalah inti BELUM teratasi**: saat kamera diarahkan ke kartu/barcode marker, **tidak ada reaksi visual sama sekali** — bukan cincin merah "kartu salah", tapi benar-benar nihil (tidak ada cincin hijau/merah, tidak ada popup, tidak ada apa pun). Model 3D AR tidak pernah muncul.

Karena reaksi yang muncul adalah **nihil total** (bukan cincin merah), root cause kemungkinan besar **bukan lagi** soal konflik library/WebGL seperti 5 poin di atas (yang sudah terbukti sebagian teratasi), melainkan murni di **pipeline image tracking MindAR itu sendiri** — kemungkinan MindAR gagal start, file target `.mind` gagal dimuat, atau target image tidak pernah match dengan kartu fisik.

## 2. Requirement Baru yang Wajib Dipenuhi

Solusi akhir **harus bisa diakses dan berfungsi di SEMUA jenis device** siswa/guru yang mungkin dipakai di kelas — bukan cuma 1 HP tertentu. Ini mencakup minimal:
- Berbagai merek & seri Android (low-end sampai flagship), berbagai versi Chrome/WebView
- iOS (Safari) — MindAR dan getUserMedia punya banyak perbedaan perilaku antara Chrome Android dan Safari iOS, ini wajib dicek terpisah, jangan asumsikan sama
- Berbagai ukuran layar & resolusi kamera

Jangan menganggap "sudah jalan di 1 device" sebagai bukti selesai. Kalau ada keterbatasan device tertentu yang tidak bisa didukung (misal HP sangat lawas), itu harus dilaporkan eksplisit ke user, bukan disembunyikan.

## 3. Checklist Diagnosa Wajib (harus dijalankan berurutan, dengan bukti nyata — bukan asumsi)

1. **Cek console browser** via remote debug (`chrome://inspect` untuk Android, Web Inspector untuk iOS Safari) saat halaman AR dibuka dan saat proses scan berlangsung. Screenshot/salin semua error yang muncul.
2. **Cek tab Network**: pastikan request ke `all-presets.mind` berstatus 200 dan ukuran file wajar (bukan 404, bukan 0 KB/corrupt).
3. **Isolasi masalah cetak vs kode**: uji arahkan kamera ke gambar SUMBER ASLI (yang dipakai generate `.mind`) di layar monitor/HP lain, bukan ke kartu hasil cetak. Bandingkan hasilnya — kalau berhasil di layar tapi gagal di kartu cetak, ini masalah kualitas cetak (resolusi/warna/glare), bukan bug kode.
4. **Cek kondisi fisik saat scan**: pencahayaan cukup terang & merata, jarak kamera wajar (20–30cm), kartu tidak glossy/memantul, dan kartu mengisi porsi memadai dari frame kamera.
5. **Audit urutan index anchor**: pastikan urutan gambar saat `.mind` di-compile (index 0,1,2,3) benar-benar sinkron dengan `targetIndex` yang dipakai di kode JS untuk mapping ke preset ekosistem (darat/hutan/laut/sawah). Mismatch di sini bisa membuat semua deteksi gagal walau library berjalan normal.
6. **Uji lintas device**: ulangi tes di minimal 1 device Android lain (merek/versi beda) dan 1 device iOS (Safari), catat hasilnya masing-masing secara terpisah.

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
