@echo off
echo.
echo ========================================================
echo       AlamVerse — Where Nature Meets Reality - Tunnel Cloudflare (Ultra Stabil)
echo ========================================================
echo.
echo Sedang mendownload dan membuat tunnel Cloudflare...
echo.
call npx -y cloudflared tunnel --url http://localhost:3001
echo.
echo Tunnel terputus.
pause
