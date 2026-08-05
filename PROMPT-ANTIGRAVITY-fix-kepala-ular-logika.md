# Prompt Antigravity: Perbaikan Kepala Ular dengan Logika Konstruksi yang Benar (FASE F2.2a — Revisi ke-2)

> Tempel ke Antigravity. Project: AR Edu QR (qrcodear). Lanjutan dari
> `PROMPT-ANTIGRAVITY-fix-kepala-ular.md` — percobaan sebelumnya masih
> salah (1 mata tidak terlihat, ada bentuk merah aneh seperti tanda
> centang/panah bukan lidah, dan ARAH kepala salah). Prompt ini
> memberi LOGIKA KONSTRUKSI eksplisit, bukan cuma deskripsi visual,
> supaya tidak ditebak-tebak lagi oleh AI coding.

---

## 0. Analisis Masalah dari Screenshot Terbaru

1. **Arah kepala salah**: kepala tidak menghadap ke arah yang logis
   mengikuti ujung tabung badan (harusnya kepala "melanjutkan" arah
   badan di ujungnya, seperti kepala manusia melanjutkan arah leher).
   Sekarang kepala terlihat menekuk/menghadap arah yang tidak
   nyambung dengan lengkungan badan terakhir — kemungkinan rotasi
   kepala di-hardcode manual dengan angka sudut tebakan, bukan
   dihitung dari arah tangent kurva badan di titik ujung.
2. **Hanya 1 mata terlihat, tidak simetris**: kemungkinan kedua mata
   sebenarnya ada tapi diposisikan menempel di 1 sisi kepala saja
   (bukan diposisikan relatif terhadap sumbu kiri-kanan kepala yang
   benar), atau salah satu mata tertutup geometri kepala karena
   posisi Z/kedalamannya salah.
3. **Bentuk merah bukan lidah bercabang, tapi seperti tanda
   panah/centang bersudut tajam**: ini KEMUNGKINAN BESAR dibuat dari
   garis/plane bersudut tajam (`Shape`/`Line` dengan sedikit titik
   kontrol lurus), bukan dari 2 tabung/silinder tipis melengkung
   lembut yang menyatu di pangkal (bentuk garpu/fork yang natural).

**Kesimpulan**: masalah sebelumnya kemungkinan besar karena kepala &
elemen wajah dibangun dengan **posisi & rotasi manual yang ditebak
(hardcoded angka)**, bukan dihitung secara logis dari geometri badan
yang sebenarnya. Prompt ini memberi cara hitung yang benar.

---

## 1. LOGIKA KONSTRUKSI KEPALA — WAJIB DIIKUTI PERSIS

### 1.1 Orientasi kepala (arah hadap) — HITUNG, jangan tebak sudut manual

- Ambil kurva (`CatmullRomCurve3`) yang dipakai untuk `TubeGeometry`
  badan ular.
- Ambil **titik terakhir kurva** (`curve.getPointAt(1)`) sebagai posisi
  pangkal leher/dasar kepala.
- Ambil **arah tangent kurva di titik itu** (`curve.getTangentAt(1)`,
  vector3 hasil `.normalize()`) — ini adalah arah "ke mana ujung badan
  sedang menuju". Kepala HARUS diorientasikan mengikuti vector ini:
  sumbu depan kepala (arah moncong menghadap) = arah tangent ini.
- Gunakan `Object3D.lookAt()` dari posisi kepala ke arah
  `posisiKepala + tangentVector` (titik target di depan kepala searah
  tangent), supaya rotasi kepala otomatis benar mengikuti kurva —
  BUKAN nilai rotasi X/Y/Z yang diketik manual/ditebak.
- Setelah kepala menghadap arah tangent, baru tempatkan mata & lidah
  RELATIF terhadap sistem koordinat lokal kepala (child object dari
  grup kepala), supaya otomatis ikut orientasi yang benar, bukan
  dihitung ulang posisi world-nya secara manual.

### 1.2 Posisi mata — simetris kiri-kanan terhadap sumbu depan kepala

