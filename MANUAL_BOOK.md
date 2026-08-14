# 📘 MANUAL BOOK & PANDUAN PENGGUNAAN
## QRCodeAR / AlamVerse — Media Pembelajaran AR 3D Ekosistem Rantai Makanan SD

---

## 📌 1. TENTANG PROYEK

**QRCodeAR (AlamVerse)** adalah platform media pembelajaran digital interaktif berbasis **Web Augmented Reality (WebAR)** dan **3D Interactive Studio** yang dirancang khusus untuk mata pelajaran **Ilmu Pengetahuan Alam (IPA) Sekolah Dasar (SD)** pada materi **Ekosistem dan Rantai Makanan**.

Aplikasi ini bekerja langsung di dalam browser smartphone (Google Chrome, Apple Safari, Microsoft Edge) **tanpa perlu mengunduh atau menginstal aplikasi tambahan dari Play Store maupun App Store**.

---

## 🌟 2. FITUR UTAMA APLIKASI

| Fitur | Deskripsi |
| :--- | :--- |
| **🌐 3D Interactive Studio** | Visualisasi 3D ekosistem lengkap 360° dengan pencahayaan realistis dan bayangan lembut. |
| **📷 In-Browser WebAR (Tap-to-Place)** | Memproyeksikan ekosistem 3D langsung di atas meja atau lantai kelas nyata menggunakan kamera HP. |
| **🏷️ Smart Hotspot Tracking (`matrixWorld`)** | Label peran spesies (Produsen, Konsumen I-IV, Pengurai) menempel tepat di atas kepala hewan dari segala sudut pandang 360°. |
| **👆 Kontrol Multi-Touch Intuitif** | 1 Jari memutar objek 360°, 2 Jari mencubit (*pinch*) untuk memperbesar/memperkecil, dan 2 Jari menggeser (*pan*) untuk memindahkan objek di meja. |
| **⚡ Multi-Speed Orbit Animation** | Pilihan kecepatan rotasi otomatis: `1.0x` (Normal), `2.0x` (Cepat), `0.5x` (Lambat/Detail), dan `Jeda`. |
| **🍃 Audio Ambience Alami** | Soundscape suasana alam asli (gemericik air sawah, ombak laut, burung hutan) yang menenangkan konsentrasi belajar siswa. |
| **📖 Modal Fakta Ilmiah Spesies** | Menampilkan kartu ringkasan sains saat nama hewan/tumbuhan diketuk. |
| **📱 Zero-Overflow Mobile UI** | Tampilan antarmuka melayang (*floating HUD*) yang proporsional dan tidak terpotong oleh bilah navigasi HP. |

---

## 📖 3. PANDUAN PENGGUNAAN UNTUK GURU & SISWA

### A. Membuka Aplikasi
1. Pindai (*scan*) QR Code yang ada pada kartu pembelajaran fisik menggunakan kamera HP, atau buka tautan di browser:
   - **Ekosistem Sawah**: `https://qrcodear.onrender.com/ecosystem/view/sawah`
   - **Ekosistem Laut**: `https://qrcodear.onrender.com/ecosystem/view/laut`
   - **Ekosistem Hutan**: `https://qrcodear.onrender.com/ecosystem/view/hutan`
   - *(Atau via server lokal: `http://localhost:3001/ecosystem/view/sawah`)*

---

### B. Menggunakan Mode 3D Interactive Studio
1. **Memutar Model**: Usap layar dengan 1 jari ke kiri atau ke kanan untuk melihat hewan dari segala arah.
2. **Memperbesar / Memperkecil**: Gunakan 2 jari (cubit / rentangkan) untuk memperbesar detail hewan.
3. **Mengatur Kecepatan Putar**: Tekan tombol **`[ 🔄 Putar: 1.0x ]`** di bilah bawah untuk mengubah kecepatan rotasi otomatis (`1.0x` ➔ `2.0x` ➔ `0.5x` ➔ `Jeda`).
4. **Membuka Informasi Hewan**: Ketuk salah satu label spesies (misal: *Padi*, *Katak*, *Ular*) untuk membuka kartu penjelasan perannya dalam rantai makanan.
5. **Menyembunyikan Label**: Tekan tombol **`[ 🏷️ Label ]`** jika ingin melihat model 3D murni tanpa teks.
6. **Mendengarkan Suasana Alam**: Tekan tombol **`[ 🍃 Suasana ]`** untuk menyalakan atau mematikan musik latar suara alam yang damai.

---

### C. Menggunakan Mode WebAR Kamera (Tap-to-Place)
1. Tekan tombol ungu besar di bagian bawah: **`[ 📷 Lihat di AR (Kamera Browser) ]`**.
2. Berikan izin saat browser meminta akses kamera (*Allow / Izinkan*).
3. Arahkan kamera smartphone Anda ke permukaan datar (meja belajar atau lantai kelas).
4. **Ketuk layar sekali (*Tap*)** tepat pada lingkaran target ungu yang muncul di tengah layar.
5. Model ekosistem 3D dan seluruh label rantai makanan akan langsung terkunci dan berdiri tegak di atas meja Anda!
6. **Interaksi di Mode AR**:
   - 👆 **1 Jari Geser**: Memutar model 3D di atas meja.
   - 🤏 **2 Jari Cubit**: Memperbesar / memperkecil ukuran model di ruangan kelas.
   - 🖐️ **2 Jari Geser**: Memindahkan letak model ke area meja yang lain secara stabil.
