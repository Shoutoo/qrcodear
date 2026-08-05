# Prompt untuk Antigravity: Perbaikan & Perluasan Model Library (Hutan, Laut, Sawah)

> Tempel isi file ini ke Antigravity. Project: AR Edu QR (qrcodear).
> Lampirkan juga `PROMPT-ANTIGRAVITY-preset-rantai-makanan.md` di sesi
> yang sama supaya konteks fitur Model Library (section 2.6) penuh.

---

## 0. Temuan Masalah (dari screenshot galeri "Darat" yang sudah jadi)

Galeri Model Library untuk ekosistem **Darat** sudah tampil, tapi
**sebagian besar thumbnail/model TIDAK SESUAI nama labelnya** — ini
harus diperbaiki dulu sebelum lanjut ke ekosistem lain:

| Slot | Label | Masalah yang terlihat di screenshot |
|---|---|---|
| Produsen | Rumput | Ikon daun — kemungkinan OK, tetap verifikasi ulang model 3D-nya (bukan cuma ikon UI-nya). |
| Konsumen Primer | Belalang | Ikon serangga — kemungkinan OK, verifikasi ulang. |
| Konsumen Sekunder | Katak | Ikon yang tampil SAMA PERSIS dengan ikon Belalang (serangga) — **SALAH**, katak bukan serangga. |
| Konsumen Tersier | Ular | Ikon tampak seperti cakar/kaki binatang berbulu (mirip kucing/anjing) — **SALAH TOTAL**, ular tidak berkaki. |
| Konsumen Final | Elang | Ikon tampak seperti kelinci (telinga panjang) — **SALAH TOTAL**, elang adalah burung. |
| Decomposer | Jamur | Ikon tampak seperti mikroba/virus generik — kemungkinan bisa diterima secara konsep tapi sebaiknya diganti ikon jamur/fungi yang lebih jelas. |

**Kesimpulan**: sepertinya sebagian entry Model Library dulu diisi
model/ikon PLACEHOLDER GENERIK (bukan model asli sesuai nama), atau
proses matching nama→model salah assign. Ini harus diaudit ulang
semuanya, bukan cuma yang kelihatan salah di screenshot — karena ikon
UI kadang beda dari model 3D aslinya, jadi model 3D-nya sendiri juga
wajib dicek satu-satu.

---

## 1. ATURAN KERJA — WAJIB DIIKUTI

1. **Setiap model 3D yang dipasang ke suatu label WAJIB benar-benar
   merepresentasikan nama itu.** Kalau labelnya "Ular", modelnya harus
   benar-benar model ular (reptil memanjang tanpa kaki) — BUKAN model
   binatang lain, BUKAN placeholder generik, BUKAN ikon abstrak.
   **DILARANG KERAS memasang model yang tidak sesuai** hanya karena
   modelnya tersedia/gampang ditemukan. Kalau model yang benar-benar
   sesuai tidak ketemu, LEBIH BAIK kosongkan/tandai "belum tersedia"
   dan laporkan ke saya, daripada dipaksakan pakai model yang salah.
2. **Verifikasi wajib sebelum finalisasi tiap entry**: setelah
   download model dari sumber manapun, cek ulang (lihat nama file,
   deskripsi di halaman sumber, dan kalau perlu render/screenshot
   modelnya) bahwa modelnya benar cocok dengan nama role tersebut.
   Jangan hanya percaya nama file/folder dari hasil pencarian tanpa
   verifikasi isi.
3. **Sumber model**: gunakan library gratis yang formatnya `.glb`/`.gltf`
   dan lisensinya jelas (utamakan CC0/Public Domain), seperti:
   - **Poly Pizza** (`poly.pizza`) — cari lewat nama spesies spesifik,
     misal `poly.pizza/search/frog`, `poly.pizza/search/snake`,
     `poly.pizza/search/eagle`, dst — JANGAN asal ambil hasil pertama,
     cek dulu preview modelnya cocok.
   - **Quaternius** (`quaternius.com`) — terutama untuk paket
     nature/animal pack.
   - Kalau spesies tertentu tidak ada di dua sumber itu, BOLEH cari di
     sumber lain yang formatnya bisa langsung dirender via
     `GLTFLoader`/`<model-viewer>`, TAPI tetap wajib cek lisensi
     (utamakan CC0; kalau CC-BY, WAJIB catat nama author + sumber di
     `ecosystem-model-library.json` untuk atribusi) dan JANGAN pakai
     yang berbayar/premium/lisensi tidak jelas.
4. Prioritaskan model **low-poly** (ringan) — konsisten dengan tujuan
   reliabilitas ukuran file yang sudah dibahas sebelumnya.
5. **Satu ekosistem, satu waktu** — kerjakan berurutan sesuai daftar
   fase di bagian 3, tunjukkan bukti visual (screenshot galeri +
   screenshot preview tiap model) tiap fase selesai, TUNGGU konfirmasi
   saya sebelum lanjut ke ekosistem berikutnya.
