@echo off
echo Ngrok Test Baslatiliyor...
echo.

REM Projedeki env dosyasindan okuma
set ENABLE_NGROK=true

echo Development server baslatiliyor...
start "Dev Server" cmd /k "npm run dev"

echo 10 saniye bekleniyor...
timeout /t 10 /nobreak >nul

echo Ngrok tunnel baslatiliyor...
ngrok http 3000

echo.
echo Test tamamlandi!
pause
