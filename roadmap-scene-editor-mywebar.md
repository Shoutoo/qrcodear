# Roadmap: Scene Editor Multi-Objek (Seperti MyWebAR)

Ini PROYEK BESAR, bukan fase tambahan biasa. Dikerjakan di route terpisah 
(`/studio`) supaya TIDAK mengganggu sistem yang sudah jalan (`/ar/:id`, 
`/editor/:id`, upload flow). Estimasi realistis: berminggu-minggu, dikerjakan 
bertahap, SATU FASE DI SATU WAKTU, dengan bukti visual di tiap fase.

---

## Prinsip Kerja (Wajib Dipatuhi Agent di Setiap Fase)

1. **Isolasi total dari kode lama** — semua kode baru di `server/views/studio/` 
   dan route baru `/studio/*`. TIDAK BOLEH mengubah `ar-viewer.html`, 
   `editor.html` (yang lama), atau upload flow yang sudah ada, sampai 
   dinyatakan eksplisit oleh saya untuk digabung.
2. **Tidak ada scope creep** — kerjakan HANYA apa yang diminta di fase yang 
   sedang berjalan. Ide fitur tambahan boleh dicatat di file terpisah 
   (`ide-tambahan.md`), TIDAK dikerjakan tanpa izin eksplisit.
3. **Bukti visual wajib** — screenshot browser asli tiap fase selesai, bukan 
   cuma laporan teks/curl.
4. **Berhenti & tunggu konfirmasi** di akhir tiap fase.

---

## FASE 0: Arsitektur & Schema (Fondasi, Belum Ada UI)

- Tentukan **scene JSON schema** — struktur data untuk menyimpan komposisi 
  scene (daftar objek, tipe tiap objek, transform position/rotation/scale, 
  properti khusus per tipe objek)
- Contoh schema kasar (agent boleh sempurnakan):
  ```json
  {
    "sceneId": "...",
    "objects": [
      {
        "id": "obj1", "type": "model", "src": "/assets/burger.glb",
        "position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1]
      },
      {
        "id": "obj2", "type": "text", "content": "Halo",
        "position": [0,1,0], "rotation": [0,0,0], "scale": [1,1,1],
        "color": "#ffffff"
      },
      {
        "id": "obj3", "type": "light", "lightType": "point",
        "color": "#ffffff", "intensity": 1, "position": [0,2,0]
      }
    ]
  }
  ```
- Simpan schema ini di file baru `server/data/scenes.json` (TERPISAH dari 
  `assets.json` yang sudah ada, supaya tidak bentrok)
- Setup route dasar `/studio` yang menampilkan halaman kosong dulu (belum 
  ada canvas), cuma untuk pastikan routing jalan

## FASE 1: Canvas 3D Dasar (three.js, Grid Floor, Kamera Orbit)

- Setup three.js scene kosong di `/studio`: grid floor, kamera orbit 
  (OrbitControls), lighting default minimal (biar tidak gelap total)
- Belum ada objek yang bisa ditambah — cuma pastikan canvas render dengan 
  benar, kamera bisa di-drag/zoom
- Bukti: screenshot canvas 3D kosong dengan grid, kamera bisa diputar

## FASE 2: Panel Objek + Tambah Model 3D

- Sidebar kiri: daftar tipe objek (mulai dari "3D Model" saja dulu, tipe 
  lain menyusul di fase berikutnya)
- User bisa pilih file .glb yang sudah pernah diupload (dari daftar asset 
  yang sudah ada di `assets.json`) untuk ditambahkan ke scene
- Objek yang ditambah muncul di scene (posisi default 0,0,0) DAN muncul di 
  list "Objects" di sidebar
- Bukti: screenshot model 3D berhasil ditambah & muncul di canvas + sidebar

## FASE 3: Transform Gizmo + Properties Panel

- Klik objek di canvas/sidebar → muncul gizmo (panah untuk translate, 
  lingkaran untuk rotate, kotak untuk scale) — three.js sudah punya 
  `TransformControls` bawaan, pakai itu, jangan bikin dari nol
- Panel kanan "Properties": tampilkan & bisa edit angka position/rotation/
  scale objek yang dipilih secara manual (selain drag gizmo)
- Bukti: screenshot gizmo aktif di objek terpilih, drag gizmo mengubah 
  posisi objek secara visual

## FASE 4: Tipe Objek Tambahan — Text & Shapes

