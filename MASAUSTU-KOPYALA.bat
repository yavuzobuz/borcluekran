@echo off
title Masaustu GUI Kopyalayici
color 0A

echo.
echo ===============================================================
echo                    MASAUSTU GUI KOPYALAYICI                 
echo ===============================================================
echo.

:: Masaustu yolunu al
set "desktop=%USERPROFILE%\Desktop"

echo GUI-BASIT-LAUNCHER.bat masaustune kopyalaniyor...
copy "%~dp0GUI-BASIT-LAUNCHER.bat" "%desktop%\Borclu-Sorgulama-GUI.bat" >nul

if exist "%desktop%\Borclu-Sorgulama-GUI.bat" (
    echo.
    echo ✅ BASARILI!
    echo.
    echo 📁 Masaustunde "Borclu-Sorgulama-GUI.bat" olusturuldu
    echo 🖱️  Bu dosyaya cift tiklayarak GUI'yi acabilirsiniz
    echo.
    echo 🌟 KULLANIM:
    echo    - Windows GUI penceresi acilacak
    echo    - Butonlara tiklayarak sistemi yonetin
    echo    - Terminal degil, gercek GUI!
    echo.
    echo 🚀 Masaustundeki GUI aciliyor...
    start "" "%desktop%\Borclu-Sorgulama-GUI.bat"
    
) else (
    echo.
    echo ❌ HATA: Dosya kopyalanamadi!
)

echo.
echo Bu pencereyi kapatabilirsiniz
timeout /t 3 >nul