# Prompt Antigravity: Perbaikan Mata Semua Spesies + Fix Overflow Model "Pohon"

> Tempel ke Antigravity. Project: AR Edu QR (qrcodear). Dua perbaikan
> terpisah dan tidak saling berhubungan — kerjakan sebagai 2 task
> independen, laporkan masing-masing terpisah.

---

## TASK A — Perbaiki Posisi/Bentuk Mata untuk SEMUA Spesies yang Punya Wajah

### Konteks
Untuk Ular, logika perhitungan posisi mata sudah dibahas & diperbaiki
di prompt sebelumnya (`PROMPT-ANTIGRAVITY-fix-kepala-ular-logika.md`,
bagian 1.2). User sekarang melihat spesies LAIN yang juga punya mata
(Belalang, Katak, Ikan Kecil, Ikan Besar, Elang, Burung, Hiu, Ulat,
Udang, dst — semua yang secara alami punya wajah/mata) juga terlihat
"agak aneh" di bagian matanya, kemungkinan besar karena masalah yang
sama: posisi/ukuran mata ditebak manual per spesies tanpa logika
konsisten.

### Yang Harus Dilakukan
1. **Audit semua spesies yang punya elemen mata** — screenshot close-up
   kepala/wajah tiap spesies tersebut dari sudut 3/4 depan.
2. **Terapkan logika yang sama seperti Ular** ke semua spesies ini:
   - Mata sebagai 2 child object dari grup kepala (bukan grup badan
     utama), posisi lokal simetris: `offsetX` sama besar, tanda
     berlawanan (`-offsetX` untuk kiri, `+offsetX` untuk kanan).
   - Untuk spesies dengan kepala di ujung tubuh memanjang (Ulat, Udang,
     Belalang): orientasi kepala mengikuti arah tangent/arah hadap
     tubuh di titik itu (`lookAt` berbasis vector, BUKAN rotasi
     hardcoded) — sama seperti pendekatan Ular.
   - Untuk spesies dengan kepala yang lebih independen dari kurva
     tubuh (Katak, Elang, Burung, Ikan, Hiu — badan bukan hasil tube
     curve panjang): pastikan tetap mata diposisikan simetris relatif
     terhadap sumbu tengah kepala (bidang simetri kiri-kanan kepala),
     dan ukurannya proporsional cukup besar (gaya "cute" = mata besar,
     bukan titik kecil nyaris tak terlihat).
   - Tiap mata: pupil hitam besar mengisi sebagian besar bola mata + 1
     titik highlight putih kecil offset dari pusat (gaya glossy,
     konsisten dengan style guide sebelumnya).
   - **Wajib test**: render 3/4 depan, pastikan KEDUA mata terlihat
     jelas dan simetris, tidak ada yang miring/tenggelam ke dalam
     geometri kepala.
3. **Laporkan per kelompok** (misal 4-5 spesies per laporan) dengan
   screenshot before/after, supaya user bisa review bertahap — jangan
   sekaligus semua tanpa checkpoint.
4. **Isolasi scope**: HANYA perbaiki posisi/ukuran/material mata.
   Jangan ubah bentuk badan/proporsi lain yang sudah dikonfirmasi OK
   sebelumnya (termasuk Ular — badan & lilitannya jangan disentuh,
   fokus prompt sebelumnya soal kepala Ular dianggap task terpisah).

---

## TASK B — Fix Bug: Label "Pohon" Tertutup karena Model Overflow di Galeri (Ekosistem Hutan)

### Gejala
Saat user cek galeri Model Library untuk ekosistem **Hutan**, asset
**Pohon** ukurannya overflow keluar dari area kartu/thumbnail-nya,
sampai menutupi/menimpa teks label "Pohon" di bawah/di kartu tersebut
— jadi labelnya tidak terbaca.

### Dugaan Root Cause (perlu diverifikasi, jangan asal fix)
1. Kemungkinan model Pohon (terutama setelah FASE F2.1/F2.2 dibuat
   kanopi BESAR sesuai instruksi "kanopi harus jelas lebih besar dari
   batang") tidak melalui proses **normalisasi ukuran/bounding box**
   yang sama seperti model lain sebelum ditampilkan di kartu galeri —
   sehingga skalanya jadi jauh lebih besar dari model lain di card
   yang sama ukurannya.
2. ATAU proses render thumbnail/preview di galeri memang men-scale
   semua model ke bounding box seragam, TAPI kalkulasi bounding box
   untuk Pohon spesifik salah/tidak ter-update setelah geometrinya
   diubah di FASE sebelumnya (cache thumbnail lama, atau bounding box
   dihitung sebelum kanopi diperbesar).
3. ATAU container/layout kartu galeri punya `overflow: visible`
   (bukan `hidden`) untuk elemen 3D-nya, jadi kalau model lebih besar
   dari container, dia "bocor" keluar menimpa elemen teks di
   bawahnya/di atasnya secara visual (CSS/layout issue, bukan masalah
   scale 3D itu sendiri).

### Yang Harus Dilakukan
1. **Diagnosa dulu**: cek apakah SEMUA model di galeri (termasuk Pohon)
   melalui proses normalisasi skala yang sama (misal auto-fit ke
   bounding box target seragam sebelum ditampilkan di kartu). Cek juga
   CSS/struktur container kartu galeri — apakah ada `overflow: hidden`
   pada area render 3D supaya model besar tidak "bocor" keluar kartu.
   Laporkan temuan spesifiknya (bukan langsung asal fix).
2. **Perbaiki sesuai root cause**:
   - Kalau masalahnya normalisasi skala: pastikan proses render
     thumbnail/preview galeri menghitung ulang bounding box tiap model
     SETELAH geometri final (bukan pakai ukuran lama/cache), lalu
     scale semua model secara proporsional supaya muat rapi dalam
     ukuran kartu yang seragam.
   - Kalau masalahnya CSS overflow: tambahkan `overflow: hidden` (atau
     setara) pada container render 3D di kartu galeri, dan/atau
     pastikan area render (canvas/viewport) tidak menimpa area teks
     label secara z-index/layout.
3. **Cek juga apakah bug serupa berpotensi terjadi di spesies lain**
   yang modelnya berukuran besar/tidak biasa (misal spesies lain yang
   juga baru diperbesar proporsinya di FASE gaya toy) — laporkan kalau
   ada yang berisiko sama, jangan cuma fix Pohon lalu berhenti kalau
   ternyata pola bug-nya sistemik.
4. Bukti: screenshot galeri ekosistem Hutan SEBELUM dan SESUDAH fix,
   pastikan label "Pohon" (dan semua label lain di ekosistem itu)
   terbaca jelas tanpa tertutup model.

---

## Aturan Kerja Umum untuk Kedua Task

1. Kerjakan TASK A dan TASK B sebagai 2 alur terpisah, laporkan
   masing-masing dengan bukti screenshot sendiri-sendiri.
2. Kalau nemu masalah lain yang tidak terduga saat mengerjakan salah
   satu task, laporkan dulu ke saya sebelum eksekusi perbaikan
   tambahan yang di luar scope prompt ini.
3. FASE F3/F4 (verifikasi canvas preset, dari prompt jauh sebelumnya)
   tetap ditunda sampai kedua task ini selesai.