6. Kalau ragu satu spesies itu modelnya cocok atau tidak (misal cuma
   nemu model yang mirip tapi beda spesies persis), LAPORKAN ke saya
   dengan preview-nya, biar saya yang putuskan — jangan diputuskan
   sendiri.

---

## 2. Daftar Spesies per Ekosistem (usulan, boleh Anda sesuaikan)

Struktur tetap 6 role: Produsen → Konsumen Primer → Konsumen Sekunder →
Konsumen Tersier → Konsumen Final → Decomposer (siklus balik ke
Produsen).

### 2.1 Perbaikan Ekosistem Darat (audit ulang, existing)

| Role | Label | Catatan |
|---|---|---|
| produsen | Rumput | Verifikasi ulang model rumput/tumbuhan hijau sederhana. |
| konsumen_primer | Belalang | Verifikasi ulang model belalang. |
| konsumen_sekunder | Katak | **WAJIB GANTI** — cari model katak asli, bukan serangga. |
| konsumen_tersier | Ular | **WAJIB GANTI** — cari model ular/reptil memanjang. |
| konsumen_final | Elang | **WAJIB GANTI** — cari model elang/burung pemangsa. |
| decomposer | Jamur | Sebaiknya ganti ke model jamur/fungi yang jelas bentuknya. |

### 2.2 Ekosistem Hutan (baru)

| Role | Label |
|---|---|
| produsen | Pohon |
| konsumen_primer | Ulat |
| konsumen_sekunder | Burung Pemakan Serangga |
| konsumen_tersier | Ular |
| konsumen_final | Elang |
| decomposer | Jamur |

### 2.3 Ekosistem Laut (baru)

| Role | Label |
|---|---|
| produsen | Fitoplankton / Alga Laut |
| konsumen_primer | Zooplankton / Udang Kecil |
| konsumen_sekunder | Ikan Kecil |
| konsumen_tersier | Ikan Besar |
| konsumen_final | Hiu |
| decomposer | Bakteri Pengurai (boleh divisualkan sebagai bentuk generik mikroba di dasar laut, atau elemen dekomposisi lain yang masuk akal secara visual — laporkan ke saya kalau butuh keputusan representasi) |

### 2.4 Ekosistem Sawah (baru)

| Role | Label |
|---|---|
| produsen | Padi |
| konsumen_primer | Belalang |
| konsumen_sekunder | Katak |
| konsumen_tersier | Ular Sawah |
| konsumen_final | Elang / Burung Hantu |
| decomposer | Jamur |

**Catatan**: kalau saat searching Anda menemukan bahwa salah satu nama
di atas modelnya benar-benar tidak tersedia di sumber gratis manapun
yang layak, JANGAN diganti sepihak ke spesies lain — laporkan dulu ke
saya, kita putuskan bareng (ganti nama spesies ke yang modelnya
tersedia, atau cari sumber lain, atau terima keterbatasan).

---

## 3. Daftar Fase Eksekusi (kerjakan berurutan, satu-satu)

- **FASE M1** — Audit & perbaikan Ekosistem Darat: cek ulang 6 entry
  yang sudah ada di `ecosystem-model-library.json` untuk `ecosystem:
  "darat"`, ganti model yang salah (minimal Katak, Ular, Elang, Jamur
  sesuai temuan di bagian 0), update thumbnail. Bukti: screenshot
  galeri Darat yang sudah diperbaiki (bandingkan sebelum/sesudah) +
  link sumber & lisensi tiap model yang diganti.

- **FASE M2** — Ekosistem Hutan: download & pasang 6 model sesuai
  2.2, buat entry baru di `ecosystem-model-library.json` dengan
  `"ecosystem": "hutan"`. Bukti: screenshot galeri Hutan + link sumber
  & lisensi tiap model.

- **FASE M3** — Ekosistem Laut: sama seperti M2, untuk 2.3.

- **FASE M4** — Ekosistem Sawah: sama seperti M2, untuk 2.4.

- **FASE M5** — (Opsional, kalau relevan dengan struktur project Anda)
  Pastikan preset baru (`ecosystem-presets.json`) untuk Hutan, Laut,
  Sawah juga dibuat/di-update supaya bisa langsung dipilih di dropdown
  preset picker — bukan cuma masuk Model Library saja tapi presetnya
  sendiri belum ada.

---

## 4. Pengingat Penutup

- Ini prompt independen, jangan asumsikan Anda "ingat" konteks dari
  sesi sebelumnya.
- **Sekali lagi ditekankan**: lebih baik kosong/belum lengkap daripada
  memasang model yang salah/tidak sesuai nama. Ini fitur edukasi untuk
  siswa — kesalahan representasi (misal model kucing dipasang untuk
  label "Ular") bisa mengajarkan hal yang salah.
- Mulai dari FASE M1 saja dulu, berhenti setelah itu dan tunggu
  konfirmasi saya.
