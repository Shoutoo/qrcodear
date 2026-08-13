# 🔧 Tahap Pasca-Rollback: Rotate 360°, Pinch Zoom, & Skala Default

## 1. Status Terkini (baseline yang sudah dikonfirmasi jalan)

Rollback ke state stabil sudah berhasil — **model 3D AR sekarang muncul kembali** (dikonfirmasi user via screenshot, kartu "Ekosistem Darat"). Ini baseline baru yang harus dijaga tetap jalan selama proses berikutnya.

## 2. Temuan di Baseline Ini

UI sudah menampilkan teks status **"DARAT TERKUNCI — Geser Layar untuk Memutar 360°"**, tapi kenyataannya:
- ❌ Menggeser layar **TIDAK memutar model** — model diam di tempat meski sudah digeser. Label UI mengklaim fitur ini ada, tapi secara fungsional belum jalan (pola yang sama seperti kasus pinch-to-zoom sebelumnya: teks status kadang menjanjikan fitur yang belum benar-benar terhubung ke gesture handler-nya).
- ❌ Belum ada kontrol pinch untuk memperbesar/memperkecil model.
- ❌ Skala default model saat pertama muncul masih terlalu besar (sesuai laporan sebelumnya, belum berubah).

## 3. Permintaan — WAJIB DIKERJAKAN SATU-SATU (bukan digabung dalam 1 eksekusi)

Mengacu ke aturan yang sudah disepakati sebelumnya (setelah 2x regresi akibat menggabung banyak perubahan sekaligus), urutan pengerjaan berikut **wajib dipisah per commit, dan wajib berhenti + lapor ke user untuk verifikasi fisik di tiap tahap sebelum lanjut ke tahap berikutnya**:

### Tahap 1: Fix gesture rotate 360°
- Cari kode yang menangani drag/swipe gesture untuk rotasi model. Konfirmasi apakah event listener-nya memang belum terpasang, atau terpasang tapi tidak ter-attach ke elemen yang benar (kandidat umum: listener terpasang ke elemen yang berbeda dari yang sebenarnya menerima touch event, atau z-index/overlay lain menghalangi elemen sehingga touch event tidak sampai ke handler rotasi).
- Perbaiki HANYA bagian ini dulu. Commit terpisah. Deploy. **Tunggu user konfirmasi fisik di HP bahwa rotate 360° sudah jalan** sebelum lanjut ke Tahap 2.

### Tahap 2: Tambah pinch-to-zoom
- Implementasikan gesture pinch (2 titik sentuh) untuk memperbesar/memperkecil skala model secara real-time.
- Beri batas wajar (skala minimum & maksimum) supaya tidak bisa di-zoom sampai hilang atau sampai menutupi seluruh layar.
- Commit terpisah dari Tahap 1. Deploy. **Tunggu user konfirmasi fisik** sebelum lanjut ke Tahap 3.

### Tahap 3: Sesuaikan skala default
- Ubah nilai scale/transform awal supaya begitu model pertama kali muncul, seluruh ekosistem langsung terlihat utuh dalam satu frame tanpa perlu di-zoom out manual dulu.
- Commit terpisah. Deploy. **Tunggu user konfirmasi fisik.**

## 4. Aturan Wajib

- **Satu tahap = satu commit = satu deploy = satu verifikasi fisik dari user**, baru lanjut ke tahap berikutnya. Jangan gabung Tahap 1-3 jadi satu eksekusi besar — ini persis pola yang menyebabkan regresi 2 kali sebelumnya.
- Sebelum mulai Tahap 1, pastikan dulu baseline sekarang (model muncul, meski belum bisa rotate/zoom) benar-benar stabil di Render production — bukan cuma lokal.
- Dilarang melaporkan "berhasil" tanpa bukti pengujian fisik nyata di device (screenshot/video) untuk MASING-MASING tahap.
- Kalau di tengah proses Tahap manapun ditemukan tanda-tanda fitur lain jadi rusak (regresi), STOP, laporkan ke user, jangan lanjut ke tahap berikutnya sampai dikonfirmasi lagi.
