@echo off
title Borclu Sorgulama Sistemi - GUI Launcher

:: PowerShell GUI oluştur
powershell -WindowStyle Hidden -Command "
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Form oluştur
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Borçlu Sorgulama Sistemi'
$form.Size = New-Object System.Drawing.Size(500,400)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::White

# Başlık
$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(50,20)
$label.Size = New-Object System.Drawing.Size(400,40)
$label.Text = 'BORÇLU SORGULAMA SİSTEMİ'
$label.Font = New-Object System.Drawing.Font('Arial',16,[System.Drawing.FontStyle]::Bold)
$label.TextAlign = 'MiddleCenter'
$form.Controls.Add($label)

# Yerel Başlat butonu
$btnYerel = New-Object System.Windows.Forms.Button
$btnYerel.Location = New-Object System.Drawing.Point(100,80)
$btnYerel.Size = New-Object System.Drawing.Size(300,50)
$btnYerel.Text = '🏠 YEREL BAŞLAT (WiFi Ağı)'
$btnYerel.Font = New-Object System.Drawing.Font('Arial',12,[System.Drawing.FontStyle]::Bold)
$btnYerel.BackColor = [System.Drawing.Color]::LightGreen
$btnYerel.Add_Click({
    $form.Hide()
    Start-Process cmd -ArgumentList '/c', 'cd /d \`"$PWD\`" && docker-compose up -d && echo Sistem başlatıldı! && echo Yerel: http://localhost:3000 && echo WiFi: http://192.168.0.17:3000 && start http://localhost:3000 && pause' -WindowStyle Normal
    $form.Close()
})
$form.Controls.Add($btnYerel)

# Internet Başlat butonu
$btnInternet = New-Object System.Windows.Forms.Button
$btnInternet.Location = New-Object System.Drawing.Point(100,140)
$btnInternet.Size = New-Object System.Drawing.Size(300,50)
$btnInternet.Text = '🌍 İNTERNET BAŞLAT (Ngrok)'
$btnInternet.Font = New-Object System.Drawing.Font('Arial',12,[System.Drawing.FontStyle]::Bold)
$btnInternet.BackColor = [System.Drawing.Color]::LightBlue
$btnInternet.Add_Click({
    $form.Hide()
    Start-Process cmd -ArgumentList '/c', 'cd /d \`"$PWD\`" && docker-compose up -d && start \`"Ngrok - KAPATMAYIN!\`" cmd /k \`"ngrok http 3000\`" && echo Ngrok penceresindeki URL''i kopyalayın! && pause' -WindowStyle Normal
    $form.Close()
})
$form.Controls.Add($btnInternet)

# Sistemi Durdur butonu
$btnDurdur = New-Object System.Windows.Forms.Button
$btnDurdur.Location = New-Object System.Drawing.Point(100,200)
$btnDurdur.Size = New-Object System.Drawing.Size(300,50)
$btnDurdur.Text = '⏹️ SİSTEMİ DURDUR'
$btnDurdur.Font = New-Object System.Drawing.Font('Arial',12,[System.Drawing.FontStyle]::Bold)
$btnDurdur.BackColor = [System.Drawing.Color]::LightGray
$btnDurdur.Add_Click({
    $form.Hide()
    Start-Process cmd -ArgumentList '/c', 'cd /d \`"$PWD\`" && docker-compose down && echo Sistem durduruldu! && pause' -WindowStyle Normal
    $form.Close()
})
$form.Controls.Add($btnDurdur)

# Veritabanı Temizle butonu
$btnTemizle = New-Object System.Windows.Forms.Button
$btnTemizle.Location = New-Object System.Drawing.Point(100,260)
$btnTemizle.Size = New-Object System.Drawing.Size(300,50)
$btnTemizle.Text = '🗑️ VERİTABANI TEMİZLE'
$btnTemizle.Font = New-Object System.Drawing.Font('Arial',12,[System.Drawing.FontStyle]::Bold)
$btnTemizle.BackColor = [System.Drawing.Color]::LightCoral
$btnTemizle.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show('TÜM veritabanı verileri silinecek!`nBu işlem geri alınamaz!`n`nDevam etmek istiyor musunuz?', 'UYARI', 'YesNo', 'Warning')
    if ($result -eq 'Yes') {
        $form.Hide()
        Start-Process cmd -ArgumentList '/c', 'cd /d \`"$PWD\`" && docker-compose down && docker volume rm borclu-sorgulama_borclu-db-data 2>nul && docker-compose up -d && echo Veritabanı temizlendi! && echo Yerel: http://localhost:3000 && echo WiFi: http://192.168.0.17:3000 && pause' -WindowStyle Normal
        $form.Close()
    }
})
$form.Controls.Add($btnTemizle)

# Formu göster
$form.ShowDialog()
"