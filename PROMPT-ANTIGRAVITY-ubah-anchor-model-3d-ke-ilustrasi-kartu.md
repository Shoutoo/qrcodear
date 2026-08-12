# 🔄 Permintaan Perubahan: Anchor Model 3D Dipindah dari Area QR ke Ilustrasi Kartu

## 1. Latar Belakang

Saat ini titik pemicu tampilnya model 3D AR diarahkan ke **area QR Code** yang sama dengan area yang dipakai untuk decode (baca kode QR). Dugaan user: ada kemungkinan dua proses ini (decode QR + render/tracking model 3D) **bertabrakan** kalau dijalankan di area & waktu yang sama — sama-sama memperebutkan frame kamera yang sama untuk dua tujuan berbeda (satu untuk decode kode, satu untuk tracking visual penempatan model).

## 2. Perubahan yang Diminta

Pindahkan titik anchor/pemicu tampilnya model 3D dari **area QR Code** ke **ilustrasi spesifik di kartu** — bukan lagi bagian kode QR-nya, melainkan bagian gambar/karakter yang ada di desain kartu itu sendiri.

Contoh referensi yang dilampirkan user: untuk kartu **Ekosistem Sawah**, anchor diarahkan ke ilustrasi **kepala kuda** yang ada di kartu (lihat gambar terlampir). Bukan ke QR Code-nya lagi.

**Catatan penting**: user akan melampirkan referensi ilustrasi serupa untuk kartu ekosistem lain (Darat, Hutan, Laut) secara menyusul — masing-masing kartu kemungkinan akan punya ilustrasi anchor yang berbeda-beda sesuai desain kartunya masing-masing.

## 3. Implikasi Arsitektur yang Perlu Dikerjakan

Perubahan ini pada dasarnya memisahkan dua fungsi yang sebelumnya digabung di satu area:

- **QR Code**: tetap berfungsi seperti semula — sebagai pemicu awal untuk membuka halaman AR viewer preset yang benar (encode URL ke halaman preset ekosistem terkait). Fungsi ini TIDAK berubah.
- **Ilustrasi kartu (mis. kepala kuda)**: menjadi target BARU untuk **image-target tracking** — begitu kamera mendeteksi ilustrasi ini, barulah model 3D AR muncul & ditempatkan di posisi ilustrasi tersebut.

Ini berarti dibutuhkan mekanisme **image recognition/tracking** terhadap ilustrasi kartu (bukan QR decode), yang secara teknis berbeda dari decoder QR yang dipakai sekarang. Antigravity perlu:
1. Konfirmasi dulu apakah project sudah punya kapabilitas image-target tracking yang bisa dipakai ulang (misal sisa implementasi MindAR dari versi lama), atau perlu dibangun dari awal.
2. Kalau reuse MindAR: ingat riwayat masalah sebelumnya — MindAR sempat py bermasalah karena konflik dual Three.js dan WebGL context dengan `<model-viewer>` (lihat riwayat di dokumen audit sebelumnya: `PROMPT-ANTIGRAVITY-audit-ar-marker-tidak-terdeteksi-multi-device.md`). Pastikan solusi baru ini tidak mengulang konflik yang sama.
3. Pastikan proses decode QR (untuk buka halaman) dan proses image-tracking ilustrasi (untuk render model) berjalan di **konteks/waktu yang terpisah** — QR discan sekali di awal untuk membuka halaman, baru SETELAH itu kamera AR aktif untuk tracking ilustrasi. Jangan jalankan dua-duanya bersamaan di satu loop kamera yang sama, itu yang mau dihindari dari desain lama.
4. Siapkan sistem yang bisa menerima ilustrasi anchor BERBEDA per preset ekosistem (Darat/Hutan/Laut/Sawah) — bukan 1 ilustrasi anchor untuk semua, karena tiap kartu desainnya beda.

## 4. Pertanyaan Terbuka (perlu dijawab sebelum eksekusi)

- Apakah ilustrasi anchor per kartu akan dipakai utuh (satu ilustrasi besar keseluruhan kartu) atau di-crop ke elemen kecil spesifik seperti contoh kepala kuda ini?
- Apakah kartu Darat/Hutan/Laut juga akan dikirim referensi anchor-nya sebelum eksekusi dimulai, atau Antigravity boleh menentukan sendiri elemen ilustrasi yang representatif dari tiap kartu?

## 5. Aturan Wajib

- Jangan mulai eksekusi kode sebelum referensi ilustrasi anchor untuk SEMUA 4 preset ekosistem (Darat/Hutan/Laut/Sawah) sudah diterima dari user — kalau baru ada 1 (Sawah/kuda), tanyakan dulu ke user apakah mau eksekusi bertahap per-kartu atau tunggu semua referensi lengkap.
- Jangan melaporkan "berhasil" tanpa bukti pengujian fisik nyata di device (screenshot/video hasil scan di device sungguhan, bukan cuma commit & deploy).
- Pastikan perubahan ini tidak merusak fungsi QR-untuk-buka-halaman yang sudah berjalan sekarang.
