# Prompt Antigravity: Debug "Gagal Memuat" saat Scan QR AR Ekosistem di HP

> Tempel ke Antigravity. Project: AR Edu QR (qrcodear). Fokus:
> viewer `/ecosystem/view/:id` gagal memuat saat diakses lewat scan
> QR di HP fisik user. Ini bug lama yang sempat dilaporkan sebelumnya
> (`PROMPT-ANTIGRAVITY-debug-ar-gagal-memuat.md` di sesi awal) dan
> belum terkonfirmasi selesai — sekarang dikonfirmasi user MASIH
> terjadi, setelah pekerjaan besar di sisi model 3D (FASE F1-F2.2)
> baru saja selesai.

---

## 0. Konteks Penting

Objek 3D (24 model prosedural gaya "cute toy" dengan material glossy/
clearcoat) baru saja selesai dikerjakan. Ini KEMUNGKINAN relevan
dengan bug "gagal memuat" karena beberapa alasan baru yang belum
pernah jadi variabel sebelumnya:

1. **Material baru pakai fitur lebih kompleks** (`clearcoat`,
   `clearcoatRoughness`, kemungkinan `MeshPhysicalMaterial`) — perlu
   dicek apakah `THREE.GLTFExporter` yang dipakai untuk proses
   bake-to-GLB (`FASE P4` di alur publish) benar-benar mendukung
   ekspor properti-properti ini dengan sempurna, atau ada silent
   failure/properti yang di-drop yang bisa membuat file GLB hasil
   ekspor tidak valid atau tidak ditampilkan dengan benar oleh
   `<model-viewer>`/Scene Viewer/AR Quick Look di HP.
2. **Jumlah geometri per model bertambah** (badan bergelung dengan
   banyak segmen, wajah dengan banyak elemen kecil per spesies) —
   perlu dicek apakah total ukuran file `.glb` hasil bake gabungan 6
   slot preset masih wajar (jauh di bawah limit 50MB yang sudah
   disepakati sejak awal project), karena bug "gagal memuat" bisa juga
   murni soal file kebesaran/lambat di-load di jaringan data HP siswa.
3. Kemungkinan lain TETAP semua dugaan lama yang belum terkonfirmasi
   sebelumnya (path/URL salah di data publish, file corrupt saat
   upload, dll) — jangan asumsikan penyebabnya PASTI dari perubahan
   model baru, checklist di bawah tetap mengecek dari awal secara
   menyeluruh.

---

## 1. ATURAN KERJA

1. **Diagnosa dulu, jangan asal fix.** Ikuti checklist bagian 2 secara
   berurutan, laporkan temuan tiap langkah dengan BUKTI (isi file,
   log, screenshot console/network) — bukan dugaan.
2. **Reproduksi dulu di desktop sebelum asumsi soal HP**: karena
   agent tidak bisa scan QR fisik di HP, gunakan Chrome desktop untuk
   membuka URL viewer yang sama persis (`/ecosystem/view/:id`) dan
   inspect lewat DevTools (Console + Network tab) untuk melihat error
   yang sama kemungkinan besar juga terjadi di HP.
3. Kalau desktop ternyata berhasil load tapi HP tetap gagal, laporkan
   itu sebagai temuan penting (kemungkinan device/browser-specific,
   misal masalah related ke `<model-viewer>` versi tertentu atau
   AR Quick Look/Scene Viewer requirement khusus) — JANGAN
   diasumsikan "berarti sudah beres" hanya karena desktop OK.
4. Setelah root cause ditemukan, laporkan dulu rencana fix ke user
   SEBELUM eksekusi perbaikan — jangan langsung ubah kode.
5. Agent TIDAK BOLEH mengklaim sudah "menguji di HP fisik" — verifikasi
   akhir tetap dilakukan user sendiri setelah fix diterapkan.

---

## 2. Checklist Diagnosa (urutan prioritas)

### Langkah 1 — Pastikan entry publish valid
- Cek `ecosystem-published.json` (atau nama file data publish yang
  sesuai) untuk ID yang sedang ditest oleh user — apakah entry-nya
  ada, dan field path/URL ke file `.glb` hasil bake mengarah ke file
  yang benar-benar ada di storage/uploads.

### Langkah 2 — Validasi file `.glb` hasil bake
- Cek file `.glb` yang dirujuk: ukurannya berapa (bandingkan dengan
  limit 50MB), dan apakah file itu valid secara struktur (bisa dibuka
  tanpa error via glTF validator, atau minimal dicoba di-load manual
  lewat `GLTFLoader` di script terpisah dan lihat apakah error).
- **Khusus untuk temuan baru soal material**: cek apakah proses bake
  (`GLTFExporter`) menghasilkan warning/error di console saat proses
  export dijalankan — terutama terkait properti material
  clearcoat/physical yang baru dipakai. Kalau ada warning "unsupported
  extension" atau properti yang di-drop, catat detailnya.

### Langkah 3 — Reproduksi di Chrome desktop
- Buka langsung URL `/ecosystem/view/:id` yang sama di Chrome desktop,
  buka DevTools → Console & Network tab.
- Screenshot/catat SEMUA error yang muncul di Console (terutama error
  dari `<model-viewer>` terkait load model — biasanya custom event
  `error` dengan detail reason).
- Cek tab Network: apakah request ke file `.glb` berhasil (status 200)
  atau gagal (404/500/timeout), dan berapa lama waktu loading-nya.

### Langkah 4 — Cek logic tombol AR
- Cari kode yang mengontrol tombol "Mulai AR Rantai Makanan" di
  `ecosystem/view` template — pastikan tombol disembunyikan HANYA saat
  ada event `error` resmi dari `<model-viewer>`, bukan karena kondisi
  lain yang salah logic (misal timeout terlalu pendek, atau kondisi
  yang salah trigger padahal model sebenarnya masih loading).

### Langkah 5 — Cek log server
- Cek log server (kalau ada logging di endpoint publish/serve file
  glb) untuk error terkait request file ini, termasuk kemungkinan
  masalah CORS, MIME type yang salah untuk file `.glb`
  (`model/gltf-binary`), atau masalah serving static file dari hosting
  (Render, sesuai commit sebelumnya yang disebut auto-redeploy Render).

### Langkah 6 — Kalau semua di atas terlihat baik-baik saja
- Cek kemungkinan spesifik ke environment HP: apakah browser yang
  dipakai user support `<model-viewer>`/WebXR/AR Quick Look dengan
  baik (Chrome Android versi berapa), dan apakah ada perbedaan
  signifikan antara environment desktop vs mobile yang bisa jadi
  penyebab (misal viewport, memory limit di HP untuk load model
  besar, dll) — laporkan sebagai kemungkinan yang butuh info tambahan
  dari user (versi Chrome Android, model HP) kalau memang mentok di
  sini.

---

## 3. Yang Diminta dari Saya (User) Kalau Dibutuhkan

Kalau checklist di atas butuh info tambahan yang cuma saya yang tahu,
tanyakan spesifik, misalnya:
- ID/link preset yang gagal dimuat persis yang mana
- Versi Chrome & model HP Android yang dipakai saat testing
- Screenshot pesan error persis yang muncul di HP (kalau ada selain
  "gagal memuat")

---

## 4. Pengingat Penutup

- Fase model 3D (FASE F1 - F2.2 + task mata/overflow) dianggap SELESAI
  untuk sementara — fokus sekarang murni ke bug AR viewer ini.
- Mulai dari Langkah 1 checklist, laporkan temuan tiap langkah,
  berhenti dan tunggu konfirmasi rencana fix dari saya sebelum
  eksekusi perbaikan kode apapun.
