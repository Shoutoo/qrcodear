# Prompt untuk Antigravity: Fitur Preset Ekosistem "Rantai Makanan" (AR Studio)

> Tempel isi file ini langsung ke Antigravity sebagai instruksi kerja.
> Project: AR Edu QR (qrcodear). Lampirkan juga
> `RINGKASAN-PROJECT-AR-EDU-QR.md` di sesi yang sama supaya konteks penuh.

---

## 0. Konteks Perubahan Ini

Fitur AR Studio yang sudah ada (`server/views/studio/`) awalnya untuk scene
editor bebas (user susun objek manual, lalu AR playback pakai WebXR mentah
dengan tap-to-place + XRAnchor — sebut ini **FASE C**).

Setelah diagnosa: FASE C (WebXR mentah via `navigator.xr`/Chrome↔ARCore
bridge) **tidak reliable** di banyak HP Android acak — device tertentu
gagal deteksi hit-test sama sekali walau device itu sendiri mampu
(terbukti app AR native/MyWebAR jalan normal di device yang sama). Karena
target penggunaan fitur baru ini adalah **disebar ke banyak siswa dengan HP
acak**, dan kontennya **statis** (bukan interaktif), maka fitur baru ini
akan pakai pendekatan berbeda yang jauh lebih reliable: **bake scene jadi
satu file `.glb` gabungan, lalu tampilkan lewat `<model-viewer>`** (native
Scene Viewer/AR Quick Look — sama seperti sistem lama `/ar/:id`, bukan
WebXR mentah).

## 1. ATURAN KERJA — WAJIB DIIKUTI, BACA DULU SEBELUM MULAI

