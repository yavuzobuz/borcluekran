@echo off
title Borclu Sorgulama Sistemi GUI

REM PowerShell GUI kodunu direkt çalıştır
powershell -ExecutionPolicy Bypass -Command "& {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    # Ana form
    $form = New-Object System.Windows.Forms.Form
    $form.Text = 'Borclu Sorgulama Sistemi'
    $form.Size = New-Object System.Drawing.Size(450, 350)
    $form.StartPosition = 'CenterScreen'
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Başlık
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = 'BORCLU SORGULAMA SISTEMI'
    $titleLabel.Font = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::DarkBlue
    $titleLabel.Size = New-Object System.Drawing.Size(410, 30)
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $titleLabel.TextAlign = 'MiddleCenter'
    $form.Controls.Add($titleLabel)
    
    # Yerel Başlat Butonu
    $localButton = New-Object System.Windows.Forms.Button
    $localButton.Text = 'YEREL BASLAT (WiFi Agi)'
    $localButton.Size = New-Object System.Drawing.Size(350, 45)
    $localButton.Location = New-Object System.Drawing.Point(50, 70)
    $localButton.BackColor = [System.Drawing.Color]::Green
    $localButton.ForeColor = [System.Drawing.Color]::White
    $localButton.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
    $localButton.FlatStyle = 'Flat'
    $form.Controls.Add($localButton)
    
    # Internet Başlat Butonu
    $internetButton = New-Object System.Windows.Forms.Button
    $internetButton.Text = 'INTERNET BASLAT (Ngrok)'
    $internetButton.Size = New-Object System.Drawing.Size(350, 45)
    $internetButton.Location = New-Object System.Drawing.Point(50, 130)
    $internetButton.BackColor = [System.Drawing.Color]::Blue
    $internetButton.ForeColor = [System.Drawing.Color]::White
    $internetButton.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
    $internetButton.FlatStyle = 'Flat'
    $form.Controls.Add($internetButton)
    
    # Sistem Durdur Butonu
    $stopButton = New-Object System.Windows.Forms.Button
    $stopButton.Text = 'SISTEMI DURDUR'
    $stopButton.Size = New-Object System.Drawing.Size(350, 35)
    $stopButton.Location = New-Object System.Drawing.Point(50, 190)
    $stopButton.BackColor = [System.Drawing.Color]::Gray
    $stopButton.ForeColor = [System.Drawing.Color]::White
    $stopButton.Font = New-Object System.Drawing.Font('Segoe UI', 9, [System.Drawing.FontStyle]::Bold)
    $stopButton.FlatStyle = 'Flat'
    $form.Controls.Add($stopButton)
    
    # Durum etiketi
    $statusLabel = New-Object System.Windows.Forms.Label
    $statusLabel.Text = 'Sistem hazir - Bir islem secin'
    $statusLabel.Font = New-Object System.Drawing.Font('Segoe UI', 9)
    $statusLabel.ForeColor = [System.Drawing.Color]::Green
    $statusLabel.Size = New-Object System.Drawing.Size(410, 20)
    $statusLabel.Location = New-Object System.Drawing.Point(20, 240)
    $statusLabel.TextAlign = 'MiddleCenter'
    $form.Controls.Add($statusLabel)
    
    # Proje dizini - masaüstünden çalışırsa otomatik bul
    $projectDir = 'C:\Users\$env:USERNAME\Desktop\BORCLUSORGU\borclu-sorgulama'
    if (-not (Test-Path '$projectDir\docker-compose.yml')) {
        $projectDir = 'C:\Users\$env:USERNAME\Desktop\borclu-sorgulama'
    }
    if (-not (Test-Path '$projectDir\docker-compose.yml')) {
        $projectDir = 'C:\Users\$env:USERNAME\Documents\borclu-sorgulama'
    }
    
    # Buton olayları
    $localButton.Add_Click({
        $statusLabel.Text = 'Yerel sistem baslatiliyor...'
        $statusLabel.ForeColor = [System.Drawing.Color]::Orange
        $form.Refresh()
        
        Set-Location $projectDir
        $process = Start-Process 'cmd' -ArgumentList '/c', 'docker-compose up -d' -Wait -PassThru -WindowStyle Hidden
        
        if ($process.ExitCode -eq 0) {
            $statusLabel.Text = 'Sistem baslatildi! Tarayici aciliyor...'
            $statusLabel.ForeColor = [System.Drawing.Color]::Green
            Start-Process 'http://localhost:3000'
        } else {
            $statusLabel.Text = 'Hata! Docker Desktop calistigin emin olun'
            $statusLabel.ForeColor = [System.Drawing.Color]::Red
        }
    })
    
    $internetButton.Add_Click({
        $statusLabel.Text = 'Internet erisimi baslatiliyor...'
        $statusLabel.ForeColor = [System.Drawing.Color]::Orange
        $form.Refresh()
        
        Set-Location $projectDir
        Start-Process 'cmd' -ArgumentList '/c', 'docker-compose up -d' -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Start-Process 'cmd' -ArgumentList '/k', 'title Ngrok Tunnel - KAPATMAYIN! && ngrok http 3000'
        
        $statusLabel.Text = 'Internet erisimi aktif! Ngrok penceresini kontrol edin'
        $statusLabel.ForeColor = [System.Drawing.Color]::Green
    })
    
    $stopButton.Add_Click({
        $statusLabel.Text = 'Sistem durduruluyor...'
        $statusLabel.ForeColor = [System.Drawing.Color]::Orange
        $form.Refresh()
        
        Set-Location $projectDir
        Start-Process 'cmd' -ArgumentList '/c', 'docker-compose down' -Wait -WindowStyle Hidden
        
        $statusLabel.Text = 'Sistem durduruldu'
        $statusLabel.ForeColor = [System.Drawing.Color]::Gray
    })
    
    # Formu göster
    $form.ShowDialog()
}"

REM Eğer PowerShell çalışmazsa alternatif menü
if %errorlevel% neq 0 (
    echo.
    echo PowerShell GUI calismadi. Terminal menu aciliyor...
    pause
    call "%~dp0BASIT-LAUNCHER.bat"
)