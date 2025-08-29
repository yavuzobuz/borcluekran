@echo off
title Borclu Sorgulama Sistemi
color 0A

:menu
cls
echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo ===============================================================
echo.
echo  [1] Yerel Baslat (WiFi Agi)
echo  [2] Internet Baslat (Ngrok)  
echo  [3] Sistemi Durdur
echo  [4] Veritabani Temizle
echo  [5] Cikis
echo.
set /p choice="Seciminizi yapin (1-5): "

if "%choice%"=="1" goto yerel
if "%choice%"=="2" goto internet
if "%choice%"=="3" goto durdur
if "%choice%"=="4" goto temizle
if "%choice%"=="5" exit
goto menu

:yerel
echo.
echo Yerel sistem baslatiliyor...
docker-compose up -d
echo.
echo Sistem baslatildi!
echo Yerel: http://localhost:3000
echo WiFi Agi: http://192.168.0.17:3000
echo.
start http://localhost:3000
pause
goto menu

:internet
echo.
echo Internet erisimi baslatiliyor...
docker-compose up -d
echo.
echo Ngrok baslatiliyor...
start "Ngrok - KAPATMA!" cmd /k "ngrok http 3000"
echo.
echo Ngrok penceresindeki URL'i kopyala ve paylas!
pause
goto menu

:durdur
echo.
echo Sistem durduruluyor...
docker-compose down
echo Sistem durduruldu!
pause
goto menu

:temizle
echo.
echo ===============================================================
echo                    UYARI: VERITABANI TEMIZLEME              
echo ===============================================================
echo.
echo TUM veritabani verileri silinecek!
echo Bu islem geri alinamaz!
echo.
set /p confirm="Devam etmek istiyor musunuz? (E/H): "
if /i "%confirm%"=="E" goto temizle_onayli
if /i "%confirm%"=="e" goto temizle_onayli
echo.
echo Islem iptal edildi.
pause
goto menu

:temizle_onayli
echo.
echo Veritabani temizleniyor...
docker-compose down
docker volume rm borclu-sorgulama_borclu-db-data 2>nul
docker-compose up -d
echo.
echo ✅ Veritabani temizlendi ve sistem yeniden baslatildi!
echo Yerel: http://localhost:3000
echo WiFi Agi: http://192.168.0.17:3000
pause
goto menu