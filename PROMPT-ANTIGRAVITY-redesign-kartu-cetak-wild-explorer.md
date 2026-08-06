# PROMPT ANTIGRAVITY — Redesign Visual Kartu Cetak QR (ikuti gaya "Wild Explorer" dari Stitch AI)

> Lampirkan prompt ini ke Antigravity BERSAMA 2 file zip:
> - `stitch_barcode_card_generator.zip` dan
> - `stitch_barcode_card_generator (2).zip`
> (satu isinya asset gambar background kartu, satu isinya kode
> design — biarkan Antigravity yang identifikasi sendiri isi
> masing-masing, jangan diasumsikan urutannya).

---

## Konteks

Kartu cetak QR project ini (contoh tampilan sekarang: kartu "Magic AR
Edu" — header ungu, judul "SCAN QR CODE INI DENGAN KAMERA HP", kotak
QR polos, teks instruksi, footer judul+tanggal) mau di-**redesign
total secara visual** supaya gayanya sama seperti hasil generate dari
Stitch AI yang sudah saya buat: kartu "Wild Explorer" — background
ilustrasi jungle penuh warna (gunung, matahari terbenam, hewan-hewan:
burung, monyet, jerapah, kuda, kura-kura, babi, hippo), judul besar
"SCAN HERE" dengan gradient kuning-oranye, kotak QR dengan frame putus-
putus (dashed corner) di pojok kanan bawah kartu.

**Tujuan tugas ini HANYA mengganti tampilan visual kartu cetaknya.**
Fungsi generate QR, data yang ditampilkan (judul experience, tanggal,
link AR), dan logic AR/publish sama sekali TIDAK BOLEH diubah.

## ATURAN WAJIB

1. **Scope HANYA visual/template kartu cetak.** Jangan sentuh logic
   generate QR code, endpoint publish, data model, atau file AR
   viewer manapun (`ar-viewer.html`, `studio/viewer.html`, route
   `/api/*`). Kalau ternyata kartu cetak dan logic AR ada di file yang
   sama/bercampur, PISAHKAN dulu (extract markup kartu ke bagian/
   komponen sendiri) daripada mengedit campur aduk.
2. **Cari dulu, jangan tebak lokasi file.** Sebelum mengubah apapun,
   temukan file yang men-generate kartu cetak QR saat ini di project
   (kemungkinan `server/views/print-card.html` atau bagian dari modal
   publish — cek keduanya). Laporkan ke saya file mana yang ditemukan
   sebelum lanjut edit, supaya saya bisa konfirmasi itu benar file yang
   dimaksud.
3. **Ekstrak dulu isi kedua zip Stitch**, identifikasi:
   - File mana yang berisi **asset gambar background** (ilustrasi
     jungle/hewan) — ini nanti dipakai sebagai aset visual.
   - File mana yang berisi **kode design** (HTML/CSS layout kartu) —
     ini dipakai sebagai REFERENSI struktur/layout & styling, BUKAN
     ditempel mentah-mentah menimpa kartu yang sudah ada (karena kode
     dari Stitch generator kemungkinan hardcode teks/data yang di
     project ini harus tetap dinamis — lihat poin 4).
4. **Semua data yang sebelumnya dinamis HARUS tetap dinamis** setelah
   redesign — jangan sampai jadi hardcode gara-gara nyontek kode
   Stitch apa adanya. Elemen yang wajib tetap dinamis (ambil dari data
   experience yang di-publish, bukan teks statis):
   - Nilai/isi QR code (link AR experience)
   - Judul experience (contoh sekarang: "Rantai Makanan AR")
   - Tanggal publish
   - (kalau ada di versi lama) badge tipe kartu, misal "Kartu AR
     Markerless"

## Scope Kerja

1. **Adaptasi background & layout** — ganti background kartu polos
   (ungu solid) jadi ilustrasi jungle full-bleed dari asset Stitch,
   dengan area teks/QR tetap kebaca jelas di atas background ramai
   (kalau perlu overlay gradient/semi-transparent box di belakang teks
   supaya kontras cukup, sesuaikan seperti pola yang dipakai gambar
   referensi "Wild Explorer").
2. **Judul utama** — ganti jadi gaya besar/bold dengan warna kuning-
   oranye gradient, mirip "SCAN HERE" di referensi, tapi teksnya tetap
   ambil dari string instruksi yang sudah ada di project (boleh
   disesuaikan kalimatnya kalau saya minta nanti, tapi untuk sekarang
   fokus ke STYLING-nya dulu, bukan ganti kalimat).
3. **Kotak QR code** — ganti frame QR jadi gaya dashed-corner (garis
   putus-putus di 4 sudut) seperti referensi, QR code-nya sendiri
   (data/generate logic) tidak berubah, cuma bingkai visualnya.
4. **Footer/info tambahan** — pertahankan info judul experience +
   tanggal publish yang sudah ada, styling-nya disesuaikan supaya
   nyambung sama tema jungle/eksplorer tapi tetap gampang dibaca saat
   dicetak (perhatikan kontras warna untuk hasil print, bukan cuma
   bagus di layar).
5. **Responsif untuk cetak**: pastikan hasil akhir tetap proporsional
   kalau di-print (bukan cuma bagus di preview browser) — cek ukuran/
   resolusi background image cukup tinggi supaya tidak pecah saat
   dicetak.

## Yang TIDAK Boleh Berubah

- ❌ Logic generate QR code / value yang di-encode.
- ❌ Endpoint publish, struktur data experience.
- ❌ File AR viewer (`ar-viewer.html`, `studio/viewer.html`) atau
  logic AR apapun.
- ❌ Data yang sebelumnya dinamis (judul, tanggal, link) jadi hardcode
  ikut teks contoh dari Stitch.

## Bukti yang Harus Dilaporkan

1. Konfirmasi file kartu cetak yang ditemukan & diedit (poin Aturan
   Wajib #2).
2. Screenshot hasil kartu baru dengan minimal 2 data experience
   BERBEDA (judul & tanggal beda) untuk membuktikan bagian dinamisnya
   masih berfungsi, bukan ke-hardcode dari template Stitch.
3. Konfirmasi eksplisit: file AR viewer dan logic QR/publish tidak
   tersentuh.

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek/konfirmasi
sebelum dianggap final.
