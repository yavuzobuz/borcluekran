# Port Forwarding Rehberi

## 🌐 İnternetten Erişim İçin Router Ayarları

### 1️⃣ Router Yönetim Paneline Giriş
1. Tarayıcıda `192.168.0.1` veya `192.168.1.1` adresi aç
2. Router kullanıcı adı/şifre ile giriş yap (genelde admin/admin)

### 2️⃣ Port Forwarding Ayarları
1. **"Port Forwarding"** veya **"Sanal Sunucu"** bölümünü bul
2. Yeni kural ekle:
   - **Servis Adı:** Borclu Sistemi
   - **Dış Port:** 8080 (veya istediğin port)
   - **İç IP:** 192.168.0.17 (sunucu PC IP'si)
   - **İç Port:** 3000
   - **Protokol:** TCP

### 3️⃣ Dış IP Adresini Öğren
```cmd
# PowerShell ile:
Invoke-RestMethod -Uri "https://ipinfo.io/ip"

# Veya tarayıcıda:
https://whatismyipaddress.com/
```

### 4️⃣ Erişim Adresi
```
http://[DIŞ-IP]:8080
```

## ⚠️ Güvenlik Uyarıları
- **Firewall:** Windows Firewall'da port 3000'i aç
- **Güvenlik:** Sadece güvenilir kişilerle paylaş
- **Şifre:** Sisteme giriş şifresi ekle (opsiyonel)

## 🔧 Windows Firewall Ayarı
1. **Windows Güvenlik** > **Güvenlik Duvarı**
2. **Gelişmiş ayarlar**
3. **Gelen Kuralları** > **Yeni Kural**
4. **Port** > **TCP** > **3000**
5. **Bağlantıya izin ver**

## 📱 Test Etme
1. Mobil veriyi aç (WiFi kapat)
2. `http://[DIŞ-IP]:8080` adresini dene
3. Sistem açılmalı