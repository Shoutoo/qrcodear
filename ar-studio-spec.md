# AR Studio — Spesifikasi Final: 3D View + AR Tunggal (Marker-based)

> **Status: LOCKED.** Semua keputusan di dokumen ini sudah final hasil diskusi dengan pemilik proyek. Eksekusi langsung tanpa menanyakan ulang ke user. Jika ada ambiguitas implementasi teknis kecil yang tidak dicakup di sini, pilih opsi yang paling konsisten dengan prinsip di bagian "Keputusan Final" dan lanjutkan.

## Konteks

Proyek ini adalah penyempurnaan sistem AR yang sudah ada (sebelumnya disebut FASE C), bukan proyek baru. Referensi acuan kualitas adalah Assemblr EDU, tapi scope sudah disederhanakan dari rencana awal (FASE R9 Unity dibatalkan, tidak perlu app native).

Sistem lama saat ini:
- Route `/ar/:id` pakai `<model-viewer>` — render 3D biasa, tanpa AR, ini yang disebut mode **3D View**.
- Ada sistem QR yang sudah dicetak di kartu fisik (print card), yang saat ini fungsinya sebagai link biasa menuju halaman AR.
- Sempat ada eksperimen WebXR tap-to-place (markerless, plane detection) tapi ini **dihentikan** karena tidak bisa konsisten di semua device (WebXR cuma jalan di Android Chrome, tidak ada di Safari iOS).

## Keputusan Final (jangan diubah tanpa konfirmasi eksplisit dari user)

1. **Hanya 2 mode**: `3D View` dan `AR` (satu mode AR saja, bukan markerless + marker-based terpisah).
2. **Mode AR = marker-based saja**, menggunakan **MindAR.js** (library open-source, berbasis kamera + computer vision di JS, TIDAK pakai WebXR Device API, TIDAK pakai ARKit/QuickLook, TIDAK pakai SDK berbayar seperti 8th Wall/Zappar). Alasan: ini satu-satunya pendekatan yang bisa berjalan identik di Android, iOS, dan desktop tanpa bercabang kode/behavior per platform.
3. **Model 3D di mode AR HARUS persis sama** dengan model 3D yang dipakai di mode 3D View (`<model-viewer>`) — satu file/asset sumber yang sama, jangan bikin versi model terpisah untuk AR. Kalau ada optimasi ukuran/performa untuk AR, lakukan lewat kompresi/LOD dari file yang sama, bukan bikin model baru yang berbeda secara konten.
4. **QR yang dipakai adalah QR yang sudah ada di print card fisik** — jangan generate QR baru. QR ini bersifat **statis/permanen**: sekali dicetak, harus tetap valid dan bisa di-scan selamanya, tidak boleh ada mekanisme yang membuatnya expired atau berubah.
5. **Marker untuk tracking MindAR = gambar kartu print secara keseluruhan** (QR + elemen visual/desain lain yang sudah ada di kartu tersebut), bukan QR polos. QR sendirian terlalu repetitif/kurang feature-point untuk tracking yang stabil, tapi karena kartu print biasanya sudah punya elemen visual lain di sekitar QR (judul, gambar, layout), itu SUDAH CUKUP untuk dijadikan seluruh area kartu sebagai target gambar MindAR — tidak perlu redesain kartu atau bikin marker tambahan.
6. Tampilan/rendering AR disesuaikan dengan ekosistem masing-masing platform (Android Chrome / iOS Safari / browser desktop) — beda browser engine (Blink vs WebKit) punya karakteristik performa dan izin kamera yang beda, jadi lakukan penyesuaian UX teknis (permission flow, fallback pesan error, tuning performa render) per ekosistem — TAPI teknologi inti (MindAR.js) dan behavior fungsional harus tetap satu kode yang sama, bukan implementasi terpisah per platform.

## Arsitektur

| Mode | Teknologi | Sumber aset | Device |
|---|---|---|---|
| 3D View | `<model-viewer>` (sudah ada, tidak diubah) | Model 3D asli project | Semua |
| AR | MindAR.js (image tracking) | Model 3D **sama** dengan 3D View + gambar kartu print sebagai target marker | Semua (Android/iOS/desktop dengan kamera) |

