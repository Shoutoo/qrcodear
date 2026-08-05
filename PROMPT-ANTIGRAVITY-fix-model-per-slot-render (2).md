# Prompt untuk Antigravity: Perbaikan — Semua Entry Model Library Menunjuk ke File .glb yang Sama

> Tempel isi file ini ke Antigravity. Project: AR Edu QR (qrcodear).
> Lampirkan juga `PROMPT-ANTIGRAVITY-preset-rantai-makanan.md` dan
> `PROMPT-ANTIGRAVITY-model-library-perbaikan-dan-ekosistem-baru.md`
> di sesi yang sama supaya konteks penuh.
>
> **Revisi dari versi sebelumnya**: temuan awal dikira cuma "6 slot
> canvas Studio menampilkan model yang sama" (dugaan bug loop/wiring
> kode render). Setelah dicek ulang, masalahnya lebih luas: **SEMUA
> entry di galeri Model Library** (bukan cuma 1 preset yang sedang
> ditampilkan di canvas) menunjuk ke file `.glb` yang PERSIS SAMA —
> hanya `label`/nama teksnya yang beda-beda per entry. Ini
> mengarahkan dugaan root cause ke **level data** (kemungkinan besar
> `ecosystem-model-library.json`), bukan ke logic rendering canvas.
> Checklist diagnosa di bawah sudah disusun ulang sesuai ini.

---

## 0. Temuan Masalah (update)

Sebelumnya dikira: 6 slot di canvas Studio semuanya menampilkan model
burung/kelelawar hitam generik yang sama — diduga bug rendering per
slot.

**Setelah dicek ulang oleh user**: bukan cuma di canvas Studio saat
preview 1 preset. Di **galeri Model Library** sendiri (tempat semua
entry model per ekosistem terdaftar), banyak/semua entry ternyata
merujuk ke **file `.glb` yang sama persis** — cuma field nama/label
yang berbeda-beda. Artinya kalau benar begini, walau logic loop di
canvas Studio 100% benar (baca `modelSrc` per slot dengan tepat),
hasilnya akan tetap kelihatan "semua model sama" karena SUMBER
DATANYA sendiri memang menunjuk ke file yang sama.

**Dugaan root cause paling mungkin**: waktu proses audit/perbaikan di
FASE M1-M4 (prompt Model Library sebelumnya) dijalankan, yang diubah
cuma field `label`/`name` di `ecosystem-model-library.json` per
entry — sedangkan field path/URL model (`modelSrc`, `glbUrl`, `file`,
atau nama field sejenis) TIDAK pernah benar-benar diarahkan ke file
`.glb` hasil download yang baru/berbeda. Jadi terlihat "sudah
diperbaiki" di UI (nama sudah benar, thumbnail mungkin juga sudah
beda kalau thumbnail di-generate terpisah), tapi model 3D aktual yang
dimuat tetap 1 file lama yang sama untuk semua entry.

Ini baru dugaan — WAJIB diverifikasi dulu lewat data, bukan diasumsikan benar.

---

## 1. ATURAN KERJA — WAJIB DIIKUTI

1. **Diagnosa dari level DATA dulu, baru turun ke level KODE.** Jangan
   langsung masuk ke logic canvas Studio sebelum memastikan data
   sumbernya (`ecosystem-model-library.json` dan/atau
   `ecosystem-presets.json`) memang sudah unik per entry.
2. **Laporkan temuan tiap langkah dengan bukti** (isi file JSON yang
   relevan, hasil hitung hash/ukuran file, screenshot) — bukan
   dugaan/tebakan.
3. **Setelah root cause ketemu, baru perbaiki.** Kalau ternyata
   penyebabnya kombinasi data salah DAN bug kode, perbaiki
   semuanya, jangan cuma tambal satu titik.
4. **Setiap entry WAJIB menampilkan model yang benar-benar unik dan
   sesuai label/role-nya** — verifikasi akhir dengan screenshot galeri
   Model Library yang menunjukkan model-model SECARA VISUAL BERBEDA
   sesuai nama masing-masing.
