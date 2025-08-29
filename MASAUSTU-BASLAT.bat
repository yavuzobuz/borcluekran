@echo off
color 0A
title Borclu Sorgulama Sistemi - Masaustu Baslatma

echo.
echo ===============================================================
echo                    BORCLU SORGULAMA SISTEMI                  
echo                     MASAUSTU BASLATMA                        
echo ===============================================================
echo.
echo [INFO] Sistem baslatiliyor, lutfen bekleyin...
echo.

REM Proje dizinine git - Bu yolu kendi sisteminize göre güncelleyin
set PROJECT_DIR=C:\Users\Obuzhukuk\Desktop\BORCLUSORGU\borclu-sorgulama

echo [DEBUG] Mevcut dizin: %CD%
echo [DEBUG] Hedef dizin: %PROJECT_DIR%

cd /d "%PROJECT_DIR%"

echo [DEBUG] Yeni dizin: %CD%
echo [DEBUG] docker-compose.yml var mi kontrol ediliyor...

REM Dizin kontrolü
if not exist "docker-compose.yml" (
    echo [HATA] Proje dizini bulunamadi!
    echo [INFO] Beklenen dizin: %PROJECT_DIR%
    echo [INFO] Mevcut dizin: %CD%
    echo [INFO] Dosyalar:
    dir
    echo [INFO] Lutfen MASAUSTU-BASLAT.bat dosyasindaki PROJECT_DIR yolunu guncelleyin
    pause
    exit /b 1
) else (
    echo [OK] docker-compose.yml dosyasi bulundu!
)

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
    echo [INFO] Hata detaylari icin: docker-compose logs
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
echo  Yerel erisim: http://localhost:3000                        
echo  Ag erisimi: http://192.168.0.17:3000                       
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