# 🚨 GÜVENLİK UYARISI

## Service Role Key Değiştirilmeli

**ÖNEMLİ:** Supabase Service Role Key bu chat'te paylaşıldı ve geçici olarak kod içinde kullanıldı.

### Yapılması Gerekenler:

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard/project/cwprhsnhhxamcnrwttym
   - Settings > API sayfasına gidin

2. **Service Role Key'i yenileyin (rotate):**
   - "Reset service role key" butonuna tıklayın
   - Yeni key oluşturulacak

3. **Yeni key'i .env dosyasına ekleyin:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY="yeni_service_role_key_buraya"
   ```

4. **Bu dosyayı silin:**
   ```bash
   rm SECURITY-WARNING.md
   ```

### Neden Önemli?

- Service Role Key, veritabanında tam yetki verir
- Chat logları veya kod geçmişinde kalmamalı
- Rotate işlemi eski key'i geçersiz kılar

### Test:

Yeni key ekledikten sonra test edin:
```bash
npm run users:create  # Yeni key ile çalışmalı
npm run security:check  # Tüm kontroller yeşil olmalı
```
