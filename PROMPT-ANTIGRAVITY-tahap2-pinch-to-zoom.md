# 🤏 Tahap 2: Tambah Pinch-to-Zoom (Perbesar/Perkecil Model)

## 1. Status Baseline (jangan sampai rusak lagi)

**Tahap 1 SUKSES dan sudah dikonfirmasi user secara fisik**: model 3D AR sekarang bisa digeser untuk diputar 360°, dan diam di posisi terakhir setelah jari dilepas (solusi "Opsi A": lepas atribut `animation` A-Frame saat `touchstart`, tanpa ubah struktur DOM). Ini baseline baru yang harus dijaga tetap stabil.

## 2. Yang Diminta di Tahap 2

Tambahkan gesture **pinch (2 titik sentuh)** untuk memperbesar/memperkecil skala model secara real-time.

## 3. Langkah Wajib (ikuti pola yang sudah terbukti berhasil di Tahap 1)

1. **Diagnosa dulu, jangan langsung nulis kode baru.** Cek apakah sudah ada sisa/kerangka kode untuk gesture pinch di `viewer.html` (kemungkinan ada dari percobaan sebelumnya, mengingat teks UI sempat menyebut "Cubit untuk Memutar & Mem..."). Kalau ada, cek kenapa belum berfungsi. Kalau belum ada sama sekali, laporkan itu juga ke user sebelum mulai nulis kode.
2. **Cari pendekatan paling minimal** yang konsisten dengan solusi Tahap 1 (JS murni, tanpa restrukturisasi DOM/entity A-Frame). Pinch-to-zoom biasanya dihitung dari jarak antara 2 titik sentuh (`touches[0]` dan `touches[1]`) di event `touchmove`, lalu diterapkan ke `scale` model via `setAttribute('scale', ...)` — pola implementasinya mirip dengan cara Tahap 1 menangani rotasi, jadi kemungkinan bisa reuse struktur listener yang sama.
3. **Tetapkan batas skala minimum & maksimum yang wajar** supaya model tidak bisa di-zoom sampai hilang (skala mendekati 0) atau membesar berlebihan sampai menutupi seluruh layar.
4. **Laporkan rencana teknis ke user dulu** (baris kode yang akan diubah, pendekatannya seperti apa) sebelum eksekusi — sama seperti yang dilakukan di Tahap 1 kemarin, itu yang bikin prosesnya aman.

## 4. Aturan Wajib (tetap berlaku, sudah terbukti berhasil)

- Satu commit untuk Tahap 2 ini saja — jangan digabung dengan Tahap 3 (skala default).
- Sebelum push ke `main`, pastikan tidak ada error console.
- Setelah deploy, **STOP dan tunggu verifikasi fisik user di HP** sebelum lanjut ke Tahap 3.
- Dilarang lapor "berhasil" tanpa bukti pengujian fisik nyata dari user.
- Kalau ada tanda regresi (rotate 360° dari Tahap 1 jadi rusak lagi, atau model hilang), STOP segera dan laporkan.
