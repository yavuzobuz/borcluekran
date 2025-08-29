# Borclu Sorgulama Sistemi - Grafik Launcher
# Modern Windows Forms UI ile sistem yönetimi

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Ana form oluştur
$form = New-Object System.Windows.Forms.Form
$form.Text = "Borçlu Sorgulama Sistemi - Launcher"
$form.Size = New-Object System.Drawing.Size(600, 500)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 248, 255)

# Icon ayarla (opsiyonel)
try {
    $form.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("$PSScriptRoot\favicon.ico")
} catch {
    # Icon yoksa devam et
}

# Başlık
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "🏢 BORÇLU SORGULAMA SİSTEMİ"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(25, 118, 210)
$titleLabel.Size = New-Object System.Drawing.Size(560, 40)
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$titleLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($titleLabel)

# Alt başlık
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "Modern ve güvenli borçlu takip sistemi"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$subtitleLabel.Size = New-Object System.Drawing.Size(560, 25)
$subtitleLabel.Location = New-Object System.Drawing.Point(20, 60)
$subtitleLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($subtitleLabel)

# Buton stili fonksiyonu
function Set-ButtonStyle($button, $backColor, $foreColor) {
    $button.FlatStyle = "Flat"
    $button.FlatAppearance.BorderSize = 0
    $button.BackColor = $backColor
    $button.ForeColor = $foreColor
    $button.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $button.Cursor = "Hand"
}

# Yerel Başlatma Butonu
$localButton = New-Object System.Windows.Forms.Button
$localButton.Text = "🏠 YEREL BAŞLAT (WiFi Ağı)"
$localButton.Size = New-Object System.Drawing.Size(520, 50)
$localButton.Location = New-Object System.Drawing.Point(40, 110)
Set-ButtonStyle $localButton ([System.Drawing.Color]::FromArgb(76, 175, 80)) ([System.Drawing.Color]::White)
$form.Controls.Add($localButton)

# Internet Başlatma Butonu
$internetButton = New-Object System.Windows.Forms.Button
$internetButton.Text = "🌍 İNTERNET BAŞLAT (Ngrok)"
$internetButton.Size = New-Object System.Drawing.Size(520, 50)
$internetButton.Location = New-Object System.Drawing.Point(40, 180)
Set-ButtonStyle $internetButton ([System.Drawing.Color]::FromArgb(33, 150, 243)) ([System.Drawing.Color]::White)
$form.Controls.Add($internetButton)

# Veritabanı Temizle Butonu
$cleanButton = New-Object System.Windows.Forms.Button
$cleanButton.Text = "🗑️ VERİTABANI TEMİZLE"
$cleanButton.Size = New-Object System.Drawing.Size(250, 40)
$cleanButton.Location = New-Object System.Drawing.Point(40, 250)
Set-ButtonStyle $cleanButton ([System.Drawing.Color]::FromArgb(244, 67, 54)) ([System.Drawing.Color]::White)
$form.Controls.Add($cleanButton)

# Sistem Durdur Butonu
$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Text = "⏹️ SİSTEMİ DURDUR"
$stopButton.Size = New-Object System.Drawing.Size(250, 40)
$stopButton.Location = New-Object System.Drawing.Point(310, 250)
Set-ButtonStyle $stopButton ([System.Drawing.Color]::FromArgb(158, 158, 158)) ([System.Drawing.Color]::White)
$form.Controls.Add($stopButton)

# Durum etiketi
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Sistem durumu kontrol ediliyor..."
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$statusLabel.Size = New-Object System.Drawing.Size(520, 25)
$statusLabel.Location = New-Object System.Drawing.Point(40, 310)
$statusLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($statusLabel)

# URL gösterme alanı
$urlTextBox = New-Object System.Windows.Forms.TextBox
$urlTextBox.Size = New-Object System.Drawing.Size(420, 25)
$urlTextBox.Location = New-Object System.Drawing.Point(40, 350)
$urlTextBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$urlTextBox.ReadOnly = $true
$urlTextBox.Text = "Sistem başlatıldığında URL burada görünecek..."
$form.Controls.Add($urlTextBox)

# URL Kopyala Butonu
$copyButton = New-Object System.Windows.Forms.Button
$copyButton.Text = "📋"
$copyButton.Size = New-Object System.Drawing.Size(40, 25)
$copyButton.Location = New-Object System.Drawing.Point(470, 350)
Set-ButtonStyle $copyButton ([System.Drawing.Color]::FromArgb(156, 39, 176)) ([System.Drawing.Color]::White)
$form.Controls.Add($copyButton)

