# Prompt untuk Antigravity: Standar Gaya Visual Baru — "Cute 3D Toy Style" untuk SEMUA 24 Model (FASE F2.2)

> Tempel isi file ini ke Antigravity. Project: AR Edu QR (qrcodear).
> Ini MENGGANTIKAN arahan detail sebelumnya (FASE F2.1-R) dengan arah
> gaya visual yang lebih spesifik. Lampirkan juga
> `PROMPT-ANTIGRAVITY-fix-model-per-slot-render.md` (versi revisi) di
> sesi yang sama supaya konteks penuh.

---

## 0. Referensi Gaya Visual (WAJIB dipahami sebelum mulai)

User mengirim gambar referensi: **model ular gaya "3D toy/kartun
mengkilap"** — mirip gaya ikon 3D populer (inflatable-toy style / cute
3D emoji style). Ciri-ciri gaya ini yang WAJIB ditiru:

1. **Bentuk tubuh SERBA MEMBULAT dan GEMPAL** — tabung tubuh tebal
   dengan penampang bulat sempurna (bukan pipih/kotak), ujung-ujung
   selalu membulat (rounded cap), tidak ada sudut tajam sama sekali di
   seluruh model.
2. **Proporsi "gemuk/imut" (chubby), bukan anatomis realistis kurus** —
   tubuh ular pada referensi jauh lebih TEBAL dibanding ular asli,
   kesannya seperti mainan tiup (pool float/balon), bukan reptil ramping.
3. **Skema warna 2-nada yang kontras dan CERAH/SATURATED**: warna
   utama (hijau terang) untuk sisi luar/punggung, warna aksen berbeda
   (kuning) untuk sisi dalam/leher/perut — ini bikin bentuk lebih
   mudah terbaca sekaligus lebih menarik secara visual.
4. **Wajah sederhana tapi jelas & lucu**: mata bulat hitam kecil
   (dengan titik highlight putih kecil di dalamnya untuk kesan
   mengkilap), mulut terbuka sedikit menunjukkan warna dalam mulut,
   ada elemen kecil khas spesies (untuk ular: lidah bercabang merah
   menjulur).
5. **Material terkesan MENGKILAP/GLOSSY** — permukaan terlihat halus
   dan memantulkan cahaya seperti plastik/karet mengkilap, bukan
   matte/kasar.
6. **Pose tubuh tetap boleh melingkar/coiled** (referensi ular JUSTRU
   melingkar beberapa lilitan) — TERNYATA melingkar itu OK asal:
   bentuknya tetap terbaca jelas sebagai ular karena kepala & leher
   dengan warna kontras kuning berbeda jelas dari badan hijau,
   lilitannya rapi bertumpuk teratur (bukan berantakan/menggerombol
   acak), dan setiap lilitan tetap terlihat sebagai tabung tunggal yang
   jelas terpisah dari lilitan lain (ada celah/bayangan antar lilitan,
   bukan menyatu jadi gumpalan).

**Catatan jujur soal keterbatasan**: Three.js dengan geometri
prosedural + `MeshStandardMaterial`/`MeshPhysicalMaterial` BISA
mendekati gaya ini (bentuk membulat, warna 2-nada cerah, material
glossy pakai `roughness` rendah + `metalness` rendah atau tambahan
`clearcoat`), TAPI tidak akan bisa 100% identik dengan render
referensi (yang kemungkinan dibuat di software 3D profesional dengan
lighting/render studio). Target realistis: **bentuk, proporsi, skema
warna, dan kesan "mengkilap ceria"** semirip mungkin — bukan replika
piksel-demi-piksel.

---

## 1. ATURAN KERJA — WAJIB DIIKUTI (berlaku untuk SEMUA 24 spesies)

1. **Standar gaya ini BERLAKU UNIVERSAL** untuk semua 24 spesies, tidak
   cuma Ular. Tiap spesies harus punya versi "gempal/chubby/toy-style"-
   nya sendiri sesuai bentuk aslinya (badan buah/tumbuhan tetap
   membulat-gempal, burung jadi burung gempal dengan sayap tebal
   membulat, ikan jadi ikan gempal dengan sirip tebal, dst) — BUKAN
   proporsi kurus/tipis/tajam seperti sebelumnya.
2. **Material WAJIB pakai parameter glossy**: `roughness` rendah
   (sekitar 0.15–0.35), sedikit `metalness` (0–0.1, jangan sampai
   terlihat seperti logam) ATAU gunakan `MeshPhysicalMaterial` dengan
   `clearcoat` tinggi (0.7–1.0) + `clearcoatRoughness` rendah untuk
   kesan lapisan mengkilap di atas warna dasar. Pastikan ada
   pencahayaan (`environment map` sederhana atau minimal beberapa
   `PointLight`/`DirectionalLight`) supaya highlight mengkilap
   benar-benar terlihat, bukan cuma warna flat tanpa pantulan cahaya.
