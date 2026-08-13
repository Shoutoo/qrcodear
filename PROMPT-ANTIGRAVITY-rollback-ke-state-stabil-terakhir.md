# ⏪ Rollback ke State Stabil Terakhir + Rencana Perubahan Bertahap

## 1. Kenapa Rollback (baca dulu sebelum eksekusi apa pun)

Sudah terjadi beberapa lapis perubahan berturut-turut di fitur AR ecosystem preset dalam waktu singkat, dan setiap lapis perubahan **memperburuk keadaan** alih-alih memperbaiki:

1. **State awal (BAIK, terverifikasi fisik)**: model 3D AR berhasil muncul setelah scan QR, dan bisa digeser/diputar 360 derajat. Ini dibuktikan user langsung di HP dengan screenshot.
2. Diminta penyesuaian: skala model dikecilkan + pinch-to-zoom (`PROMPT-ANTIGRAVITY-perbaiki-skala-model-3d-ar.md`).
3. **Setelah itu**: model jadi tidak muncul sama sekali (regresi total).
4. Diminta perbaikan regresi (`PROMPT-ANTIGRAVITY-perbaiki-regresi-model-hilang-setelah-scale-fix.md`).
5. **Sekarang, kondisi malah lebih parah**: sistem tidak bisa mendeteksi gambar anchor sama sekali — UI stuck terus-menerus minta arahkan kamera ke gambar anchor, tidak pernah terdeteksi, model tidak pernah muncul.

Pola ini menunjukkan tiap upaya perbaikan menambah kompleksitas baru tanpa kejelasan penuh soal apa yang sebenarnya rusak. **Melanjutkan tambal-sulam dari state sekarang berisiko tinggi memperburuk lagi.**

## 2. Tindakan yang Diminta

1. **Cari commit hash persis** yang merepresentasikan "state awal (baik)" di atas — yaitu commit SEBELUM prompt penyesuaian skala (`PROMPT-ANTIGRAVITY-perbaiki-skala-model-3d-ar.md`) dijalankan. Cek riwayat git log untuk menentukan ini dengan pasti, jangan menebak.
2. **Rollback/revert penuh** ke commit tersebut untuk bagian yang berkaitan dengan AR viewer preset ekosistem (kalau ada perubahan lain di luar scope ini yang tidak berkaitan, JANGAN ikut di-revert — isolasi rollback hanya ke bagian yang relevan).
3. **Deploy ulang ke Render**, lalu **user akan verifikasi fisik langsung di HP** bahwa model kembali muncul & bisa diputar 360 derajat seperti sebelumnya. JANGAN lanjut ke langkah berikutnya sebelum ini dikonfirmasi user.
4. **Setelah dan HANYA setelah** rollback dikonfirmasi berhasil oleh user, baru mulai terapkan ulang perubahan yang diinginkan — **satu per satu, bukan digabung**:
   - Perubahan #1 (skala default lebih kecil) → commit sendiri → deploy → user tes fisik → konfirmasi OK/tidak
   - Perubahan #2 (pinch-to-zoom) → commit terpisah → deploy → user tes fisik → konfirmasi OK/tidak
   - Perubahan #3 (anchor pindah dari QR ke ilustrasi kartu, sesuai `PROMPT-ANTIGRAVITY-ubah-anchor-model-3d-ke-ilustrasi-kartu.md`) → commit terpisah → deploy → user tes fisik → konfirmasi OK/tidak

## 3. Aturan Wajib

- **Satu commit = satu perubahan kecil.** Jangan gabung beberapa perubahan berbeda dalam satu commit/eksekusi — ini yang bikin susah dilacak kenapa sesuatu rusak.
- **Wajib berhenti dan lapor ke user setelah tiap tahap**, jangan lanjut otomatis ke tahap berikutnya tanpa konfirmasi user bahwa tahap sebelumnya benar-benar jalan di device fisik.
- **Dilarang melaporkan "berhasil" tanpa bukti pengujian fisik nyata** di device sungguhan (screenshot/video), bukan cuma commit & deploy selesai.
- Kalau di tengah proses rollback ternyata ditemukan commit "state awal baik" itu ternyata TIDAK sepenuhnya bersih (misal ada bug lain yang kebetulan belum ketahuan), laporkan dulu ke user sebelum memutuskan sendiri mau diapakan.
