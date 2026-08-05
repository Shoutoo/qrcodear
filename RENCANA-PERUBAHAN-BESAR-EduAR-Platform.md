# Rencana Perubahan Besar: AR Edu QR → EduAR Platform

> Dokumen ini dibuat berdasarkan spesifikasi `PROJECT_DESIGN.md` (dari
> `EduAR_Project_Design.zip`) yang DISESUAIKAN dengan keputusan user
> dan kondisi project AR Edu QR yang sudah berjalan (Studio, fitur
> preset ekosistem rantai makanan, 24 model 3D, dll). Tempel/upload
> file ini ke Antigravity sebagai peta jalan (roadmap) sebelum mulai
> eksekusi bertahap.

---

## 1. Keputusan Arsitektur (hasil konfirmasi user)

| Area | Keputusan |
|---|---|
| AR sisi siswa | **Web tetap jalan** (scan QR di browser, `<model-viewer>`/WebXR seperti sekarang) **+ Unity native app dikembangkan TERPISAH** sebagai tambahan, bukan pengganti |
| Backend & Database | **Migrasi penuh** ke **NestJS + PostgreSQL + Prisma** (dari Node.js/Express + file JSON) |
| Web Creator Studio (`/studio`) | **DIPERTAHANKAN APA ADANYA** — UI & logic three.js/vanilla JS yang sudah ada TIDAK ditulis ulang ke React. Cuma lapisan data-nya (fetch/API call) disambungkan ke backend NestJS baru |
| Data existing | **WAJIB dimigrasikan penuh** ke PostgreSQL — tidak boleh ada yang hilang (24 model GLB ekosistem, `ecosystem-presets.json`, `ecosystem-model-library.json`, `ecosystem-published.json`, `scenes.json`, `assets.json`) |
| Status project lama selama rewrite | Bebas/boleh down sementara — belum dipakai orang lain |
| Strategi pengerjaan | **Rewrite besar sekaligus** sesuai skema baru (bukan incremental pelan-pelan) |
| Lokasi penyimpanan file | **Cloud storage — Cloudflare R2** (S3-compatible, tanpa biaya egress), bukan disk server |
| Strategi autentikasi | **JWT** (access token umur pendek + refresh token tersimpan di DB agar bisa di-revoke) — dipilih karena ada 3 klien beda platform (Unity, Web Studio, Admin Dashboard) |
| Hosting | **Tetap di Render** |
| Prioritas modul baru | **Quiz duluan**, dengan tabel `Lesson` dibuat sebagai skeleton di fase yang sama (karena `Quiz` punya relasi wajib ke `Lesson`) |
| Scope Unity app (FASE R9) | **MVP** — replikasi fitur AR viewer web saja (preset ekosistem + scene Studio), fitur AR khusus-Unity ditunda ke iterasi berikutnya |

