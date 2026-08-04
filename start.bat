@echo off
title AR Edu QR — Server
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║        AR Edu QR — Launcher              ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0server"

:: Check if node_modules exists
if not exist node_modules (
    echo  [1/2] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERROR: npm install gagal. Pastikan Node.js sudah terinstall.
        echo  Download: https://nodejs.org
        pause
        exit /b 1
    )
    echo  [1/2] Dependencies installed!
) else (
    echo  [1/2] Dependencies sudah ada.
)

echo.
echo  [2/2] Menjalankan server...
echo.
echo  Buka browser ke: http://localhost:3001
echo.
echo  Untuk akses dari HP di jaringan yang sama:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo  http://%IP%:3001
echo.
echo  Tekan Ctrl+C untuk menghentikan server.
echo.

node index.js

pause
