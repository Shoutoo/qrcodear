@echo off
echo.
echo ========================================================
echo       Magic AR Edu - Tunnel Cloudflare (Ultra Stabil)
echo ========================================================
echo.
echo Sedang mendownload dan membuat tunnel Cloudflare...
echo.
call npx -y cloudflared tunnel --url http://localhost:3001
echo.
echo Tunnel terputus.
pause
