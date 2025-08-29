@echo off
title Tek Tikla Masaustu GUI Olusturucu
color 0A

echo.
echo ⚡ TEK TIKLA MASAÜSTÜ GUI OLUŞTURUCU
echo ===================================
echo.

:: Masaustu yolunu al
set "desktop=%USERPROFILE%\Desktop"

:: Proje dizinini al
set "projectDir=%~dp0"

:: HTML launcher'i masaustune kopyala
echo 📁 Masaüstü GUI oluşturuluyor...
copy "%projectDir%launcher.html" "%desktop%\Borclu-Sorgulama-GUI.html" >nul

:: Başlatma batch dosyası oluştur
echo @echo off > "%desktop%\Borclu-Sorgulama-Baslat.bat"
echo title Borclu Sorgulama Sistemi >> "%desktop%\Borclu-Sorgulama-Baslat.bat"
echo cd /d "%projectDir%" >> "%desktop%\Borclu-Sorgulama-Baslat.bat"
echo start "" "%desktop%\Borclu-Sorgulama-GUI.html" >> "%desktop%\Borclu-Sorgulama-Baslat.bat"
echo exit >> "%desktop%\Borclu-Sorgulama-Baslat.bat"

if exist "%desktop%\Borclu-Sorgulama-GUI.html" (
    echo.
    echo ✅ BAŞARILI! Masaüstünde 2 dosya oluşturuldu:
    echo.
    echo 📄 Borclu-Sorgulama-GUI.html     = Ana kontrol paneli
    echo 🚀 Borclu-Sorgulama-Baslat.bat   = Hızlı başlatıcı
    echo.
    echo 🎯 KULLANIM:
    echo    • GUI için: HTML dosyasına çift tıklayın
    echo    • Hızlı başlatma: BAT dosyasına çift tıklayın
    echo.
    
    :: GUI'yi aç
    start "" "%desktop%\Borclu-Sorgulama-GUI.html"
    
    echo 🌟 Masaüstü GUI hazır!
    
) else (
    echo ❌ HATA: Dosyalar oluşturulamadı!
)

echo.
pause