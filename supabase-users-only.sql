-- ============================================
-- SUPABASE KULLANICI TABLOSU
-- Sadece authentication için gerekli tablo
-- ============================================

-- Kullanıcı Profilleri Tablosu (Supabase Auth entegrasyonu için)
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

-- Kullanıcı Profilleri İndexleri
CREATE INDEX IF NOT EXISTS idx_user_profiles_supabase_user_id ON public.user_profiles(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- ============================================
-- TRİGGER - OTOMATIK GÜNCELLEME TARİHİ
-- ============================================

-- User profiles için güncelleme trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı tabloya uygula
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at_column();

-- ============================================
-- ROW LEVEL SECURİTY (RLS) - GÜVENLİK
-- ============================================

-- RLS'yi etkinleştir
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcı profilleri - herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (supabase_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (supabase_user_id = auth.uid());

-- Admin'ler tüm profilleri görebilir ve yönetebilir
CREATE POLICY "Admin full access on user_profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE supabase_user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- ============================================
-- İLK ADMIN KULLANICIYI OLUŞTUR
-- ============================================

-- NOT: Bu kısmı kullanıcı giriş yaptıktan sonra manuel çalıştırın
-- İlk admin kullanıcıyı belirleyin (örnek: obuzhukuk@obuzhukuk.com)

-- İlk admin kullanıcıyı admin yap (manuel - kullanıcı giriş yaptıktan sonra)
-- UPDATE public.user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'obuzhukuk@obuzhukuk.com';

-- ============================================
-- TAMAMLANDI
-- ============================================
-- 
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın.
-- 
-- Kullanım:
-- 1. Supabase Dashboard > SQL Editor
-- 2. Bu dosyanın içeriğini kopyalayıp çalıştırın
-- 3. Uygulamada ilk kez giriş yapın (kayıt olun)
-- 4. Sonra yukarıdaki UPDATE komutu ile admin yapın
-- 5. Test: npm run dev
