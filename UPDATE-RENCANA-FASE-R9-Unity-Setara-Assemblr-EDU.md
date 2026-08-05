# Update Rencana: Perubahan Scope FASE R9 (Unity App → Setara Assemblr EDU)

> Dokumen ADDENDUM — tempel file ini di chat baru BARENG
> `RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md` (dokumen roadmap utama,
> sudah diupdate juga isinya) supaya AI baru langsung tahu ada
> perubahan scope terbaru tanpa perlu baca ulang detail riset dari
> awal. Dibuat karena eksekusi rewrite EduAR Platform **sudah berjalan
> sampai FASE R5 (Modul Auth & Role)** saat perubahan ini diputuskan —
> jadi perubahan ini TIDAK memengaruhi FASE R1-R8 yang sudah/sedang
> dikerjakan, HANYA mengubah scope FASE R9 (Unity app, belum mulai
> dieksekusi).

---

## 1. Status Eksekusi Saat Dokumen Ini Dibuat

- FASE R1 (fondasi backend NestJS+Prisma+Postgres+R2), FASE R2
  (migrasi data), FASE R3 (rebuild endpoint inti), FASE R4 (rewiring
  Studio & viewer lama) — **statusnya perlu dicek ke user** kalau
  lanjut di chat baru, dokumen ini tidak mengasumsikan sudah 100%
  selesai, cuma tahu FASE R5 sedang berjalan.
- **FASE R5 (Modul Auth & Role) — SEDANG BERJALAN** saat ini.
- FASE R6-R8 —juga sudah mulai.
- **FASE R9 (Unity app) — belum mulai sama sekali**, dan scope-nya
  baru saja direvisi total (isi dokumen ini).

**Perubahan di dokumen ini HANYA soal FASE R9.** Jangan diasumsikan
ada perubahan ke FASE R1-R8 yang sudah berjalan — kalau AI baru
menemukan indikasi FASE R1-R8 perlu disesuaikan gara-gara perubahan
R9 ini (kemungkinan kecil, tapi cek relasi Prisma), laporkan ke user
dulu sebelum mengubah apapun yang sudah berjalan.

---

## 2. Apa yang Berubah

Sebelumnya (versi awal dokumen roadmap), FASE R9 diputuskan **MVP**:
Unity app cuma jadi AR viewer sederhana yang mereplikasi fitur web
viewer (load & tampilkan preset ekosistem, load & tampilkan scene
Studio yang sudah dipublish) — TIDAK ada fitur create/edit di app,
dan TIDAK ada fitur AR eksklusif Unity.

**Keputusan baru**: FASE R9 direvisi jadi **full editor + AR viewer
setara Assemblr EDU / Assemblr Studio**. User eksplisit minta
"samakan seperti Assemblr EDU" — bukan cuma soal AR viewer-nya, tapi
juga sistem editor/interactivity-nya.

Dua keputusan pendukung yang sudah dikonfirmasi user:
1. **Unity app = full editor + viewer** (bukan viewer-only) — siswa/
   guru BISA membuat dan mengedit project AR langsung di app Unity,
   bukan cuma di Web Studio.
2. **Fitur classroom Assemblr TIDAK ikut masuk scope FASE R9** — share
   file/note, Topic slides siap pakai, Edu Kit library, AI 2D-ke-3D
   converter — semua ini SENGAJA ditunda ke fase terpisah nanti
   (bukan lupa, bukan dianggap tidak penting, cuma di luar scope R9).

---

## 3. Riset Fitur Assemblr EDU / Assemblr Studio (dasar keputusan)

**Tiga mode viewing** (bisa dikombinasikan lewat checkbox saat publish,
sama seperti sistem share Assemblr):
1. **3D View** — objek 3D tampil di layar tanpa kamera AR, muter/zoom
   manual.
2. **Marker-based AR** — scan QR code atau custom image marker →
   konten muncul tepat di atas marker, hilang kalau marker keluar
   frame kamera.
