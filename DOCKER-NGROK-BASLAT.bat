@echo off
color 0B
title Borclu Sorgulama - Docker + Ngrok

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                   DOCKER + NGROK INTERNET ERIŞIMI            
echo ===============================================================
echo.

REM Uygulama dizinine git
cd /d "%~dp0"

REM Docker kontrol
echo [1/3] Docker Desktop kontrol ediliyor...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Docker Desktop calisiyor degil!
    echo [INFO] Lutfen Docker Desktop'i baslatin ve tekrar deneyin.
    pause
    exit /b 1
)
echo [OK] Docker Desktop hazir!

REM Docker container başlat
echo [2/3] Docker container baslatiliyor...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [HATA] Docker container baslatilamadi!
    pause
    exit /b 1
)
echo [OK] Docker container baslatildi!

REM Ngrok kontrol ve başlat
echo [3/3] Ngrok tunnel aciliyor...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Ngrok bulunamadi!
    echo [INFO] Ngrok'u indirin: https://ngrok.com/download
    pause
    exit /b 1
)

echo [INFO] Ngrok baslatiliyor... (Yeni pencere acilacak)
start "Ngrok Tunnel - KAPATMAYIN!" cmd /k "echo === NGROK TUNNEL === && echo. && echo Bu pencereyi KAPATMAYIN! && echo Internet URL'i asagida gorunecek... && echo. && ngrok http 3000"

REM Bekleme
timeout /t 3 /nobreak >nul

echo.
echo ===============================================================
echo                        BASARILI!                            
echo                                                              
echo  ✅ Docker container calisiyor                               
echo  ✅ Ngrok tunnel acildi                                      
echo                                                              
echo  ERIŞIM ADRESLERI:                                          
echo  📍 Yerel: http://localhost:3000                            
echo  🏠 WiFi Ağı: http://192.168.0.17:3000                      
echo  🌍 İnternet: Ngrok penceresindeki https://xxxxx.ngrok.io   
echo                                                              
echo  📋 YAPILACAKLAR:                                           
echo  1. Ngrok penceresindeki URL'i kopyala                      
echo  2. URL'i ekiple paylaş                                     
echo  3. Herkes kendi cihazından erişebilir                      
echo                                                              
echo  ⚠️  ÖNEMLI: Ngrok penceresini kapatma!                     
echo                                                              
echo ===============================================================
echo.
pause