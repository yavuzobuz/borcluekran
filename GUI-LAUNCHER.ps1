# Borclu Sorgulama Sistemi - Grafik UI Launcher
# Modern Windows Forms arayüzü

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Ana form
$form = New-Object System.Windows.Forms.Form
$form.Text = "🏢 Borçlu Sorgulama Sistemi"
$form.Size = New-Object System.Drawing.Size(500, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::White

# Başlık
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "BORÇLU SORGULAMA SİSTEMİ"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::DarkBlue
$titleLabel.Size = New-Object System.Drawing.Size(460, 30)
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$titleLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($titleLabel)

# Alt başlık
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "Docker + Next.js + Ngrok ile modern borçlu takip sistemi"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$subtitleLabel.ForeColor = [System.Drawing.Color]::Gray
$subtitleLabel.Size = New-Object System.Drawing.Size(460, 20)
$subtitleLabel.Location = New-Object System.Drawing.Point(20, 50)
$subtitleLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($subtitleLabel)

# Buton stili
function Create-Button($text, $x, $y, $width, $height, $backColor) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $text
    $button.Size = New-Object System.Drawing.Size($width, $height)
    $button.Location = New-Object System.Drawing.Point($x, $y)
    $button.BackColor = $backColor
    $button.ForeColor = [System.Drawing.Color]::White
    $button.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $button.FlatStyle = "Flat"
    $button.FlatAppearance.BorderSize = 0
    $button.Cursor = "Hand"
    return $button
}

# Yerel Başlat Butonu
$localButton = Create-Button "🏠 YEREL BAŞLAT (WiFi Ağı)" 50 100 380 50 ([System.Drawing.Color]::FromArgb(76, 175, 80))
$form.Controls.Add($localButton)

# Internet Başlat Butonu
$internetButton = Create-Button "🌍 İNTERNET BAŞLAT (Ngrok)" 50 170 380 50 ([System.Drawing.Color]::FromArgb(33, 150, 243))
$form.Controls.Add($internetButton)

# Veritabanı Temizle Butonu
$cleanButton = Create-Button "🗑️ VERİTABANI TEMİZLE" 50 240 180 40 ([System.Drawing.Color]::FromArgb(244, 67, 54))
$form.Controls.Add($cleanButton)

# Sistem Durdur Butonu
$stopButton = Create-Button "⏹️ SİSTEMİ DURDUR" 250 240 180 40 ([System.Drawing.Color]::FromArgb(158, 158, 158))
$form.Controls.Add($stopButton)

# Durum etiketi
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Sistem hazır - Bir işlem seçin"
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$statusLabel.ForeColor = [System.Drawing.Color]::Green
$statusLabel.Size = New-Object System.Drawing.Size(460, 20)
$statusLabel.Location = New-Object System.Drawing.Point(20, 300)
$statusLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($statusLabel)

# URL gösterme
$urlLabel = New-Object System.Windows.Forms.Label
$urlLabel.Text = "Sistem başlatıldığında URL burada görünecek"
$urlLabel.Font = New-Object System.Drawing.Font("Consolas", 8)
$urlLabel.ForeColor = [System.Drawing.Color]::Blue
$urlLabel.Size = New-Object System.Drawing.Size(460, 15)
$urlLabel.Location = New-Object System.Drawing.Point(20, 325)
$urlLabel.TextAlign = "MiddleCenter"
$form.Controls.Add($urlLabel)

# Proje dizini
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Buton olayları
$localButton.Add_Click({
    $statusLabel.Text = "🚀 Yerel sistem başlatılıyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::Orange
    $form.Refresh()
    
    Set-Location $projectDir
    $result = Start-Process "docker-compose" -ArgumentList "up -d" -Wait -PassThru -WindowStyle Hidden
    
    if ($result.ExitCode -eq 0) {
        $statusLabel.Text = "✅ Yerel sistem çalışıyor!"
        $statusLabel.ForeColor = [System.Drawing.Color]::Green
        $urlLabel.Text = "🏠 http://localhost:3000 | 📶 http://192.168.0.17:3000"
        
        # Tarayıcıda aç
        Start-Process "http://localhost:3000"
    } else {
        $statusLabel.Text = "❌ Başlatma başarısız! Docker Desktop çalışıyor mu?"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
    }
})

$internetButton.Add_Click({
    $statusLabel.Text = "🌍 Internet erişimi başlatılıyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::Orange
    $form.Refresh()
    
    Set-Location $projectDir
    
    # Docker başlat
    $dockerResult = Start-Process "docker-compose" -ArgumentList "up -d" -Wait -PassThru -WindowStyle Hidden
    
    if ($dockerResult.ExitCode -eq 0) {
        $statusLabel.Text = "✅ Internet erişimi aktif! Ngrok penceresini kontrol edin"
        $statusLabel.ForeColor = [System.Drawing.Color]::Green
        $urlLabel.Text = "🌍 Ngrok penceresindeki https://xxxxx.ngrok.io URL'ini kopyalayın"
        
        # Ngrok başlat
        Start-Process "cmd" -ArgumentList "/k", "title Ngrok Tunnel - KAPATMAYIN! && ngrok http 3000"
    } else {
        $statusLabel.Text = "❌ Docker başlatılamadı!"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
    }
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
        $statusLabel.ForeColor = [System.Drawing.Color]::Orange
        $form.Refresh()
        
        Set-Location $projectDir
        Start-Process "docker-compose" -ArgumentList "down" -Wait -WindowStyle Hidden
        Start-Process "docker" -ArgumentList "volume", "rm", "borclu-sorgulama_borclu-db-data" -Wait -WindowStyle Hidden
        Start-Process "docker-compose" -ArgumentList "up -d" -Wait -WindowStyle Hidden
        
        $statusLabel.Text = "✅ Veritabanı temizlendi ve sistem yeniden başlatıldı!"
        $statusLabel.ForeColor = [System.Drawing.Color]::Green
        $urlLabel.Text = "🏠 http://localhost:3000 | 📶 http://192.168.0.17:3000"
    }
})

$stopButton.Add_Click({
    $statusLabel.Text = "⏹️ Sistem durduruluyor..."
    $statusLabel.ForeColor = [System.Drawing.Color]::Orange
    $form.Refresh()
    
    Set-Location $projectDir
    Start-Process "docker-compose" -ArgumentList "down" -Wait -WindowStyle Hidden
    
    $statusLabel.Text = "⏹️ Sistem durduruldu"
    $statusLabel.ForeColor = [System.Drawing.Color]::Gray
    $urlLabel.Text = "Sistem durduruldu"
})

# Formu göster
$form.ShowDialog()