# 🌐 İnternet Erişim Rehberi

## 🚀 Hızlı Başlangıç

### 1️⃣ İlk Kurulum (Sadece Bir Kez)
```cmd
# 1. Ngrok'u kur
NGROK-KURULUM.bat

# 2. Ngrok hesabı oluştur ve token al
# https://dashboard.ngrok.com/get-started/your-authtoken

# 3. Token'i ayarla
ngrok config add-authtoken [SENIN-TOKEN]
```

### 2️⃣ Her Kullanımda
```cmd
# Sistemi internet erişimi ile başlat
INTERNET-BASLAT.bat
```

## 📱 Kullanım Senaryoları

### 🏢 **Ofis Kullanımı**
- Sunucu PC ofiste
- Çalışanlar evden/farklı WiFi'lerden erişim
- **Adres:** `https://abc123.ngrok.io`

### 🏠 **Ev/Saha Kullanımı**  
- Laptop evde
- Mobil cihazlardan saha çalışması
- **Adres:** `https://xyz789.ngrok.io`

### 👥 **Ekip Çalışması**
- Bir kişi sistemi çalıştırır
- URL'i WhatsApp/Telegram'dan paylaşır
- Herkes kendi cihazından erişir

## ⚡ Avantajlar

### ✅ **Ngrok Avantajları**
- 🚀 **Hızlı kurulum** (5 dakika)
- 🔒 **Güvenli HTTPS** otomatik
- 🌍 **Global erişim** her yerden
- 📱 **Mobil uyumlu** responsive
- 🔄 **Otomatik yenileme** hot reload

### ⚠️ **Sınırlamalar**
- 🕐 **2 saat limit** (ücretsiz)
- 🔄 **URL değişir** her başlatmada
- 📶 **İnternet gerekli** sürekli

## 🎯 Kullanım Adımları

### Sunucu PC'de:
1. `INTERNET-BASLAT.bat` çalıştır
2. Ngrok penceresindeki URL'i kopyala
3. URL'i ekiple paylaş

### Diğer PC/Mobillerde:
1. Paylaşılan URL'i tarayıcıda aç
2. Sistem normal şekilde çalışır
3. Excel yükle, borçlu ara, WhatsApp gönder

## 🔧 Sorun Giderme

### Ngrok Bulunamadı
```cmd
# Manuel kurulum:
# 1. https://ngrok.com/download
# 2. ngrok.exe'yi proje klasörüne kopyala
```

### Token Hatası
```cmd
# Yeni token al ve ayarla:
ngrok config add-authtoken [YENİ-TOKEN]
```

### Bağlantı Sorunu
```cmd
# Docker'ı yeniden başlat:
docker-compose restart app
```

## 💡 Pro İpuçları

### 🎯 **Sabit URL İstiyorsan**
- Ngrok Pro hesabı al ($5/ay)
- Sabit subdomain: `https://borclusistem.ngrok.io`

### 🔒 **Güvenlik İçin**
- URL'i sadece güvenilir kişilerle paylaş
- Kullanım sonrası Ngrok'u kapat
- Önemli veriler için VPN kullan

### ⚡ **Performans İçin**
- Sunucu PC'yi güçlü tut
- İnternet bağlantısını stabil tut
- Çok kullanıcı varsa Pro hesap al