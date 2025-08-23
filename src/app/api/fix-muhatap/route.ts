import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Adres bilgilerini kontrol eden gelişmiş yardımcı fonksiyon
function isAddressLike(text: string): boolean {
  if (!text) return false
  const upperText = text.toUpperCase().trim()
  
  // Adres anahtar kelimeleri
  const addressKeywords = [
    'MAH', 'MAHALLE', 'MAHALLESI', 'SOK', 'SOKAK', 'SOKAĞI', 'CAD', 'CADDE', 'CADDESİ',
    'NO', 'NUMARA', 'APT', 'APARTMAN', 'APARTMANI', 'BLOK', 'KAT', 'DAİRE', 'DAIRE',
    'BAŞÖĞRETMEN', 'ADEM', 'HAMİDİYE', 'İÇERENKÖY', 'ÇEKMEKÖY', 'ATAŞEHİR',
    'FETİH', 'ÜNAYDIN', 'ALTINŞEHİR', 'HAYAT', 'ÜMRANİYE', 'FEVZİ', 'ÇAKMAK', 'ACELE', 'PENDİK',
    'ÇENGELKÖY', 'ÖZLEM', 'ÜSKÜDAR', 'EĞİTİM', 'MÜCEVHER', 'KADIKÖY', 'İSTİKLAL', 'CİHAN',
    'İSTANBUL', 'ANKARA', 'İZMİR', 'BURSA', 'ANTALYA', 'ADANA', 'KONYA', 'GAZİANTEP',
    'ŞANLIURFA', 'KOCAELİ', 'MERSİN', 'DİYARBAKIR', 'HATAY', 'MANİSA', 'KAYSERI',
    'SAMSUN', 'BALIKESİR', 'KAHRAMANMARAŞ', 'VAN', 'AYDIN', 'DENIZLI', 'MUĞLA',
    'TEKİRDAĞ', 'TRABZON', 'ŞAHINBEY', 'ADAPAZARI', 'MALATYA', 'ERZURUM', 'ORDU',
    'MERKEZ', 'KUZEY', 'GÜNEY', 'DOĞU', 'BATI', 'YENİ', 'ESKİ', 'BÜYÜK', 'KÜÇÜK'
  ]
  
  // Adres anahtar kelimelerini kontrol et
  const hasAddressKeywords = addressKeywords.some(keyword => upperText.includes(keyword))
  
  // Sayı + kelime kombinasyonlarını kontrol et (örn: "NO 52", "52 ÇEKMEKÖY")
  const hasNumberPattern = /\b\d+\s+[A-ZÇĞIİÖŞÜ]+|[A-ZÇĞIİÖŞÜ]+\s+\d+\b/.test(upperText)
  
  // Çok uzun metinler genellikle adrestir (50+ karakter)
  const isTooLong = upperText.length > 50
  
  // Birden fazla "/" içeren metinler genellikle adrestir
  const hasMultipleSlashes = (upperText.match(/\//g) || []).length > 1
  
  // Posta kodu benzeri pattern (5 haneli sayı)
  const hasPostalCode = /\b\d{5}\b/.test(upperText)
  
  return hasAddressKeywords || hasNumberPattern || isTooLong || hasMultipleSlashes || hasPostalCode
}

// İsim/Şirket benzeri olup olmadığını kontrol eden fonksiyon
function isNameLike(text: string): boolean {
  if (!text) return false
  const trimmed = text.trim()
  
  // Çok kısa (2 karakterden az) veya çok uzun (100+ karakter) değilse
  if (trimmed.length < 2 || trimmed.length > 100) return false
  
  // Adres benzeri değilse
  if (isAddressLike(trimmed)) return false
  
  // Şirket isimleri için genişletilmiş pattern
  const namePattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü0-9\s\.\-&VE]+$/
  if (!namePattern.test(trimmed)) return false
  
  // Şirket anahtar kelimeleri
  const companyKeywords = [
    'LTD', 'ŞTİ', 'A.Ş', 'AŞ', 'LLC', 'INC', 'CORP', 'CO', 'COMPANY', 'ŞİRKETİ',
    'TİCARET', 'SANAYİ', 'İNŞAAT', 'GIDA', 'TEKSTİL', 'OTOMOTİV', 'ELEKTRONİK',
    'MARKET', 'MAĞAZA', 'RESTORAN', 'CAFE', 'OTEL', 'HASTANE', 'KLİNİK',
    'ECZANE', 'BERBER', 'KUAFÖR', 'TAMİR', 'SERVİS', 'ATÖLYE'
  ]
  
  const upperText = trimmed.toUpperCase()
  const hasCompanyKeyword = companyKeywords.some(keyword => upperText.includes(keyword))
  
  // Eğer şirket anahtar kelimesi varsa, kesinlikle isim benzeri
  if (hasCompanyKeyword) return true
  
  // Kişi ismi kontrolü
  const personNamePattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü\s]+$/
  if (personNamePattern.test(trimmed)) {
    if (!/^\d{11}$/.test(trimmed.replace(/\s/g, ''))) {
      return true
    }
  }
  
  // Karma isim/şirket (harf + sayı kombinasyonu)
  const mixedPattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü][A-ZÇĞIİÖŞÜa-zçğıiöşü0-9\s\.\-&]*$/
  if (mixedPattern.test(trimmed)) {
    const digitCount = (trimmed.match(/\d/g) || []).length
    if (digitCount < trimmed.length / 2) {
      return true
    }
  }
  
  return false
}

