# PROMPT untuk Antigravity: AUDIT MENDALAM Deskripsi Tiap Menu (Masih Salah/Belum Sesuai)

## Masalah

Prompt sebelumnya (`PROMPT-ANTIGRAVITY-rombak-deskripsi-menu-dan-
statistik-real.md`) minta tiap menu punya header/deskripsi sendiri
sesuai fungsinya. Tapi setelah dicek, hasilnya **masih SALAH**:
contoh nyata — saat user buka menu **"Kuis Interaktif"**, header yang
tampil masih:

- Badge: "Ruang Belajar AR Kamu"
- Judul: "Eksplorasi Rantai Makanan & Hewan 3D"
- Deskripsi: "Yuk pilih ekosistem di bawah! Kamu bisa klik Tampilkan
  AR Viewer atau cetak kartu QR untuk melihat hewan 3D bergerak lewat
  kamera HP."
- 4 card statistik: Total Scan QR, Tampilan AR, Baked GLB Ekosistem,
  Kuis Diselesaikan — masih semua "--"

Ini adalah **konten menu Beranda/preset ekosistem**, BUKAN konten
untuk menu Kuis Interaktif. Kelihatan seperti implementasi kemarin
cuma ganti highlight navbar atau tidak benar-benar mengecek per-route
header-nya masing-masing — kemungkinan besar semua menu masih
share 1 komponen header yang sama persis (hardcoded konten Beranda),
cuma dipasang di banyak route tanpa isi konten yang benar-benar
beda per menu.

## Tugas: AUDIT dulu, baru perbaiki

### Langkah 1 — Audit

Buka SATU PER SATU semua menu di navbar (Beranda & Analytics, AR
Studio, Kuis Interaktif, Unity Assemblr, Activity Log — cek juga
kalau ada sub-halaman lain yang tidak muncul di navbar tapi ada
route-nya). Untuk TIAP menu, screenshot kondisi SEKARANG dan catat:

- Apakah header/badge/judul/deskripsi-nya benar-benar spesifik untuk
  menu itu, atau masih copy-paste dari menu lain (terutama dari
  Beranda)?
- Apakah 4 card statistik yang tampil relevan dengan fungsi menu itu,
  atau masih 4 statistik generic yang sama di semua menu?
- Cek juga di level KODE (bukan cuma visual): apakah komponen header
  itu SATU komponen shared yang dipakai berulang dengan props/konten
  hardcoded sama, atau memang sudah ada logic untuk render konten
  beda per route? Laporkan temuan ini dulu sebelum mulai perbaikan,
  supaya jelas akar masalahnya di komponen mana.

### Langkah 2 — Perbaiki berdasarkan hasil audit

Untuk tiap menu, buat konten yang BENAR-BENAR spesifik ke fungsinya.
Bedakan bahasa Siswa (sederhana, dipahami anak SD) vs Guru
(profesional, boleh sebut istilah fitur):

- **Beranda & Analytics**: overview umum platform, ajakan eksplorasi
  ekosistem/preset AR (ini yang isinya sudah ada sekarang, boleh
  dipertahankan di menu Beranda SAJA).
- **AR Studio**: fokus ke aktivitas bikin/edit scene 3D & preset
  ekosistem sendiri. Narasi edukatif: buat siswa ("Di sini kamu bisa
  susun hewan-hewan jadi rantai makanan sendiri!"), buat guru ("Kelola
  preset ekosistem, tambah/edit objek 3D untuk materi ajar").
- **Kuis Interaktif**: fokus ke kuis, BUKAN ekosistem/AR viewer.
  Narasi edukatif: siswa ("Uji seberapa paham kamu tentang ekosistem
  lewat kuis seru ini!"), guru ("Buat soal kuis, lihat nilai & progres
  belajar siswa kamu di sini").
- **Unity Assemblr**: karena fitur ini belum ada isinya (FASE R9
  belum mulai), buat state "Segera Hadir" yang jujur, dengan
  penjelasan singkat apa yang akan bisa dilakukan nanti (edukatif,
  bukan halaman kosong tanpa konteks).
- **Activity Log**: fokus ke riwayat aktivitas. Narasi: siswa
  ("Lihat aktivitas belajar AR & kuis yang sudah kamu lakukan"), guru
  ("Pantau aktivitas semua siswa: scan QR, kuis dikerjakan, dll").

### Langkah 3 — Statistik per menu (relevan, bukan 4 angka sama ditempel semua halaman)

Ingat aturan dari prompt sebelumnya: **statistik harus relevan ke
menu itu dan pakai data REAL, bukan dummy**. Kalau menu Kuis
Interaktif, statistiknya seharusnya soal kuis (jumlah soal, jumlah
kuis dikerjakan, skor rata-rata), BUKAN "Total Scan QR"/"Baked GLB
Ekosistem" yang itu domain-nya menu Beranda/AR Studio.

## Batasan scope

- JANGAN ubah logic auth/routing yang sudah jalan.
- Kalau audit menemukan bahwa arsitektur komponennya memang 1 shared
  component untuk semua header (bukan per-route), REFACTOR supaya
  tiap route bisa render konten sendiri (via config/data map per
  route, bukan hardcode kondisional numpuk di 1 file kalau bisa
  dihindari) — supaya ke depan gampang diubah lagi per menu tanpa
  bug seperti ini terulang.

## Setelah selesai

Kasih laporan hasil audit (temuan root cause kenapa kemarin salah),
lalu screenshot SEMUA menu satu-satu (versi Siswa & Guru) yang
membuktikan tiap menu sekarang punya konten & statistik yang benar-
benar berbeda dan sesuai fungsinya masing-masing.
