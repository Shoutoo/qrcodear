# Prompt untuk Antigravity: Perbaikan Detail Bentuk 24 Model Prosedural (FASE F2.1)

> Tempel isi file ini ke Antigravity. Project: AR Edu QR (qrcodear).
> Lanjutan dari FASE F1+F2 yang sudah selesai (commit `dd31e7c`).
> Lampirkan juga `PROMPT-ANTIGRAVITY-fix-model-per-slot-render.md`
> (versi revisi) di sesi yang sama supaya konteks penuh.

---

## 0. Temuan Masalah (screenshot terlampir dari user)

FASE F2 berhasil membuat 24 file `.glb` dengan **hash unik per spesies**
(root cause "semua file sama" sudah teratasi) — TAPI kualitas bentuk
geometrinya masih terlalu kasar untuk fitur edukasi ini.

Contoh konkret dari screenshot yang dikirim user: model dengan label
**"Ular"** yang tampil di canvas Studio **BUKAN terlihat seperti ular**
(tubuh memanjang menyatu, melengkung tanpa kaki) — melainkan terlihat
seperti **kumpulan titik-titik/bulatan-bulatan terpisah** yang
menggerombol tidak beraturan, sama sekali tidak terbaca sebagai
siluet reptil memanjang.

Ini kemungkinan besar karena implementasi geometri sebelumnya (tabel
FASE F2: "Ular = Spiral melingkar 10 segmen + kepala") membangun tubuh
dari **banyak `SphereGeometry` terpisah** yang disusun mengikuti jalur
melingkar, TANPA digabung jadi 1 bentuk tabung yang menyatu/kontinyu —
hasilnya jadi rangkaian bola-bola renggang, bukan tubuh ular yang
solid dan mengalir.

Dugaan ini kemungkinan berlaku juga untuk sebagian dari 23 spesies
lain yang dibangun dengan pendekatan serupa (susunan primitif lepas
tanpa digabung jadi silhouette yang menyatu) — SEMUA 24 model wajib
diaudit ulang secara visual, bukan cuma yang keliatan salah di
screenshot.

---

## 1. ATURAN KERJA — WAJIB DIIKUTI

1. **Standar minimum**: siapapun yang melihat model itu (tanpa
   membaca labelnya) harus bisa langsung menebak jenis hewan/tumbuhan
   apa itu secara umum dari SILUETNYA SAJA — reptil memanjang tanpa
   kaki, burung bersayap, mamalia/amfibi berkaki empat, ikan
   bertubuh torpedo, tumbuhan menjulang, dst. Ini tetap low-poly
   (BUKAN minta hyper-realistic), tapi bentuknya harus MENYATU dan
   PROPORSIONAL, bukan kumpulan primitif lepas yang menggerombol.
2. **Body harus jadi 1 bentuk kontinyu**, bukan kumpulan bola/kotak
   terpisah yang cuma "didekatkan" satu sama lain. Gunakan salah satu
   teknik berikut (pilih sesuai bentuk tubuh spesiesnya):
   - **`TubeGeometry`** mengikuti `CatmullRomCurve3` untuk tubuh
     memanjang/melengkung (ular, cacing, ulat, belut) — dengan radius
     yang bisa mengecil di ujung (taper) supaya tidak terlihat seperti
     pipa lurus seragam.
   - **`LatheGeometry`** untuk bentuk badan yang simetris terhadap
     sumbu (badan ikan/torpedo, jamur, badan burung sederhana) — bisa
     hasilkan profil organik dari 1 kurva radius terhadap ketinggian.
   - **Gabungan beberapa primitif yang saling BERPOTONGAN/MENYAMBUNG
     rapat** (bukan renggang) dan di-`BufferGeometryUtils.mergeGeometries`
     atau minimal overlap cukup dalam supaya tidak ada celah terlihat
     antar bagian — untuk badan majemuk (kaki, sayap, kepala yang
     menempel ke badan utama).
