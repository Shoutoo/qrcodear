# Roadmap Baru: Tap-to-Place AR, Publish Modal, & Studio Theme

Roadmap TERPISAH dari `roadmap-scene-editor-mywebar.md` sebelumnya. Fokus 
project ini: 3 hal spesifik yang diamati dari referensi MyWebAR — logika 
penempatan AR (tap to place), modal publish (QR/link/embed), dan tema visual 
studio yang lebih cerah.

**Hubungan dengan roadmap sebelumnya**: fitur di sini melengkapi/memperjelas 
detail **FASE 8 dan FASE 9** dari roadmap scene editor yang sudah ada. Kerjakan 
roadmap ini SETELAH FASE 0-7 scene editor selesai dan terbukti stabil, 
KECUALI bagian tema studio (bisa dikerjakan kapan saja karena murni styling, 
tidak bergantung fase lain).

---

## Prinsip Kerja (Wajib, Sama Seperti Roadmap Sebelumnya)

1. **Isolasi** — semua perubahan tetap di dalam scope `/studio` dan file 
   terkaitnya. JANGAN sentuh `ar-viewer.html`, `editor.html` lama, 
   `client/index.html` (dashboard utama), atau route/file lain di luar 
   scope studio — sudah pernah dilanggar sebelumnya, JANGAN terulang.
2. **Satu fase, satu waktu** — kerjakan berurutan, berhenti & tunjukkan 
   bukti visual tiap fase selesai, tunggu konfirmasi eksplisit sebelum 
   lanjut.
3. **Tidak ada penambahan di luar instruksi** — ide tambahan dicatat di 
   `ide-tambahan.md`, TIDAK langsung dikerjakan.
4. **Ingat batasan verifikasi fisik** — fase yang butuh device AR asli 
   (kamera, hit-test) HANYA bisa diverifikasi oleh user langsung di HP, 
   bukan oleh agent.

---

## FASE A: Tema Studio Lebih Cerah (Independen, Bisa Kapan Saja)

Ganti skema warna UI Studio dari tema gelap (kalau saat ini gelap) menjadi 
tema terang, mengikuti kesan visual referensi:
- Background utama: putih/abu sangat terang
- Sidebar kiri (Objects panel) & panel kanan (Properties): putih dengan 
  border tipis abu-abu muda
- Aksen warna: hijau/teal untuk tombol aktif (seperti "Content" terpilih di 
  referensi), tombol Publish berwarna hijau solid
- Toolbar atas (Undo/Redo/Save/Select/Rotate/dll di kanan atas canvas): 
  tetap kontras gelap di atas background terang, seperti di referensi
- Grid floor di canvas 3D: abu-abu terang dengan garis lebih halus (bukan 
  hitam pekat)

Ini murni CSS/styling, TIDAK mengubah logic apa pun. Bisa dikerjakan 
independen dari fase mana pun asal canvas studio dasar (FASE 1 roadmap 
sebelumnya) sudah ada.

**Bukti**: screenshot before/after tampilan studio.

---

## FASE B: Publish Modal (QR + Direct Link + Embed)

Prasyarat: FASE 7 (Simpan & Muat Scene) dari roadmap sebelumnya harus sudah 
selesai — publish butuh scene yang sudah tersimpan.

1. Tombol **"Publish"** di studio (pojok kanan atas, seperti referensi) 
   memicu proses:
   - Generate QR code baru khusus untuk scene ini (pakai library `qrcode` 
     yang sudah ada di project, arahkan ke URL scene, bukan URL model 
     tunggal lama)
   - Simpan status scene sebagai "published" di `scenes.json`

2. Modal popup setelah publish berhasil, isinya:
   - Pesan konfirmasi ("AR experience Anda sudah live!")
   - Preview QR code + tombol **Download QR** (format PNG, bisa tambah 
     opsi SVG kalau reliable)
   - **Direct Link**: URL langsung ke halaman AR scene (`/studio/view/:sceneId`), 
     dengan tombol copy-to-clipboard
   - **Embed code**: snippet `<iframe>` yang bisa ditempel di website lain, 
     dengan atribut `allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking"` 
     (penting untuk AR jalan di dalam iframe), dengan tombol copy

3. **Bedakan jelas** dari sistem lama: publish di studio ini untuk 
   scene multi-objek (`/studio/view/:sceneId`), TIDAK menimpa atau 
   bercampur dengan sistem `/ar/:id` (single model lama) yang sudah 
   established.

