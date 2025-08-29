@echo off
echo.
echo ===============================================================
echo                    MANUEL KISAYOL OLUSTURMA                 
echo ===============================================================
echo.
echo PowerShell otomatik kisayol olusturma basarisiz oldu.
echo Manuel olarak kisayol olusturmak icin:
echo.
echo 1. Masaustune sag tikla
echo 2. "Yeni" > "Kisayol" sec
echo 3. Konum olarak su yolu gir:
echo    %~dp0BASIT-LAUNCHER.bat
echo 4. Ad olarak "Borclu Sistem" yaz
echo 5. Tamam'a tikla
echo.
echo Alternatif: BASIT-LAUNCHER.bat dosyasini masaustune kopyala
echo.
pause

REM Dosyayı masaüstüne kopyala
echo Dosya masaustune kopyalaniyor...
copy "%~dp0BASIT-LAUNCHER.bat" "%USERPROFILE%\Desktop\Borclu Sistem.bat"
if %errorlevel% equ 0 (
    echo.
    echo Basarili! Masaustunde "Borclu Sistem.bat" dosyasi olusturuldu.
    echo Bu dosyaya cift tiklayarak sistemi baslatabilirsiniz.
) else (
    echo.
    echo Kopyalama basarisiz. Manuel olarak kopyalayin.
)
pause