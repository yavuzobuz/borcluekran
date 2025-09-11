-- ============================================
-- SUPABASE VERİTABANI MİGRASYONU
-- Borçlu Sorgulama Sistemi için tüm tablolar
-- ============================================

-- 1. Ana Borçlu Bilgileri Tablosu
CREATE TABLE IF NOT EXISTS public.borclu_bilgileri (
    id SERIAL PRIMARY KEY,
    ilgili_tckn TEXT,
    avukat_atama_tarihi TEXT,
    durum TEXT,
    durum_tanitici TEXT UNIQUE NOT NULL,
    muhatap_tanimi TEXT,
    durum_tanimi TEXT,
    sozlesme_hesabi TEXT,
    tc_kimlik_no TEXT,
    ad TEXT,
    soyad TEXT,
    isim TEXT,
    vergi_no TEXT,
    icra_dosya_numarasi TEXT,
    icra_dairesi_tanimi TEXT,
    adres_bilgileri TEXT,
    il TEXT,
    ilce TEXT,
    telefon TEXT,
    telefon_2 TEXT,
    telefon_3 TEXT,
    telefon_abone_grubu TEXT,
    asil_alacak DECIMAL(15,2),
    takip_cikis_miktari DECIMAL(15,2),
    takip_oncesi_tahsilat DECIMAL(15,2),
    takip_sonrasi_tahsilat DECIMAL(15,2),
    toplam_acik_tutar DECIMAL(15,2),
    guncel_borc DECIMAL(15,2),
    itiraz_durumu TEXT,
    borclu_tipi_tanimi TEXT,
    hitam_tarihi TEXT,
    takip_tarihi TEXT,
    neden_tanimi TEXT,
    durum_turu TEXT,
    durum_turu_tanimi TEXT,
    tesisat_durumu TEXT,
    odeme_durumu TEXT,
    vekalet_ucreti DECIMAL(15,2),
    neden TEXT,
    muhatap_tanimi_ek TEXT,
    uyap_durumu TEXT,
    telefon_tesisat TEXT,
    tesisat_durumu_tanimi TEXT,
    kayit_tarihi TIMESTAMPTZ DEFAULT NOW(),
    guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ödeme Sözleri Tablosu
CREATE TABLE IF NOT EXISTS public.odeme_sozleri (
    id SERIAL PRIMARY KEY,
    borclu_id INTEGER NOT NULL REFERENCES public.borclu_bilgileri(id) ON DELETE CASCADE,
    tarih TIMESTAMPTZ NOT NULL,
    aciklama TEXT NOT NULL,
    odeme_miktari DECIMAL(15,2),
    durum TEXT DEFAULT 'Aktif' CHECK (durum IN ('Aktif', 'İptal', 'Tamamlandı')),
    olusturma_tarihi TIMESTAMPTZ DEFAULT NOW(),
    guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WhatsApp Mesajları Tablosu
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    durum_tanitici TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    message_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Kullanıcı Profilleri Tablosu (Supabase Auth entegrasyonu için)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    supabase_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- İNDEXLER - PERFORMANS İÇİN
-- ============================================

-- Borçlu Bilgileri İndexleri
CREATE INDEX IF NOT EXISTS idx_borclu_durum_tanitici ON public.borclu_bilgileri(durum_tanitici);
CREATE INDEX IF NOT EXISTS idx_borclu_sozlesme_hesabi ON public.borclu_bilgileri(sozlesme_hesabi);
CREATE INDEX IF NOT EXISTS idx_borclu_tc_kimlik_no ON public.borclu_bilgileri(tc_kimlik_no);
CREATE INDEX IF NOT EXISTS idx_borclu_telefon ON public.borclu_bilgileri(telefon);
CREATE INDEX IF NOT EXISTS idx_borclu_guncel_borc ON public.borclu_bilgileri(guncel_borc);
CREATE INDEX IF NOT EXISTS idx_borclu_durum_tanimi ON public.borclu_bilgileri(durum_tanimi);
CREATE INDEX IF NOT EXISTS idx_borclu_kayit_tarihi ON public.borclu_bilgileri(kayit_tarihi);
CREATE INDEX IF NOT EXISTS idx_borclu_ad_soyad ON public.borclu_bilgileri(ad, soyad);
CREATE INDEX IF NOT EXISTS idx_borclu_isim ON public.borclu_bilgileri(isim);
CREATE INDEX IF NOT EXISTS idx_borclu_muhatap_tanimi ON public.borclu_bilgileri(muhatap_tanimi);
CREATE INDEX IF NOT EXISTS idx_borclu_icra_dosya_numarasi ON public.borclu_bilgileri(icra_dosya_numarasi);

-- Ödeme Sözleri İndexleri
CREATE INDEX IF NOT EXISTS idx_odeme_sozleri_borclu_id ON public.odeme_sozleri(borclu_id);
CREATE INDEX IF NOT EXISTS idx_odeme_sozleri_tarih ON public.odeme_sozleri(tarih);
CREATE INDEX IF NOT EXISTS idx_odeme_sozleri_durum ON public.odeme_sozleri(durum);
CREATE INDEX IF NOT EXISTS idx_odeme_sozleri_borclu_durum ON public.odeme_sozleri(borclu_id, durum);

-- WhatsApp Mesajları İndexleri
CREATE INDEX IF NOT EXISTS idx_whatsapp_durum_tanitici ON public.whatsapp_messages(durum_tanitici);
CREATE INDEX IF NOT EXISTS idx_whatsapp_phone_number ON public.whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_created_at ON public.whatsapp_messages(created_at);

-- Kullanıcı Profilleri İndexleri
CREATE INDEX IF NOT EXISTS idx_user_profiles_supabase_user_id ON public.user_profiles(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- ============================================
-- TRİGGERLER - OTOMATIK GÜNCELLEME TARİHLERİ
-- ============================================

-- Güncelleme tarihi için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- WhatsApp mesajları için güncelleme trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_whatsapp_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- User profiles için güncelleme trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları tablolara uygula
CREATE TRIGGER update_borclu_bilgileri_updated_at 
    BEFORE UPDATE ON public.borclu_bilgileri 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_odeme_sozleri_updated_at 
    BEFORE UPDATE ON public.odeme_sozleri 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_messages_updated_at 
    BEFORE UPDATE ON public.whatsapp_messages 
    FOR EACH ROW EXECUTE FUNCTION update_whatsapp_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at_column();

-- ============================================
-- ROW LEVEL SECURİTY (RLS) - GÜVENLİK
-- ============================================

-- RLS'yi etkinleştir
ALTER TABLE public.borclu_bilgileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odeme_sozleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin'ler her şeye erişebilir
CREATE POLICY "Admin full access on borclu_bilgileri" ON public.borclu_bilgileri
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

CREATE POLICY "Admin full access on odeme_sozleri" ON public.odeme_sozleri
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

CREATE POLICY "Admin full access on whatsapp_messages" ON public.whatsapp_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Kullanıcılar sadece okuma yapabilir
CREATE POLICY "User read access on borclu_bilgileri" ON public.borclu_bilgileri
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'user' 
            AND is_active = true
        )
    );

CREATE POLICY "User read access on odeme_sozleri" ON public.odeme_sozleri
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'user' 
            AND is_active = true
        )
    );

-- Kullanıcı profilleri - herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (supabase_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (supabase_user_id = auth.uid());

-- ============================================
-- İLK ADMIN KULLANICIYI OLUŞTUR
-- ============================================

-- NOT: Bu kısmı manuel olarak çalıştırın, service role ile
-- İlk admin kullanıcıyı belirleyin (örnek: obuzhukuk@obuzhukuk.com)

-- İlk admin kullanıcıyı admin yap (manuel)
-- UPDATE public.user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'obuzhukuk@obuzhukuk.com';

-- ============================================
-- TAMAMLANDI
-- ============================================
-- 
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın.
-- Ardından ilk admin kullanıcınızı manuel olarak belirleyin.
-- 
-- Kullanım:
-- 1. Supabase Dashboard > SQL Editor
-- 2. Bu dosyanın içeriğini kopyalayıp çalıştırın
-- 3. İlk admin kullanıcıyı belirleyin (yukarıdaki UPDATE komutu)
-- 4. Test edin: npm run dev ile uygulamayı başlatın