4. Cek: apakah route `/studio/view/:sceneId` untuk render hasil publish 
   (viewer AR khusus scene) sudah ada dari fase-fase sebelumnya (FASE 8 
   roadmap lama) — kalau belum, fase ini BERGANTUNG pada itu selesai 
   dulu, jangan dipaksa jalan duluan.

**Bukti**: screenshot modal publish lengkap dengan QR, link, dan embed 
code yang benar-benar ter-generate (bukan placeholder statis).

---

## FASE C: Tap-to-Place AR (Logika Penempatan Manual)

Ini fase paling teknis, terkait erat dengan **FASE 8 (AR Playback)** di 
roadmap sebelumnya — kemungkinan besar dikerjakan BERSAMAAN, bukan setelah.

**Alur yang diinginkan** (beda dari auto-placement `ar-placement="floor"` 
yang dipakai di sistem lama):

1. User buka link/scan QR hasil publish
2. AR terbuka, muncul instruksi di layar: **"Tap di layar untuk menempatkan 
   scene"** (bukan otomatis muncul begitu buka)
3. Selama belum di-tap, tampilkan **reticle/indikator** (biasanya lingkaran 
   atau kotak transparan) yang mengikuti hasil scan permukaan real-world 
   dari kamera (pakai **WebXR Hit Test API** — `XRHitTestSource`)
4. Setelah user tap di titik yang diinginkan, seluruh scene (semua objek 
   dari `scenes.json`) di-anchor ("ditempel") di titik itu, reticle hilang, 
   scene tidak berpindah lagi walau kamera digerakkan

**Implikasi teknis penting** (agent WAJIB konfirmasi ke user sebelum 
eksekusi):
- Fitur hit-test WebXR ini **HANYA jalan di Opsi A dari FASE 8 roadmap 
  sebelumnya** (WebXR API mentah + three.js). Kalau ternyata FASE 8 
  sebelumnya sudah terlanjur pakai Opsi B (bake jadi 1 glb + tetap pakai 
  `<model-viewer>`), fitur tap-to-place manual ini **TIDAK BISA 
  diimplementasikan** — `<model-viewer>` tidak expose kontrol hit-test 
  placement sedetail itu, cuma auto-place.
- Kalau situasinya begitu (FASE 8 lama sudah pakai Opsi B), agent HARUS 
  laporkan konflik ini ke user, JANGAN paksa workaround yang setengah-
  setengah. User yang akan putuskan: tetap di Opsi B (tanpa tap-to-place 
  manual) atau migrasi ke Opsi A demi fitur ini.
- Dukungan WebXR Hit Test di browser terbatas (kuat di Chrome Android/
  ARCore, riwayat dukungan lemah di iOS Safari) — cek status terbaru 
  sebelum implementasi, jangan asumsikan dari training data lama.

**Bukti**: WAJIB dites di HP Android asli oleh USER (bukan agent, sesuai 
batasan yang sudah disepakati) — reticle muncul mengikuti permukaan nyata, 
tap menempatkan scene dengan benar, scene tidak geser saat kamera digerakkan 
setelahnya.

---

## Urutan Eksekusi yang Disarankan

1. **FASE A (tema cerah)** — bisa dikerjakan paling awal, resiko rendah, 
   tidak bergantung apa pun
2. **FASE C (tap-to-place)** — sebaiknya diputuskan/dikerjakan BERSAMAAN 
   dengan FASE 8 roadmap lama (AR Playback), karena keduanya membahas 
   arsitektur AR playback yang sama — jangan kerjakan FASE 8 dulu baru 
   nyadar perlu rombak lagi untuk FASE C
3. **FASE B (publish modal)** — paling akhir, karena butuh scene viewer 
   (`/studio/view/:sceneId`) dari FASE C/8 sudah jalan dulu

## Catatan Penting Sebelum Mulai

- Roadmap ini TIDAK menggantikan `roadmap-scene-editor-mywebar.md` — 
  keduanya dipakai bersamaan, roadmap ini menambah DETAIL ke FASE 8 & 9 
  yang sebelumnya masih garis besar
- Jangan berikan roadmap ini ke agent sebelum FASE 0-7 dari roadmap lama 
  benar-benar selesai (kecuali FASE A yang independen)
- Ingatkan agent lagi soal aturan isolasi & larangan scope creep di awal 
  setiap sesi baru — pola pelanggaran sudah terjadi berkali-kali sebelumnya, 
  jangan asumsikan agent otomatis ingat dari sesi sebelumnya