3. **Markerless AR (World Tracking)** — scan permukaan datar (lantai/
   meja) → reticle muncul mengikuti hasil deteksi → tap untuk menanam
   objek di titik itu → user bisa jalan mengelilingi objek 360°, bisa
   resize/reposisi objek kapan saja setelah ditanam.

**Sistem Interactivity** (trigger → target, tanpa coding):
- **Animate**: Move / Rotate / Scale / Play Animation (kalau model
  punya animasi bawaan) — mode playback: Once, Loop, PingPong, Clamp
  Forever, Default.
- **Visibility**: Hide / Show objek lain.
- **Jump Up**: pindah ke scene/slide lain, atau buka URL eksternal.
- **Media**: kontrol play/pause video, trigger sound effect.
- **On Scene Enter**: interactivity otomatis jalan begitu masuk scene
  (auto-trigger, tanpa perlu tap user).
- Tiap interactivity action punya pengaturan lanjutan: start time,
  duration, easing.

**Scene/Slide system**: satu project bisa berisi banyak scene (mirip
slide PowerPoint), tiap scene punya objek sendiri, transisi antar-scene
bisa jadi salah satu action interactivity (Jump Up).

**Elemen yang bisa ditaruh di scene**: 3D object, 2D image, teks 3D,
video/audio, dan **annotation** (label titik atau garis, warna
custom, selalu menghadap kamera/billboard).

**Transform tools di editor**: move, rotate, scale, duplicate, mirror,
copy objek ke scene lain, multi-select, delete, panel input transform
manual (angka presisi).

**Fitur classroom Assemblr EDU** (referensi, TAPI sengaja tidak masuk
scope R9 — lihat bagian 2): virtual classroom (share file/note/project
ke siswa), ratusan Topic slide siap pakai per jenjang kelas, ribuan
Edu Kit 3D teaching aids siap pakai, AI 2D-ke-3D image converter.

---

## 4. Model Prisma Tambahan untuk FASE R9

> Struktur BARU ini terpisah dari `Scene.data` (JSON blob) yang dipakai
> Web Studio lama — supaya format lama TIDAK disentuh sama sekali.
> `Scene` diberi field `format` untuk membedakan: project lama dari
> Web Studio tetap `LEGACY_BLOB` (baca/tulis lewat `data` Json apa
> adanya, TIDAK diubah), project baru dari Unity editor pakai
> `STRUCTURED` (baca/tulis lewat tabel relasional di bawah, supaya
> Unity bisa query per-objek/per-interactivity dengan presisi).

