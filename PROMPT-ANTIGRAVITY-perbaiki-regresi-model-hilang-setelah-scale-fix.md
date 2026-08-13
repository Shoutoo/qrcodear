# ⛔ Regresi: Model 3D AR Hilang Lagi Setelah Perubahan Skala

## 1. Kronologi (penting, baca urutan ini)

1. Model 3D AR sudah berhasil muncul & bisa digeser/diputar 360 derajat — **dikonfirmasi user lewat pengujian fisik langsung di HP**, dibuktikan screenshot.
2. User minta penyesuaian: skala default terlalu besar, minta dikecilkan + pastikan pinch-to-zoom berfungsi (lihat `PROMPT-ANTIGRAVITY-perbaiki-skala-model-3d-ar.md`).
3. Prompt itu dijalankan Antigravity.
4. **Setelah perubahan itu, model 3D AR TIDAK MUNCUL LAGI SAMA SEKALI** — regresi total, fitur yang tadinya jalan sekarang rusak.

## 2. Apa yang Wajib Dilakukan Antigravity (urutan ini, jangan dibalik)

1. **Jangan asal tambal lagi.** Sebelum ubah kode apa pun, cek dulu **riwayat commit/diff** dari perubahan yang dibuat untuk permintaan penyesuaian skala kemarin — file apa saja yang disentuh, baris mana yang diubah.
2. **Identifikasi persis baris/logika yang menyebabkan model gagal muncul lagi.** Kemungkinan penyebab (bukan daftar lengkap, cuma dugaan awal untuk membantu arah pencarian):
   - Perubahan nilai scale/transform yang salah taruh urutan eksekusinya (misal di-apply sebelum model selesai dimuat, sehingga error saat objek belum ada)
   - Penambahan kode gesture pinch-to-zoom yang bentrok/menimpa proses inisialisasi render yang sudah ada
   - Ada exception baru yang muncul karena kode baru mengakses properti/objek yang belum tentu ada di semua kondisi
3. **Cek console browser** (remote debug) saat mencoba scan sekarang — pasti ada bedanya dibanding sebelum perubahan skala, karena sebelumnya proses render jelas-jelas berhasil sampai tahap muncul + bisa diputar.
4. **Kalau penyebab pastinya tidak bisa ditemukan dengan cepat**, opsi paling aman: **revert dulu ke commit sebelum perubahan skala diterapkan** (kembali ke state yang sudah terbukti berfungsi & sudah diverifikasi fisik oleh user), baru terapkan ulang penyesuaian skala secara lebih hati-hati dan bertahap (satu perubahan kecil dulu, uji, baru lanjut ke perubahan berikutnya) — jangan gabung banyak perubahan sekaligus seperti kemarin (scale + pinch-to-zoom dalam satu eksekusi) karena itu mempersulit pelacakan kalau ada yang rusak.

## 3. Aturan Wajib

- WAJIB laporkan git diff/commit yang jadi penyebab, jangan cuma bilang "sudah diperbaiki".
- WAJIB uji fisik di device dan sertakan bukti (screenshot/video) SEBELUM melaporkan selesai — mengingat ini sudah kejadian berkali-kali (laporan "berhasil" yang ternyata tidak match kenyataan production).
- Kalau memilih opsi revert, terapkan penyesuaian skala berikutnya SATU PERUBAHAN KECIL PER SEKALI JALAN, uji ulang tiap tahap, jangan gabung beberapa perubahan sekaligus lagi.
