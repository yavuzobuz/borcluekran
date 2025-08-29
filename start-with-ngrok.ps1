# Uygulama ve Ngrok Otomatik Baslat
# Bu script Next.js uygulamasini ve ngrok'u otomatik olarak baslatir

Write-Host "=== Borclu Sorgulama Uygulamasi - Ngrok ile Baslatici ===" -ForegroundColor Green
Write-Host ""

# Mevcut dizini kontrol et
$currentDir = Get-Location
Write-Host "Calisma dizini: $currentDir" -ForegroundColor Yellow

# Node.js kontrolu
try {
    $nodeVersion = node --version
    Write-Host "Node.js bulundu: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js bulunamadi! Lutfen Node.js'i yukleyin." -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# Docker Desktop'i otomatik baslat
Write-Host "Docker Desktop baslatiliyor..." -ForegroundColor Yellow
try {
    # Docker Desktop'in calisip calismadigini kontrol et
    $dockerRunning = $false
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            $dockerRunning = $true
        }
    } catch {
        $dockerRunning = $false
    }
    
    if (-not $dockerRunning) {
        Write-Host "Docker Desktop baslatiliyor..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden
        
        # Docker'in baslamasini bekle (maksimum 120 saniye)
        $timeout = 120
        $elapsed = 0
        while ($elapsed -lt $timeout) {
            Start-Sleep -Seconds 3
            $elapsed += 3
            try {
                $dockerInfo = docker info 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Docker Desktop basariyla basladi!" -ForegroundColor Green
                    break
                }
            } catch {
                # Devam et
            }
            Write-Host "Docker baslamasini bekleniyor... ($elapsed/$timeout saniye)" -ForegroundColor Yellow
        }
        
        if ($elapsed -ge $timeout) {
            Write-Host "Docker Desktop baslatilirken zaman asimi! Manuel olarak baslatmayi deneyin." -ForegroundColor Red
            Read-Host "Devam etmek icin Enter'a basin"
            exit 1
        }
    } else {
        Write-Host "Docker Desktop zaten calisiyor!" -ForegroundColor Green
    }
} catch {
    Write-Host "Docker Desktop baslatilirken hata olustu!" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# Ngrok kontrolu
try {
    $ngrokVersion = ngrok version
    Write-Host "Ngrok bulundu" -ForegroundColor Green
} catch {
    Write-Host "Ngrok bulunamadi! Lutfen ngrok'u yukleyin ve PATH'e ekleyin." -ForegroundColor Red
    Write-Host "Indirme linki: https://ngrok.com/download" -ForegroundColor Yellow
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# package.json kontrolu
if (-not (Test-Path "package.json")) {
    Write-Host "package.json bulunamadi! Bu dizinde bir Next.js projesi yok gibi gorunuyor." -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

# Port 3000 kontrolu
try {
    $portCheck = netstat -an | Select-String ":3000"
    if ($portCheck) {
        Write-Host "Port 3000 zaten kullanimda! Devam etmek istiyor musunuz?" -ForegroundColor Yellow
        $continue = Read-Host "Devam etmek istiyor musunuz? (y/n)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 0
        }
    }
} catch {
    # Port kontrolu basarisiz olursa devam et
}

Write-Host "" 
Write-Host "Uygulama baslatiliyor..." -ForegroundColor Green
Write-Host ""

# 1. Docker container'ini baslat
Write-Host "Docker container baslatiliyor..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentDir'; docker-compose up -d; Write-Host 'Docker container baslatildi! Bu pencereyi kapatabilirsiniz.' -ForegroundColor Green; Read-Host 'Enter ile devam'"

# Uygulamanin baslamasi icin bekle
Write-Host "Uygulamanin baslamasi icin 10 saniye bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 2. Ngrok'u baslat
Write-Host "Ngrok tunnel baslatiliyor..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000"

Write-Host ""
Write-Host "Her iki servis de baslatildi!" -ForegroundColor Green
Write-Host "Docker Container: http://localhost:3000" -ForegroundColor Blue
Write-Host "Ngrok Tunnel: Public URL ngrok penceresinde gorunecek" -ForegroundColor Magenta
Write-Host ""
Write-Host "Ipucu: Ngrok penceresindeki 'https://xxx.ngrok.io' adresini paylasabilirsiniz" -ForegroundColor Yellow
Write-Host ""
Write-Host "Durdurmak icin: Her iki pencerede Ctrl+C tuslayın" -ForegroundColor Red
Write-Host "Docker'i durdurmak icin: docker-compose down" -ForegroundColor Red
Write-Host ""
Write-Host "OTOMATIK DURDURMA: Bu pencereyi kapattiginizda Docker container'lari otomatik olarak durdurulacak." -ForegroundColor Magenta

# Cleanup fonksiyonu tanimla
$cleanup = {
    Write-Host ""
    Write-Host "Temizlik yapiliyor..." -ForegroundColor Yellow
    try {
        docker-compose down 2>$null
        Write-Host "Docker container'lari durduruldu." -ForegroundColor Green
    } catch {
        Write-Host "Docker container'lari durdurulurken hata olustu." -ForegroundColor Red
    }
}

# Ctrl+C veya pencere kapatma durumunda cleanup calistir
try {
    [Console]::TreatControlCAsInput = $true
    Register-EngineEvent PowerShell.Exiting -Action $cleanup
    
    # Kullanicinin kapatmasini bekle
    Read-Host "Bu pencereyi kapatmak icin Enter'a basin"
    
    # Manuel durdurma
    & $cleanup
} catch {
    # Hata durumunda da cleanup calistir
    & $cleanup
}