# Prompt untuk Antigravity: Perbaikan Detail SEMUA 24 Model Prosedural (FASE F2.1 — Revisi Tegas)

> Tempel isi file ini ke Antigravity. Project: AR Edu QR (qrcodear).
> Ini REVISI dari prompt FASE F2.1 sebelumnya. Lampirkan juga
> `PROMPT-ANTIGRAVITY-fix-model-per-slot-render.md` (versi revisi) di
> sesi yang sama supaya konteks penuh.
>
> **Kenapa direvisi**: percobaan pertama FASE F2.1 sudah mengganti
> geometri Ular jadi 1 tabung menyatu (`TubeGeometry`) — secara teknis
> sudah "menyatu", TAPI bentuk kurvanya masih berupa **lilitan
> melingkar rapat menyerupai tumpukan tali/donat**, BUKAN bentuk khas
> ular yang dikenali orang awam (tubuh memanjang yang meliuk pelan
> berbentuk S/melengkung terbuka di atas tanah, kepala terangkat
> sedikit di satu ujung). Screenshot kedua dari user mengonfirmasi ini
> masih belum terbaca sebagai "ular" walau sudah 1 bentuk kontinyu.
>
> **Perubahan permintaan penting**: sebelumnya perbaikan dibagi
> batch berdasarkan prioritas ("yang paling parah dulu"). User
> sekarang minta SEMUA 24 spesies dikerjakan dengan tingkat detail
> tinggi yang sama — bukan cuma yang paling rusak yang diperbaiki,
> sisanya dibiarkan seadanya. Jadi checklist "sudah lumayan" dari
> FASE F2.1a TIDAK BERLAKU LAGI sebagai alasan untuk skip — semua 24
> tetap wajib melewati standar detail yang sama di bagian 1 & 2 di
> bawah.

---

## 0. Kenapa Bentuk Ular Masih Salah (analisis dari screenshot ke-2)

Tabung yang dipakai sekarang kemungkinan dibangun dari `CatmullRomCurve3`
dengan titik-titik kontrol yang membentuk LINGKARAN TERTUTUP atau
spiral rapat (looping ke diri sendiri berkali-kali di area sempit) —
hasilnya terlihat seperti tali digulung, bukan tubuh yang meliuk maju
ke satu arah.

**Yang benar**: kurva tubuh ular harus berupa jalur TERBUKA (bukan
loop tertutup) yang membentang dari kepala ke ekor dengan 2-3 lengkungan
S yang LEBAR dan LANDAI (bukan lilitan sempit berulang), sepanjang
permukaan datar (mendekati horizontal, dengan sedikit variasi tinggi
kalau mau kesan meliuk 3D), dan **total panjang jalurnya harus jauh
lebih panjang dari lebar area yang ditempatinya** (rasio memanjang khas
ular, bukan menggerombol dalam radius kecil).

---

## 1. ATURAN KERJA — WAJIB DIIKUTI (berlaku untuk SEMUA 24 spesies, tanpa kecuali)

1. **Tidak ada lagi pembagian "kritis vs tidak kritis".** Semua 24
   model — termasuk yang sebelumnya dianggap "sudah lumayan" di audit
   FASE F2.1a — WAJIB dikerjakan ulang/diperhalus sampai memenuhi
   standar detail yang sama di bagian 2.
2. **Standar kelulusan per model**: tunjukkan screenshot dari MINIMAL
   2 sudut berbeda (depan-samping, atau isometrik + samping), dan
   model harus lolos tes ini: **"kalau nama labelnya disembunyikan,
   apakah orang awam masih bisa langsung menyebut nama hewan/tumbuhan
   ini dengan benar hanya dari bentuknya?"** Kalau jawabannya
   meragukan, iterasi lagi — jangan lanjut ke spesies berikutnya dulu.
3. **Untuk bentuk tubuh memanjang (ular, ulat, udang, belut-like)**:
   - Kurva jalur (`CatmullRomCurve3`) HARUS berupa jalur terbuka
     (bukan loop tertutup), titik awal dan akhir jelas berbeda jauh
     posisinya (kepala vs ekor).
   - Maksimal 2-3 lengkungan S yang landai sepanjang jalur — HINDARI
     lengkungan tajam berulang dalam radius kecil (itu yang bikin
     kelihatan "kumpulan lilitan/donat").
   - Radius tabung mengecil bertahap dari leher ke ujung ekor
     (`TubeGeometry` mendukung radius custom via fungsi radius per-
     segmen, atau scaling manual tiap ring vertex).
   - Kepala: sedikit lebih lebar dari leher, TERANGKAT sedikit dari
     permukaan tanah (elevasi Y lebih tinggi di ujung kepala) untuk
     kesan "waspada", bukan rata menempel tanah semua.
   - Total panjang jalur (bentangan ujung-ke-ujung) harus terlihat
     jelas MEMANJANG dibanding lebar/tinggi keseluruhan model — cek
     bounding box: dimensi terpanjang harus jauh lebih besar dari 2
     dimensi lainnya.
4. **Untuk SEMUA spesies lain (bukan cuma yang tubuh memanjang)**:
   berlaku detail minimum yang sama ketatnya seperti di tabel bagian
   2 prompt sebelumnya (kaki jelas & di posisi anatomis benar, sayap
   terbentang lebar untuk burung, sirip dorsal mencolok untuk hiu,
   kanopi besar untuk pohon, dst) — TIDAK ADA yang boleh dilewati
   dengan alasan "sudah cukup jelas".