- Text: pakai `CSS2DRenderer`/`CSS3DRenderer` three.js atau `TextGeometry`, 
  tentukan mana yang lebih cocok untuk kebutuhan AR nanti — jelaskan 
  trade-off ke saya SEBELUM implementasi
- Shapes: primitives dasar (box, sphere, cylinder, plane) dengan warna 
  solid, bisa ditambah dari sidebar sama seperti 3D Model
- Bukti: screenshot text & shape berhasil ditambah, bisa di-gizmo juga

## FASE 5: Image & Video sebagai Objek

- Image: plane dengan texture dari file gambar yang diupload
- Video: plane dengan `VideoTexture` three.js, ada kontrol play/pause dasar
- Perlu endpoint upload baru untuk gambar/video (belum ada di sistem 
  sekarang, yang ada baru upload .glb/.usdz)
- Bukti: screenshot image & video muncul di scene sebagai objek

## FASE 6: Light Source sebagai Objek yang Bisa Diatur

- Tambah point light / directional light / ambient light dari sidebar
- Properties panel bisa atur warna & intensity
- Bukti: screenshot perubahan lighting terlihat nyata di objek lain dalam 
  scene (bukan cuma light muncul sebagai objek kosong)

## FASE 7: Simpan & Muat Scene (Persistensi)

- Tombol "Save" menyimpan seluruh scene graph (semua objek + transform) ke 
  `scenes.json` sesuai schema Fase 0
- Reload halaman `/studio/:sceneId` harus memuat ulang scene persis seperti 
  terakhir disimpan
- Bukti: save scene, refresh browser, scene termuat identik

## FASE 8: AR Playback untuk Scene Multi-Objek

**Ini fase paling kritis secara teknis.** `<model-viewer>` TIDAK BISA dipakai 
untuk render scene custom multi-objek. Dua opsi (agent WAJIB jelaskan 
trade-off, saya yang putuskan sebelum eksekusi):

- **Opsi A**: AR viewer baru ditulis pakai **WebXR API langsung + three.js** 
  (bukan model-viewer), baca `scenes.json`, render semua objek dalam mode AR. 
  Lebih fleksibel tapi effort tinggi, dan WebXR punya keterbatasan dukungan 
  browser (terutama iOS Safari yang historisnya lemah WebXR support — CEK 
  status terbaru sebelum asumsi, jangan asal klaim)
- **Opsi B**: scene di-"bake"/export jadi SATU file .glb gabungan (merge 
  semua objek jadi satu model), lalu tetap pakai `<model-viewer>` yang 
  sudah terbukti jalan. Lebih terbatas (video/audio interaktif sulit di-bake 
  jadi glb statis) tapi jauh lebih reliable & konsisten dengan yang sudah ada

## FASE 9: UI Preview & Publish (Meniru Tampilan MyWebAR)

- Tombol "Preview" (lihat scene tanpa publish) dan "Publish" (generate 
  QR code baru khusus untuk scene ini, terpisah dari sistem single-model 
  yang lama)
- Baru di fase ini print-card & QR system disentuh lagi — dan harus jelas 
  dibedakan: QR untuk single-model (`/ar/:id`) vs QR untuk scene 
  (`/studio/view/:sceneId`), JANGAN dicampur/menimpa sistem lama

## FASE 10: End-to-End Testing

- Test bikin scene dengan minimal 3 jenis objek berbeda (model + text + 
  light, misalnya), publish, scan QR, verifikasi AR menampilkan semua 
  objek dengan benar di HP asli (Android & iOS)
- Bukti: screenshot/video dari HP asli

---

## Yang TIDAK Termasuk (Supaya Realistis)

Beberapa fitur MyWebAR sengaja TIDAK direplikasi karena butuh infrastruktur 
di luar scope project ini (server processing berat, storage besar, dsb) — 
kalau nanti diperlukan, dibahas terpisah:
- Curved image tracking (label botol melengkung)
- Face filter/try-on
- Object tracking (kenali benda fisik real-world)
- Analytics/dashboard (sudah disepakati di awal: TIDAK diperlukan)
- E-commerce (Buy Now button, dsb)

---

## Cara Mulai

Jangan kasih semua roadmap ini ke agent sekaligus. Mulai HANYA dari FASE 0 
dan FASE 1 dulu, minta konfirmasi, baru lanjut satu-satu. Prompt untuk FASE 
0-1 ada di dokumen terpisah — kabari saya kalau siap mulai, saya buatkan.