- Setelah grup kepala berorientasi benar (mengikuti 1.1), definisikan
  mata sebagai 2 child object dari grup kepala dengan posisi LOKAL:
  - Mata kiri: `position.set(-offsetX, offsetY, offsetZ)`
  - Mata kanan: `position.set(+offsetX, offsetY, offsetZ)`
  - (offsetX sama besar untuk keduanya, cuma beda tanda +/-, supaya
    otomatis simetris sempurna — JANGAN input 2 angka X berbeda yang
    ditebak manual)
  - offsetY: sedikit di atas garis tengah kepala (mata di bagian atas
    kepala, bukan tengah/bawah)
  - offsetZ: sedikit ke depan (ke arah moncong) dari pusat kepala,
    supaya mata terlihat di area depan-atas, bukan di belakang kepala
- **WAJIB test**: render dari sudut depan-agak-samping (3/4 view) dan
  pastikan KEDUA mata terlihat jelas, tidak ada yang tertutup geometri
  kepala. Kalau salah satu mata tidak kelihatan dari sudut wajar
  manapun, geser offsetZ lebih ke depan atau perbesar sedikit ukuran
  kepala di area itu.
- Tiap mata: bola hitam besar (pupil, isi hampir seluruh bola mata) +
  1 bola putih kecil (sclera tipis di baliknya BOLEH, opsional) + 1
  titik putih kecil (highlight) yang di-offset sedikit dari pusat
  pupil (bukan tepat di tengah) untuk kesan mengkilap.

### 1.3 Bentuk lidah bercabang — pakai kurva melengkung, BUKAN garis lurus bersudut

- Lidah dibangun dari geometri tipis memanjang (`TubeGeometry` radius
  sangat kecil, atau `CylinderGeometry` tipis) mengikuti kurva LURUS
  MELENGKUNG SEDIKIT (bukan garis patah/zigzag bersudut tajam) yang
  keluar dari titik ujung mulut, mengarah SEARAH dengan sumbu depan
  kepala (arah tangent yang sama seperti 1.1), sedikit menunduk ke
  bawah secara natural.
- Di ujung lidah, PECAH jadi 2 cabang pendek yang membentuk sudut kecil
  membuka (seperti huruf V/Y terbalik) — masing-masing cabang juga
  pakai tabung tipis melengkung lembut, BUKAN garis lurus tunggal
  bersudut tajam seperti tanda centang.
- Panjang lidah total: proporsional terhadap ukuran kepala (kira-kira
  30-50% dari panjang kepala), cukup terlihat jelas tapi tidak
  berlebihan.
- Warna merah cerah solid, material glossy sama seperti bagian lain.

### 1.4 Hapus elemen merah yang salah bentuk

- Elemen merah bersudut tajam seperti tanda panah/centang yang
  terlihat di screenshot terbaru: hapus total, ganti dengan lidah
  hasil konstruksi 1.3 di atas.

---

## 2. Aturan Kerja

1. **Isolasi scope ketat**: hanya ubah grup kepala (orientasi, mata,
   lidah). **JANGAN ubah badan/lilitan** yang sudah dikonfirmasi OK.
2. **Ikuti logika perhitungan di bagian 1 secara literal** — kalau ada
   bagian yang sebelumnya pakai angka rotasi/posisi hardcoded hasil
   tebakan, ganti dengan perhitungan berbasis vector/tangent seperti
   dijelaskan, supaya hasilnya konsisten dan tidak "untung-untungan".
3. **Render minimal 3 sudut** untuk verifikasi: (a) depan langsung
   menghadap moncong, (b) 3/4 dari samping-depan — pastikan KEDUA mata
   & lidah bercabang terlihat jelas di sudut ini, (c) full-body seperti
   sebelumnya untuk cek orientasi kepala terhadap badan secara
   keseluruhan (harus terlihat "menyambung logis" dari arah lengkungan
   terakhir badan, bukan menekuk aneh).
4. **Berhenti setelah ini, tunggu konfirmasi saya** sebelum diterapkan
   ke 23 spesies lain (FASE F2.2b) — dan catat logika 1.1-1.3 ini
   sebagai POLA UMUM yang juga berlaku untuk spesies lain yang punya
   kepala di ujung tubuh memanjang (misal Ulat, Udang) supaya tidak
   mengulang kesalahan yang sama nanti.

---

## 3. Pengingat

- Ini prompt fokus perbaikan kepala dengan logika konstruksi eksplisit
  — kalau Antigravity butuh konteks gaya visual penuh, rujuk lagi ke
  `PROMPT-ANTIGRAVITY-style-cute-3d-toy.md`.
- FASE F3/F4 (verifikasi canvas preset) tetap ditunda sampai kepala
  Ular final dikonfirmasi.
