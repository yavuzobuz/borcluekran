@echo off
echo Masaustu kisayolu olusturuluyor...

REM PowerShell ile masaüstü kısayolu oluştur
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Desktop = [System.Environment]::GetFolderPath('Desktop'); $Shortcut = $WshShell.CreateShortcut(\"$Desktop\Borclu Sistem.lnk\"); $Shortcut.TargetPath = \"%~dp0BASIT-LAUNCHER.bat\"; $Shortcut.WorkingDirectory = \"%~dp0\"; $Shortcut.Description = 'Borclu Sorgulama Sistemi'; $Shortcut.Save(); Write-Host 'Masaustu kisayolu olusturuldu!' -ForegroundColor Green"

echo.
echo Masaustunde "Borclu Sistem.lnk" kisayolu olusturuldu!
echo Bu kisayola cift tiklayarak sistemi baslatabilirsiniz.
pause