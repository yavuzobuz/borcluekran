@echo off
echo.
echo GUI Masaustu kisayolu olusturuluyor...

REM Dosyayı direkt kopyala
copy "%~dp0GUI-LAUNCHER.bat" "%USERPROFILE%\Desktop\🏢 Borclu Sistem GUI.bat" >nul 2>&1

if exist "%USERPROFILE%\Desktop\🏢 Borclu Sistem GUI.bat" (
    echo.
    echo ✅ BASARILI! 
    echo.
    echo Masaustunde "🏢 Borclu Sistem GUI.bat" olusturuldu!
    echo.
    echo Bu dosyaya cift tiklayinca guzel bir UI acilacak:
    echo - Buyuk renkli butonlar
    echo - Durum gostergeleri  
    echo - URL kopyalama
    echo - Onay mesajlari
    echo.
    echo Simdi masaustundeki dosyaya cift tikla!
) else (
    echo.
    echo ❌ Otomatik kopyalama basarisiz.
    echo Manuel olarak GUI-LAUNCHER.bat'i masaustune kopyala.
)

echo.
pause