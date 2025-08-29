@echo off
title Borclu Sistem Launcher

REM PowerShell execution policy ayarla ve UI'yi başlat
powershell -ExecutionPolicy Bypass -WindowStyle Hidden -Command "& '%~dp0BORCLU-SISTEM-LAUNCHER.ps1'"

REM Eğer hata olursa alternatif yöntem
if %errorlevel% neq 0 (
    echo PowerShell UI baslatilirken hata olustu.
    echo Alternatif menu aciliyor...
    echo.
    goto :menu
)
exit

:menu
color 0B
cls
echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                      ALTERNATIF LAUNCHER                     
echo ===============================================================
echo.
echo [1] Yerel Baslat (WiFi Agi)
echo [2] Internet Baslat (Ngrok)
echo [3] Veritabani Temizle
echo [4] Sistemi Durdur
echo [5] Cikis
echo.
set /p choice="Seciminizi yapin (1-5): "

if "%choice%"=="1" goto :local
if "%choice%"=="2" goto :internet
if "%choice%"=="3" goto :clean
if "%choice%"=="4" goto :stop
if "%choice%"=="5" goto :exit
goto :menu

:local
echo.
echo [INFO] Yerel sistem baslatiliyor...
cd /d "%~dp0"
start "Docker" cmd /k "docker-compose up -d && echo Sistem baslatildi: http://localhost:3000 && echo Ag erisimi: http://192.168.0.17:3000"
goto :menu

:internet
echo.
echo [INFO] Internet erisimi baslatiliyor...
cd /d "%~dp0"
call "MASAUSTU-NGROK-BASLAT.bat"
goto :menu

:clean
echo.
echo [UYARI] TUM veritabani verileri silinecek!
set /p confirm="Devam etmek istiyor musunuz? (E/H): "
if /i "%confirm%"=="E" (
    echo [INFO] Veritabani temizleniyor...
    cd /d "%~dp0"
    start "Temizlik" cmd /k "docker-compose down && docker volume rm borclu-sorgulama_borclu-db-data 2>nul && docker-compose up -d && echo Veritabani temizlendi!"
)
goto :menu

:stop
echo.
echo [INFO] Sistem durduruluyor...
cd /d "%~dp0"
start "Durdur" cmd /k "docker-compose down && echo Sistem durduruldu!"
goto :menu

:exit
exit