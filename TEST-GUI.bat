@echo off
echo GUI test ediliyor...

REM Direkt proje klasöründen GUI'yi çalıştır
powershell -ExecutionPolicy Bypass -File "%~dp0GUI-LAUNCHER.ps1"

if %errorlevel% neq 0 (
    echo.
    echo GUI calismadi. Alternatif basit menu:
    pause
    call "%~dp0BASIT-LAUNCHER.bat"
)

pause