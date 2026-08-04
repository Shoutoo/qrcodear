@echo off
echo.
echo ========================================================
echo         Magic AR Edu - Membuka Akses untuk HP
echo ========================================================
echo.
echo Sedang membuat tunnel aman (localhost.run)...
echo.
echo INFO PENTING:
echo 1. Jika muncul peringatan keamanan SSH (The authenticity of host...), ketik "yes" lalu Enter.
echo 2. Tunggu sampai muncul tulisan hijau berisi URL: https://xxxx.lhr.life
echo 3. Buka URL https tersebut di browser laptop Anda.
echo 4. Upload model 3D di sana.
echo 5. QR Code yang dihasilkan sekarang bisa di-scan dari HP Anda!
echo.
echo Tekan Ctrl+C untuk menutup tunnel jika sudah selesai.
echo.
ssh -R 80:localhost:3001 nokey@localhost.run
pause
