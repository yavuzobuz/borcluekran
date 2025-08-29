@echo off
color 0C
title Borclu Sorgulama Sistemi - Durdur

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                        DURDURMA                              
echo ===============================================================
echo.

REM Uygulama dizinine git
cd /d "%~dp0"

echo [INFO] Sistem durduruluyor...
echo.

REM Docker container'ları durdur
echo [1/2] Container'lar durduruluyor...
docker-compose down
if %errorlevel% equ 0 (
    echo [OK] Containerlar basariyla durduruldu!
) else (
    echo [UYARI] Containerlar zaten durdurulmus olabilir.
)

REM Kullanılmayan Docker kaynaklarını temizle (isteğe bağlı)
echo [2/2] Temizlik yapılıyor...
docker system prune -f >nul 2>&1
echo [OK] Temizlik tamamlandi!

echo.
echo ===============================================================
echo                        DURDURULDU!                          
echo                                                              
echo  Sistem basariyla durduruldu.                               
echo                                                              
echo  Tekrar baslatmak icin: BASLA.bat dosyasini calistirin     
echo                                                              
echo ===============================================================
echo.
pause
exit