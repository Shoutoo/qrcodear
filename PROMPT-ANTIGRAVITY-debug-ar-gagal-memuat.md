# Prompt Debugging untuk Antigravity: AR Rantai Makanan "Gagal Memuat"

> Tempel isi file ini ke Antigravity sebagai instruksi debugging.
> Project: AR Edu QR (qrcodear). Kalau Antigravity butuh konteks fitur
> ini dibangun seperti apa, lampirkan juga
> `PROMPT-ANTIGRAVITY-preset-rantai-makanan.md` dan
> `RINGKASAN-PROJECT-AR-EDU-QR.md` di sesi yang sama.

---

## 0. Gejala Bug (laporan user, apa adanya)

- HP: Android, browser Chrome.
- Awalnya tombol **"Mulai AR Rantai Makanan"** muncul di halaman viewer,
  TAPI **tidak bisa diklik**.
- Sekarang kondisinya berubah: tombol itu **hilang sama sekali**,
  digantikan pesan **"gagal memuat"**.
- Ini terjadi setelah scan QR / buka link hasil publish — kemungkinan
  besar di route `/ecosystem/view/:id` (viewer hasil bake-to-glb),
  BUKAN di proses menyusun scene di Studio.

---

## 1. Aturan Kerja Debugging — WAJIB DIIKUTI

1. **JANGAN langsung menebak & mengubah kode secara acak.** Diagnosa
   dulu SISTEMATIS sesuai checklist di bagian 2, satu langkah satu
   waktu, laporkan temuan tiap langkah.
2. **JANGAN mengubah scope di luar bug ini** — jangan sambil refactor
   atau "sekalian benerin" bagian lain yang tidak terkait.
3. Kalau ternyata akar masalahnya butuh keputusan arsitektur (misal
   ternyata pendekatan bake-to-glb punya keterbatasan fundamental untuk
   kasus tertentu, atau perlu ganti pendekatan), **STOP dan laporkan ke
   saya**, jangan diputuskan/diubah sendiri.
4. **Tunjukkan bukti konkret** tiap klaim — isi console log, isi
   network tab, response server, isi file — bukan asumsi "kemungkinan
   karena X" tanpa dicek langsung.
5. Setelah root cause ketemu dan diperbaiki: reproduce dulu bug-nya,
   baru tunjukkan bukti sudah tidak terjadi lagi, SEBELUM saya coba tes
   fisik ulang di HP.

---

## 2. Checklist Diagnosa (urutan prioritas, jangan lompat)

### Langkah 1 — Cek entry hasil publish
- Buka `server/data/ecosystem-published.json`, cari entry dari hasil
  publish yang baru saja ditest user.
- Pastikan field path/URL model `.glb` ada dan formatnya benar.
- Cek apakah file `.glb` yang direferensikan itu **benar-benar ada** di
  folder uploads server (bukan cuma tercatat di JSON tapi filenya tidak
  ada / gagal ke-save saat proses publish).

### Langkah 2 — Cek validitas file .glb hasil bake
- Cek ukuran file `.glb` itu — 0 byte / kecil mencurigakan / justru
  kegedean?
- Coba buka file itu di viewer glTF terpisah (misal
  gltf-viewer.donmccurdy.com atau tool serupa) untuk pastikan file
  tidak korup.
- Kalau file korup/kosong → root cause kemungkinan besar di proses
  `GLTFExporter` (FASE P4) — export dipanggil sebelum semua
  async texture/model selesai di-load, atau proses upload terputus
  sebelum file lengkap ter-save ke server.

### Langkah 3 — Cek route viewer `/ecosystem/view/:id` di Chrome desktop
- Buka link viewer itu di Chrome DESKTOP dulu (lebih gampang buka
  DevTools).
- Tab **Console**: salin SEMUA error yang muncul, termasuk stack
  trace-nya, jangan cuma judul error.
- Tab **Network**: cari request ke file `.glb` tersebut, cek status
  code (200 / 404 / 500 / CORS error) dan response header-nya,
  khususnya `Content-Type` (untuk `.glb` seharusnya
  `model/gltf-binary`).

### Langkah 4 — Cek logic tampil-tidaknya tombol AR
- Cari kode di viewer page yang menentukan kapan tombol "Mulai AR
  Rantai Makanan" ditampilkan vs kapan pesan "gagal memuat" muncul
  (kemungkinan berdasarkan event `<model-viewer>`, misal `error` vs
  `load`).
- Konfirmasi: apakah tombol AR itu memang SENGAJA baru muncul setelah
  event `load` sukses dari `<model-viewer>`? Kalau iya, berarti "gagal
  memuat" itu valid mencerminkan model beneran gagal ke-load (balik ke
  Langkah 1–3), bukan bug terpisah di logic tombolnya sendiri.

### Langkah 5 — Cek log server
- Lihat log server Express saat proses publish dilakukan, dan saat
  viewer request ulang file `.glb` — apakah ada error di endpoint
  `POST /api/ecosystem/publish` atau saat serve static file di
  `server/uploads/`.

---

## 3. WAJIB Lapor Hasil Diagnosa Sebelum Memperbaiki

Setelah checklist di atas ditelusuri, laporkan ke saya dengan format:

- **Root cause** yang ditemukan (dengan bukti konkret dari langkah di
  atas — bukan dugaan).
- **Rencana fix** yang diusulkan.
- Apakah fix ini murni bug-fix (tidak mengubah arsitektur) atau
  ternyata butuh keputusan tambahan dari saya.

BARU setelah saya konfirmasi, lakukan perbaikan. Setelah fix, tunjukkan
bukti sebelum/sesudah (reproduce bug → fix → tidak reproduce lagi).

---

## 4. Pengingat

- Ini prompt independen, jangan asumsikan Anda "ingat" konteks dari
  sesi sebelumnya.
- Aturan project lama tetap berlaku: isolasi scope, jangan sentuh
  `ar-viewer.html` / `editor.html` / `client/index.html` dashboard lama
  kecuali diminta eksplisit.
- Verifikasi fisik AR di HP asli tetap dilakukan oleh SAYA, bukan Anda.
