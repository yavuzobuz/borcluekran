@echo off
color 0A
title Borclu Sorgulama Sistemi - Tek Tik Baslatma

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                     TEK TIK BASLATMA                         
echo ===============================================================
echo.
echo [INFO] Sistem baslatiliyor, lutfen bekleyin...
echo.

REM Uygulama dizinine git
cd /d "%~dp0"

REM Docker Desktop kontrolü ve başlatma
echo [1/5] Docker Desktop kontrol ediliyor...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [UYARI] Docker Desktop calisiyor, baslatiliyor...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo [INFO] Docker Desktop baslatildi, 30 saniye bekleniyor...
    timeout /t 30 /nobreak >nul
    
    REM Docker'ın başlamasını bekle
    :wait_docker
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Docker henuz hazir degil, 5 saniye daha bekleniyor...
        timeout /t 5 /nobreak >nul
        goto wait_docker
    )
)
echo [OK] Docker Desktop hazir!

REM Environment dosyası kontrolü
echo [2/5] Yapilandirma dosyalari kontrol ediliyor...
if not exist ".env" (
    echo [UYARI] .env dosyasi bulunamadi, ornek dosyadan kopyalaniyor...
    if exist ".env.ornek" (
        copy ".env.ornek" ".env" >nul
        echo [OK] .env dosyasi olusturuldu!
        echo [UYARI] Lutfen .env dosyasindaki API anahtarlarini guncelleyin!
        pause
    ) else (
        echo [HATA] .env.ornek dosyasi bulunamadi!
        echo [INFO] Varsayilan .env dosyasi olusturuluyor...
        call :create_default_env
    )
)
echo [OK] Yapilandirma dosyalari hazir!

REM Önceki container'ları temizle
echo [3/5] Onceki containerlar temizleniyor...
docker-compose down >nul 2>&1
echo [OK] Temizlik tamamlandi!

REM Docker container'ları başlat
echo [4/5] Uygulama baslatiliyor...
echo [INFO] Bu islem ilk seferde biraz uzun surebilir...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [HATA] Uygulama baslatilamadi!
    echo [INFO] Hata detayları için: docker-compose logs
    pause
    exit /b 1
)
echo [OK] Uygulama baslatildi!

REM Uygulamanın hazır olmasını bekle
echo [5/5] Uygulama hazirlaniyor...
timeout /t 10 /nobreak >nul

REM Tarayıcıda aç
echo [OK] Sistem hazir! Tarayici aciliyor...
start http://localhost:3000

echo.
echo ===============================================================
echo                        BASARILI!                            
echo                                                              
echo  Uygulama su adreste calisiyor: http://localhost:3000       
echo                                                              
echo  Durdurmak icin: DURDUR.bat dosyasini calistirin           
echo                                                              
echo ===============================================================
echo.
echo Bu pencereyi kapatabilirsiniz.
pause
exit

:create_default_env
echo DATABASE_URL="file:/app/prisma/dev.db" > .env
echo GEMINI_API_KEY="your_gemini_api_key_here" >> .env
echo NEXTAUTH_SECRET="your_nextauth_secret_here" >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env
echo [OK] Varsayilan .env dosyasi olusturuldu!
echo [UYARI] API anahtarlarini .env dosyasinda guncellemeyi unutmayin!
goto :eof