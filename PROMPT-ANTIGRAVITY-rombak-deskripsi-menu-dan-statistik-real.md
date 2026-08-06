# PROMPT untuk Antigravity: Rombak Deskripsi Tiap Menu + Aktifkan Indikator Statistik (Data Real)

## Konteks

Sekarang setiap menu di dashboard (Beranda & Analytics, AR Studio,
Kuis Interaktif, Unity Assemblr, Activity Log) kemungkinan pakai
header/hero card generik yang mirip-mirip semua menu (contoh yang
sudah ada di menu Beranda: badge "EduAR Platform Enterprise • NestJS
& PostgreSQL Active", judul "Platform Pembelajaran Augmented Reality &
Kuis Interaktif", deskripsi 1 paragraf, lalu 4 card statistik: Total
Scan QR, Tampilan AR, Baked GLB Ekosistem, Kuis Diselesaikan — yang
isinya masih "--" alias belum hidup/belum konek data asli).

Ada 2 masalah yang mau dibenahi:

1. Setiap menu butuh header/penjelasan **masing-masing sesuai
   fungsinya sendiri**, bukan template generik yang sama di semua
   menu.
2. 4 card statistik itu **harus hidup** — nampilin angka asli dari
   data project (bukan dummy/hardcode), dan formatnya harus
   diterapkan ke SEMUA menu yang relevan (statistik yang cocok dengan
   fungsi menu itu masing-masing, bukan cuma 4 angka yang sama
   ditempel di semua halaman).

## Tugas 1 — Rombak header/deskripsi tiap menu

Untuk tiap menu di navbar (Beranda & Analytics, AR Studio, Kuis
Interaktif, Unity Assemblr, Activity Log — cek juga kalau ada menu
lain yang belum kesebut), buat header/hero section dengan judul +
deskripsi singkat yang **spesifik ke fungsi menu itu**, dengan bahasa
yang beda tergantung siapa yang login:

- **Dashboard Siswa**: bahasa sederhana, kalimat pendek, kata-kata
  yang bisa dipahami anak SD (hindari istilah teknis kayak "GLB",
  "NestJS", "PostgreSQL", "WebXR" — ganti jadi bahasa sehari-hari,
  mis. "lihat hewan 3D lewat kamera HP", bukan "Tampilan AR"). Boleh
  pakai nada ceria/ajakan ("Yuk coba scan QR-nya!").
- **Dashboard Guru**: bahasa profesional tapi tetap jelas, boleh
  sebut istilah teknis fitur (Studio, preset ekosistem, kuis, dll)
  karena guru butuh paham fungsi manajemen (bikin kuis, lihat rekap
  nilai siswa, kelola preset), tapi tetap hindari jargon infrastruktur
  backend (NestJS/PostgreSQL) yang tidak relevan buat guru sehari-hari
  — itu boleh tetap muncul di badge kecil kalau memang sudah ada
  sebagai indikator status sistem, tapi jangan dominan di judul/body
  copy.

Tulis draft copy utk tiap menu (siapkan 2 versi: versi Siswa & versi
Guru) sebelum diimplementasi, supaya saya bisa review dulu kalau
Antigravity ragu-ragu dengan katanya — TAPI kalau kalimatnya jelas dan
sesuai arahan di atas, boleh langsung jalan tanpa nunggu approval
tambahan.

## Tugas 2 — Aktifkan indikator statistik jadi data real (BUKAN dummy)

### Aturan paling penting

**JANGAN hardcode angka apapun.** Kalau data belum ada/belum bisa
dihitung (misal karena fitur Quiz di FASE R6 belum diimplementasi),
tampilkan angka **0** (nol asli dari query kosong), BUKAN angka
dummy/contoh/placeholder yang keliatan seperti data asli padahal
karangan.

### Per statistik yang sudah ada di menu Beranda, ini sumber data yang harus dipakai:

