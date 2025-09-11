# Ngrok ile Uygulama Başlatma PowerShell Script
Write-Host "🚀 Ngrok ile uygulama baslatiliyor..." -ForegroundColor Green
Write-Host ""

# Current directory
$currentDir = Get-Location

# Start the application
Write-Host "📱 Development server baslatiliyor..." -ForegroundColor Yellow
$devProcess = Start-Process powershell -ArgumentList "-Command", "Set-Location '$currentDir'; npm run dev" -WindowStyle Normal -PassThru

# Wait for server to start
Write-Host "⏰ Server başlaması için 15 saniye bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start Ngrok
Write-Host "🌍 Ngrok tunnel oluşturuluyor..." -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Public URL'niz yakinda konsola yazdırılacaktır!" -ForegroundColor Cyan
Write-Host ""

try {
    # Start ngrok with automatic browser opening disabled
    & ngrok http 3000 --log stdout
} catch {
    Write-Host "❌ Ngrok başlatılamadı: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Manuel olarak 'ngrok http 3000' komutunu çalıştırabilirsiniz." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ İşlem tamamlandı!" -ForegroundColor Green
Read-Host "Çıkmak için Enter tuşuna basın"
