import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Türkçe karakterleri normalize eden yardımcı
function normalizeKey(key: string) {
  return key
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, '') // boşluk, noktalama vs kaldır
}

function parseTrNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return undefined
  const cleaned = val.replace(/\./, '').replace(/,/g, '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? undefined : num
}

function getValue(row: Record<string, any>, candidates: string[]): any {
  // satırın anahtarlarını normalize et
  const normRow: Record<string, any> = {}
  const keys: string[] = []
  for (const [k, v] of Object.entries(row)) {
    const norm = normalizeKey(k)
    normRow[norm] = v
    keys.push(norm)
  }
  for (const c of candidates) {
    const key = normalizeKey(c)
    // 1) Tam eşleşme
    if (key in normRow) {
      const val = normRow[key]
      return typeof val === 'string' ? val.trim() : val
    }
    // 2) Çoğaltılmış başlıklar (örn: muhataptanimi1, muhataptanimi2, telefon1 ...)
    const foundKey = keys.find(k => k === key || k.startsWith(key))
    if (foundKey) {
      const val = normRow[foundKey]
      return typeof val === 'string' ? val.trim() : val
    }
  }
  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Excel dosyasını oku
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const [index, row] of data.entries()) {
      try {
        const r = row as Record<string, any>

        // Gerçek Excel sütun başlıklarına göre alanları yakala
        const ilgiliTCKN = getValue(r, [
          'İlgili TCKN', 'ilgili TCKN', 'TC Kimlik No', 'T.C. Kimlik No', 'TCKN', 'tc no', 'tc kimlik no', 'ilgili_tckn', 'tcKimlikNo'
        ])
        const durumTanitici = getValue(r, [
          'Durum tanıtıcısı', 'Durum Tanıtıcısı', 'Durum Tanıtıcı', 'Durum Tanitici', 'Durum Taniticisi', 'durum_tanitici', 'durumTanitici'
        ])

        // Excel dosyasındaki gerçek "Muhatap tanımı" sütununu yakala
        // Önce direkt sütun adıyla dene
        let muhatapTanimi: any = r['Muhatap tanımı'] || r['Muhatap Tanımı'] || r['muhatap tanımı']
        
        // Eğer bulunamazsa getValue fonksiyonuyla dene
        if (!muhatapTanimi) {
          muhatapTanimi = getValue(r, [
            'Muhatap tanımı',
            'Muhatap Tanımı', 
            'muhatap tanımı',
            'MUHATAP TANIMI',
            'Muhatap Tanimi', 
            'muhataptanimi', 
            'muhataptanımı', 
            'muhatap_tanimi', 
            'muhatap_tanımı',
            'muhatap'
          ])
        }
        
        // Debug: İlk 3 satırda tüm sütun başlıklarını ve muhatap tanımını logla
        if (index < 3) {
          console.log(`=== SATIR ${index + 2} ===`)
          console.log('Muhatap tanımı sütunu:', r['Muhatap tanımı'])
          console.log('Muhatap Tanımı sütunu:', r['Muhatap Tanımı'])
          console.log('Bulunan muhatapTanimi:', muhatapTanimi)
          if (index === 0) {
            console.log('TÜM SÜTUN BAŞLIKLARI:', Object.keys(r))
            // Muhatap içeren sütunları özellikle göster
            Object.keys(r).forEach(key => {
              if (key.toLowerCase().includes('muhatap')) {
                console.log(`MUHATAP SÜTUNU BULUNDU: "${key}" = "${r[key]}"`)
              }
            })
          }
          console.log('==================')
        }
        
        // Eğer hala muhatapTanimi bulunamadıysa, tüm sütunları kontrol et
        if (!muhatapTanimi) {
          console.log(`Satır ${index + 2}: Muhatap tanımı bulunamadı, tüm sütunları tarıyorum...`)
          
          // Tüm sütunları kontrol et
          for (const [key, value] of Object.entries(r)) {
            console.log(`Kontrol ediliyor: "${key}" = "${value}"`)
            if (value && String(value).trim()) {
              const keyLower = key.toLowerCase()
              // Muhatap içeren sütunları öncelikle kontrol et
              if (keyLower.includes('muhatap')) {
                muhatapTanimi = String(value).trim()
                console.log(`MUHATAP BULUNDU: "${key}" = "${muhatapTanimi}"`)
                break
              }
            }
          }
        }
        
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
          // Harf, boşluk, Türkçe karakterler, sayılar, nokta, tire, ve, ampersand
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
          
          // Kişi ismi kontrolü (sadece harf ve boşluk)
          const personNamePattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü\s]+$/
          if (personNamePattern.test(trimmed)) {
            // TC kimlik numarası değilse
            if (!/^\d{11}$/.test(trimmed.replace(/\s/g, ''))) {
              return true
            }
          }
          
          // Karma isim/şirket (harf + sayı kombinasyonu)
          const mixedPattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü][A-ZÇĞIİÖŞÜa-zçğıiöşü0-9\s\.\-&]*$/
          if (mixedPattern.test(trimmed)) {
            // Çok fazla sayı içermiyorsa (telefon numarası vs. değilse)
            const digitCount = (trimmed.match(/\d/g) || []).length
            if (digitCount < trimmed.length / 2) {
              return true
            }
          }
          
          return false
        }
        
        // Muhatap tanımını temizle ve doğrula
        if (muhatapTanimi !== undefined && muhatapTanimi !== null) {
          muhatapTanimi = String(muhatapTanimi).trim()
          
          // "Borçlu" kelimesini içeren tanımları temizle
          if (muhatapTanimi.toLowerCase() === 'borçlu' || muhatapTanimi.toLowerCase() === 'borclu') {
            muhatapTanimi = ''
          }
          
          // TC kimlik numarası içeren tanımları temizle (11 haneli sayı)
          if (/^\d{11}$/.test(muhatapTanimi.replace(/\s/g, ''))) {
            muhatapTanimi = ''
          }
          
          // "CENGİZ KAMA / ÇAKMAK-MERKEZ" gibi formatta ise, ilk kısmı al ve doğrula
          if (muhatapTanimi && muhatapTanimi.includes('/')) {
            const parts = muhatapTanimi.split('/')
            if (parts.length > 0 && parts[0].trim()) {
              const firstPart = parts[0].trim()
              // İlk kısım isim benzeri ise kullan, değilse temizle
              if (isNameLike(firstPart)) {
                muhatapTanimi = firstPart
              } else {
                muhatapTanimi = ''
              }
            }
          }
          
          // Adres benzeri metinleri temizle
          if (muhatapTanimi && isAddressLike(muhatapTanimi)) {
            muhatapTanimi = ''
          }
          
          // İsim benzeri değilse temizle
          if (muhatapTanimi && !isNameLike(muhatapTanimi)) {
            muhatapTanimi = ''
          }
        }
        const adRaw = getValue(r, [
          'Ad', 'Adi', 'Adı', 'ADI', 'AD', 'First Name', 'FirstName', 'first name', 'firstname',
          'İsim', 'Isim', 'isim', 'NAME', 'Name', 'name'
        ])
        const soyadRaw = getValue(r, [
          'Soyad', 'Soyadı', 'Soyadi', 'SOYAD', 'SOYADI', 'Last Name', 'LastName', 'last name', 'lastname',
          'Surname', 'surname', 'SURNAME'
        ])
        let ad = adRaw !== undefined && adRaw !== null ? String(adRaw).trim() : ''
        let soyad = soyadRaw !== undefined && soyadRaw !== null ? String(soyadRaw).trim() : ''
        
        // Ad ve soyad alanlarını doğrula ve temizle
        if (ad && (!isNameLike(ad) || isAddressLike(ad))) {
          ad = ''
        }
        if (soyad && (!isNameLike(soyad) || isAddressLike(soyad))) {
          soyad = ''
        }
        
        if ((!muhatapTanimi || muhatapTanimi === '') && (ad || soyad)) {
          muhatapTanimi = [ad, soyad].filter(Boolean).join(' ').trim()
        }

        // Excel'de "Muhatap Tanımı" sütunu tekrar geçiyor, bu ikinci olanı ek olarak al
        let muhatapTanimiEk = getValue(r, [
          'Muhatap Tanımı', // İkinci "Muhatap Tanımı" sütunu varsa
          'Muhatap Tanımı Ek', 
          'Muhatap Tanimi Ek', 
          'muhatap tanımı ek', 
          'muhatap tanimi ek', 
          'muhatap_tanimi_ek'
        ])
        
        // Muhatap tanımı ek alanını temizle ve doğrula
        if (muhatapTanimiEk !== undefined && muhatapTanimiEk !== null) {
          muhatapTanimiEk = String(muhatapTanimiEk).trim()
          
          // "Borçlu" kelimesini içeren değerleri temizle
          if (muhatapTanimiEk.toLowerCase().includes('borçlu') || muhatapTanimiEk.toLowerCase().includes('borclu')) {
            muhatapTanimiEk = ''
          }
          
          // Adres benzeri metinleri temizle
          if (muhatapTanimiEk && isAddressLike(muhatapTanimiEk)) {
            muhatapTanimiEk = ''
          }
          
          // İsim benzeri değilse temizle
          if (muhatapTanimiEk && !isNameLike(muhatapTanimiEk)) {
            muhatapTanimiEk = ''
          }
        }

        // Diğer alanları gerçek sütun başlıklarına göre yakala
        // Excel tarih formatını string'e çevir
        const avukatAtamaTarihiRaw = getValue(r, ['Avukat Atama Tarihi', 'avukat atama tarihi'])
        const avukatAtamaTarihi = avukatAtamaTarihiRaw ? String(avukatAtamaTarihiRaw) : undefined
        const durum = getValue(r, ['Durum', 'durum'])
        const durumTanimi = getValue(r, ['Durum Tanımı', 'durum tanımı', 'Durum Tanimi'])
        const sozlesmeHesabi = getValue(r, ['Sözleşme hesabı', 'sözleşme hesabı', 'Sozlesme hesabi'])
        const tcKimlikNo = getValue(r, ['TC kimlik no', 'TC Kimlik No', 'tc kimlik no']) || ilgiliTCKN
        const vergiNo = getValue(r, ['Vergi No', 'vergi no', 'Vergi Numarası'])
        const icraDosyaNumarasi = getValue(r, ['İcra Dosya Numarası', 'icra dosya numarası', 'İcra Dosya No'])
        const icraDairesiTanimi = getValue(r, ['İcra Dairesi Tanımı', 'icra dairesi tanımı'])
        const adresBilgileri = getValue(r, ['Adres Bilgileri', 'adres bilgileri', 'Adres'])
        const il = getValue(r, ['İl', 'il', 'IL'])
        const ilce = getValue(r, ['İlçe', 'ilçe', 'ILCE'])
        const telefon = getValue(r, ['Telefon', 'telefon', 'Telefon No'])
        const telefonAboneGrubu = getValue(r, ['Telefon Abone Grubu', 'telefon abone grubu'])
        const asilAlacak = parseTrNumber(getValue(r, ['Asıl Alacak', 'asıl alacak', 'Asil Alacak']))
        const takipCikisMiktari = parseTrNumber(getValue(r, ['Takip Çıkış Miktarı', 'takip çıkış miktarı']))
        const takipOncesiTahsilat = parseTrNumber(getValue(r, ['Takip Öncesi Tahsilat', 'takip öncesi tahsilat']))
        const takipSonrasiTahsilat = parseTrNumber(getValue(r, ['Takip Sonrası Tahsilat', 'takip sonrası tahsilat']))
        const toplamAcikTutar = parseTrNumber(getValue(r, ['Toplam Açık tutar', 'toplam açık tutar']))
        const guncelBorc = parseTrNumber(getValue(r, ['Güncel Borç', 'güncel borç', 'Guncel Borc']))
        const itirazDurumu = getValue(r, ['İtiraz Durumu', 'itiraz durumu'])
        const borcluTipiTanimi = getValue(r, ['Borçlu Tipi Tanımı', 'borçlu tipi tanımı', 'Borclu Tipi']) || 'Gerçek Kişi'
        const takipTarihiRaw = getValue(r, ['Takip Tarihi', 'takip tarihi'])
        const takipTarihi = takipTarihiRaw ? String(takipTarihiRaw) : undefined
        const hitamTarihiRaw = getValue(r, ['Hitam Tarihi', 'hitam tarihi'])
        const hitamTarihi = hitamTarihiRaw ? String(hitamTarihiRaw) : undefined
        const nedenTanimi = getValue(r, ['Neden Tanımı', 'neden tanımı'])
        const durumTuru = getValue(r, ['Durum Türü', 'durum türü'])
        const durumTuruTanimi = getValue(r, ['Durum Türü Tanımı', 'durum türü tanımı'])
        const tesisatDurumu = getValue(r, ['Tesisat Durumu', 'tesisat durumu'])
        const odemeDurumu = getValue(r, ['Ödeme Durumu', 'ödeme durumu'])
        const vekaletUcreti = parseTrNumber(getValue(r, ['Vekalet Ücreti', 'vekalet ücreti']))
        const neden = getValue(r, ['Neden', 'neden'])
        const uyapDurumu = getValue(r, ['Uyap Durumu', 'uyap durumu'])
        const telefonTesisat = getValue(r, ['Telefon Tesisat', 'telefon tesisat'])
        const tesisatDurumuTanimi = getValue(r, ['Tesisat Durumu Tanımı', 'tesisat durumu tanımı'])

        if (!durumTanitici) {
          errors.push(`Satır ${index + 2}: Durum Tanıtıcı eksik`)
          errorCount++
          continue
        }

        // Tanılama logu (ilk 5 satırı logla)
        if (index < 5) {
          console.log(`[upload-excel][Row ${index + 2}]`)
          console.log(`  - Durum Tanıtıcı: '${durumTanitici}'`)
          console.log(`  - Muhatap Tanımı: '${muhatapTanimi ?? 'BOŞ'}'`)
          console.log(`  - Ad: '${ad}' | Soyad: '${soyad}'`)
          console.log(`  - İlgili TCKN: '${ilgiliTCKN ?? 'BOŞ'}'`)
          console.log(`  - İl: '${il ?? 'BOŞ'}' | Telefon: '${telefon ?? 'BOŞ'}'`)
          console.log(`  - Güncel Borç: '${guncelBorc ?? 'BOŞ'}'`)
          console.log('  - Tüm sütunlar:', Object.keys(r).slice(0, 10).join(', '))
          console.log('---')
        }

        // Ad ve soyad varsa birleştir
        const fullName = [ad, soyad].filter(Boolean).join(' ').trim()
        
        // Final muhatap tanımı belirleme
        let finalMuhatapTanimi = null
        if (muhatapTanimi && String(muhatapTanimi).trim() !== '') {
          finalMuhatapTanimi = String(muhatapTanimi).trim()
        } else if (fullName !== '') {
          finalMuhatapTanimi = fullName
        }
        
        // Debug log
        if (index < 3) {
          console.log(`[Final] Muhatap Tanımı: '${finalMuhatapTanimi ?? 'BOŞ KALACAK'}'`)
        }
        
        await prisma.borcluBilgileri.create({
          data: {
            ilgiliTCKN: ilgiliTCKN || undefined,
            avukatAtamaTarihi: avukatAtamaTarihi || undefined,
            durum: durum || undefined,
            durumTanitici,
            muhatapTanimi: finalMuhatapTanimi,
            durumTanimi: durumTanimi || undefined,
            sozlesmeHesabi: sozlesmeHesabi || undefined,
            tcKimlikNo: tcKimlikNo || undefined,
            vergiNo: vergiNo || undefined,
            icraDosyaNumarasi: icraDosyaNumarasi || undefined,
            icraDairesiTanimi: icraDairesiTanimi || undefined,
            adresBilgileri: adresBilgileri || undefined,
            il: il || undefined,
            ilce: ilce || undefined,
            telefon: telefon || undefined,
            telefonAboneGrubu: telefonAboneGrubu || undefined,
            asilAlacak: asilAlacak || undefined,
            takipCikisMiktari: takipCikisMiktari || undefined,
            takipOncesiTahsilat: takipOncesiTahsilat || undefined,
            takipSonrasiTahsilat: takipSonrasiTahsilat || undefined,
            toplamAcikTutar: toplamAcikTutar || undefined,
            guncelBorc: guncelBorc || undefined,
            itirazDurumu: itirazDurumu || undefined,
            borcluTipiTanimi: borcluTipiTanimi || undefined,
            hitamTarihi: hitamTarihi || undefined,
            takipTarihi: takipTarihi || undefined,
            nedenTanimi: nedenTanimi || undefined,
            durumTuru: durumTuru || undefined,
            durumTuruTanimi: durumTuruTanimi || undefined,
            tesisatDurumu: tesisatDurumu || undefined,
            odemeDurumu: odemeDurumu || undefined,
            vekaletUcreti: vekaletUcreti || undefined,
            neden: neden || undefined,
            muhatapTanimiEk: (muhatapTanimiEk && String(muhatapTanimiEk).trim() !== '' && muhatapTanimiEk !== finalMuhatapTanimi) ? 
              String(muhatapTanimiEk).trim() : undefined,
            uyapDurumu: uyapDurumu || undefined,
            telefonTesisat: telefonTesisat || undefined,
            tesisatDurumuTanimi: tesisatDurumuTanimi || undefined,
            ad: ad || undefined,
            soyad: soyad || undefined
          }
        })

        successCount++
      } catch (error) {
        errorCount++
        errors.push(`Satır ${index + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      }
    }

    return NextResponse.json({
      message: 'Excel dosyası işlendi',
      successCount,
      errorCount,
      errors: errors.slice(0, 10)
    })

  } catch (error) {
    console.error('Excel yükleme hatası:', error)
    return NextResponse.json(
      { error: 'Excel dosyası işlenirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}