1. **Total Scan QR** — hitung dari log/record event scan QR yang
   sungguhan terjadi (baik scan kartu model satuan maupun kartu
   preset ekosistem yang barusan ditambahkan di route `/print/*`).
   Cek dulu: apakah event scan ini SUDAH tercatat di suatu tempat
   (mis. tabel/log yang dipakai menu "Activity Log" yang sudah ada di
   navbar)? Kalau sudah ada infrastruktur logging di situ, REUSE —
   jangan bikin sistem tracking baru yang terpisah. Kalau scan QR
   belum pernah dicatat sama sekali, perlu ditambahkan pencatatan
   event-nya dulu (di endpoint yang menghandle akses AR viewer via
   QR), baru dihitung.
2. **Tampilan AR** — hitung dari jumlah kunjungan/pemakaian halaman AR
   viewer (baik `/ar/:id` sistem lama maupun viewer preset ekosistem),
   dari log yang sama kalau memungkinkan.
3. **Baked GLB Ekosistem** — hitung dari jumlah proses bake GLB
   ekosistem yang benar-benar sudah terjadi (mis. count file .glb
   hasil bake yang tersimpan, atau count record kalau prosesnya
   sudah dicatat sebagai event/history).
4. **Kuis Diselesaikan** — ini TERGANTUNG fitur Quiz FASE R6 yang
   BELUM diimplementasi. Untuk sekarang, siapkan query-nya (count
   dari tabel hasil kuis siswa) tapi WAJAR kalau hasilnya 0 karena
   belum ada data — itu 0 yang benar, bukan bug. JANGAN isi dummy
   angka biar keliatan ramai.

### Scope per menu

Statistik yang ditampilkan di tiap menu harus **relevan ke menu itu**
(bukan 4 angka sama ditempel di semua halaman):
- Menu **AR Studio**: statistik terkait pemakaian studio (jumlah scene
  dibuat, jumlah objek/model dipakai, dll — sesuaikan sama data yang
  tersedia).
- Menu **Kuis Interaktif**: statistik terkait kuis (jumlah soal
  tersedia, jumlah siswa yang sudah mengerjakan, rata-rata skor —
  kalau FASE R6 belum jalan, ini juga wajar tampil 0/kosong dengan
  pesan "Belum ada data" bukan angka fiktif).
- Menu **Unity Assemblr**: kalau fitur ini juga belum ada isinya
  (FASE R9 belum mulai), cukup tampilkan state "Segera Hadir"/"Belum
  tersedia", JANGAN paksa bikin angka statistik untuk fitur yang
  belum ada.
- Menu **Activity Log**: pastikan halaman ini sendiri sudah benar2
  menampilkan histori aktivitas asli (kalau sudah ada infrastrukturnya,
  ini jadi sumber utama untuk statistik-statistik di atas).

### Beda tampilan Siswa vs Guru untuk statistik

- **Siswa**: tampilkan statistik personal dia sendiri (mis. "Kamu
  sudah scan QR 5 kali", "Kuis yang sudah kamu selesaikan: 3").
- **Guru**: tampilkan statistik agregat kelas/semua siswa yang
  terdaftar di bawah guru itu (mis. total scan QR semua siswa, jumlah
  siswa yang sudah mengerjakan kuis).

## Batasan scope

- JANGAN ubah logic auth/routing yang sudah jalan.
- Kalau suatu statistik memang belum bisa dihitung karena fitur
  sumbernya belum ada (Quiz/Unity), JANGAN dipaksa — cukup state
  kosong yang jujur ("0" atau "Segera Hadir"), tidak boleh dummy.
- Kalau nemu konflik data (mis. ternyata event scan QR memang belum
  pernah dicatat sama sekali di mana pun), laporkan dulu sebelum
  nambah sistem tracking baru, supaya desain tabel loggingnya bisa
  dikonfirmasi dulu.

## Setelah selesai

Kasih laporan: file yang diubah/ditambah per menu, skema tabel/query
yang dipakai untuk tiap statistik (biar saya tahu datanya nyata dari
mana), dan screenshot tiap menu (versi Siswa & versi Guru) yang
menunjukkan header baru + statistik yang sudah hidup dengan angka
asli (boleh 0 kalau memang belum ada aktivitas).