## Alur Pengguna (User Flow)

1. User scan QR di kartu print pakai kamera HP biasa (native camera app atau browser) → redirect ke halaman project (behavior ini sudah ada, tidak berubah).
2. Di halaman project, user pilih mode: `3D View` atau `AR`.
3. Jika pilih `AR`: browser minta izin kamera → user arahkan kamera ke kartu print fisik yang sama → MindAR mendeteksi gambar kartu sebagai marker → model 3D (identik dengan yang di 3D View) muncul menempel di atas kartu, mengikuti posisi/orientasi kartu secara real-time selama kartu ada di frame kamera.

## Requirement Detail per Komponen

### 1. 3D View
- Tidak ada perubahan fungsional. Pastikan tetap jadi sumber tunggal file model 3D yang direferensikan oleh mode AR.

### 2. Mode AR (MindAR.js)
- Integrasikan MindAR image-tracking module.
- Load model 3D dari path/aset yang **sama persis** dengan yang dipakai `<model-viewer>` di 3D View (satu sumber data, jangan duplikasi).
- Anchor objek AR ke tracked image (kartu), scale & posisi default disesuaikan supaya proporsional terhadap ukuran kartu fisik.
- Objek AR hilang/berhenti render saat kartu keluar dari frame kamera, muncul kembali saat kartu terdeteksi lagi.

### 3. Pipeline Marker/Target Image
- Untuk tiap project/kartu yang sudah ada, ambil gambar digital kartu print (desain lengkap, bukan cuma QR) sebagai source image.
- Compile source image tersebut jadi target file MindAR (`.mind`) menggunakan MindAR image target compiler.
- Proses ini one-time per kartu — begitu `.mind` file dibuat, tidak perlu digenerate ulang kecuali desain kartu berubah.
- QR di dalam kartu TIDAK diubah/diganti — tetap statis seperti yang sudah dicetak.

### 4. Penyesuaian per Ekosistem Device
- Deteksi platform (user agent / feature detection) untuk menyesuaikan hal-hal non-fungsional: alur permintaan izin kamera, pesan fallback jika kamera tidak tersedia/ditolak, tuning resolusi kamera/render untuk performa.
- Behavior fungsional (deteksi marker, anchor objek, render model) tetap satu implementasi yang sama untuk semua platform — TIDAK ada cabang WebXR vs QuickLook vs library lain.

## Yang TIDAK termasuk scope (Non-goals)

- Markerless AR (taruh objek bebas di ruang/lantai kosong tanpa marker) — **tidak dilanjutkan**, digantikan sepenuhnya oleh marker-based.
- WebXR Device API — tidak dipakai lagi.
- ARKit / Apple QuickLook / file USDZ — tidak dipakai.
- SDK AR berbayar (8th Wall, Zappar, dsb) — tidak dipakai.
- App native Android/iOS (FASE R9 Unity) — dibatalkan, semua tetap berbasis web.
- Generate QR baru — dilarang, QR yang ada di kartu print harus tetap dipakai apa adanya.

## Acceptance Criteria

- [ ] Mode `3D View` tetap berfungsi seperti sebelumnya, tanpa regresi.
- [ ] Mode `AR` bisa dibuka dan berjalan di Android Chrome, iOS Safari, dan browser desktop dengan kamera, dengan behavior yang identik (bukan implementasi berbeda per platform).
- [ ] Model 3D yang muncul di mode AR identik (file/aset sama) dengan yang tampil di mode 3D View.
- [ ] Marker yang dikenali adalah gambar kartu print utuh (bukan QR polos), dan QR di kartu tetap berfungsi sebagai link seperti sebelumnya tanpa perubahan.
- [ ] Tidak ada QR baru yang digenerate untuk kebutuhan AR — kartu print yang sudah ada tetap valid selamanya.
- [ ] Objek AR ter-anchor stabil ke kartu dan mengikuti gerakan/orientasi kartu secara real-time.