5. **Proses kerja per spesies**: bangun → render dari 2 sudut → uji
   sendiri dengan pertanyaan di poin 2 → kalau ragu, iterasi lagi
   SEBELUM lapor ke saya. Baru setelah semua 24 lolos uji internal,
   kumpulkan semua screenshot jadi 1 laporan.
6. **Laporkan progres per beberapa spesies** (boleh kelompokkan
   5-6 spesies per laporan supaya saya bisa review bertahap, TAPI
   tanpa ada yang di-skip) — bukan sekaligus 24 di akhir tanpa
   checkpoint sama sekali.
7. **Isolasi scope** — tetap hanya mengubah geometri prosedural per
   spesies, tidak mengubah sistem publish/bake/viewer/struktur data
   di luar keperluan.
8. Kalau ada spesies yang setelah berkali-kali iterasi tetap sulit
   dibuat cukup jelas HANYA dari primitif Three.js, laporkan dengan
   screenshot hasil terbaik + jelaskan kesulitannya — jangan
   dipaksakan asal jadi.

---

## 2. Checklist Detail Wajib per Kategori Bentuk Tubuh

Gunakan ini sebagai checklist SEBELUM screenshot final tiap spesies
(centang tiap poin secara internal sebelum lapor):

**Reptil/tubuh memanjang tanpa kaki** (Ular):
- [ ] Kurva jalur terbuka, bukan loop tertutup
- [ ] Maks 2-3 lengkungan landai, tidak ada lilitan rapat berulang
- [ ] Radius mengecil dari leher ke ekor
- [ ] Kepala terangkat sedikit dari tanah, sedikit lebih lebar dari leher
- [ ] Proporsi memanjang jelas terlihat di bounding box

**Serangga/artropoda berkaki banyak** (Belalang, Ulat, Udang):
- [ ] Segmentasi tubuh terlihat menyatu (bukan renggang berjarak)
- [ ] Kaki/kaki lompat/antena terlihat jelas sebagai bagian terpisah menonjol

**Amfibi/mamalia berkaki empat** (Katak):
- [ ] 4 kaki jelas menempel di bawah badan, posisi anatomis benar
- [ ] Proporsi kaki belakang vs depan sesuai (belakang lebih besar untuk katak)

**Ikan/hewan air torpedo** (Ikan Kecil, Ikan Besar, Hiu):
- [ ] Bentuk torpedo menyatu (lebar tengah, meruncing ujung)
- [ ] Sirip dorsal & ekor terlihat jelas menonjol, bukan tempelan datar tipis
- [ ] Untuk Hiu: sirip dorsal harus mencolok/tinggi sebagai ciri khas

**Burung/hewan bersayap** (Elang, Burung):
- [ ] Sayap terbentang LEBAR (bukan tonjolan kecil), proporsional dengan badan
- [ ] Kepala terpisah jelas dari badan, ada paruh menonjol
- [ ] Ekor kipas terlihat

**Tumbuhan** (Rumput, Padi, Pohon, Alga):
- [ ] Proporsi batang vs daun/kanopi masuk akal (kanopi Pohon harus jelas lebih besar dari batangnya)
- [ ] Untuk Padi: bulir menunduk terlihat di ujung batang

**Decomposer/mikroba** (Jamur, Bakteri):
- [ ] Jamur: tudung payung jelas lebih lebar dari batang, ada sedikit lengkungan
- [ ] Bakteri: flagela terlihat menjulur jelas, bukan titik-titik acak

---

## 3. Daftar Fase Eksekusi

- **FASE F2.1-R1** — Perbaiki Ular DULU sampai benar-benar lolos
  checklist di atas (fokus khusus: hilangkan bentuk lilitan/donat,
  ganti jadi jalur S terbuka memanjang). Screenshot dari 2 sudut.
  **Berhenti, tunggu konfirmasi saya bahwa bentuk Ular sudah OK**
  sebelum lanjut — ini acuan standar untuk semua spesies lain.

- **FASE F2.1-R2** — Setelah Ular dikonfirmasi OK, kerjakan SEMUA 23
  spesies sisanya dengan standar yang sama, dikelompokkan per
  beberapa spesies per laporan (misal per kategori bentuk tubuh sesuai
  bagian 2). Tiap kelompok: screenshot 2 sudut per spesies, tunggu
  saya review sebelum lanjut kelompok berikutnya.

- **FASE F2.1-R3** — Setelah semua 24 dikonfirmasi, generate ulang
  thumbnail (kalau ada proses terpisah), lalu push ke GitHub dengan
  commit message yang jelas ("FASE F2.1-R: rebuild all 24 procedural
  models for recognizable silhouette accuracy").

---

## 4. Pengingat Penutup

- FASE F3/F4 (verifikasi canvas preset) dari prompt sebelumnya TETAP
  ditunda sampai seluruh FASE F2.1-R ini selesai dan dikonfirmasi.
- Prinsip: **kualitas dan keterbacaan bentuk lebih penting daripada
  kecepatan selesai.** Lebih baik Ular butuh 3-4 kali iterasi sampai
  benar, daripada dipaksakan "sudah lumayan" seperti kemarin.
- Mulai dari FASE F2.1-R1 (Ular) saja dulu, berhenti setelah itu dan
  tunggu konfirmasi saya sebelum lanjut ke spesies lain.
