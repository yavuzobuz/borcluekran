@echo off
color 0A
title Borclu Sorgulama - Hizli Launcher

:main
cls
echo.
echo        ╔══════════════════════════════════════════════════════╗
echo        ║              🏢 BORÇLU SORGULAMA SİSTEMİ              ║
echo        ║                   HIZLI LAUNCHER                     ║
echo        ╚══════════════════════════════════════════════════════╝
echo.
echo        ┌──────────────────────────────────────────────────────┐
echo        │  [1] 🏠 YEREL BAŞLAT (WiFi Ağı)                     │
echo        │  [2] 🌍 İNTERNET BAŞLAT (Ngrok)                     │
echo        │  [3] 🗑️  VERİTABANI TEMİZLE                          │
echo        │  [4] ⏹️  SİSTEMİ DURDUR                              │
echo        │  [5] 📊 SİSTEM DURUMU                               │
echo        │  [6] ❌ ÇIKIŞ                                        │
echo        └──────────────────────────────────────────────────────┘
echo.
set /p choice="        Seçiminizi yapın (1-6): "

if "%choice%"=="1" goto :local
if "%choice%"=="2" goto :internet  
if "%choice%"=="3" goto :clean
if "%choice%"=="4" goto :stop
if "%choice%"=="5" goto :status
if "%choice%"=="6" goto :exit
echo        ❌ Geçersiz seçim! Tekrar deneyin...
timeout /t 2 >nul
goto :main

:local
cls
echo.
echo        🏠 YEREL SİSTEM BAŞLATILIYOR...
echo        ═══════════════════════════════════
echo.
cd /d "%~dp0"
docker-compose up -d
if %errorlevel% equ 0 (
    echo        ✅ Sistem başarıyla başlatıldı!
    echo.
    echo        📍 Erişim Adresleri:
    echo           • Yerel: http://localhost:3000
    echo           • WiFi Ağı: http://192.168.0.17:3000
    echo.
    echo        🌐 Tarayıcıda açılıyor...
    start http://localhost:3000
) else (
    echo        ❌ Sistem başlatılamadı! Docker Desktop çalışıyor mu?
)
echo.
pause
goto :main

:internet
cls
echo.
echo        🌍 İNTERNET ERİŞİMİ BAŞLATILIYOR...
echo        ═══════════════════════════════════════
echo.
cd /d "%~dp0"
echo        [1/2] Docker container başlatılıyor...
docker-compose up -d
if %errorlevel% equ 0 (
    echo        ✅ Docker container başlatıldı!
    echo        [2/2] Ngrok tunnel açılıyor...
    echo.
    echo        📋 YAPILACAKLAR:
    echo           1. Açılacak Ngrok penceresindeki URL'i kopyala
    echo           2. URL'i ekiple paylaş
    echo           3. Herkes farklı WiFi'lerden erişebilir
    echo.
    echo        ⚠️  Ngrok penceresini kapatma!
    echo.
    pause
    start "Ngrok Tunnel - KAPATMA!" cmd /k "echo === NGROK TUNNEL === && echo Bu pencereyi KAPATMA! && echo Internet URL'i asagida gorunecek... && echo. && ngrok http 3000"
) else (
    echo        ❌ Docker başlatılamadı!
)
echo.
pause
goto :main

:clean
cls
echo.
echo        🗑️ VERİTABANI TEMİZLEME
echo        ═══════════════════════════
echo.
echo        ⚠️  UYARI: TÜM veritabanı verileri silinecek!
echo        ⚠️  Bu işlem geri alınamaz!
echo.
set /p confirm="        Devam etmek istiyor musunuz? (EVET/hayir): "
if /i "%confirm%"=="EVET" (
    echo.
    echo        🗑️ Veritabanı temizleniyor...
    cd /d "%~dp0"
    docker-compose down
    docker volume rm borclu-sorgulama_borclu-db-data 2>nul
    docker-compose up -d
    echo        ✅ Veritabanı temizlendi ve sistem yeniden başlatıldı!
) else (
    echo        ❌ İşlem iptal edildi.
)
echo.
pause
goto :main

:stop
cls
echo.
echo        ⏹️ SİSTEM DURDURULUYOR...
echo        ═══════════════════════════
echo.
cd /d "%~dp0"
docker-compose down
if %errorlevel% equ 0 (
    echo        ✅ Sistem başarıyla durduruldu!
) else (
    echo        ⚠️ Sistem zaten durdurulmuş olabilir.
)
echo.
pause
goto :main

:status
cls
echo.
echo        📊 SİSTEM DURUMU
echo        ═══════════════════
echo.
cd /d "%~dp0"
echo        Docker Desktop Durumu:
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo        ✅ Docker Desktop çalışıyor
    echo.
    echo        Container Durumu:
    docker-compose ps
) else (
    echo        ❌ Docker Desktop çalışmıyor
    echo        💡 Docker Desktop'ı başlatın ve tekrar deneyin
)
echo.
echo        Ngrok Durumu:
ngrok version >nul 2>&1
if %errorlevel% equ 0 (
    echo        ✅ Ngrok kurulu
) else (
    echo        ❌ Ngrok kurulu değil
    echo        💡 https://ngrok.com/download adresinden indirin
)
echo.
pause
goto :main

:exit
cls
echo.
echo        👋 Görüşürüz!
echo.
timeout /t 2 >nul
exit