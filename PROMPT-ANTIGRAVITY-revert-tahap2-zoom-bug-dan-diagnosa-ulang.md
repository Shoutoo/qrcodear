# ⛔ Bug Tahap 2 (Pinch-Zoom): Revert Dulu + Diagnosa Ulang

## 1. Gejala yang Dilaporkan User

Setelah Tahap 2 (pinch-zoom) di-deploy:
1. Zoom in/out terasa **terlalu cepat dan tidak konsisten** — bukan gerakan halus mengikuti jari.
2. Tiba-tiba model **membesar sangat ekstrem** lalu **hilang** dari layar.
3. Saat dicoba ulang setelah itu, **model 3D tidak muncul sama sekali** — regresi total, mirip pola Tahap 1 yang gagal sebelumnya.

## 2. Tindakan Segera

1. **Revert commit Tahap 2** (pinch-zoom) untuk kembali ke baseline Tahap 1 yang sudah terbukti stabil (rotate 360° jalan & diam di posisi terakhir, TANPA fitur zoom). Jangan revert lebih jauh dari itu — baseline Tahap 1 masih baik.
2. Deploy ulang, **tunggu konfirmasi fisik user** bahwa model & rotate 360° kembali normal, sebelum melanjutkan diagnosa pinch-zoom.

## 3. Dugaan Root Cause untuk Diagnosa Ulang (setelah revert & baseline dikonfirmasi aman)

Gejala "melonjak ekstrem lalu hilang" khas untuk beberapa bug umum di perhitungan pinch-zoom — tolong cek satu per satu, JANGAN langsung tulis ulang kode tanpa konfirmasi penyebab pastinya:

1. **Pembagian dengan angka mendekati nol**: kalau `initialPinchDist` (jarak awal 2 jari saat `touchstart`) kebetulan sangat kecil (jari hampir menempel saat mulai pinch), maka `scaleRatio = currentDist / initialPinchDist` bisa melonjak jadi angka sangat besar dalam sekejap. Cek apakah ada guard minimum untuk `initialPinchDist` sebelum dipakai sebagai pembagi.
2. **Clamp batas 0.35x–3.00x tidak benar-benar diterapkan ke nilai akhir**: cek apakah hasil `Math.min/Math.max` untuk clamping itu benar-benar dipakai saat `setAttribute('scale', ...)`, atau jangan-jangan variabel yang di-clamp itu tidak dipakai (masih pakai variabel mentah sebelum di-clamp).
3. **Nilai NaN/Infinity**: kalau di titik tertentu perhitungan menghasilkan NaN atau Infinity (misal dari pembagian nol persis), `setAttribute('scale', 'NaN NaN NaN')` bisa membuat A-Frame gagal render entity itu sama sekali dan berpotensi menyebabkan entity/scene jadi rusak untuk sesi berikutnya juga. Tambahkan guard eksplisit: kalau hasil perhitungan NaN/Infinity, JANGAN diterapkan ke scale, biarkan skala tetap di nilai valid terakhir.
4. **State pinch tidak direset dengan bersih di `touchend`**: pastikan `initialPinchDist` dan variabel terkait di-reset ke `null`/`undefined` setiap kali sesi sentuhan berakhir, supaya sesi pinch berikutnya tidak kebawa nilai basi dari sesi sebelumnya.

## 4. Aturan Wajib

- Revert dulu, verifikasi fisik baseline aman, BARU mulai diagnosa dan re-implementasi.
- Setelah re-implementasi, WAJIB sertakan guard untuk NaN/Infinity dan minimum-distance sebelum push lagi.
- Sebelum push ke `main`, laporkan dulu ke user apa penyebab pasti yang ditemukan dan perbaikan spesifik apa yang akan diterapkan (seperti Tahap 1 & rencana Tahap 2 kemarin) — jangan langsung eksekusi tanpa konfirmasi.
- Dilarang lapor "berhasil" tanpa bukti pengujian fisik nyata, termasuk uji coba pinch dengan gerakan cepat/ekstrem (bukan cuma pelan-pelan) untuk memastikan tidak ada lagi lonjakan liar.
