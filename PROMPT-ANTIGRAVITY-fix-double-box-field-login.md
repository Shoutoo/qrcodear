# PROMPT untuk Antigravity: Rapikan Field Login (Bukan Transparan — Ikut Style CSS Global)

## Masalah

Di halaman login (field "Email Akun" & "Kata Sandi"), sekarang ada
2 lapis box: box luar (border tipis, rounded, membungkus icon +
input) DAN box dalam (input-nya sendiri punya border + background
lavender/keunguan sendiri). Efeknya jadi kotak-di-dalam-kotak yang
keliatan tidak rapi.

## Perbaikan yang benar (koreksi dari instruksi sebelumnya)

**JANGAN dibuat transparan/menyatu tanpa border sama sekali.** Yang
diminta:

1. Tetap **1 box per field** (hapus box dalam yang terpisah dari
   `<input>` — input tidak boleh punya border/background sendiri yang
   beda dari container-nya).
2. Container terluar (yang membungkus icon + input) **pakai style
   yang SAMA/konsisten dengan komponen form/card lain di CSS global
   project** — cek dulu token/variable border-radius, border-color,
   dan background yang sudah dipakai di komponen lain (mis. card
   preset ekosistem, dropdown, dll), jangan bikin nilai baru sendiri.
3. **Border-radius**: buat rounded yang LEBIH LEMBUT dari sekarang —
   sekarang kesannya "tegas"/kaku (radius kecil atau terlalu kotak).
   Naikkan radius-nya secukupnya (ikut skala radius yang sudah ada di
   design system, misal yang dipakai di badge/pill atau card lain),
   tapi jangan sampai jadi full pill/oval.
4. **Warna field**: pakai warna yang MASIH SATU KELUARGA dengan CSS
   global (misal border abu-abu muda/ungu sangat soft yang konsisten
   dengan palette project), TAPI JANGAN warna yang mencolok/nabrak
   dengan sekitarnya (jangan background ungu terang atau warna
   kontras tinggi yang bikin field jadi lebih menonjol dari elemen
   lain di form). Field harus tetap terlihat sebagai input biasa —
   halus, tidak norak.
5. Efek fokus (saat field diklik) boleh mengubah warna border jadi
   sedikit lebih tegas/warna aksen (ungu brand), TAPI tetap 1 box
   saja, jangan memunculkan box tambahan lagi di dalamnya.
6. Berlaku untuk KEDUA field: Email Akun dan Kata Sandi.

## Batasan

Murni CSS/styling, jangan ubah logic input/validasi yang sudah ada.

## Setelah selesai

Screenshot hasil field yang sudah jadi 1 box bersih, rounded lembut,
warna konsisten dengan CSS global (normal state & saat fokus/diklik).
