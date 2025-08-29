@echo off
color 0A
title Masaustu Kisayol Olusturucu

echo.
echo ===============================================================
echo                 MASAUSTU KISAYOL OLUSTURUCU                 
echo ===============================================================
echo.

REM Proje dizinini al
set "PROJECT_DIR=%~dp0"

echo [INFO] Masaustu kisayollari olusturuluyor...
echo [INFO] Proje dizini: %PROJECT_DIR%

REM PowerShell ile kısayolları oluştur
powershell -Command "& {
    $WshShell = New-Object -comObject WScript.Shell
    $Desktop = [System.Environment]::GetFolderPath('Desktop')
    
    # Grafik Launcher kısayolu
    $Shortcut1 = $WshShell.CreateShortcut('$Desktop\Borclu Sistem Launcher.lnk')
    $Shortcut1.TargetPath = '%PROJECT_DIR%BORCLU-SISTEM-LAUNCHER.bat'
    $Shortcut1.WorkingDirectory = '%PROJECT_DIR%'
    $Shortcut1.Description = 'Borclu Sorgulama Sistemi - Grafik Launcher'
    $Shortcut1.Save()
    
    # Ngrok Başlatıcı kısayolu
    $Shortcut2 = $WshShell.CreateShortcut('$Desktop\Borclu Sistem (Internet).lnk')
    $Shortcut2.TargetPath = '%PROJECT_DIR%MASAUSTU-NGROK-BASLAT.bat'
    $Shortcut2.WorkingDirectory = '%PROJECT_DIR%'
    $Shortcut2.Description = 'Borclu Sorgulama Sistemi - Internet Erişimi'
    $Shortcut2.Save()
    
    # Yerel Başlatıcı kısayolu
    $Shortcut3 = $WshShell.CreateShortcut('$Desktop\Borclu Sistem (Yerel).lnk')
    $Shortcut3.TargetPath = '%PROJECT_DIR%MASAUSTU-BASLAT.bat'
    $Shortcut3.WorkingDirectory = '%PROJECT_DIR%'
    $Shortcut3.Description = 'Borclu Sorgulama Sistemi - Yerel Ağ'
    $Shortcut3.Save()
    
    Write-Host 'Kisayollar basariyla olusturuldu!' -ForegroundColor Green
}"

echo.
echo [OK] Masaustu kisayollari olusturuldu!
echo.
echo ===============================================================
echo                    OLUSTURULAN KISAYOLLAR                   
echo                                                              
echo  🎨 Borclu Sistem Launcher.lnk                              
echo     - Grafik arayuz ile sistem yonetimi                     
echo     - Tek tiklama ile tum islemler                          
echo                                                              
echo  🌍 Borclu Sistem (Internet).lnk                            
echo     - Internet erisimi (Ngrok)                              
echo     - Farkli WiFi aglarindan erisim                         
echo                                                              
echo  🏠 Borclu Sistem (Yerel).lnk                               
echo     - Yerel ag erisimi                                      
echo     - Ayni WiFi agindaki cihazlar                           
echo                                                              
echo ===============================================================
echo.
echo Masaustundeki kisayollari kullanabilirsiniz!
pause