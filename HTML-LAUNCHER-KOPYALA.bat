@echo off
echo.
echo HTML Launcher masaustune kopyalaniyor...

copy "%~dp0launcher.html" "%USERPROFILE%\Desktop\Borclu-Sistem-Launcher.html" >nul 2>&1

if exist "%USERPROFILE%\Desktop\Borclu-Sistem-Launcher.html" (
    echo.
    echo ✅ BASARILI!
    echo.
    echo Masaustunde "Borclu-Sistem-Launcher.html" olusturuldu!
    echo.
    echo KULLANIM:
    echo 1. Masaustundeki HTML dosyasina cift tikla
    echo 2. Tarayicida guzel bir UI acilacak
    echo 3. Renkli butonlara tikla
    echo 4. Sistem otomatik baslatilacak
    echo.
    echo OZELLIKLER:
    echo - Modern gradient tasarim
    echo - Buyuk renkli butonlar
    echo - Durum gostergeleri
    echo - URL gosterimi
    echo - Onay mesajlari
    echo.
    echo Simdi masaustundeki HTML dosyasina cift tikla!
) else (
    echo.
    echo ❌ Otomatik kopyalama basarisiz.
    echo.
    echo Manuel yontem:
    echo 1. launcher.html dosyasini kopyala
    echo 2. Masaustune yapistir
    echo 3. Cift tikla ve kullan
)

echo.
pause