3. **Detail struktural minimum per kategori** (tambahkan yang belum
   ada, sesuaikan per spesies di bagian 2):
   - Hewan berkaki: kaki harus JELAS terlihat sebagai kaki (silinder
     tipis/kerucut pipih), menempel di posisi anatomis yang masuk akal
     (bawah badan), BUKAN nempel sembarang tempat.
   - Hewan bersayap/burung: sayap harus terbentang jelas (bidang
     pipih/segitiga lebar), bukan cuma tonjolan kecil.
   - Reptil/ular: tubuh HARUS satu tabung menyatu yang melengkung
     (pakai TubeGeometry), MENGECIL ke arah ekor, kepala sedikit lebih
     lebar dari leher, tanpa kaki sama sekali.
   - Ikan/hiu: bentuk torpedo (lebar di tengah, meruncing di kedua
     ujung — pakai LatheGeometry atau `SphereGeometry` yang di-scale
     non-uniform + sirip pipih menempel).
   - Tumbuhan: batang jelas + daun/kepala yang proporsional (jangan
     cuma kerucut tipis tunggal untuk yang seharusnya rimbun, mis.
     Pohon perlu kanopi yang cukup besar dibanding batang).
4. **Satu batch per waktu, tunjukkan bukti visual, tunggu konfirmasi**
   sebelum lanjut ke batch berikutnya — ikuti pembagian fase di bagian
   3 (jangan kerjakan 24 spesies sekaligus tanpa checkpoint).
5. **Isolasi scope** — perbaikan ini HANYA mengganti kualitas/detail
   geometri prosedural per spesies. Jangan mengubah sistem
   publish/bake/viewer, jangan mengubah struktur
   `ecosystem-model-library.json` di luar yang perlu (path file boleh
   tetap sama kalau isi filenya di-replace in-place, atau update path
   kalau file baru — laporkan pendekatan mana yang dipakai).
6. Kalau untuk spesies tertentu ternyata sulit dibuat cukup jelas
   HANYA dari primitif Three.js meski sudah dicoba maksimal (misal
   bentuk anatomis yang rumit), LAPORKAN ke saya dengan
   screenshot hasil terbaik yang dicapai — jangan diam-diam
   dibiarkan tetap kasar tanpa pemberitahuan.

---

## 2. Panduan Bentuk per Spesies (acuan konstruksi, boleh disesuaikan asal tetap menyerupai)

| Spesies | Teknik disarankan | Ciri wajib terlihat |
|---|---|---|
| Rumput | Beberapa `ConeGeometry`/plane tipis melengkung, ukuran bervariasi, warna gradasi hijau | Helai tegak menjulang, bukan gerombol titik |
| Padi | Batang (`CylinderGeometry` tipis) + malai/bulir menunduk di ujung (kumpulan oval kecil kuning condong ke bawah) | Bulir menunduk khas padi matang |
| Pohon | Batang silinder coklat + kanopi BULAT BESAR (bukan kerucut tipis) — kanopi minimal 2-3x diameter batang | Proporsi kanopi jelas lebih besar dari batang |
| Alga/Fitoplankton | Pita bergelombang (`TubeGeometry` pipih melengkung acak) + beberapa bola kecil (gelembung) | Bentuk meliuk seperti pita, bukan blok padat |
| Belalang/Ulat | Badan memanjang tersegmentasi (bisa `TubeGeometry` bersegmen atau kapsul-kapsul BERSAMBUNG rapat tanpa celah) + kaki/kaki lompat jelas untuk belalang | Segmentasi terlihat menyatu, bukan renggang |
| Udang | Tubuh melengkung (`TubeGeometry`) + capit (2 bentuk kecil di depan) + ekor kipas | Lengkungan tubuh khas udang |
| Katak | Badan gempal oval + 4 kaki (belakang lebih besar/panjang untuk kesan lompat) + mata menonjol di atas kepala | Kaki belakang jelas lebih besar dari depan |
| Ikan Kecil/Besar | `LatheGeometry` torpedo + sirip dorsal pipih + sirip ekor bercabang (bukan segitiga tunggal datar) | Bentuk torpedo menyatu, ekor bercabang |
| **Ular** | **`TubeGeometry` sepanjang `CatmullRomCurve3` melengkung-S, radius mengecil ke ekor**, kepala sedikit lebih lebar di ujung depan, TANPA kaki | Tubuh 1 tabung menyatu melengkung, TIDAK BOLEH berupa bola-bola terpisah |
| Elang/Burung | Badan oval + KEPALA jelas terpisah dari badan (bukan menyatu total) + PARUH kecil menonjol + sayap lebar terbentang (plane/segitiga besar, bukan kecil) + ekor kipas | Sayap terbentang lebar, paruh terlihat |
| Hiu | `LatheGeometry` torpedo ramping + sirip dorsal SEGITIGA TINGGI menonjol jelas di punggung + sirip ekor bentuk sabit | Sirip dorsal harus mencolok, ciri khas hiu |
| Jamur | Batang silinder + tudung setengah-bola/payung lebar (radius tudung > radius batang, ada sedikit lengkungan payung bukan kerucut tajam) | Bentuk payung jamur yang jelas |
| Bakteri | Bentuk oval/kapsul bergelombang + beberapa flagela (garis tipis melengkung menjulur keluar, pakai `TubeGeometry` tipis) | Flagela terlihat jelas menjulur, bukan titik acak |

