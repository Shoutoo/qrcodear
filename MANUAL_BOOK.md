# 📘 BUKU PANDUAN PENGGUNAAN (MANUAL BOOK)
## QRCodeAR / AlamVerse — Media Pembelajaran AR 3D Ekosistem Rantai Makanan SD

---

## 📌 1. TENTANG PLATFORM

**QRCodeAR (AlamVerse)** adalah media pembelajaran digital interaktif berbasis **Web Augmented Reality (WebAR)** dan **3D Interactive Studio** yang dirancang khusus untuk mata pelajaran **Ilmu Pengetahuan Alam (IPA) Sekolah Dasar (SD)** pada materi **Ekosistem, Siklus Rantai Makanan, & Jaring-Jaring Kehidupan**.

Platform ini dapat diakses langsung melalui browser smartphone (Google Chrome, Apple Safari, Microsoft Edge) **tanpa perlu menginstal aplikasi tambahan dari Play Store maupun App Store**.

---

## 🌟 2. DAFTAR MENU LENGKAP APLIKASI

Platform ini menyediakan 5 menu utama untuk mendukung proses belajar mengajar antara Guru dan Murid:

| No | Menu / Modul | Peran Pengguna | URL Akses | Deskripsi Utama |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Eksplorasi 3D & WebAR Viewer** | Murid & Guru | `/ecosystem/view/:id` | Visualisasi 3D 360° dan Augmented Reality di atas meja kelas nyata. |
| **2** | **Materi Pembelajaran Interaktif** | Murid & Guru | *(Bilah Alur & Modal)* | Penjelasan ilmiah peran Produsen, Konsumen I–IV, dan Pengurai. |
| **3** | **Kuis Interaktif Evaluasi Siswa** | Murid & Guru | `/quiz` / Bank Soal | Evaluasi pemahaman IPA SD dengan skor otomatis & pembahasan. |
| **4** | **3D Ecosystem Studio Editor** | Guru | `/studio` | Pengaturan preset tema ekosistem, penataan slot hewan, & nama spesies. |
| **5** | **Pusat Cetak Kartu AR Siswa** | Guru | `/print-card` | Menghasilkan lembar kartu pembelajaran ber-QR Code siap cetak. |
| **6** | **Log Audit & Diagnostik AR** | Guru & Laboran | `/ar-debug` | Pengujian kesiapan kamera, WebGL, dan koneksi perangkat sebelum kelas. |

---

## 🎒 3. PANDUAN LENGKAP UNTUK MURID (SISWA)

### A. Cara Membuka Media Pembelajaran
1. Pindai (*scan*) **QR Code pada Kartu Pembelajaran Ekosistem** yang dibagikan oleh Guru.
2. Tautan materi akan langsung terbuka di browser smartphone:
   - 🌾 **Ekosistem Sawah**: `https://qrcodear.onrender.com/ecosystem/view/sawah`
   - 🌊 **Ekosistem Laut**: `https://qrcodear.onrender.com/ecosystem/view/laut`
   - 🌳 **Ekosistem Hutan**: `https://qrcodear.onrender.com/ecosystem/view/hutan`

---

### B. Eksplorasi di Mode 3D Interactive Studio
Di dalam mode 3D Studio, siswa dapat mengamati rantai makanan secara mandiri:

1. **Memutar & Mengamati Hewan (360° Orbit View)**:
   - Usap layar dengan **1 Jari** ke kiri/kanan/atas/bawah untuk memutar sudut pandang ekosistem.
2. **Memperbesar Objek (Zoom In/Out)**:
   - Gunakan **2 Jari** (cubit atau rentangkan layar) untuk melihat detail fisik hewan dari dekat.
3. **Mengatur Kecepatan Putaran Otomatis**:
   - Tekan tombol **`[ 🔄 Putar: 1.0x ]`** untuk memilih kecepatan:
     - 🚀 **`Putar: 1.0x`**: Kecepatan normal.
     - ⚡ **`Putar: 2.0x`**: Kecepatan cepat untuk melihat perputaran siklus makanan.
     - 🐢 **`Putar: 0.5x`**: Kecepatan lambat untuk mengamati hewan satu per satu.
     - ⏸️ **`Jeda`**: Menghentikan putaran objek agar tetap diam.