// Muhatap tanımını temizleyen fonksiyon
function cleanMuhatapTanimi(muhatapTanimi: string | null): string | null {
  if (!muhatapTanimi) return null
  
  let cleaned = muhatapTanimi.trim()
  
  // "Borçlu" kelimesini içeren tanımları temizle
  if (cleaned.toLowerCase() === 'borçlu' || cleaned.toLowerCase() === 'borclu') {
    return null
  }
  
  // TC kimlik numarası içeren tanımları temizle (11 haneli sayı)
  if (/^\d{11}$/.test(cleaned.replace(/\s/g, ''))) {
    return null
  }
  
  // "CENGİZ KAMA / ÇAKMAK-MERKEZ" gibi formatta ise, ilk kısmı al ve doğrula
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/')
    if (parts.length > 0 && parts[0].trim()) {
      const firstPart = parts[0].trim()
      // İlk kısım isim benzeri ise kullan, değilse temizle
      if (isNameLike(firstPart)) {
        cleaned = firstPart
      } else {
        return null
      }
    }
  }
  
  // Adres benzeri metinleri temizle
  if (isAddressLike(cleaned)) {
    return null
  }
  
  // İsim benzeri değilse temizle
  if (!isNameLike(cleaned)) {
    return null
  }
  
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    // Tüm borçlu kayıtlarını getir
    const borclular = await prisma.borcluBilgileri.findMany({
      select: {
        id: true,
        muhatapTanimi: true,
        muhatapTanimiEk: true,
        ad: true,
        soyad: true,
        ilgiliTCKN: true,
        tcKimlikNo: true
      }
    })

    let fixedCount = 0
    let totalCount = borclular.length
    const fixedRecords: any[] = []

    for (const borclu of borclular) {
      let needsUpdate = false
      const updates: any = {}

      // Muhatap tanımını temizle
      const cleanedMuhatapTanimi = cleanMuhatapTanimi(borclu.muhatapTanimi)
      if (cleanedMuhatapTanimi !== borclu.muhatapTanimi) {
        updates.muhatapTanimi = cleanedMuhatapTanimi
        needsUpdate = true
      }

      // Muhatap tanımı ek'i temizle
      const cleanedMuhatapTanimiEk = cleanMuhatapTanimi(borclu.muhatapTanimiEk)
      if (cleanedMuhatapTanimiEk !== borclu.muhatapTanimiEk) {
        updates.muhatapTanimiEk = cleanedMuhatapTanimiEk
        needsUpdate = true
      }

      // Ad ve soyad alanlarını kontrol et
      if (borclu.ad && (!isNameLike(borclu.ad) || isAddressLike(borclu.ad))) {
        updates.ad = null
        needsUpdate = true
      }

      if (borclu.soyad && (!isNameLike(borclu.soyad) || isAddressLike(borclu.soyad))) {
        updates.soyad = null
        needsUpdate = true
      }

      // Eğer muhatap tanımı temizlendiyse ve ad/soyad varsa, bunları birleştir
      if (!updates.muhatapTanimi && (borclu.ad || borclu.soyad)) {
        const fullName = [
          updates.ad !== null ? borclu.ad : null,
          updates.soyad !== null ? borclu.soyad : null
        ].filter(Boolean).join(' ').trim()
        
        if (fullName && isNameLike(fullName)) {
          updates.muhatapTanimi = fullName
          needsUpdate = true
        }
      }

      // Güncelleme gerekiyorsa kaydet
      if (needsUpdate) {
        await prisma.borcluBilgileri.update({
          where: { id: borclu.id },
          data: updates
        })
        
        fixedCount++
        fixedRecords.push({
          id: borclu.id,
          before: {
            muhatapTanimi: borclu.muhatapTanimi,
            muhatapTanimiEk: borclu.muhatapTanimiEk,
            ad: borclu.ad,
            soyad: borclu.soyad
          },
          after: updates
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${fixedCount} kayıt düzeltildi`,
      totalRecords: totalCount,
      fixedRecords: fixedCount,
      details: fixedRecords.slice(0, 20) // İlk 20 kaydın detayını göster
    })

  } catch (error) {
    console.error('Muhatap tanımı düzeltme hatası:', error)
    return NextResponse.json(
      { error: 'Muhatap tanımları düzeltilirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Sadece analiz yapmak için GET endpoint'i
export async function GET(request: NextRequest) {
  try {
    const borclular = await prisma.borcluBilgileri.findMany({
      select: {
        id: true,
        muhatapTanimi: true,
        muhatapTanimiEk: true,
        ad: true,
        soyad: true
      }
    })

    let problemCount = 0
    const problemRecords: any[] = []

    for (const borclu of borclular) {
      let hasProblems = false
      const problems: string[] = []

      // Muhatap tanımı problemlerini kontrol et
      if (borclu.muhatapTanimi) {
        if (isAddressLike(borclu.muhatapTanimi)) {
          problems.push('Muhatap tanımı adres benzeri')
          hasProblems = true
        }
        if (!isNameLike(borclu.muhatapTanimi)) {
          problems.push('Muhatap tanımı isim benzeri değil')
          hasProblems = true
        }
      }

      // Muhatap tanımı ek problemlerini kontrol et
      if (borclu.muhatapTanimiEk) {
        if (isAddressLike(borclu.muhatapTanimiEk)) {
          problems.push('Muhatap tanımı ek adres benzeri')
          hasProblems = true
        }
        if (!isNameLike(borclu.muhatapTanimiEk)) {
          problems.push('Muhatap tanımı ek isim benzeri değil')
          hasProblems = true
        }
      }

      if (hasProblems) {
        problemCount++
        problemRecords.push({
          id: borclu.id,
          muhatapTanimi: borclu.muhatapTanimi,
          muhatapTanimiEk: borclu.muhatapTanimiEk,
          problems
        })
      }
    }

    return NextResponse.json({
      totalRecords: borclular.length,
      problemRecords: problemCount,
      details: problemRecords.slice(0, 50) // İlk 50 problemli kaydı göster
    })

  } catch (error) {
    console.error('Muhatap tanımı analiz hatası:', error)
    return NextResponse.json(
      { error: 'Muhatap tanımları analiz edilirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}