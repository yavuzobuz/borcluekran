@echo off
echo.
echo Basit GUI kisayolu olusturuluyor...

REM Normal karakterlerle dosya kopyala
copy "%~dp0TEST-GUI.bat" "%USERPROFILE%\Desktop\Borclu-Sistem-GUI.bat" >nul 2>&1

if exist "%USERPROFILE%\Desktop\Borclu-Sistem-GUI.bat" (
    echo.
    echo BASARILI!
    echo.
    echo Masaustunde "Borclu-Sistem-GUI.bat" olusturuldu!
    echo.
    echo Bu dosyaya cift tikla:
    echo - Grafik UI acilacak
    echo - Renkli butonlar
    echo - Kolay kullanim
    echo.
) else (
    echo.
    echo Otomatik kopyalama basarisiz.
    echo.
    echo Manuel yontem:
    echo 1. TEST-GUI.bat dosyasini kopyala
    echo 2. Masaustune yapistir
    echo 3. Adini "Borclu Sistem" yap
)

echo.
echo Simdi masaustundeki "Borclu-Sistem-GUI.bat" dosyasina cift tikla!
pause