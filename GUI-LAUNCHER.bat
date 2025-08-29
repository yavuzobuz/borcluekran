@echo off
title Borclu Sistem GUI Launcher

REM PowerShell GUI'yi başlat
powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0GUI-LAUNCHER.ps1"

REM Eğer hata olursa
if %errorlevel% neq 0 (
    echo GUI baslatilirken hata olustu.
    echo Alternatif terminal menu aciliyor...
    pause
    call "%~dp0BASIT-LAUNCHER.bat"
)