5. **Isolasi scope** — perbaikan ini fokus ke audit & fix data model
   per entry (dan wiring render kalau memang terbukti ada bug di
   situ juga). Jangan sambil mengubah logic layout posisi/panah yang
   sudah benar, jangan sambil menambah fitur lain.
6. Kalau nemu penyebab lain di luar dugaan di atas, atau perlu
   perubahan struktur data yang cukup besar, LAPORKAN dulu ke saya
   sebelum eksekusi, jangan diputuskan sendiri.

---

## 2. Checklist Diagnosa (urutan prioritas — mulai dari DATA)

### Langkah 1 — Audit isi `ecosystem-model-library.json` secara utuh
- Tampilkan/dump SELURUH isi file ini (semua ekosistem: Darat, Hutan,
  Laut, Sawah).
- Untuk tiap entry, catat: `label`/nama, dan field path/URL model
  (`modelSrc`/`glbUrl`/`file`/nama field apapun yang menunjuk ke file
  `.glb`).
- **Bandingkan field path/URL antar semua entry** — apakah memang ada
  banyak entry yang path-nya SAMA PERSIS (string identik)? Buat daftar
  eksplisit: entry mana saja yang path-nya duplikat dengan entry lain.
- Ini langkah PALING PENTING — kalau di sini sudah ketemu banyak
  duplikat, itu konfirmasi kuat bahwa root cause di data, dan langkah
  3-4 di bawah kemungkinan besar tidak perlu banyak perubahan.

### Langkah 2 — Audit isi `ecosystem-presets.json`
- Cek juga apakah preset (yang mereferensikan slot ke entry Model
  Library atau langsung ke path model) punya masalah serupa — field
  `modelSrc` per slot di tiap preset apakah unik atau ikut duplikat.

### Langkah 3 — Cek fisik file `.glb` yang dirujuk
- Untuk entry-entry yang menurut Langkah 1 SEHARUSNYA berbeda (label
  beda), cek apakah file `.glb` yang dirujuk di disk/storage memang
  cuma 1 file fisik yang sama (misal cek ukuran file, hash MD5/SHA1
  tiap file `.glb` yang dirujuk) — untuk memastikan bukan cuma
  "path string" yang kebetulan sama tapi juga benar-benar 1 file yang
  sama secara isi.
- Kalau ternyata memang banyak entry unik model hasil FASE M1-M4
  BELUM PERNAH benar-benar ter-upload/tersimpan sebagai file terpisah
  (misal proses download berhasil tapi proses simpan/link ke
  entry JSON gagal diam-diam), laporkan temuan ini spesifik.

### Langkah 4 — Baru cek kode loop pemasangan model ke tiap slot (canvas Studio)
- HANYA lakukan langkah ini SETELAH Langkah 1-3 selesai dan
  dilaporkan. Kalau Langkah 1-3 sudah menjelaskan sepenuhnya kenapa
  hasilnya sama semua (karena datanya memang sama), langkah ini cukup
  jadi pengecekan tambahan/konfirmasi saja, bukan fokus utama.
- Cari fungsi yang membangun slot di canvas Studio, pastikan tiap
  iterasi loop benar-benar memakai `modelSrc` MILIK entry/slot itu
  sendiri (cek closure bug `let` vs `var`, index binding per iterasi).
- Pastikan hasil scene dari GLTF di-`clone()` dengan benar sebelum
  ditambahkan ke `sceneGroup`/galeri per entry (jangan sampai menunjuk
  ke instance Three.js Object3D yang sama persis di memori walau
  `modelSrc` sudah berbeda).

### Langkah 5 — Cek fallback/error-handling tersembunyi
- Cek apakah ada `catch` block atau fallback yang diam-diam mengganti
  SEMUA model yang gagal load dengan 1 model placeholder default yang
  sama, tanpa menampilkan error di UI — ini bisa menjelaskan kenapa
  hasilnya "terlihat berhasil tapi sama semua" walau data & kode
  loop-nya benar.

---

## 3. Sourcing Model — Aturan Tegas (tetap berlaku kalau ternyata perlu download ulang)

