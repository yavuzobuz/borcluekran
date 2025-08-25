@echo off
echo Uygulama ngrok ile baslatiliyor...
echo.

REM Uygulama dizinine git
cd /d "%~dp0"

REM Iki terminal penceresi ac
echo Next.js uygulamasi baslatiliyor...
start "Next.js App" cmd /k "npm run dev"

REM 10 saniye bekle (uygulamanin baslamasi icin)
echo Uygulama baslatiliyor, lutfen bekleyin...
timeout /t 10 /nobreak >nul

REM Ngrok'u baslat
echo Ngrok baslatiliyor...
start "Ngrok Tunnel" cmd /k "ngrok http 3000"

echo.
echo Basarili! Iki pencere acildi:
echo 1. Next.js uygulamasi (localhost:3000)
echo 2. Ngrok tunnel (public URL)
echo.
echo Ngrok penceresindeki public URL'i kullanabilirsiniz.
echo.
pause