# PROMPT ANTIGRAVITY — Fix Ukuran Cetak Kartu AR jadi Fixed A6 (10.5cm x 14.8cm)

## Konteks

Kartu cetak AR ("Wild Explorer" style, hasil redesign sebelumnya)
saat ini kalau di-print ukurannya ikut membesar mengisi seluruh
kertas A4 (lihat screenshot print preview browser — kartu jadi
raksasa memenuhi 1 halaman penuh). Ini karena belum ada aturan CSS
print yang mengunci ukuran fisik kartu. Task ini **HANYA fix ukuran
cetak**, bukan desain ulang visual kartu (yang sudah beres di task
sebelumnya) — jangan ubah warna/layout/font, cuma dimensi & setup
print-nya.

## ATURAN WAJIB

1. **Scope HANYA CSS/print setup**, jangan sentuh logic generate QR,
   endpoint publish, atau file AR viewer manapun.
2. Cari dulu file yang menghasilkan halaman cetak ini (kemungkinan
   `print-card.html` atau sejenisnya — sama seperti file yang diedit
   di task redesign visual sebelumnya). Kalau ragu file mana,
   konfirmasi dulu sebelum edit.
3. Test hasilnya lewat **Print Preview browser** (Ctrl+P / Cmd+P) —
   bukan cuma asumsi dari kode, karena rendering print bisa beda dari
   rendering layar biasa.

## Target Ukuran

Kartu harus tercetak **fixed A6 = 10.5cm x 14.8cm** (portrait, sama
seperti orientasi kartu sekarang), TIDAK BOLEH ikut membesar/mengecil
mengikuti ukuran kertas printer (A4/Letter/dll) — ukuran kartu harus
tetap 10.5cm x 14.8cm berapa pun ukuran kertas yang dipilih user di
dialog print.

## Scope Kerja

1. **Set `@page` CSS rule** untuk halaman cetak ini ke ukuran A6:
   ```css
   @page {
     size: A6;
     margin: 0;
   }
   ```
2. **Kunci ukuran kartu dalam satuan fisik (cm/mm), bukan persen/vw/vh
   relatif ke viewport** — kartu dan semua isinya (background image,
   teks, kotak QR) harus pakai unit yang stabil di layar cetak (cm,
   mm, atau px dengan basis 96dpi/print-appropriate), supaya tidak
   ikut scale ke ukuran kertas.
3. **Hilangkan/override style yang bikin kartu full-bleed ke ukuran
   kertas** — kemungkinan ada CSS lama yang pakai `width: 100%`,
   `height: 100vh`, atau sejenisnya khusus untuk mode print, ganti jadi
   dimensi fixed sesuai poin 2.
4. **Center kartu di tengah halaman cetak** kalau memang halaman
   fisik output lebih besar dari kartu (misal user tetap pilih print
   ke kertas A4 padahal `@page size` diset A6 — browser biasanya tetap
   scale ke kertas fisik yang dipilih user, jadi pastikan minimal
   preview/testing di setting kertas A6 hasilnya presisi, dan test
   juga di kertas A4 untuk lihat behavior fallback-nya wajar/rapi,
   tidak terpotong).
5. **QR code tetap harus proporsional & cukup besar untuk di-scan** —
   setelah fix ukuran fisik ke A6 (lebih kecil dari tampilan sekarang
   yang selebar A4), pastikan ukuran kotak QR tidak jadi terlalu kecil
   untuk di-scan HP dari jarak wajar (~15-20cm). Kalau perlu, sesuaikan
   proporsi ukuran QR relatif terhadap kartu supaya tetap gampang
   di-scan di ukuran A6.
6. Test print preview browser: ukuran kartu di preview harus terlihat
   sesuai proporsi A6 sungguhan (bukan lagi memenuhi 1 halaman A4
   penuh seperti sebelumnya).

## Yang TIDAK Boleh Berubah

- ❌ Desain visual kartu (warna, background, font, layout elemen) —
  itu sudah final dari task sebelumnya, task ini murni ukuran cetak.
- ❌ Logic generate QR code / data yang di-encode.
- ❌ Tampilan kartu di LAYAR (bukan mode print) — kalau ada preview
  kartu di halaman web sebelum tombol print ditekan, itu boleh tetap
  seperti sekarang, yang diubah cuma output/CSS khusus mode `@media
  print`.

## Bukti yang Harus Dilaporkan

1. Screenshot print preview browser (Ctrl+P) yang menunjukkan kartu
   sekarang berukuran wajar (bukan memenuhi 1 halaman A4), dengan
   setting kertas A6 dipilih.
2. Screenshot print preview browser yang sama tapi dengan kertas A4
   dipilih (untuk cek fallback behavior tidak rusak/terpotong).
3. Konfirmasi ukuran QR code masih proporsional & layak untuk di-scan
   di ukuran A6.

Setelah selesai, tunjukkan hasilnya dan tunggu saya cek sebelum
dianggap final.
