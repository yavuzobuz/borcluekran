@echo off
title Super Basit Masaustu Launcher
color 0E

echo.
echo 🚀 SUPER BASİT MASAÜSTÜ LAUNCHER OLUŞTURUCU
echo ============================================
echo.

:: Masaustu yolunu al
for /f "tokens=3*" %%i in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop') do set desktop=%%i %%j

:: HTML launcher'i masaustune kopyala
echo 📋 HTML launcher masaustune kopyalaniyor...
copy "%~dp0launcher.html" "%desktop%\🏢 Borclu Sorgulama Sistemi.html" >nul 2>&1

if exist "%desktop%\🏢 Borclu Sorgulama Sistemi.html" (
    echo ✅ BAŞARILI!
    echo.
    echo 🎉 Masaüstünde "🏢 Borclu Sorgulama Sistemi.html" oluşturuldu
    echo.
    echo 💡 KULLANIM:
    echo    1️⃣  Masaüstündeki HTML dosyasına çift tıklayın
    echo    2️⃣  İstediğiniz seçeneğe tıklayın:
    echo       🏠 Yerel Başlat = WiFi ağından erişim
    echo       🌍 Internet Başlat = Ngrok ile internet erişimi
    echo       🗑️  Veritabanı Temizle = Tüm verileri sil
    echo       ⏹️  Sistemi Durdur = Docker'ı kapat
    echo.
    
    :: Masaüstündeki dosyayı aç
    start "" "%desktop%\🏢 Borclu Sorgulama Sistemi.html"
    
    echo 🌟 HTML launcher açıldı!
    echo 📌 Artık masaüstünden kolayca sistemi başlatabilirsiniz
    
) else (
    echo ❌ HATA: Dosya kopyalanamadı!
    echo 🔧 Çözüm: Bu dosyayı sağ tık > "Yönetici olarak çalıştır"
)

echo.
echo 🔄 Bu pencereyi kapatabilirsiniz
timeout /t 5 >nul