@echo off
echo.
echo ========================================================
echo         Magic AR Edu - Tunnel Baru (Localtunnel)
echo ========================================================
echo.
echo Sedang membuat tunnel baru...
echo.
echo INFO PENTING:
echo 1. Nanti akan muncul tulisan "your url is: https://xxxx.loca.lt"
echo 2. Buka URL https tersebut di browser laptop Anda.
echo 3. Akan ada halaman peringatan dari localtunnel, klik tombol "Click to Continue"
echo 4. Upload model 3D di sana.
echo 5. QR Code yang dihasilkan sekarang bisa di-scan dari HP Anda!
echo.
echo Tekan Ctrl+C untuk menutup tunnel jika sudah selesai.
echo.
call npx -y localtunnel --port 3001
pause
