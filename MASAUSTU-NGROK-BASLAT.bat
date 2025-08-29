@echo off
color 0B
title Borclu Sorgulama - Masaustu Ngrok Baslat

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                   MASAUSTU NGROK BASLATICI                   
echo ===============================================================
echo.

REM Proje dizinini otomatik bul
set "FOUND_DIR="

REM Mevcut dizinde kontrol et
if exist "docker-compose.yml" (
    set "FOUND_DIR=%CD%"
    echo [OK] Proje dizini mevcut konumda bulundu: %CD%
    goto :found_project
)

REM Yaygın konumları kontrol et
set "SEARCH_PATHS=C:\Users\%USERNAME%\Desktop\BORCLUSORGU\borclu-sorgulama"
set "SEARCH_PATHS=%SEARCH_PATHS%;C:\Users\%USERNAME%\Desktop\borclu-sorgulama"
set "SEARCH_PATHS=%SEARCH_PATHS%;C:\Users\%USERNAME%\Documents\borclu-sorgulama"

echo [INFO] Proje dizini aranıyor...

for %%P in ("%SEARCH_PATHS:;=" "%") do (
    if exist "%%~P\docker-compose.yml" (
        set "FOUND_DIR=%%~P"
        echo [OK] Proje dizini bulundu: %%~P
        goto :found_project
    )
)

REM Bulunamadıysa kullanıcıdan sor
echo [UYARI] Proje dizini otomatik bulunamadi!
echo [INFO] Lutfen borclu-sorgulama klasorunun tam yolunu girin:
set /p "FOUND_DIR=Proje yolu: "

if not exist "%FOUND_DIR%\docker-compose.yml" (
    echo [HATA] Belirtilen dizinde docker-compose.yml bulunamadi!
    pause
    exit /b 1
)

:found_project
cd /d "%FOUND_DIR%"
echo [OK] Proje dizinine gecildi: %FOUND_DIR%

REM PowerShell script'ini çalıştır
echo [INFO] Ngrok launcher baslatiliyor...
powershell -ExecutionPolicy Bypass -File "%FOUND_DIR%\start-with-ngrok.ps1"

pause