# Tarayıcıda Aç Butonu
$openButton = New-Object System.Windows.Forms.Button
$openButton.Text = "🌐"
$openButton.Size = New-Object System.Drawing.Size(40, 25)
$openButton.Location = New-Object System.Drawing.Point(520, 350)
Set-ButtonStyle $openButton ([System.Drawing.Color]::FromArgb(255, 152, 0)) ([System.Drawing.Color]::White)
$form.Controls.Add($openButton)

# Proje dizinini bul
$projectDir = $PSScriptRoot
if (-not (Test-Path "$projectDir\docker-compose.yml")) {
    $possiblePaths = @(
        "C:\Users\$env:USERNAME\Desktop\BORCLUSORGU\borclu-sorgulama",
        "C:\Users\$env:USERNAME\Desktop\borclu-sorgulama",
        "C:\Users\$env:USERNAME\Documents\borclu-sorgulama"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path "$path\docker-compose.yml") {
            $projectDir = $path
            break
        }
    }
}

# Docker durumunu kontrol et
function Check-DockerStatus {
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            $statusLabel.Text = "✅ Docker çalışıyor - Sistem hazır"
            $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
            return $true
        }
    } catch {}
    
    $statusLabel.Text = "❌ Docker çalışmıyor - Lütfen Docker Desktop'ı başlatın"
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(244, 67, 54)
    return $false
}

# Buton olayları
$localButton.Add_Click({
    $statusLabel.Text = "🚀 Yerel sistem başlatılıyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(33, 150, 243)
    
    Set-Location $projectDir
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker-compose up -d; Write-Host 'Sistem başlatıldı! http://localhost:3000' -ForegroundColor Green"
    
    Start-Sleep -Seconds 3
    $urlTextBox.Text = "http://localhost:3000 | http://192.168.0.17:3000"
    $statusLabel.Text = "✅ Yerel sistem çalışıyor"
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
})

$internetButton.Add_Click({
    $statusLabel.Text = "🌍 Internet erişimi başlatılıyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(33, 150, 243)
    
    Set-Location $projectDir
    Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "$projectDir\start-with-ngrok.ps1"
    
    Start-Sleep -Seconds 5
    $urlTextBox.Text = "Ngrok penceresindeki https://xxxxx.ngrok.io URL'ini kopyalayın"
    $statusLabel.Text = "✅ Internet erişimi aktif - Ngrok penceresini kontrol edin"
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
})

$cleanButton.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show(
        "TÜM veritabanı verileri silinecek!`nBu işlem geri alınamaz.`n`nDevam etmek istiyor musunuz?",
        "Veritabanı Temizle",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Warning
    )
    
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        $statusLabel.Text = "🗑️ Veritabanı temizleniyor..."
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(244, 67, 54)
        
        Set-Location $projectDir
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker-compose down; docker volume rm borclu-sorgulama_borclu-db-data 2>$null; docker-compose up -d; Write-Host 'Veritabanı temizlendi!' -ForegroundColor Green"
        
        Start-Sleep -Seconds 3
        $statusLabel.Text = "✅ Veritabanı temizlendi - Sistem yeniden başlatıldı"
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
    }
})

$stopButton.Add_Click({
    $statusLabel.Text = "⏹️ Sistem durduruluyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 158, 158)
    
    Set-Location $projectDir
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "docker-compose down; Write-Host 'Sistem durduruldu!' -ForegroundColor Yellow"
    
    Start-Sleep -Seconds 2
    $urlTextBox.Text = "Sistem durduruldu"
    $statusLabel.Text = "⏹️ Sistem durduruldu"
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(158, 158, 158)
})

$copyButton.Add_Click({
    if ($urlTextBox.Text -and $urlTextBox.Text -ne "Sistem başlatıldığında URL burada görünecek..." -and $urlTextBox.Text -ne "Sistem durduruldu") {
        [System.Windows.Forms.Clipboard]::SetText($urlTextBox.Text)
        [System.Windows.Forms.MessageBox]::Show("URL panoya kopyalandı!", "Başarılı", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    }
})

$openButton.Add_Click({
    if ($urlTextBox.Text -match "http") {
        $url = ($urlTextBox.Text -split " \| ")[0]
        Start-Process $url
    }
})

# İlk durum kontrolü
Check-DockerStatus

# Timer ile periyodik kontrol
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 10000  # 10 saniye
$timer.Add_Tick({ Check-DockerStatus })
$timer.Start()

# Formu göster
$form.Add_FormClosed({ $timer.Stop() })
$form.ShowDialog()