Kalau ada spesies lain di 24 daftar yang tidak tercantum di tabel ini,
terapkan prinsip yang sama (silhouette menyatu + ciri anatomis
minimum) berdasarkan kategori hewannya.

---

## 3. Daftar Fase Eksekusi (kerjakan berurutan, satu batch per waktu)

- **FASE F2.1a** — Audit visual cepat: render/screenshot ke-24 model
  saat ini dari sudut yang cukup jelas, kelompokkan mana yang
  PALING PARAH (seperti Ular di screenshot user — tidak terbaca sama
  sekali) vs mana yang sudah lumayan tapi perlu polish. Laporkan
  daftar prioritas ini dulu ke saya sebelum mulai perbaikan.

- **FASE F2.1b** — Perbaiki batch prioritas tertinggi dulu (kemungkinan:
  Ular, Belalang, Ulat, Udang, Bakteri — kategori yang paling rawan
  jadi "kumpulan bola" kalau dibangun asal). Terapkan teknik
  `TubeGeometry`/penyambungan rapat sesuai bagian 2. Bukti: screenshot
  before/after tiap spesies di batch ini. **Berhenti, tunggu
  konfirmasi saya.**

- **FASE F2.1c** — Lanjutkan batch berikutnya (hewan berkaki/bersayap:
  Katak, Elang, Burung, sisanya) dengan pendekatan yang sama.

- **FASE F2.1d** — Lanjutkan batch terakhir (tumbuhan & ikan: Rumput,
  Padi, Pohon, Alga, Ikan Kecil, Ikan Besar, Hiu, Jamur).

- **FASE F2.1e** — Setelah semua batch selesai, generate ulang
  thumbnail galeri Model Library kalau ada proses thumbnail terpisah,
  lalu push ke GitHub dengan pesan commit yang jelas menyebut "FASE
  F2.1: improve procedural model detail/silhouette accuracy".

---

## 4. Pengingat Penutup

- Ini masih tahap sebelum FASE F3/F4 (verifikasi canvas preset) — jadi
  FASE F3/F4 dari prompt sebelumnya BELUM dimulai sampai FASE F2.1
  ini selesai dan dikonfirmasi user.
- Prinsip tetap sama: lebih baik satu spesies butuh waktu lebih lama
  untuk dibuat benar-benar menyerupai bentuk aslinya, daripada cepat
  selesai tapi hasilnya tidak terbaca sebagai hewan yang dimaksud.
- Mulai dari FASE F2.1a saja dulu (audit & prioritisasi), berhenti
  setelah itu dan tunggu konfirmasi saya sebelum eksekusi perbaikan.
