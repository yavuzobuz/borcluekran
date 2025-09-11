#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Local Prisma client (SQLite)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

// Supabase client (PostgreSQL)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Eksik environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateData() {
  console.log('🚀 Veri aktarımı başlatılıyor...')
  console.log('📱 SQLite -> Supabase PostgreSQL')
  
  try {
    // 1. Borçlu Bilgilerini Aktar
    console.log('\n📋 Borçlu bilgileri aktarılıyor...')
    const borcluBilgileri = await prisma.borcluBilgileri.findMany()
    console.log(`   📊 ${borcluBilgileri.length} kayıt bulundu`)
    
    if (borcluBilgileri.length > 0) {
      // Supabase'e batch insert
      const borcluData = borcluBilgileri.map(item => ({
        id: item.id,
        ilgili_tckn: item.ilgiliTCKN,
        avukat_atama_tarihi: item.avukatAtamaTarihi,
        durum: item.durum,
        durum_tanitici: item.durumTanitici,
        muhatap_tanimi: item.muhatapTanimi,
        durum_tanimi: item.durumTanimi,
        sozlesme_hesabi: item.sozlesmeHesabi,
        tc_kimlik_no: item.tcKimlikNo,
        ad: item.ad,
        soyad: item.soyad,
        isim: item.isim,
        vergi_no: item.vergiNo,
        icra_dosya_numarasi: item.icraDosyaNumarasi,
        icra_dairesi_tanimi: item.icraDairesiTanimi,
        adres_bilgileri: item.adresBilgileri,
        il: item.il,
        ilce: item.ilce,
        telefon: item.telefon,
        telefon_2: item.telefon2,
        telefon_3: item.telefon3,
        telefon_abone_grubu: item.telefonAboneGrubu,
        asil_alacak: item.asilAlacak,
        takip_cikis_miktari: item.takipCikisMiktari,
        takip_oncesi_tahsilat: item.takipOncesiTahsilat,
        takip_sonrasi_tahsilat: item.takipSonrasiTahsilat,
        toplam_acik_tutar: item.toplamAcikTutar,
        guncel_borc: item.guncelBorc,
        itiraz_durumu: item.itirazDurumu,
        borclu_tipi_tanimi: item.borcluTipiTanimi,
        hitam_tarihi: item.hitamTarihi,
        takip_tarihi: item.takipTarihi,
        neden_tanimi: item.nedenTanimi,
        durum_turu: item.durumTuru,
        durum_turu_tanimi: item.durumTuruTanimi,
        tesisat_durumu: item.tesisatDurumu,
        odeme_durumu: item.odemeDurumu,
        vekalet_ucreti: item.vekaletUcreti,
        neden: item.neden,
        muhatap_tanimi_ek: item.muhatapTanimiEk,
        uyap_durumu: item.uyapDurumu,
        telefon_tesisat: item.telefonTesisat,
        tesisat_durumu_tanimi: item.tesisatDurumuTanimi,
        kayit_tarihi: item.kayitTarihi,
        guncelleme_tarihi: item.guncellemeTarihi
      }))
      
      // Batch size 100'de parçalara böl
      const batchSize = 100
      for (let i = 0; i < borcluData.length; i += batchSize) {
        const batch = borcluData.slice(i, i + batchSize)
        const { error } = await supabase
          .from('borclu_bilgileri')
          .insert(batch)
        
        if (error) {
          console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} hatası:`, error)
        } else {
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(borcluData.length/batchSize)} tamamlandı`)
        }
      }
    }
    
    // 2. Ödeme Sözlerini Aktar
    console.log('\n💰 Ödeme sözleri aktarılıyor...')
    const odemeSozleri = await prisma.odemeSozu.findMany()
    console.log(`   📊 ${odemeSozleri.length} kayıt bulundu`)
    
    if (odemeSozleri.length > 0) {
      const odemeData = odemeSozleri.map(item => ({
        id: item.id,
        borclu_id: item.borcluId,
        tarih: item.tarih,
        aciklama: item.aciklama,
        odeme_miktari: item.odemeMiktari,
        durum: item.durum,
        olusturma_tarihi: item.olusturmaTarihi,
        guncelleme_tarihi: item.guncellemeTarihi
      }))
      
      const batchSize = 100
      for (let i = 0; i < odemeData.length; i += batchSize) {
        const batch = odemeData.slice(i, i + batchSize)
        const { error } = await supabase
          .from('odeme_sozleri')
          .insert(batch)
        
        if (error) {
          console.error(`❌ Ödeme sözleri batch ${Math.floor(i/batchSize) + 1} hatası:`, error)
        } else {
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(odemeData.length/batchSize)} tamamlandı`)
        }
      }
    }
    
    // 3. WhatsApp Mesajlarını Aktar
    console.log('\n💬 WhatsApp mesajları aktarılıyor...')
    const whatsappMessages = await prisma.whatsAppMessage.findMany()
    console.log(`   📊 ${whatsappMessages.length} kayıt bulundu`)
    
    if (whatsappMessages.length > 0) {
      const whatsappData = whatsappMessages.map(item => ({
        id: item.id,
        durum_tanitici: item.durumTanitici,
        phone_number: item.phoneNumber,
        message: item.message,
        status: item.status,
        sent_at: item.sentAt,
        delivered_at: item.deliveredAt,
        read_at: item.readAt,
        error_message: item.errorMessage,
        message_id: item.messageId,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }))
      
      const batchSize = 100
      for (let i = 0; i < whatsappData.length; i += batchSize) {
        const batch = whatsappData.slice(i, i + batchSize)
        const { error } = await supabase
          .from('whatsapp_messages')
          .insert(batch)
        
        if (error) {
          console.error(`❌ WhatsApp mesajları batch ${Math.floor(i/batchSize) + 1} hatası:`, error)
        } else {
          console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(whatsappData.length/batchSize)} tamamlandı`)
        }
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Veri aktarımı tamamlandı!')
    console.log(`📋 Borçlu Bilgileri: ${borcluBilgileri.length} kayıt`)
    console.log(`💰 Ödeme Sözleri: ${odemeSozleri.length} kayıt`)
    console.log(`💬 WhatsApp Mesajları: ${whatsappMessages.length} kayıt`)
    console.log('='.repeat(60))
    
    // İlk admin kullanıcıyı belirle
    console.log('\n👤 İlk admin kullanıcıyı belirleme...')
    const { error: adminError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('email', 'obuzhukuk@obuzhukuk.com')
    
    if (adminError) {
      console.log('⚠️  Admin belirleme sırasında hata (bu normal olabilir):', adminError.message)
      console.log('💡 Kullanıcı henüz giriş yapmamışsa profil oluşmamış olabilir.')
    } else {
      console.log('✅ obuzhukuk@obuzhukuk.com admin olarak belirlendi')
    }
    
  } catch (error) {
    console.error('❌ Veri aktarımı sırasında hata:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('✅ İşlem tamamlandı')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ İşlem başarısız:', error)
      process.exit(1)
    })
}

module.exports = { migrateData }
