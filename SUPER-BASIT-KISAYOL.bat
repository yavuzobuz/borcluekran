@echo off
echo.
echo Kanka, en basit yontem:
echo.
echo 1. BASIT-LAUNCHER.bat dosyasini sec
echo 2. Ctrl+C ile kopyala
echo 3. Masaustune git
echo 4. Ctrl+V ile yapistir
echo 5. Adini "Borclu Sistem" yap
echo 6. Cift tikla ve kullan!
echo.
echo Alternatif: Bu dosyayi masaustune kopyaliyorum...

copy "%~dp0BASIT-LAUNCHER.bat" "%USERPROFILE%\Desktop\🏢 Borclu Sistem.bat" >nul 2>&1

if exist "%USERPROFILE%\Desktop\🏢 Borclu Sistem.bat" (
    echo.
    echo ✅ BASARILI! Masaustunde "🏢 Borclu Sistem.bat" olusturuldu!
    echo.
    echo Simdi masaustundeki dosyaya cift tikla ve kullan!
) else (
    echo.
    echo ❌ Otomatik kopyalama basarisiz.
    echo Manuel olarak BASIT-LAUNCHER.bat'i masaustune kopyala.
)

echo.
pause