4. **Menyembunyikan / Menampilkan Label**:
   - Tekan tombol **`[ 🏷️ Label ]`** jika ingin melihat model 3D murni tanpa teks.
5. **Mendengarkan Musik Suasana Alam**:
   - Tekan tombol **`[ 🍃 Suasana ]`** untuk menyalakan suara gemericik air, deburan ombak, atau kicauan burung rimba yang menenangkan selama belajar.

---

### C. Belajar Nyata dengan Mode AR Kamera (*Tap-to-Place*)
Mode AR Kamera membawa hewan 3D berdiri di dunia nyata (di atas meja kelas):

1. **Memulai AR**:
   - Tekan tombol ungu besar: **`[ 📷 Lihat di AR (Kamera Browser) ]`**.
   - Berikan izin saat browser meminta akses kamera (*Tekan "Izinkan" / "Allow"*).
2. **Menempatkan Model di Meja (*Tap-to-Place*)**:
   - Arahkan kamera HP ke permukaan meja belajar atau lantai.
   - Muncul lingkaran target ungu di tengah layar.
   - **Ketuk layar sekali (*Tap*)** ➔ Seluruh model ekosistem 3D dan label rantai makanan langsung terkunci berdiri tegak di atas meja!
3. **Gestur Kontrol Sentuh di Mode AR**:
   - 👆 **1 Jari Geser**: Memutar model 3D 360° di atas meja untuk melihat hewan dari segala sisi.
   - 🤏 **2 Jari Cubit (*Pinch*)**: Memperbesar atau memperkecil ukuran ekosistem di meja belajar.
   - 🖐️ **2 Jari Geser (*Pan*)**: Memindahkan posisi ekosistem ke bagian meja yang lain secara halus dan stabil.
4. **Memindahkan Posisi / Keluar dari AR**:
   - Tekan tombol **`[ 🎯 Pindah Posisi ]`** untuk memilih titik meja baru.
   - Tekan tombol **`[ ✕ Tutup AR ]`** untuk kembali ke mode 3D Studio.

---

## 📚 4. MENU MATERI PEMBELAJARAN INTERAKTIF

Menu Materi Pembelajaran terintegrasi langsung pada antarmuka viewer melalui **Bilah Alur Rantai Makanan** di bagian atas dan **Kartu Fakta Sains**:

### A. Bilah Alur Rantai Makanan (*Flow Banner*)
Menampilkan bagan urutan makan dan dimakan yang mudah dipahami:
`PRODUSEN ➔ KONSUMEN I ➔ KONSUMEN II ➔ KONSUMEN III ➔ KONSUMEN PUNCAK ➔ PENGURAI`

### B. Tingkatan Peran Sains Ekosistem
Siswa dapat mengetuk setiap label hewan untuk membuka kartu penjelasan perannya:
1. **Produsen**: Tumbuhan atau fitoplankton yang mampu membuat makanan sendiri melalui proses fotosintesis dengan bantuan sinar matahari.
2. **Konsumen I (Primer)**: Hewan herbivora (pemakan tumbuhan) yang memperoleh energi langsung dari produsen (contoh: Belalang, Ikan Kecil, Ulat).
3. **Konsumen II (Sekunder)**: Hewan karnivora tingkat satu atau insektivora yang memangsa konsumen primer (contoh: Katak, Ikan Sedang).
4. **Konsumen III (Tersier)**: Hewan karnivora tingkat menengah dalam rantai makanan (contoh: Ular, Ikan Besar).
5. **Konsumen Puncak (Apex Predator)**: Predator tertinggi yang tidak memiliki pemangsa alami dalam ekosistemnya (contoh: Burung Elang, Hiu, Harimau).
6. **Pengurai (Dekomposer)**: Organisme seperti jamur dan bakteri yang menguraikan bangkai makhluk hidup menjadi unsur hara penyubur tanah dan air.

---

## 📝 5. MENU KUIS INTERAKTIF EVALUASI SISWA

Modul kuis ini dirancang untuk mengukur tingkat pemahaman siswa setelah mempelajari ekosistem 3D dan AR:

### A. Fitur Modul Kuis
1. **Bank Soal Terstandar IPA SD**: Berisi 20+ soal pilihan ganda interaktif mencakup ekosistem sawah, laut, hutan, darat, dan konsep umum rantai makanan.
2. **Penilaian Skor Otomatis**: Nilai langsung dihitung dan ditampilkan setelah siswa menyelesaikan kuis.
3. **Umpan Balik Instan**: Siswa langsung mengetahui jawaban mana yang benar dan mana yang salah disertai penjelasan singkat.

