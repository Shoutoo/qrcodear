# ⛔ Regresi Ke-3: Revert Commit `121e4ab` + Aturan Baru Wajib Sebelum Push

## 1. Kejadian

Tahap 1 dari rencana bertahap (`PROMPT-ANTIGRAVITY-tambahkan-rotate-zoom-scale-pasca-rollback.md`) — yaitu fix gesture rotate 360° lewat commit `121e4ab` (membungkus model ke dalam wrapper entity `#cam-touch-wrapper`/`#anchor-touch-wrapper` + memasang touch listener di level `window`) — **membuat model 3D AR hilang lagi sepenuhnya**.

Ini adalah **regresi ke-3** dalam rangkaian perbaikan fitur AR ini. Yang paling penting untuk digarisbawahi: perubahan ini SUDAH diisolasi sekecil mungkin (cuma 1 tahap dari 3, sesuai aturan bertahap) dan **tetap saja merusak fitur inti**. Ini menandakan bagian kode AR ini sangat rapuh terhadap perubahan sekecil apa pun, dan proses verifikasi sebelum push selama ini tidak memadai.

## 2. Tindakan Segera

1. **Revert HANYA commit `121e4ab`** (`git revert 121e4ab`, atau kalau ada commit lanjutan setelahnya yang juga menumpuk di atasnya, revert semua sampai kembali ke state SEBELUM commit ini) — jangan rollback lebih jauh dari itu, karena baseline sebelum commit ini (model muncul tapi belum bisa rotate) sudah terbukti stabil.
2. Deploy ulang, lalu **tunggu konfirmasi fisik dari user** bahwa model kembali muncul seperti baseline sebelumnya, sebelum mencoba pendekatan lain untuk fix rotate.
3. **Setelah revert dikonfirmasi berhasil**, coba pendekatan BERBEDA untuk fix rotate 360° — jangan pakai pendekatan wrapper entity + window-level listener yang sama, karena itu yang terbukti merusak. Cari pendekatan minimal-invasif lain (misal modifikasi listener yang sudah ada tanpa mengubah struktur DOM/entity, atau debug dulu KENAPA listener lama tidak jalan sebelum menambah struktur baru).

## 3. Aturan BARU — Wajib Mulai Sekarang (untuk semua perubahan AR selanjutnya)

Karena pola regresi sudah terjadi 3 kali meski perubahan sudah diisolasi kecil-kecil, perlu lapisan pengaman tambahan sebelum kode di-push ke `main`/production:

1. **Sebelum push ke `main`**, jalankan dulu halaman AR di environment lokal atau branch terpisah, dan pastikan minimal: tidak ada error di console browser saat scene AR di-load, dan struktur entity/model tetap ter-attach dengan benar ke scene (screenshot/log sebagai bukti).
2. **Kalau ada cara untuk deploy ke URL preview/staging Render** (branch non-main) sebelum ke production, gunakan itu dulu untuk pengujian awal, baru merge ke `main` setelah dikonfirmasi tidak ada regresi — supaya URL production yang dipakai user untuk testing fisik tidak terus-menerus kena kondisi rusak.
3. **Setiap perubahan pada bagian AR viewer, sekecil apa pun, dianggap berisiko tinggi** sampai terbukti sebaliknya — perlakukan dengan kehati-hatian ekstra, jangan asumsikan "ini kan cuma perubahan kecil, pasti aman".
4. Tetap: satu perubahan = satu commit = satu verifikasi fisik dari user sebelum lanjut ke perubahan berikutnya (aturan ini tidak berubah).