> **Update:** kelima keputusan di atas (baris "Lokasi penyimpanan
> file" s/d "Scope Unity app") tadinya berstatus "belum diputuskan"
> di bagian 8 versi sebelumnya — sekarang sudah final dan dipindah ke
> sini. Bagian 8 di bawah sudah diperbarui jadi catatan histori.

---

## 2. Prinsip Utama yang WAJIB Dipegang Selama Rewrite

1. **Tidak ada fitur yang sudah jalan boleh hilang/rusak** tanpa
   persetujuan eksplisit user — termasuk: sistem lama `/ar/:id`, AR
   Studio `/studio` (FASE C WebXR tap-to-place), fitur Preset
   Ekosistem Rantai Makanan (6 slot siklus, bake-to-GLB, viewer
   `<model-viewer>`), dan seluruh 24 model 3D gaya "cute toy" yang
   baru selesai dipoles.
2. **UI/UX Studio yang sudah ada TIDAK disentuh** — perubahan hanya di
   lapisan komunikasi data (dulu `fetch('/api/...')` ke Express+JSON,
   sekarang `fetch('/api/...')` ke NestJS+Postgres). Kalau memang ada
   penambahan UI baru (misal untuk fitur lesson/quiz/auth), itu
   ditambahkan sebagai elemen BARU, bukan mengubah yang sudah ada.
3. **Migrasi data harus reversibel/aman** — sebelum proses migrasi
   dijalankan ke production, WAJIB ada backup penuh semua file JSON +
   folder `uploads/` yang ada sekarang.
4. **Satu fase, bukti hasil, tunggu konfirmasi** — walau strateginya
   "rewrite besar sekaligus", eksekusinya TETAP dipecah jadi fase
   teknis dengan checkpoint (lihat bagian 7), bukan 1 commit raksasa
   tanpa titik verifikasi.
5. **Verifikasi fisik AR di HP** tetap HANYA boleh dilakukan user,
   bukan diklaim oleh agent.
6. **Konflik desain wajib dilaporkan** ke user untuk diputuskan, bukan
   diputuskan sepihak oleh agent (termasuk hal-hal yang belum
   diputuskan di dokumen ini — lihat bagian 9).

---

## 3. Perbandingan Arsitektur Lama vs Baru

```
LAMA (saat ini)                         BARU (target rewrite)
─────────────────────                   ─────────────────────
Express (Node.js)                       NestJS (Node.js)
File JSON (server/data/*.json)          PostgreSQL + Prisma ORM
Tanpa autentikasi                       Auth + Role-based access
                                         (siswa / guru / admin)
Tanpa entitas User/Project/Lesson/Quiz  + Users, Projects, Lessons,
                                           Classes, Quiz (modul baru)
/studio (vanilla JS + three.js)         /studio (SAMA, UI tidak
  → panggil Express API                   diubah) → panggil NestJS API
/ar/:id (model-viewer)                  Tetap ada, disambungkan ke
                                         data dari Postgres
/ecosystem/view/:id (model-viewer)      Tetap ada, data dari Postgres
Tidak ada mobile app                    + Unity AR Foundation app
                                         (project terpisah, konsumsi
                                         REST API yang sama)
Tidak ada admin dashboard               + Admin Dashboard (web baru,
                                         React/Next.js — karena ini
                                         modul BARU, bukan modifikasi
                                         yang lama, jadi bebas pilih
                                         stack modern)
```

**Catatan penting**: karena Studio dipertahankan vanilla JS, sementara
Admin Dashboard adalah modul yang sama sekali baru — boleh pakai
React/Next.js untuk Admin Dashboard saja (sesuai spek zip untuk modul
baru), TANPA memaksa Studio ikut migrasi framework. Backend NestJS
yang sama melayani ketiganya (Studio lama, Admin Dashboard baru, dan
nanti Unity app).

---

## 4. Sketsa Skema Database (Prisma) — Gabungan Modul Lama + Baru

> Ini sketsa awal untuk didiskusikan/disesuaikan saat implementasi,
> bukan skema final yang kaku.

```prisma
model User {
  id                String   @id @default(uuid())
  name              String
  email             String   @unique
  password_hash     String
  role              Role     @default(STUDENT)
  // Skeleton untuk fitur lupa password — kolom disiapkan di FASE R1,
  // alur email reset penuh baru diimplementasi di FASE R5 (Auth).
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime @default(now())
  projects          Project[]
  classesTaught     Class[]  @relation("TeacherClasses")
  enrollments       ClassEnrollment[]
  quizAttempts      QuizAttempt[]
  refreshTokens     RefreshToken[]
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

// Strategi auth: JWT stateless (access token umur pendek, dibawa di
// header Authorization). Refresh token disimpan di sini supaya bisa
// di-revoke per-device (misal saat logout atau device hilang) —
// dibutuhkan karena ada 3 klien beda platform (Unity, Web Studio,
// Admin Dashboard) yang masing-masing pegang sesi sendiri.
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  device    String?  // label klien: "unity", "web-studio", "admin-dashboard"
  revoked   Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(uuid())
  title       String
  description String?
  creator     User     @relation(fields: [creatorId], references: [id])
  creatorId   String
  assets      Asset[]
  scenes      Scene[]
  lessons     Lesson[]
  createdAt   DateTime @default(now())
}

// Menggabungkan: assets.json (sistem lama) + object dalam scenes.json
// + ecosystem-model-library.json (jadi 1 tabel Asset dengan `type`)
model Asset {
  id              String    @id @default(uuid())
  project         Project?  @relation(fields: [projectId], references: [id])
  projectId       String?
  type            AssetType
  // File fisik disimpan di Cloudflare R2 (bukan disk server), agar
  // aman dari reset filesystem di Render saat redeploy/restart.
  modelUrl        String    // full public/CDN URL ke object R2
  storageKey      String?   // object key di bucket R2 (untuk delete/regenerate URL)
  textureUrl      String?
  label           String?
  ecosystem       String?   // khusus type ECOSYSTEM_MODEL: "darat"/"hutan"/"laut"/"sawah"
  role            String?   // khusus type ECOSYSTEM_MODEL: "produsen"/"konsumen_primer"/dst
  source          String?   // atribusi: "Poly Pizza", "Quaternius", "procedural", dst
  license         String?   // "CC0", "CC-BY", dll
  needsReview     Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

enum AssetType {
  LEGACY_SINGLE     // dari assets.json sistem /ar/:id lama
  STUDIO_OBJECT     // objek dalam scene Studio
  ECOSYSTEM_MODEL   // dari ecosystem-model-library.json
}

// Menggantikan scenes.json — data scene AR Studio (multi-objek)
model Scene {
  id          String   @id @default(uuid())
  project     Project  @relation(fields: [projectId], references: [id])
  projectId   String
  data        Json     // struktur scene yang sama persis seperti scenes.json sekarang
  published   PublishedExperience[]
  createdAt   DateTime @default(now())
}

// Menggantikan ecosystem-presets.json
model EcosystemPreset {
  id          String   @id @default(uuid())
  name        String   // "Darat", "Hutan", "Laut", "Sawah"
  slots       Json     // 6 slot: {role, label, assetId}[]
  published   PublishedExperience[]
  createdAt   DateTime @default(now())
}

// Menggantikan ecosystem-published.json (dan publish flow Studio lama)
model PublishedExperience {
  id           String   @id @default(uuid())
  type         PublishType
  sceneId      String?
  scene        Scene?           @relation(fields: [sceneId], references: [id])
  presetId     String?
  preset       EcosystemPreset? @relation(fields: [presetId], references: [id])
  bakedGlbUrl  String?          // untuk ecosystem: hasil bake GLTFExporter
  qrCodeUrl    String
  viewUrl      String
  createdAt    DateTime @default(now())
}

enum PublishType {
  STUDIO_SCENE
  ECOSYSTEM_PRESET
  LEGACY_SINGLE
}

model Lesson {
  id        String   @id @default(uuid())
  project   Project  @relation(fields: [projectId], references: [id])
  projectId String
  title     String
  content   String
  quizzes   Quiz[]
}

model Quiz {
  id            String   @id @default(uuid())
  lesson        Lesson   @relation(fields: [lessonId], references: [id])
  lessonId      String
  question      String
  options       Json     // array of string
  correctAnswer String
  attempts      QuizAttempt[]
}

model QuizAttempt {
  id          String   @id @default(uuid())
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  quizId      String
  student     User     @relation(fields: [studentId], references: [id])
  studentId   String
  answer      String
  isCorrect   Boolean
  attemptedAt DateTime @default(now())
}

model Class {
  id          String   @id @default(uuid())
  className   String
  teacher     User     @relation("TeacherClasses", fields: [teacherId], references: [id])
  teacherId   String
  enrollments ClassEnrollment[]
}

model ClassEnrollment {
  id        String @id @default(uuid())
  class     Class  @relation(fields: [classId], references: [id])
  classId   String
  student   User   @relation(fields: [studentId], references: [id])
  studentId String
}
```

---

## 5. Rencana Migrasi Data Existing → PostgreSQL

1. **Backup dulu**: copy penuh `server/data/*.json` dan `server/uploads/`
   ke lokasi terpisah sebelum migrasi apapun dijalankan.
2. **Buat 1 script migrasi terpisah** (misal `migrate-legacy-data.ts`)
   yang:
   - Baca `assets.json` → insert ke `Asset` dengan `type: LEGACY_SINGLE`.
   - Baca `scenes.json` → insert ke `Scene` (field `data` diisi JSON
     scene yang sama persis, TIDAK diubah strukturnya, supaya Studio
     yang sudah ada tetap bisa baca formatnya tanpa perlu adaptasi
     besar).
   - Baca `ecosystem-model-library.json` → insert ke `Asset` dengan
     `type: ECOSYSTEM_MODEL`, isi `ecosystem`, `role`, `source`,
     `license`, `needsReview` sesuai data asli.
   - Baca `ecosystem-presets.json` → insert ke `EcosystemPreset`,
     field `slots` mereferensikan `Asset.id` hasil migrasi di atas
     (bukan lagi path string langsung, tapi tetap simpan `label`).
   - Baca `ecosystem-published.json` → insert ke `PublishedExperience`
     dengan `type: ECOSYSTEM_PRESET`.
   - **File fisik (`.glb`, QR code, thumbnail) di `server/uploads/`
     WAJIB diunggah ulang ke bucket Cloudflare R2** sebagai bagian
     dari script migrasi ini (bukan tetap di disk server) — karena
     keputusan storage sudah final pindah ke R2. Untuk tiap file:
     upload ke R2 → simpan `storageKey` (object key) dan `modelUrl`
     (URL publik/CDN) hasilnya ke record `Asset` yang bersangkutan.
     File lokal di `server/uploads/` baru dihapus SETELAH verifikasi
     semua file ter-upload & bisa diakses dari R2 (jangan hapus
     duluan).
3. **Buat 1 akun User "legacy owner"** (role TEACHER) sebagai
   `creatorId` default untuk semua `Project`/`Asset`/`Scene` hasil
   migrasi yang sebelumnya tidak terikat ke user manapun (karena
   sistem lama tidak ada login) — supaya struktur relasi ke `User`
   tetap konsisten. Email/password akun ini dikomunikasikan ke user
   setelah migrasi (BUKAN di-hardcode credential lemah).
4. **Verifikasi pasca-migrasi**: hitung jumlah record tiap tabel,
   bandingkan dengan jumlah entry di file JSON asli — laporkan ke user
   kalau ada selisih sebelum lanjut ke fase berikutnya.

---

## 6. Rewiring Studio Lama ke Backend Baru

Karena Studio (UI & three.js logic) dipertahankan apa adanya, yang
perlu diubah HANYA lapisan pemanggilan API:

1. **Audit semua endpoint yang dipanggil Studio saat ini** (`fetch(...)`
   di `studio/index.html`, dan endpoint publish `/api/studio/publish/:id`,
   `/api/ecosystem/publish`, dst) — buat daftar lengkap.
2. **Bangun endpoint NestJS yang path & response shape-nya SAMA PERSIS**
   dengan endpoint Express lama (atau kalau terpaksa beda, buat
   adapter/wrapper di sisi frontend Studio yang minimal perubahannya)
   — supaya kode Studio existing tidak perlu dibongkar logic-nya,
   cukup ganti base URL/response mapping-nya saja.
3. **Uji tiap endpoint satu-satu**: create scene, load scene, publish
   scene, load preset ekosistem, publish ekosistem, generate QR — pastikan
   semua masih berfungsi persis seperti sebelum rewrite backend.
4. Kalau ada perbedaan struktur data yang TIDAK BISA dihindari (misal
   karena `id` sekarang UUID bukan nanoid, atau relasi butuh field
   tambahan), laporkan spesifik ke user sebelum mengubah kode Studio.

---

## 7. Daftar Fase Eksekusi

- **FASE R1 — Setup fondasi backend baru**: init project NestJS,
  setup PostgreSQL + Prisma, definisikan schema (bagian 4, sesuaikan
  bersama user kalau ada perubahan), jalankan migration Prisma
  pertama, **setup koneksi ke Cloudflare R2 (bucket + kredensial +
  helper upload/delete)**. Belum ada logic bisnis, cuma fondasi.
  Bukti: schema ter-generate, koneksi DB berhasil, test-upload 1 file
  dummy ke R2 berhasil.

- **FASE R2 — Migrasi data**: jalankan script migrasi (bagian 5) di
  environment development dulu (BUKAN langsung production), verifikasi
  jumlah data, laporkan hasil ke user.

- **FASE R3 — Rebuild endpoint API inti** (yang dipakai Studio &
  viewer lama): scenes, assets, ecosystem presets, ecosystem model
  library, publish flow, QR generation. Tes tiap endpoint dengan
  Postman/curl dulu sebelum disambungkan ke frontend.

- **FASE R4 — Rewiring Studio & viewer lama ke API baru** (bagian 6):
  sambungkan `/studio`, `/ar/:id`, `/ecosystem/view/:id` ke backend
  baru. Bukti: screenshot/demo semua alur existing (create scene,
  publish, scan QR, AR Studio FASE C, preset ekosistem) berfungsi
  normal dengan backend baru.

- **FASE R5 — Modul Auth & Role**: sistem login/register, **JWT**
  (access token + refresh token via tabel `RefreshToken`, bagian 4),
  role-based access (STUDENT/TEACHER/ADMIN), lindungi endpoint yang
  perlu (misal cuma TEACHER yang bisa publish scene). Alur lupa
  password (kirim email reset, validasi `resetToken`) diimplementasi
  penuh di fase ini juga — kolomnya sudah disiapkan sejak FASE R1.

- **FASE R6 — Modul baru: Quiz (prioritas) + skeleton Lesson**: karena
  Quiz jadi prioritas tapi punya relasi wajib ke `Lesson`, urutan
  kerja di fase ini: (1) buat tabel & endpoint CRUD `Lesson` versi
  skeleton dulu (cukup `title` + `project` terhubung, tanpa fitur
  authoring konten lengkap), (2) baru CRUD `Quiz` penuh terhubung ke
  Lesson tsb, (3) UI tambahan di Studio (elemen BARU, bukan mengubah
  UI lama) untuk guru membuat quiz. Authoring konten Lesson yang
  lebih lengkap (rich text/media) boleh menyusul di fase berikutnya
  kalau user minta, tidak wajib selesai di sini.

- **FASE R7 — Modul baru: Class Management**: guru bikin kelas,
  invite/assign siswa, siswa lihat kelas & progress quiz.

- **FASE R8 — Admin Dashboard** (React/Next.js, project/app terpisah):
  user management, moderasi konten, asset management, statistik.

- **FASE R9 — (Terpisah, boleh paralel/menyusul)**: inisiasi project
  Unity AR Foundation untuk mobile app, konsumsi REST API yang sama
  dari backend NestJS (auth, ambil project/lesson/quiz, load AR asset).
  **Scope v1 = MVP**: replikasi fitur AR viewer yang sudah ada di web
  saja (load & tampilkan preset ekosistem, load & tampilkan scene
  Studio yang sudah dipublish) — TIDAK ada fitur AR baru yang eksklusif
  hanya di Unity untuk versi awal ini. Ini tetap scope besar tersendiri
  — sebaiknya jadi dokumen rencana terpisah setelah FASE R1-R8 stabil.

- **FASE R10 — Cutover**: pindahkan environment production ke backend
  baru, matikan Express+JSON lama (setelah user konfirmasi semua
  fungsi sudah tervalidasi).

**Catatan**: walau strategi keseluruhan "rewrite besar sekaligus", tiap
FASE di atas tetap wajib checkpoint (bukti + konfirmasi user) sebelum
lanjut — supaya kalau ada yang salah arah, ketahuan lebih awal, bukan
di akhir setelah semua fase selesai.

---

## 8. Riwayat Keputusan (dulu "belum diputuskan", sekarang SUDAH FINAL)

> Status: **SELESAI DIPUTUSKAN**. Kelima poin di bawah ini tadinya
> berupa pertanyaan terbuka sebelum FASE R1 boleh mulai. Keputusan
> finalnya sudah dipindahkan ke tabel di bagian 1 dan diterapkan ke
> skema Prisma (bagian 4) & daftar fase (bagian 7). Bagian ini
> disimpan sebagai jejak histori diskusi, bukan lagi checklist aktif.

1. ~~Lokasi penyimpanan file~~ → **Cloud storage (Cloudflare R2)**.
   Alasan: disk server di Render tidak persisten lintas
   redeploy/restart tanpa fitur Persistent Disk berbayar (yang pun
   terikat 1 instance, tidak scalable) — lebih aman pindah sekarang
   sebelum asset bertambah banyak dari modul Lesson/Quiz.
2. ~~Strategi autentikasi~~ → **JWT** (access token pendek + refresh
   token di tabel `RefreshToken`, per-device, bisa di-revoke). Alasan:
   ada 3 klien beda platform (Unity, Web Studio, Admin Dashboard),
   JWT stateless lebih natural dibanding session-based untuk native
   app. Fitur lupa password: kolom skeleton disiapkan di FASE R1, alur
   penuh (email reset) diimplementasi di FASE R5.
3. ~~Hosting~~ → **Tetap di Render**.
4. ~~Prioritas modul baru~~ → **Quiz duluan**, dengan skeleton tabel
   `Lesson` dibuat di fase yang sama karena `Quiz` punya relasi wajib
   ke `Lesson` (lihat FASE R6 di bagian 7).
5. ~~Scope Unity app (FASE R9)~~ → **MVP**: replikasi fitur AR viewer
   web saja (preset ekosistem + scene Studio), tanpa fitur AR
   eksklusif Unity untuk versi awal.

---

## 9. Pengingat Penutup

- Dokumen ini adalah PETA JALAN — detail teknis tiap fase (nama
  endpoint spesifik, struktur folder NestJS, dsb) akan disusun lebih
  rinci per fase saat eksekusi, bukan sekaligus di sini.
- Prinsip dari project lama tetap berlaku: satu fase satu waktu,
  bukti visual/fungsional tiap fase, verifikasi fisik AR hanya oleh
  user, konflik/keputusan besar dilaporkan dulu bukan diputuskan
  sepihak.
- Bagian 8 sudah tuntas didiskusikan/diputuskan (lihat riwayat di
  atas) — **FASE R1 sudah boleh dieksekusi**. Agent tetap wajib
  berhenti setelah tiap fase dan tunggu konfirmasi user sebelum
  lanjut ke fase berikutnya.