1. **JANGAN HAPUS FASE C.** Tap-to-place manual WebXR yang sudah ada di
   `server/views/studio/viewer.html` (route `/studio/view/:sceneId`,
   scene editor bebas di `studio/index.html`) **tetap dipertahankan apa
   adanya**, jadikan menu/opsi TERPISAH (misal label menu "AR Studio —
   Mode Manual / Eksperimental"), BUKAN dihapus atau ditimpa.
2. **Isolasi scope**: semua kode baru untuk fitur preset ini masuk file/
   route BARU yang terpisah jelas dari FASE C maupun sistem lama
   (`ar-viewer.html`, `editor.html`, `client/index.html` dashboard utama).
   JANGAN sentuh ketiga file itu kecuali diminta eksplisit.
3. **Satu fase, satu waktu** — kerjakan berurutan sesuai daftar FASE di
   bawah, tunjukkan bukti visual (screenshot) tiap fase selesai, TUNGGU
   konfirmasi eksplisit dari saya sebelum lanjut ke fase berikutnya.
4. **Tidak ada penambahan fitur di luar instruksi ini** — kalau ada ide
   tambahan selama pengerjaan, catat di `ide-tambahan.md`, JANGAN langsung
   dikerjakan.
5. **Batasan verifikasi fisik**: pengetesan AR di HP asli (scan QR, lihat
   hasil `<model-viewer>` di device nyata) HANYA boleh dilakukan oleh SAYA
   (user), bukan oleh Anda (agent). Anda tidak boleh mengklaim sudah
   "menguji" hasil AR di device fisik.
6. **Konflik arsitektur wajib dilaporkan**, bukan diputuskan sendiri —
   kalau ada kondisi ambigu/bertabrakan saat implementasi, berhenti dan
   tanya saya dulu.
7. **Pengecualian terbatas untuk `server/views/studio/index.html`**: file
   ini BOLEH disentuh, TAPI HANYA untuk menambahkan menu/opsi navigasi
   baru yang mengarah ke UI preset ekosistem (lihat FASE P6). DILARANG
   mengubah logic/canvas/editor bebas FASE C yang sudah ada di file itu.
   Kalau ternyata menambah menu ini butuh restrukturisasi besar pada
   file tersebut, STOP dan laporkan dulu, jangan diputuskan sendiri.

---

## 2. Spesifikasi Fitur: Preset Ekosistem Rantai Makanan

### 2.1 Konsep

Template rantai makanan siklus dengan **selalu tepat 6 slot/role tetap**
(urutan searah lingkaran, panah melengkung antar-node, node ke-6 balik
menyambung ke node ke-1):

1. Produsen
2. Konsumen Primer
3. Konsumen Sekunder
4. Konsumen Tersier
5. Konsumen Final
6. Decomposer

Preset per ekosistem (Darat, Laut, dll) HANYA berbeda di: model 3D per
slot + label teks per slot. Posisi, layout lingkaran, dan panah SELALU
dihitung otomatis dari template — user tidak mengatur posisi manual.

### 2.2 Data Schema Baru

Buat file baru `server/data/ecosystem-presets.json`, jangan modifikasi
`scenes.json` yang sudah ada (skema berbeda, keperluan berbeda):

```json
[
  {
    "id": "preset-darat",
    "name": "Ekosistem Darat",
    "slots": [
      { "role": "produsen", "label": "Rumput", "modelSrc": "/assets/..." },
      { "role": "konsumen_primer", "label": "Belalang", "modelSrc": "/assets/..." },
      { "role": "konsumen_sekunder", "label": "Katak", "modelSrc": "/assets/..." },
      { "role": "konsumen_tersier", "label": "Ular", "modelSrc": "/assets/..." },
      { "role": "konsumen_final", "label": "Elang", "modelSrc": "/assets/..." },
      { "role": "decomposer", "label": "Jamur", "modelSrc": "/assets/..." }
    ]
  }
]
```

### 2.3 Layout Otomatis (dihitung di kode, bukan disimpan per-objek)

- 6 slot ditempatkan di lingkaran, jarak sudut 60° antar node, radius
  tetap (misal 1.5 unit, sesuaikan saat testing visual).
- Panah melengkung antar node berurutan (1→2→3→4→5→6→1) dibuat dengan
  `THREE.CatmullRomCurve3` + `TubeGeometry`, warna merah, kepala panah
  kerucut kecil di ujung — meniru arah panah di referensi gambar rantai
  makanan siklus yang saya berikan sebelumnya.
- Label teks nama hewan/organisme muncul di dekat tiap model (reuse
  logic `type: "text"` yang sudah ada di scene editor, canvas texture di
  plane).
- **PENTING — perbedaan perilaku saat bake**: di editor Studio (live
  three.js), plane label biasanya "menghadap kamera" (billboard,
  dihitung ulang tiap frame). Setelah di-bake jadi `.glb` statis dan
  ditampilkan di `<model-viewer>`/Scene Viewer, plane TIDAK bisa lagi
  auto-menghadap kamera (orientasinya jadi tetap/fixed, karena bukan
  live render three.js lagi). Maka khusus untuk proses bake fitur ini,
  orientasikan tiap plane label menghadap KELUAR dari titik pusat
  lingkaran (arah radial keluar dari centroid ke posisi slot), bukan
  mengikuti orientasi kamera terakhir saat publish — supaya label tetap
  terbaca wajar dari sudut pandang normal user mengelilingi objek.

### 2.4 UI Studio — Preset Picker

Tambahan UI baru di Studio (bukan mengubah editor bebas yang lama):
- Dropdown/gallery pilih preset ekosistem yang tersedia.
- Setelah preset dipilih, tampil 6 slot di canvas 3D sesuai layout
  otomatis di atas.
- User HANYA bisa: ganti model 3D per slot (upload file baru ATAU pilih
  dari galeri model yang sudah pernah diupload untuk keperluan preset
  ini), edit teks label per slot. TIDAK bisa geser posisi/rotasi manual
  (posisi terkunci dari template).
- Catatan penting: upload model per-slot ini BUKAN bagian dari
  `assets.json` (itu punya sistem lama `/ar/:id`, jangan ditulisi/dibaca
  dari fitur ini). Simpan referensi file model preset di tempat
  terpisah (boleh field di dalam `ecosystem-presets.json` itu sendiri,
  atau folder upload khusus misal `server/uploads/ecosystem-models/`) —
  jangan campur dengan mekanisme galeri dashboard lama.

### 2.5 Publish — Bake to GLB (jalur BARU, reliable)

1. Tombol "Publish" pada mode preset ini memicu proses BERBEDA dari
   publish FASE C:
   - Client-side, pakai `THREE.GLTFExporter`, gabungkan seluruh scene
     (6 model + 6 label + panah-panah) jadi SATU file `.glb`.
   - Upload hasil bake ke server (endpoint baru, misal
     `POST /api/ecosystem/publish`).
   - **Perhatikan ukuran file hasil bake**: 6 model + 6 label + 6 panah
     digabung bisa jadi besar. Supaya tujuan awal (reliabel di HP acak
     siswa, koneksi data terbatas) tidak rusak oleh file yang kegedean,
     usahakan kompres tekstur/geometri secukupnya saat export (misal
     batasi resolusi canvas texture label, jangan generate geometri
     panah dengan segment count berlebihan). Kalau ukuran akhir
     mendekati/melebihi batas 50MB yang berlaku di sistem lama,
     laporkan ke saya sebelum lanjut, jangan dipaksakan.
2. Server simpan file glb hasil bake + generate entry baru (skema mirip
   `assets.json` sistem lama, tapi di collection/file terpisah — jangan
   campur ke `assets.json` asli, buat misal `ecosystem-published.json`)
   + generate QR code (reuse library `qrcode` yang sudah ada) mengarah
   ke route viewer baru.
3. Viewer hasil publish pakai **`<model-viewer>`** (BUKAN WebXR mentah),
   route baru misal `/ecosystem/view/:id`, auto-place floor seperti
   sistem lama `/ar/:id` — supaya reliable di HP acak siswa.
4. Modal setelah publish: tampilkan QR + direct link + tombol download
   QR (boleh reuse pattern dari FASE B roadmap lama kalau relevan).

---

## 3. Daftar Fase Eksekusi (kerjakan berurutan, satu-satu)

- **FASE P1** — Data & schema: buat `ecosystem-presets.json` + 1 preset
  contoh ("Darat", boleh pakai model placeholder/primitive dulu kalau
  aset final belum ada). Tidak ada UI baru di fase ini, cukup pastikan
  data bisa dibaca backend. Bukti: tunjukkan isi file + endpoint GET
  yang mengembalikan data preset.

- **FASE P2** — Layout otomatis: implementasikan perhitungan posisi 6
  slot melingkar + generate kurva panah, render di canvas Studio (belum
  perlu UI picker lengkap, cukup hardcode load 1 preset dulu). Bukti:
  screenshot 6 objek placeholder tersusun melingkar dengan panah
  menghubungkan searah siklus.

- **FASE P3** — UI Preset Picker: dropdown pilih preset, swap model per
  slot, edit label per slot. Bukti: screenshot alur ganti model/label
  pada salah satu slot.

- **FASE P4** — Bake-to-GLB: implementasi `GLTFExporter` gabungkan scene
  jadi 1 file, uji hasil file valid (bisa dibuka di viewer glTF mana
  pun). Bukti: file `.glb` hasil bake + screenshot preview-nya.

- **FASE P5** — Publish flow baru + viewer `<model-viewer>`: endpoint
  publish, penyimpanan `ecosystem-published.json`, route
  `/ecosystem/view/:id`, generate QR. Bukti: screenshot modal publish +
  link viewer yang bisa dibuka di browser desktop (preview 3D non-AR
  dulu, cukup buktikan model tampil, AR fisik nanti saya tes sendiri di
  HP).

- **FASE P6** — Restrukturisasi menu: pastikan navigasi jelas memisahkan
  "AR Studio — Mode Manual (WebXR, FASE C, eksperimental)" dan
  "AR Studio — Preset Ekosistem (Reliable AR)" sebagai dua menu/opsi
  terpisah, tidak saling menimpa. Bukti: screenshot navigasi akhir.

---

## 4. Pengingat Penutup

- Jangan asumsikan Anda "ingat" aturan ini dari sesi sebelumnya — ini
  prompt independen, ikuti persis seperti ditulis.
- Kalau ragu antara dua pilihan implementasi di tengah jalan, LAPORKAN
  ke saya, jangan pilih sendiri.
- Mulai dari FASE P1 saja dulu, berhenti setelah itu dan tunggu
  konfirmasi saya.
