@echo off
color 0B
title Borclu Sorgulama Sistemi - Internet Erişimi

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                     INTERNET ERIŞIMI                         
echo ===============================================================
echo.
echo [INFO] Sistem internet erişimi ile baslatiliyor...
echo.

REM Uygulama dizinine git
cd /d "%~dp0"

REM Docker kontrol
echo [1/4] Docker Desktop kontrol ediliyor...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Docker Desktop calisiyor degil!
    echo [INFO] Lutfen Docker Desktop'i baslatin ve tekrar deneyin.
    pause
    exit /b 1
)
echo [OK] Docker Desktop hazir!

REM Docker container başlat
echo [2/4] Docker container baslatiliyor...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [HATA] Docker container baslatilamadi!
    pause
    exit /b 1
)
echo [OK] Docker container baslatildi!

REM Ngrok kontrol
echo [3/4] Ngrok kontrol ediliyor...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Ngrok bulunamadi!
    echo [INFO] Ngrok'u indirmek icin: https://ngrok.com/download
    echo [INFO] Veya chocolatey ile: choco install ngrok
    pause
    exit /b 1
)
echo [OK] Ngrok hazir!

REM Ngrok başlat
echo [4/4] Internet tunnel aciliyor...
echo [INFO] Ngrok baslatiliyor... (Yeni pencere acilacak)

REM Ngrok'u JSON formatında başlat (URL'yi otomatik almak için)
start "Ngrok Tunnel" cmd /k "echo Ngrok Tunnel - KAPATMAYIN! && echo. && echo Internet URL'i aliniyor... && ngrok http 3000 --log stdout"

REM Ngrok'un başlamasını bekle
echo [INFO] Ngrok baslatiliyor, lutfen bekleyin...
timeout /t 8 /nobreak >nul

REM Ngrok URL'sini almaya çalış
echo [INFO] Internet URL'i aliniyor...
for /f "tokens=*" %%i in ('curl -s http://localhost:4040/api/tunnels 2^>nul ^| findstr "public_url"') do (
    set "ngrok_url=%%i"
)

echo.
echo ===============================================================
echo                        BASARILI!                            
echo                                                              
echo  Yerel erisim: http://localhost:3000                        
echo  Ag erisimi: http://192.168.0.17:3000                       
echo                                                              
echo  INTERNET ERIŞIMI:                                          
echo  Ngrok penceresindeki https://xxxxx.ngrok.io URL'ini        
echo  kopyala ve paylas!                                         
echo                                                              
echo  ONEMLI NOTLAR:                                             
echo  - Ngrok penceresini kapatma!                               
echo  - URL her yeniden baslatmada degisir                       
echo  - Ucretsiz surum 2 saat sonra kapanir                     
echo                                                              
echo ===============================================================
echo.
echo Ngrok penceresi acildi. URL'i oradan kopyala!
echo Bu pencereyi kapatabilirsin.
pause