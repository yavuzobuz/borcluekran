@echo off
color 0C
title Veritabani Temizleme - DIKKAT!

echo.
echo ===============================================================
echo                    VERITABANI TEMIZLEME                     
echo                        DIKKAT!                              
echo ===============================================================
echo.
echo [UYARI] Bu islem TUM veritabani verilerini silecek!
echo [UYARI] Bu islem geri alinamaz!
echo.
set /p confirm="Devam etmek istediginizden emin misiniz? (EVET/hayir): "

if /i not "%confirm%"=="EVET" (
    echo [IPTAL] Islem iptal edildi.
    pause
    exit /b 0
)

echo.
echo [INFO] Veritabani temizleniyor...

REM Proje dizinine git
cd /d "%~dp0"

REM Container'ı durdur
echo [1/4] Container durduruluyor...
docker-compose down
echo [OK] Container durduruldu!

REM Veritabanı volume'unu sil
echo [2/4] Veritabani volume'u siliniyor...
docker volume rm borclu-sorgulama_borclu-db-data 2>nul
echo [OK] Veritabani volume'u silindi!

REM WhatsApp session'ını da temizle (isteğe bağlı)
echo [3/4] WhatsApp session temizleniyor...
docker volume rm borclu-sorgulama_whatsapp-session-data 2>nul
docker volume rm borclu-sorgulama_whatsapp-cache-data 2>nul
echo [OK] WhatsApp session temizlendi!

REM Container'ı yeniden başlat
echo [4/4] Temiz veritabani ile baslatiliyor...
docker-compose up -d
echo [OK] Sistem temiz veritabani ile baslatildi!

echo.
echo ===============================================================
echo                    TEMIZLEME TAMAMLANDI!                    
echo                                                              
echo  Sistem temiz bir veritabani ile baslatildi                 
echo  Artik Excel dosyanizi yukleyebilirsiniz                    
echo                                                              
echo  Sistem adresi: http://localhost:3000                       
echo                                                              
echo ===============================================================
echo.
pause