3. **Skema warna 2-nada per spesies** (warna utama + warna aksen
   kontras untuk bagian dalam/perut/detail) — jangan monokrom polos
   satu warna untuk seluruh tubuh.
4. **Semua geometri dihaluskan** — tambah jumlah segmen radial/tinggi
   pada `TubeGeometry`/`CylinderGeometry`/`SphereGeometry` (minimal
   16-24 segmen radial) supaya permukaan terlihat mulus membulat,
   bukan berfaset kotak-kotak kasar.
5. **Tambahkan wajah sederhana untuk semua spesies yang punya "muka"**
   secara natural (hewan) — 2 mata bulat hitam kecil dengan highlight
   putih. Untuk yang tidak relevan (tumbuhan, mikroba) boleh dilewati
   bagian wajah, tapi tetap ikuti aturan bentuk gempal + warna 2-nada +
   material glossy.
6. **Proses per spesies**: bangun → render 2 sudut dengan pencahayaan
   yang cukup untuk menunjukkan efek glossy-nya (jangan render flat
   tanpa shading) → bandingkan sendiri dengan semangat gaya referensi
   sebelum lapor.
7. **Laporkan bertahap per kelompok** (5-6 spesies), tunggu review
   sebelum lanjut kelompok berikutnya — supaya kalau arah gayanya
   masih meleset, ketahuan lebih awal.
8. **Isolasi scope** — tetap hanya geometri, material, dan pencahayaan
   di scene builder model. Jangan ubah sistem publish/bake/viewer di
   luar keperluan.

---

## 2. Titik Awal Konkret: Ular (acuan gaya, kerjakan dan konfirmasi dulu)

Bangun ulang model Ular mengikuti referensi persis sedekat mungkin:
- Badan tabung tebal gempal (`TubeGeometry` radius besar relatif
  terhadap panjang total, bukan tabung kurus), warna hijau cerah
  saturated.
- Bagian dalam leher/perut dari leher sampai kepala: warna kuning
  cerah kontras (bisa dibuat sebagai geometri tabung tipis terpisah
  yang mengikuti sisi dalam lengkungan leher, atau pakai 2 material
  berbeda di 1 mesh via material index/UV mapping — pilih pendekatan
  mana yang lebih mudah diimplementasi, jelaskan pilihannya).
- Kepala: bentuk oval membulat gempal, tidak meruncing tajam, dengan
  2 mata bulat hitam + highlight putih kecil, mulut sedikit terbuka,
  lidah bercabang merah menjulur keluar pendek.
- Badan melingkar beberapa lilitan TERSUSUN RAPI bertumpuk (bukan
  menggerombol acak) — boleh pertahankan konsep melingkar seperti
  sekarang, TAPI perbaiki: tambah radius tabung (lebih gempal), pastikan
  tiap lilitan punya jarak/celah terlihat dari lilitan lain (bisa
  offset posisi Y tiap lilitan sedikit + beri sedikit gap), dan
  material glossy dengan pencahayaan yang jelas.
- Material glossy sesuai parameter di poin 2 bagian 1.

Screenshot hasil dari 2 sudut, **berhenti dan tunggu konfirmasi saya**
sebelum diterapkan ke 23 spesies lain — Ular versi ini jadi acuan gaya
resmi untuk semuanya.

---

## 3. Daftar Fase Eksekusi

- **FASE F2.2a** — Bangun ulang Ular sesuai bagian 2, screenshot,
  tunggu konfirmasi user bahwa gaya sudah sesuai referensi.
- **FASE F2.2b** — Setelah Ular dikonfirmasi, terapkan gaya yang sama
  (proporsi gempal + warna 2-nada + material glossy + wajah sederhana
  untuk hewan) ke 23 spesies lain, dikelompokkan 5-6 spesies per
  laporan, tunggu review tiap kelompok.
- **FASE F2.2c** — Setelah semua 24 dikonfirmasi, generate ulang
  thumbnail galeri (kalau ada proses terpisah), lalu push ke GitHub
  dengan commit message jelas ("FASE F2.2: apply cute glossy toy-style
  to all 24 procedural models").

---

## 4. Pengingat Penutup

- FASE F3/F4 (verifikasi canvas preset) tetap ditunda sampai FASE
  F2.2 ini selesai dan dikonfirmasi.
- Prinsip: ikuti referensi visual yang dikirim user semirip mungkin
  dalam batas kemampuan geometri prosedural Three.js — kalau ada
  aspek referensi yang benar-benar tidak bisa direplikasi dengan
  primitif/material yang tersedia, laporkan ke user dengan penjelasan
  dan alternatif terdekat yang bisa dicapai, jangan diam-diam
  diabaikan.
- Mulai dari FASE F2.2a (Ular) saja dulu, berhenti setelah itu dan
  tunggu konfirmasi saya sebelum lanjut ke spesies lain.
