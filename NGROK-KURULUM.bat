@echo off
color 0E
title Ngrok Kurulum

echo.
echo ===============================================================
echo                        NGROK KURULUM                        
echo ===============================================================
echo.

REM Chocolatey var mı kontrol et
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Chocolatey bulundu, Ngrok kuruluyor...
    choco install ngrok -y
    if %errorlevel% equ 0 (
        echo [OK] Ngrok basariyla kuruldu!
        goto :setup_auth
    )
)

echo [INFO] Manuel kurulum gerekli...
echo.
echo 1. https://ngrok.com/download adresine git
echo 2. Windows surumunu indir
echo 3. ngrok.exe dosyasini bu klasore kopyala
echo 4. Veya PATH'e ekle
echo.
echo Kurulum tamamlandiktan sonra bu dosyayi tekrar calistir.
pause
exit /b 1

:setup_auth
echo.
echo [INFO] Ngrok hesap kurulumu...
echo.
echo 1. https://dashboard.ngrok.com/get-started/your-authtoken adresine git
echo 2. Ucretsiz hesap ac (GitHub ile giris yapabilirsin)
echo 3. Authtoken'i kopyala
echo 4. Asagidaki komutu calistir:
echo.
echo    ngrok config add-authtoken [TOKEN]
echo.
echo Ornek:
echo    ngrok config add-authtoken 2abc123def456ghi789jkl
echo.
pause