```prisma
model Scene {
  id              String       @id @default(uuid())
  project         Project      @relation(fields: [projectId], references: [id])
  projectId       String
  format          SceneFormat  @default(LEGACY_BLOB)
  data            Json?        // HANYA dipakai kalau format = LEGACY_BLOB (Web Studio lama — JANGAN diubah)
  order           Int          @default(0) // urutan slide, dipakai kalau format = STRUCTURED
  objects         SceneObject[]            // HANYA dipakai kalau format = STRUCTURED
  interactivities Interactivity[]
  published       PublishedExperience[]
  createdAt       DateTime     @default(now())
}

enum SceneFormat {
  LEGACY_BLOB   // dari Web Studio (`/studio`), format tidak berubah
  STRUCTURED    // dari Unity editor (FASE R9), relasional
}

model SceneObject {
  id          String   @id @default(uuid())
  scene       Scene    @relation(fields: [sceneId], references: [id])
  sceneId     String
  asset       Asset?   @relation(fields: [assetId], references: [id]) // untuk type MODEL_3D/IMAGE/VIDEO
  assetId     String?
  type        SceneObjectType
  textContent String?  // untuk type TEXT
  color       String?  // untuk type ANNOTATION_POINT/ANNOTATION_LINE
  positionX   Float    @default(0)
  positionY   Float    @default(0)
  positionZ   Float    @default(0)
  rotationX   Float    @default(0)
  rotationY   Float    @default(0)
  rotationZ   Float    @default(0)
  scaleX      Float    @default(1)
  scaleY      Float    @default(1)
  scaleZ      Float    @default(1)
  triggerOf   Interactivity[] @relation("TriggerObject")
  targetOf    Interactivity[] @relation("TargetObject")
  createdAt   DateTime @default(now())
}

enum SceneObjectType {
  MODEL_3D
  TEXT
  IMAGE
  VIDEO
  ANNOTATION_POINT
  ANNOTATION_LINE
}

// Sistem trigger → target Interactivity (lihat bagian 3)
model Interactivity {
  id              String   @id @default(uuid())
  scene           Scene    @relation(fields: [sceneId], references: [id])
  sceneId         String
  name            String?
  triggerObject   SceneObject @relation("TriggerObject", fields: [triggerObjectId], references: [id])
  triggerObjectId String
  targetObject    SceneObject @relation("TargetObject", fields: [targetObjectId], references: [id])
  targetObjectId  String
  actionType      InteractivityActionType
  params          Json     // detail spesifik per actionType, misal:
                            // MOVE: {direction, distance}
                            // ROTATE: {direction, degree}
                            // SCALE: {factor}
                            // PLAY_ANIMATION: {animationName, mode: "ONCE"|"LOOP"|"PINGPONG"|"CLAMP_FOREVER"}
                            // JUMP_SCENE: {targetSceneId, delaySeconds}
                            // OPEN_URL: {url}
                            // VIDEO_CONTROL: {action: "PLAY"|"PAUSE"}
                            // SOUND_EFFECT: {assetId}
  startTime       Float    @default(0)
  duration        Float    @default(0)
  easing          String?
  autoTrigger     Boolean  @default(false) // true = "On Scene Enter"
  createdAt       DateTime @default(now())
}

enum InteractivityActionType {
  MOVE
  ROTATE
  SCALE
  PLAY_ANIMATION
  HIDE
  SHOW
  JUMP_SCENE
  OPEN_URL
  VIDEO_CONTROL
  SOUND_EFFECT
}
```

**Update pada `PublishedExperience`** (model yang sudah ada di skema
utama) — tambah flag kombinasi mode viewing (meniru checkbox share
Assemblr):

```prisma
model PublishedExperience {
  // ...field yang sudah ada di skema utama tetap sama, ditambah:
  allow3DView       Boolean @default(true)
  allowMarkerAR     Boolean @default(true)
  allowMarkerlessAR Boolean @default(true)
  customMarkerUrl   String? // untuk mode Marker-based AR pakai custom image marker (bukan cuma QR)
}
```

**Catatan migrasi schema**: karena FASE R5 sedang berjalan dan
Prisma schema kemungkinan sudah punya beberapa migration history,
penambahan model/field di atas HARUS dijalankan sebagai **migration
baru** (`prisma migrate dev --name add-r9-structured-scene-models`),
BUKAN mengedit migration lama yang sudah pernah dijalankan.

---

## 5. FASE R9 — Sub-Fase Eksekusi (dipecah, checkpoint per sub-fase)

> FASE R9 tetap "Terpisah, boleh paralel/menyusul" setelah FASE R1-R8
> stabil — tapi kalau user memutuskan mulai lebih awal/paralel, tetap
> WAJIB checkpoint per sub-fase di bawah, jangan digabung jadi 1 commit
> raksasa.

- **R9.1 — Setup project & fondasi**: init project Unity + AR
  Foundation (kompatibel ARCore & ARKit), integrasi login pakai JWT
  yang sama dengan Web Studio/Admin (konsumsi endpoint Auth dari
  FASE R5), konsumsi REST API yang sama (Project/Asset dari FASE
  R1-R4). Belum ada fitur editor/AR sungguhan, cuma fondasi + login
  berhasil. Bukti: app Unity bisa login pakai akun yang sama dengan
  Web Studio, dan berhasil fetch daftar Project milik user tsb.