7. **Pindah Titik / Keluar**:
   - Tekan tombol **`[ 🎯 Pindah Posisi ]`** untuk memindahkan titik letak model ke lokasi baru.
   - Tekan tombol **`[ ✕ Tutup AR ]`** untuk kembali ke mode 3D Studio.

---

## 🛠️ 4. PANDUAN PENGEMBANG (DEVELOPER MANUAL)

### A. Prasyarat Sistem (System Requirements)
- **Node.js**: Versi `v18.x` atau lebih baru
- **Python**: Versi `3.10+` (opsional untuk auto-generate audio MP3)
- **FFmpeg**: Untuk konversi dan encoding audio
- **Web Browser**: Chrome (Android/Desktop) / Safari (iOS 14+)

---

### B. Struktur Direktori Proyek
```
qrcodear/
├── client/                     # Frontend client (React / Next / Vite)
├── public/
│   └── audio/
│       └── ecosystems/         # File MP3 & WAV Ambience Ekosistem
├── server/
│   ├── data/                   # Data JSON preset ekosistem
│   ├── public/                 # Static assets server
│   ├── scripts/
│   │   ├── bake_complete_preset_glb.js   # Script auto-bake 3D models
│   │   └── generate_ecosystem_ambiance.py # Script synthesizer audio
│   ├── views/
│   │   ├── ecosystem/
│   │   │   └── viewer.html     # Template utama WebAR & 3D Viewer
│   │   └── studio/             # Antarmuka 3D Studio Editor
│   └── index.js                # Express main server entry point
├── server-v2/                  # Backend NestJS (Fase lanjutan)
├── viewer.html                 # Fallback standalone viewer
├── start.bat                   # Batch script untuk start server lokal
├── render.yaml                 # Konfigurasi deployment Render
├── package.json
└── MANUAL_BOOK.md              # Buku panduan ini
```

---

### C. Menjalankan Server di Komputer Lokal
1. Buka terminal PowerShell di folder proyek (`d:\3d\qrcodear`).
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server Express:
   ```bash
   node server/index.js
   ```
   *(Atau klik ganda berkas `start.bat`)*
4. Buka di browser:
   `http://localhost:3001/ecosystem/view/sawah`

---

### D. Daftar Endpoint Penting

| Metode | Endpoint URL | Fungsi |
| :---: | :--- | :--- |
| `GET` | `/ecosystem/view/:id` | Halaman WebAR & 3D Interactive Viewer (`sawah`, `laut`, `hutan`, dll.) |
| `GET` | `/studio` | Halaman Studio Editor 3D Rantai Makanan |
| `GET` | `/assets/:filename.glb` | Menyajikan file model 3D gabungan (*baked GLB*) |
| `GET` | `/audio/ecosystems/:id.mp3` | Menyajikan file audio suasana alam berformat 192k MP3 |
| `GET` | `/api/ecosystem/presets` | Mendapatkan data slot hewan dan peran rantai makanan |

---

### E. Menambahkan atau Mengubah Preset Ekosistem Baru
1. Tambahkan konfigurasi ekosistem baru di berkas `server/data/ecosystem_presets.json`.
2. Setiap preset memiliki 6 slot rantai makanan:
   - Slot 0: `produsen`
   - Slot 1: `konsumen_primer` (Konsumen I)
   - Slot 2: `konsumen_sekunder` (Konsumen II)
   - Slot 3: `konsumen_tersier` (Konsumen III)
   - Slot 4: `konsumen_final` (Konsumen Puncak)
   - Slot 5: `decomposer` (Pengurai)
3. Jalankan script auto-bake untuk menggabungkan model 3D:
   ```bash
   node server/scripts/bake_complete_preset_glb.js
   ```

---

## 🚀 5. PANDUAN DEPLOYMENT (PRODUCTION)

Proyek ini telah dikonfigurasi untuk deployment otomatis ke **Render.com**:
- **Repository Git**: `https://github.com/Shoutoo/qrcodear`
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node server/index.js`
- **Live URL**: `https://qrcodear.onrender.com/ecosystem/view/sawah`

Setiap kali dilakukan `git push origin main`, Render akan otomatis melakukan proses *build & deploy* dalam waktu ~1 menit.

---

## 📞 6. CATATAN & TROUBLESHOOTING

1. **Kamera Tidak Muncul di Mode AR**:
   - Pastikan situs diakses menggunakan protokol **HTTPS** (kamera tidak dapat dibuka di HTTP kecuali pada `localhost`).
   - Pastikan izin kamera pada browser smartphone telah diizinkan (*Settings -> Site Settings -> Camera -> Allow*).
2. **Suara Ambience Tidak Bunyi**:
   - Pastikan volume media pada smartphone tidak dalam kondisi *silent* atau *mute*.
   - Tekan tombol **`[ 🍃 Suasana ]`** sekali untuk mengaktifkan Web Audio context.

---

*Hak Cipta © 2026 QRCodeAR / AlamVerse — Media Pembelajaran Digital Interaktif SD.*