Untuk entry yang terbukti dari Langkah 1-3 memang belum punya file
model unik sendiri (bukan cuma butuh perbaikan wiring), gunakan
urutan prioritas berikut, JANGAN LOMPAT TAHAP:

### Tier 1 — Cari model asli gratis di internet (prioritas utama)
- Sumber utama: **Poly Pizza** (`poly.pizza`, cari per nama spesies
  spesifik) dan **Quaternius** (`quaternius.com`).
- Kalau tidak ada di dua sumber itu, boleh cari sumber lain yang
  formatnya `.glb`/`.gltf` dan lisensinya jelas (utamakan CC0; kalau
  CC-BY wajib dicatat atribusinya).
- **WAJIB verifikasi visual** sebelum dipakai, dan **WAJIB pastikan
  file hasil download benar-benar tersimpan sebagai file terpisah
  dengan path unik**, lalu path itu benar-benar ditulis ke field
  `modelSrc` entry yang bersangkutan di `ecosystem-model-library.json`
  — verifikasi ini dengan membaca ulang isi JSON setelah proses
  simpan, bukan cuma percaya proses download "sukses".

### Tier 2 — Kalau BENAR-BENAR tidak ketemu di internet: buat sendiri secara prosedural
- Susun model sederhana dari primitif Three.js (`SphereGeometry`,
  `CylinderGeometry`, `ConeGeometry`, dll) yang siluetnya masuk akal
  merepresentasikan nama itu, lalu export jadi `.glb` sekali dan
  simpan sebagai file terpisah dengan path unik (bukan referensi ke
  file bersama).

### Tier 3 — Kalau Tier 1 & 2 dua-duanya tidak memungkinkan
- JANGAN pasang model spesies lain yang tidak berhubungan.
- Boleh pakai bentuk primitif polos DENGAN label teks jelas, dan tandai
  entry dengan flag `"needsReview": true` di
  `ecosystem-model-library.json`.

---

## 4. Daftar Fase Eksekusi (kerjakan berurutan, satu-satu)

- **FASE F1** — Audit data: jalankan Langkah 1-3 di checklist bagian
  2. Laporkan HASIL LENGKAP: daftar semua entry di
  `ecosystem-model-library.json` beserta path model-nya, daftar
  entry mana saja yang path/file-nya duplikat, dan kesimpulan apakah
  root cause murni di data atau ada indikasi lain. **Berhenti setelah
  ini, tunggu konfirmasi saya sebelum lanjut ke FASE F2.**

- **FASE F2** — Kalau root cause dikonfirmasi murni di data: perbaiki
  `ecosystem-model-library.json` (dan `ecosystem-presets.json` kalau
  perlu) supaya tiap entry unik menunjuk model yang benar sesuai
  sourcing di bagian 3. Kalau root cause ternyata JUGA ada di kode
  (Langkah 4-5), perbaiki juga bagian itu. Bukti: screenshot galeri
  Model Library dengan model-model yang jelas berbeda per entry, untuk
  SEMUA ekosistem (Darat, Hutan, Laut, Sawah).

- **FASE F3** — Verifikasi akhir di canvas Studio: load preset
  "Darat" dan pastikan 6 slot menampilkan model yang benar-benar
  berbeda sesuai role masing-masing. Screenshot sebagai bukti.

- **FASE F4** — Ulangi verifikasi yang sama untuk preset Hutan, Laut,
  Sawah — pastikan tidak ada slot yang keliru menampilkan model dari
  role/ekosistem lain.

---

## 5. Pengingat Penutup

- Ini prompt independen, jangan asumsikan Anda "ingat" konteks dari
  sesi sebelumnya.
- Prinsip utama tetap sama: **lebih baik jujur belum lengkap/pakai
  placeholder yang ditandai jelas, daripada terlihat "selesai" padahal
  isinya salah/tidak sesuai nama.**
- Mulai dari FASE F1 saja dulu (audit data), berhenti setelah itu dan
  tunggu konfirmasi saya sebelum lanjut ke perbaikan.
