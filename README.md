# 🏢 Borçlu Sorgulama Sistemi

## 🚀 TEK TIK BAŞLATMA - İŞÇİLER İÇİN

### ⚡ Hızlı Başlangıç (3 Adım)

1. **📁 .env.ornek dosyasını .env olarak yeniden adlandırın**
2. **🔑 .env dosyasındaki API anahtarlarını doldurun**
3. **▶️ BASLA.bat dosyasına çift tıklayın**

**Bu kadar! Sistem otomatik olarak başlayacak.**

---

## 📋 Detaylı Kurulum Talimatları

### 🔧 Ön Gereksinimler

Sistem otomatik olarak kontrol eder, ancak şunlar yüklü olmalı:
- ✅ **Docker Desktop** (otomatik başlatılır)
- ✅ **Windows 10/11**

### 📝 Adım Adım Kurulum

#### 1️⃣ Yapılandırma Dosyasını Hazırlayın

```
📁 Proje klasöründe:
   📄 .env.ornek  ➡️  📄 .env (yeniden adlandırın)
```

#### 2️⃣ API Anahtarlarını Doldurun

📄 **.env** dosyasını not defteri ile açın ve şunları doldurun:

```env
# Google Gemini API Anahtarı (zorunlu)
GEMINI_API_KEY="buraya_api_anahtarinizi_yazin"

# Güvenlik Şifresi (zorunlu - rastgele 32+ karakter)
NEXTAUTH_SECRET="buraya_guclu_bir_sifre_yazin"
```

**🔑 Google Gemini API Anahtarı nasıl alınır:**
1. https://makersuite.google.com/app/apikey adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. Oluşan anahtarı kopyalayın

#### 3️⃣ Sistemi Başlatın

```
🖱️ BASLA.bat dosyasına çift tıklayın
```

**Sistem otomatik olarak:**
- ✅ Docker Desktop'ı başlatır
- ✅ Gerekli kontrolleri yapar
- ✅ Uygulamayı başlatır
- ✅ Tarayıcıyı açar

---

## 🎯 Kullanım

### ▶️ Başlatma
```
🖱️ BASLA.bat dosyasına çift tıklayın
```

### ⏹️ Durdurma
```
🖱️ DURDUR.bat dosyasına çift tıklayın
```

### 🌐 Erişim
```
Tarayıcıda: http://localhost:3000
```

---

## 🆘 Sorun Giderme

### ❌ Sistem başlamıyor?

1. **DURDUR.bat** çalıştırın
2. **Docker Desktop**'ın açık olduğunu kontrol edin
3. **.env** dosyasının doğru doldurulduğunu kontrol edin
4. **BASLA.bat** tekrar çalıştırın

### ❌ "Docker bulunamadı" hatası?

1. Docker Desktop'ı manuel olarak başlatın
2. 1-2 dakika bekleyin
3. **BASLA.bat** tekrar çalıştırın

### ❌ API anahtarı hatası?

1. **.env** dosyasını açın
2. **GEMINI_API_KEY** değerini kontrol edin
3. Doğru API anahtarını yazın
4. **DURDUR.bat** sonra **BASLA.bat** çalıştırın

### ❌ Port 3000 kullanımda hatası?

1. **DURDUR.bat** çalıştırın
2. Bilgisayarı yeniden başlatın
3. **BASLA.bat** çalıştırın

---

## 📞 Destek

**Sorun yaşıyorsanız:**
1. 🔄 **DURDUR.bat** → **BASLA.bat** deneyin
2. 🔄 Bilgisayarı yeniden başlatın
3. 📧 IT destek ekibine başvurun

---

## 📁 Önemli Dosyalar

```
📁 Proje Klasörü/
├── 🚀 BASLA.bat          # Sistemi başlat
├── ⏹️ DURDUR.bat         # Sistemi durdur
├── ⚙️ .env               # Yapılandırma dosyası
├── 📋 .env.ornek         # Örnek yapılandırma
└── 📖 README.md          # Bu dosya
```

---

**🎉 Başarılı kurulum sonrası sistem http://localhost:3000 adresinde çalışacaktır!**