- **R9.2 — Backend: endpoint struktur project baru**: bangun endpoint
  CRUD untuk `Scene` (format `STRUCTURED`), `SceneObject`,
  `Interactivity` (skema bagian 4) — endpoint TERPISAH dari endpoint
  Studio lama yang pakai `Scene.data` blob, supaya format lama tidak
  tersentuh sama sekali. Tes tiap endpoint dengan Postman/curl dulu.

- **R9.3 — Unity Editor Mode**: insert 3D object/text/image/video/
  annotation ke scene, transform tools (move/rotate/scale/duplicate/
  mirror/delete/multi-select), manajemen scene/slide (tambah/duplikat/
  hapus/urutkan, set scene camera). Ini bagian "guru/siswa bikin
  project AR langsung di HP" — setara fitur Editor Assemblr Studio.

- **R9.4 — Sistem Interactivity**: UI untuk set trigger→target, semua
  action type (Animate: Move/Rotate/Scale/Play Animation dengan mode
  Once/Loop/PingPong/Clamp Forever; Visibility Hide/Show; Jump Up:
  switch scene/open URL; Media: video control/sound effect), pengaturan
  lanjutan (start time, duration, easing), toggle "On Scene Enter"
  auto-trigger, tombol preview.

- **R9.5 — AR Viewer 3 mode**: (1) 3D View — render scene tanpa kamera
  AR; (2) Marker-based AR — scan QR atau custom image marker (pakai
  `ARTrackedImageManager` di AR Foundation), konten menempel/hilang
  sesuai marker terdeteksi; (3) Markerless AR (World Tracking) — plane
  detection, reticle mengikuti permukaan, tap untuk menanam objek,
  jalan mengelilingi 360°, resize/reposisi kapan saja setelah ditanam.
  **Verifikasi fisik di device Android/iOS tetap HANYA boleh dilakukan
  user, bukan diklaim agent.**

- **R9.6 — Publish & sharing flow**: opsi centang mode viewing saat
  publish (`allow3DView`/`allowMarkerAR`/`allowMarkerlessAR`), generate
  QR/link yang SAMA dipakai lintas platform (baik dibuka lewat Unity
  app maupun browser web) — 1 project bisa diakses dari kedua sisi
  selama backend & format datanya kompatibel.

**Di luar scope R9** (ditunda ke fase terpisah nanti, misal FASE R11+
setelah R9 & R10 stabil): fitur classroom (share file/note ke siswa),
Topic slides siap pakai, Edu Kit library, AI 2D-ke-3D converter.

---

## 6. Kalau Lanjut di Chat Baru, Sampaikan Ringkasnya Begini

> "Saya lagi eksekusi rewrite besar AR Edu QR → EduAR Platform,
> sekarang statusnya sedang di FASE R5 (Modul Auth & Role). Sebelum
> ini saya juga baru merevisi scope FASE R9 (Unity app) — awalnya
> direncanakan MVP viewer-only, sekarang saya putuskan full editor +
> AR viewer setara Assemblr EDU/Assemblr Studio (3 mode viewing: 3D
> View/Marker AR/Markerless AR, plus sistem Interactivity trigger-
> target, scene/slide, annotation, transform tools) — TAPI fitur
> classroom Assemblr (share file/note, Topic slides, Edu Kit, AI
> 2D-ke-3D) sengaja tidak ikut, ditunda ke fase lain. Perubahan ini
> HANYA di FASE R9 (belum mulai eksekusi), FASE R1-R8 tidak
> terpengaruh."

Lalu lampirkan file ini plus `RENCANA-PERUBAHAN-BESAR-EduAR-Platform.md`
(dokumen roadmap utama, isinya sudah sinkron dengan perubahan di
dokumen ini).
