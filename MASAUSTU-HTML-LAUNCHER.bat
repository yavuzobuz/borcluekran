@echo off
title Masaustu HTML Launcher Olusturucu
color 0B

echo.
echo ===============================================================
echo              MASAUSTU HTML LAUNCHER OLUSTURUCU              
echo ===============================================================
echo.

:: Masaustu yolunu al
set "desktop=%USERPROFILE%\Desktop"

:: HTML launcher dosyasini masaustune kopyala
echo HTML launcher masaustune kopyalaniyor...
copy "%~dp0launcher.html" "%desktop%\Borclu-Sorgulama-Launcher.html" >nul

if exist "%desktop%\Borclu-Sorgulama-Launcher.html" (
    echo.
    echo ✅ BASARILI!
    echo.
    echo 📁 Masaustunde "Borclu-Sorgulama-Launcher.html" dosyasi olusturuldu
    echo 🖱️  Bu dosyaya cift tiklayarak sistemi baslatabilirsiniz
    echo.
    echo 🌟 KULLANIM:
    echo    - Masaustundeki HTML dosyasina cift tiklayin
    echo    - Acilan sayfada istediginiz secenege tiklayin
    echo    - Yerel: WiFi agindaki cihazlardan erisim
    echo    - Internet: Ngrok ile internet erisimi
    echo.
    
    :: HTML dosyasini ac
    echo HTML launcher aciliyor...
    start "" "%desktop%\Borclu-Sorgulama-Launcher.html"
    
) else (
    echo.
    echo ❌ HATA: HTML dosyasi kopyalanamadi!
    echo Lutfen yonetici olarak calistirin
)

echo.
pause