### B. Contoh Soal Evaluasi
- *Soal 1*: Makhluk hidup yang dapat membuat makanannya sendiri disebut... **(Jawaban: Produsen)**.
- *Soal 2*: Pada ekosistem sawah, jika populasi katak menurun drastis, maka yang akan terjadi adalah... **(Jawaban: Populasi belalang meningkat dan merusak padi)**.
- *Soal 3*: Organisme yang bertugas mengembalikan nutrisi ke tanah dari sisa makhluk hidup mati adalah... **(Jawaban: Jamur / Pengurai)**.

---

## 🔬 6. MENU LOG AUDIT & DIAGNOSTIK AR (`/ar-debug`)

Menu ini disediakan khusus bagi **Guru, Operator, atau Laboran Komputer** untuk menguji kesiapan teknis perangkat smartphone siswa sebelum pembelajaran dimulai:

1. **Akses Menu**: Buka tautan `https://qrcodear.onrender.com/ar-debug` (atau `http://localhost:3001/ar-debug`).
2. **Fitur Pengujian (*Step-by-Step Diagnostic*)**:
   - **Step 1 (Test Script Import)**: Menguji apakah browser siswa mendukung *Three.js WebGL* dan modul library AR.
   - **Step 2 (Test Kamera)**: Membuka jendela kamera belakang untuk memastikan izin kamera aktif dan tidak diblokir.
   - **Step 3 (Test Model & Data)**: Memeriksa kecepatan pengunduhan file model 3D (`.glb`) dari server.
   - **Step 4 (Test Tracking Full)**: Menguji kestabilan pelacakan AR secara *real-time*.
3. **Papan Log Output (*System Health Log*)**:
   - Menampilkan status log berkode warna:
     - 🟢 **`[OK]`**: Perangkat siswa siap digunakan (Kamera & WebGL aktif).
     - 🟡 **`[WARN]`**: Peringatan koneksi lambat atau pencahayaan kurang.
     - 🔴 **`[ERR]`**: Izin kamera ditolak atau browser belum diperbarui.

---

## 👩‍🏫 7. PANDUAN MANAJEMEN UNTUK GURU (PENDIDIK)

### A. Menu 3D Ecosystem Studio Editor (`/studio`)
Digunakan oleh Guru untuk memilih dan menyesuaikan tema materi sebelum kelas dimulai:
1. Buka `https://qrcodear.onrender.com/studio`.
2. Pilih tema ekosistem (Sawah, Laut, Hutan, Padang Rumput, Gurun, Kutub, Sungai).
3. Sesuaikan 6 posisi rantai makanan, periksa nama spesies dan deskripsi peran ilmiah sesuai rencana pelaksanaan pembelajaran (RPP/Modul Ajar).
4. Putar pratinjau 3D (*live preview*) untuk memastikan materi siap diajarkan.

---

### B. Menu Generator & Cetak Kartu Belajar AR (`/print-card`)
Digunakan untuk mencetak kartu belajar ber-QR Code bagi siswa:
1. Buka `https://qrcodear.onrender.com/print-card`.
2. Pilih tema kartu ekosistem yang ingin dicetak.
3. Tekan tombol **`[ 🖨️ Cetak Kartu / Print PDF ]`**.
4. Cetak pada kertas tebal (A4 / Art Paper) dan bagikan kepada setiap kelompok belajar siswa.

---

## 💡 8. REKOMENDASI PENGGUNAAN DI RUANG KELAS

1. **Pencahayaan Ruangan**: Pastikan ruang kelas memiliki cahaya yang terang agar kamera HP dapat mendeteksi permukaan meja dengan cepat.
2. **Permukaan Meja**: Gunakan meja belajar atau alas yang memiliki sedikit tekstur/pola.
3. **Koneksi Internet**: Cukup koneksi internet standar saat memuat halaman pertama kali (~1,5 MB), setelah itu eksplorasi 3D, AR, dan audio berjalan lancar di browser siswa.

---

*Hak Cipta © 2026 QRCodeAR / AlamVerse — Media Pembelajaran Digital Interaktif SD.*
