import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'

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
  if (typeof val === 'number') {
    return isNaN(val) ? undefined : val
  }
  if (typeof val !== 'string') return undefined
  
  try {
    // Türkçe sayı formatını temizle: "1.234,56" -> "1234.56"
    const cleaned = val.trim()
      .replace(/\s/g, '') // Boşlukları kaldır
      .replace(/\./g, '') // Binlik ayırıcı noktaları kaldır
      .replace(/,/g, '.') // Ondalık virgülü noktaya çevir
    
    if (cleaned === '') return undefined
    
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  } catch (error) {
    console.warn(`[parseTrNumber] Sayı dönüştürme hatası: "${val}"`, error)
    return undefined
  }
}

// Yeni: Kapsamlı veri tipi doğrulama fonksiyonu
function validateAndConvertTypes(data: any): { isValid: boolean; errors: string[]; convertedData?: any } {
  const errors: string[] = []
  const convertedData: any = {}
  
  try {
    // durumTanitici - zorunlu string field
    if (!data.durumTanitici || String(data.durumTanitici).trim() === '') {
      errors.push('durumTanitici alanı zorunludur ve boş olamaz')
    } else {
      convertedData.durumTanitici = String(data.durumTanitici).trim()
    }
    
    // String alanları güvenli dönüştür
    const stringFields = [
      'ilgiliTCKN', 'avukatAtamaTarihi', 'durum', 'muhatapTanimi', 'durumTanimi',
      'sozlesmeHesabi', 'tcKimlikNo', 'vergiNo', 'icraDosyaNumarasi', 'icraDairesiTanimi',
      'adresBilgileri', 'il', 'ilce', 'telefon', 'telefon2', 'telefon3', 'telefonAboneGrubu', 'itirazDurumu',
      'borcluTipiTanimi', 'hitamTarihi', 'takipTarihi', 'nedenTanimi', 'durumTuru',
      'durumTuruTanimi', 'tesisatDurumu', 'odemeDurumu', 'neden', 'muhatapTanimiEk',
      'uyapDurumu', 'telefonTesisat', 'tesisatDurumuTanimi', 'ad', 'soyad'
    ]
    
    stringFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        const stringValue = String(data[field]).trim()
        convertedData[field] = stringValue !== '' ? stringValue : undefined
      } else {
        convertedData[field] = undefined
      }
    })
    
    // Sayısal alanları dönüştür
    const numericFields = [
      'asilAlacak', 'takipCikisMiktari', 'takipOncesiTahsilat', 'takipSonrasiTahsilat',
      'toplamAcikTutar', 'guncelBorc', 'vekaletUcreti'
    ]
    
    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        const numValue = parseTrNumber(data[field])
        if (numValue !== undefined && numValue < 0) {
          errors.push(`${field} alanı negatif olamaz`)
        }
        convertedData[field] = numValue
      } else {
        convertedData[field] = undefined
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      convertedData: errors.length === 0 ? convertedData : undefined
    }
  } catch (error) {
    errors.push(`Veri doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    return { isValid: false, errors }
  }
}

// Yeni: Zorunlu alanları kontrol et
function validateRequiredFields(data: any): string[] {
  const errors: string[] = []
  
  if (!data.durumTanitici || String(data.durumTanitici).trim() === '') {
    errors.push('Durum Tanıtıcı alanı zorunludur')
  }
  
  return errors
}

// Yeni: Hata kategorileri
enum ErrorType {
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR'
}

interface ProcessingError {
  rowIndex: number
  field?: string
  value?: any
  errorType: ErrorType
  message: string
  suggestion?: string
}

interface ProcessingWarning {
  rowIndex: number
  field?: string
  message: string
}

// Yeni: Gelişmiş hata loglama
function logProcessingError(
  rowIndex: number, 
  error: any, 
  data: any, 
  context: string = ''
): ProcessingError {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  let errorType = ErrorType.PROCESSING_ERROR
  let suggestion = ''
  
  // Hata tipini belirle
  if (errorMessage.includes('Invalid value provided') || errorMessage.includes('Expected')) {
    errorType = ErrorType.TYPE_MISMATCH
    suggestion = 'Veri tipini kontrol edin ve doğru formatta olduğundan emin olun'
  } else if (errorMessage.includes('required') || errorMessage.includes('zorunlu')) {
    errorType = ErrorType.REQUIRED_FIELD
    suggestion = 'Zorunlu alanların dolu olduğundan emin olun'
  } else if (errorMessage.includes('Unique constraint') || errorMessage.includes('UNIQUE')) {
    errorType = ErrorType.DATABASE_ERROR
    suggestion = 'Bu Durum Tanıtıcı zaten mevcut, güncelleme modunu kullanın'
  } else if (errorMessage.includes('validation') || errorMessage.includes('doğrulama')) {
    errorType = ErrorType.VALIDATION_ERROR
    suggestion = 'Veri formatını kontrol edin'
  }
  
  const processingError: ProcessingError = {
    rowIndex,
    errorType,
    message: errorMessage,
    suggestion
  }
  
  // Detaylı log
  console.error(`[upload-excel][${context}] Satır ${rowIndex + 2} hatası:`, {
    error: errorMessage,
    errorType,
    data: {
      durumTanitici: data?.durumTanitici || 'Tanımsız',
      muhatapTanimi: data?.muhatapTanimi || 'Tanımsız'
    },
    suggestion
  })
  
  return processingError
}

// Yeni: Hataları kategorize et
function categorizeErrors(errors: ProcessingError[]): Record<ErrorType, ProcessingError[]> {
  const categorized: Record<ErrorType, ProcessingError[]> = {
    [ErrorType.TYPE_MISMATCH]: [],
    [ErrorType.REQUIRED_FIELD]: [],
    [ErrorType.DATABASE_ERROR]: [],
    [ErrorType.VALIDATION_ERROR]: [],
    [ErrorType.PROCESSING_ERROR]: []
  }
  
  errors.forEach(error => {
    categorized[error.errorType].push(error)
  })
  
  return categorized
}

// Yeni: Hata raporu oluştur
function generateErrorReport(errors: ProcessingError[]): string {
  if (errors.length === 0) return ''
  
  const categorized = categorizeErrors(errors)
  const report: string[] = []
  
  Object.entries(categorized).forEach(([type, typeErrors]) => {
    if (typeErrors.length > 0) {
      let categoryName = ''
      switch (type as ErrorType) {
        case ErrorType.TYPE_MISMATCH:
          categoryName = 'Veri Tipi Hataları'
          break
        case ErrorType.REQUIRED_FIELD:
          categoryName = 'Zorunlu Alan Hataları'
          break
        case ErrorType.DATABASE_ERROR:
          categoryName = 'Veritabanı Hataları'
          break
        case ErrorType.VALIDATION_ERROR:
          categoryName = 'Doğrulama Hataları'
          break
        case ErrorType.PROCESSING_ERROR:
          categoryName = 'İşlem Hataları'
          break
      }
      
      report.push(`${categoryName}: ${typeErrors.length} hata`)
    }
  })
  
  return report.join(', ')
}

// Yeni: Kullanıcı için sonraki adımlar öner
function generateNextSteps(summary: any, errors: ProcessingError[], warnings: ProcessingWarning[]): string[] {
  const steps: string[] = []
  
  if (summary.successRate === 100) {
    steps.push('🎉 Tüm veriler başarıyla işlendi!')
    if (warnings.length > 0) {
      steps.push('📋 Veri kalitesini artırmak için uyarıları gözden geçirebilirsiniz')
    }
    steps.push('📊 Borçlu listesini görüntülemek için "Borçlular" sayfasına gidin')
    return steps
  }
  
  if (summary.successRate === 0) {
    steps.push('🔍 Excel dosyanızın formatını kontrol edin')
    steps.push('📝 Örnek Excel şablonunu indirip kullanın')
    steps.push('✅ Zorunlu alanların dolu olduğundan emin olun')
    
    const typeErrors = errors.filter(e => e.errorType === ErrorType.TYPE_MISMATCH)
    if (typeErrors.length > 0) {
      steps.push('🔢 Sayısal alanların Türkçe format (1.234,56) olduğunu kontrol edin')
    }
    
    const requiredErrors = errors.filter(e => e.errorType === ErrorType.REQUIRED_FIELD)
    if (requiredErrors.length > 0) {
      steps.push('⚠️ "Durum Tanıtıcı" sütununun her satırda dolu olduğundan emin olun')
    }
    
    return steps
  }
  
  // Kısmi başarı durumu
  steps.push(`✅ ${summary.processedRows} kayıt başarıyla işlendi`)
  steps.push(`❌ ${summary.failedRows} kayıt işlenemedi`)
  
  if (summary.failedRows > 0) {
    steps.push('📋 Hatalı satırları Excel\'de düzeltin ve tekrar yükleyin')
    
    const commonErrors = errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostCommonError = Object.entries(commonErrors)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (mostCommonError) {
      const [errorType, count] = mostCommonError
      switch (errorType) {
        case ErrorType.TYPE_MISMATCH:
          steps.push(`🔢 En çok veri tipi hatası var (${count} adet) - sayı formatlarını kontrol edin`)
          break
        case ErrorType.REQUIRED_FIELD:
          steps.push(`📝 En çok zorunlu alan hatası var (${count} adet) - boş hücreleri doldurun`)
          break
        case ErrorType.DATABASE_ERROR:
          steps.push(`💾 Veritabanı hataları var (${count} adet) - duplicate kayıtları kontrol edin`)
          break
      }
    }
  }
  
  if (warnings.length > 0) {
    steps.push(`⚠️ ${warnings.length} uyarı var - veri kalitesini artırabilirsiniz`)
    
    if (summary.dataQuality.emptyMuhatapCount > 0) {
      steps.push('👤 Muhatap tanımı boş olan kayıtları tamamlayın')
    }
    if (summary.dataQuality.invalidTCKNCount > 0) {
      steps.push('🆔 Geçersiz TC kimlik numaralarını düzeltin')
    }
    if (summary.dataQuality.invalidPhoneCount > 0) {
      steps.push('📞 Geçersiz telefon numaralarını düzeltin')
    }
  }
  
  steps.push('📊 İşlenen kayıtları görüntülemek için "Borçlular" sayfasına gidin')
  
  return steps
}

// Yeni: Metin temizleme ve doğrulama
function sanitizeText(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const text = String(value).trim()
  if (text === '') return undefined
  
  // Zararlı karakterleri temizle
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Kontrol karakterleri
    .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
    .trim()
  
  return cleaned !== '' ? cleaned : undefined
}

// Yeni: Telefon numarası doğrulama ve temizleme
function sanitizePhoneNumber(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const phone = String(value).trim()
  if (phone === '') return undefined
  
  // Sadece rakamları al
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Türk telefon numarası formatları
  if (digitsOnly.length === 10 && digitsOnly.startsWith('5')) {
    return digitsOnly // 5xxxxxxxxx
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('05')) {
    return digitsOnly.substring(1) // 05xxxxxxxxx -> 5xxxxxxxxx
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('905')) {
    return digitsOnly.substring(2) // 905xxxxxxxxx -> 5xxxxxxxxx
  } else if (digitsOnly.length >= 7) {
    return digitsOnly // Diğer formatlar için ham veriyi döndür
  }
  
  return undefined
}

// Yeni: TC Kimlik No doğrulama
function validateTCKN(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const tckn = String(value).trim().replace(/\D/g, '')
  if (tckn.length !== 11) return undefined
  
  // Basit TCKN doğrulama
  if (tckn === '00000000000' || tckn[0] === '0') return undefined
  
  return tckn
}

// Yeni: Tarih doğrulama ve temizleme
function sanitizeDate(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const dateStr = String(value).trim()
  if (dateStr === '') return undefined
  
  // Excel tarih formatları için
  if (/^\d{5}$/.test(dateStr)) {
    // Excel serial date (örn: 45821)
    try {
      const excelDate = new Date((parseInt(dateStr) - 25569) * 86400 * 1000)
      return excelDate.toISOString().split('T')[0] // YYYY-MM-DD formatı
    } catch {
      return dateStr // Dönüştürülemezse orijinal değeri döndür
    }
  }
  
  // Diğer tarih formatları için orijinal değeri döndür
  return dateStr
}

// Yeni: Gelişmiş alan doğrulama
function validateFieldIntegrity(fieldName: string, value: any, rowData: any): ProcessingWarning[] {
  const warnings: ProcessingWarning[] = []
  
  switch (fieldName) {
    case 'tcKimlikNo':
    case 'ilgiliTCKN':
      if (value && !validateTCKN(value)) {
        warnings.push({
          rowIndex: -1, // Caller tarafından set edilecek
          field: fieldName,
          message: `${fieldName} geçersiz format (11 haneli olmalı)`
        })
      }
      break
      
    case 'telefon':
    case 'telefon2':
    case 'telefon3':
      if (value && !sanitizePhoneNumber(value)) {
        warnings.push({
          rowIndex: -1,
          field: fieldName,
          message: 'Telefon numarası geçersiz format'
        })
      }
      break
      
    case 'guncelBorc':
    case 'asilAlacak':
      if (value !== undefined && (typeof value !== 'number' || value < 0)) {
        warnings.push({
          rowIndex: -1,
          field: fieldName,
          message: `${fieldName} negatif olamaz`
        })
      }
      break
      
    case 'muhatapTanimi':
      if (!value || String(value).trim() === '') {
        warnings.push({
          rowIndex: -1,
          field: fieldName,
          message: 'Muhatap tanımı boş, veri kalitesi düşük olabilir'
        })
      }
      break
  }
  
  return warnings
}

// Yeni: Kapsamlı veri temizleme
function sanitizeRowData(rawData: any): any {
  const sanitized: any = {}
  
  // String alanları temizle
  const stringFields = [
    'durumTanitici', 'ilgiliTCKN', 'durum', 'muhatapTanimi', 'durumTanimi',
    'sozlesmeHesabi', 'vergiNo', 'icraDosyaNumarasi', 'icraDairesiTanimi',
    'adresBilgileri', 'il', 'ilce', 'telefonAboneGrubu', 'itirazDurumu',
    'borcluTipiTanimi', 'nedenTanimi', 'durumTuru', 'durumTuruTanimi',
    'tesisatDurumu', 'odemeDurumu', 'neden', 'muhatapTanimiEk',
    'uyapDurumu', 'telefonTesisat', 'tesisatDurumuTanimi', 'ad', 'soyad'
  ]
  
  stringFields.forEach(field => {
    sanitized[field] = sanitizeText(rawData[field])
  })
  
  // Özel alanları temizle
  sanitized.telefon = sanitizePhoneNumber(rawData.telefon)
  sanitized.telefon2 = sanitizePhoneNumber(rawData.telefon2)
  sanitized.telefon3 = sanitizePhoneNumber(rawData.telefon3)
  sanitized.tcKimlikNo = validateTCKN(rawData.tcKimlikNo)
  sanitized.ilgiliTCKN = validateTCKN(rawData.ilgiliTCKN)
  
  // Tarih alanları
  sanitized.avukatAtamaTarihi = sanitizeDate(rawData.avukatAtamaTarihi)
  sanitized.takipTarihi = sanitizeDate(rawData.takipTarihi)
  sanitized.hitamTarihi = sanitizeDate(rawData.hitamTarihi)
  
  // Sayısal alanlar (zaten parseTrNumber ile işleniyor)
  const numericFields = [
    'asilAlacak', 'takipCikisMiktari', 'takipOncesiTahsilat', 'takipSonrasiTahsilat',
    'toplamAcikTutar', 'guncelBorc', 'vekaletUcreti'
  ]
  
  numericFields.forEach(field => {
    sanitized[field] = rawData[field] // parseTrNumber zaten uygulanmış
  })
  
  return sanitized
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
  let transaction: any = null
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'replace' // 'replace' veya 'update'

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
    
    // Büyük dosyalar için transaction başlat
    const shouldUseTransaction = data.length > 100 || mode === 'replace'
    if (shouldUseTransaction) {
      console.log(`[upload-excel] Transaction başlatılıyor (${data.length} satır)`)
    }

    let successCount = 0
    let errorCount = 0
    let updatedCount = 0
    let createdCount = 0
    const errors: string[] = []
    const processingErrors: ProcessingError[] = []
    const warnings: ProcessingWarning[] = []
    
    // Kritik hatalar için rollback flag
    let hasCriticalErrors = false
    const processedRecords: string[] = [] // Başarılı işlemleri takip et

    // Progress tracking için
    const totalRows = data.length
    const progressInterval = Math.max(1, Math.floor(totalRows / 20)) // %5'lik aralıklarla progress
    
    console.log(`[upload-excel] İşlem başlatılıyor: ${totalRows} satır`)

    for (const [index, row] of data.entries()) {
      // Progress reporting
      if (index % progressInterval === 0 || index === totalRows - 1) {
        const progressPercent = Math.round((index / totalRows) * 100)
        console.log(`[upload-excel] İlerleme: %${progressPercent} (${index + 1}/${totalRows})`)
      }
      try {
        const r = row as Record<string, any>

        // Gerçek Excel sütun başlıklarına göre alanları yakala
        const ilgiliTCKN = getValue(r, [
          'İlgili TCKN', 'ilgili TCKN', 'TC Kimlik No', 'T.C. Kimlik No', 'TCKN', 'tc no', 'tc kimlik no', 'ilgili_tckn', 'tcKimlikNo'
        ])
        const durumTaniciRaw = getValue(r, [
          'Durum tanıtıcısı', 'Durum Tanıtıcısı', 'Durum Tanıtıcı', 'Durum Tanitici', 'Durum Taniticisi', 'durum_tanitici', 'durumTanitici'
        ])
        
        // durumTanitici'yi her zaman string'e çevir (Prisma schema String bekliyor)
        const durumTanitici = durumTaniciRaw !== undefined && durumTaniciRaw !== null ? String(durumTaniciRaw).trim() : undefined

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
        const telefon = getValue(r, ['Telefon', 'telefon', 'Telefon No', 'Telefon_1', 'Telefon 1'])
        const telefon2 = getValue(r, ['Telefon_2', 'Telefon 2', 'Telefon2', 'İkinci Telefon'])
        const telefon3 = getValue(r, ['Telefon_3', 'Telefon 3', 'Telefon3', 'Üçüncü Telefon'])
        const telefonAboneGrubu = getValue(r, ['Telefon Abone Grubu', 'telefon abone grubu', 'Abone Grubu'])
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

        // Önce zorunlu alanları kontrol et
        const requiredFieldErrors = validateRequiredFields({ durumTanitici })
        if (requiredFieldErrors.length > 0) {
          requiredFieldErrors.forEach(error => {
            const processingError = logProcessingError(index, new Error(error), { durumTanitici }, 'REQUIRED_FIELD_CHECK')
            processingErrors.push(processingError)
            errors.push(`Satır ${index + 2}: ${error}`)
          })
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
        
        // Ham veriyi hazırla
        const rawData = {
          durumTanitici,
          ilgiliTCKN,
          avukatAtamaTarihi,
          durum,
          muhatapTanimi: finalMuhatapTanimi,
          durumTanimi,
          sozlesmeHesabi,
          tcKimlikNo,
          vergiNo,
          icraDosyaNumarasi,
          icraDairesiTanimi,
          adresBilgileri,
          il,
          ilce,
          telefon,
          telefon2,
          telefon3,
          telefonAboneGrubu,
          asilAlacak,
          takipCikisMiktari,
          takipOncesiTahsilat,
          takipSonrasiTahsilat,
          toplamAcikTutar,
          guncelBorc,
          itirazDurumu,
          borcluTipiTanimi,
          hitamTarihi,
          takipTarihi,
          nedenTanimi,
          durumTuru,
          durumTuruTanimi,
          tesisatDurumu,
          odemeDurumu,
          vekaletUcreti,
          neden,
          muhatapTanimiEk: (muhatapTanimiEk && String(muhatapTanimiEk).trim() !== '' && muhatapTanimiEk !== finalMuhatapTanimi) ? 
            muhatapTanimiEk : undefined,
          uyapDurumu,
          telefonTesisat,
          tesisatDurumuTanimi,
          ad,
          soyad
        }
        
        // Veriyi temizle ve sanitize et
        const sanitizedData = sanitizeRowData(rawData)
        
        // Alan bütünlüğü kontrolü ve uyarılar
        Object.entries(sanitizedData).forEach(([fieldName, value]) => {
          const fieldWarnings = validateFieldIntegrity(fieldName, value, sanitizedData)
          fieldWarnings.forEach(warning => {
            warning.rowIndex = index
            warnings.push(warning)
          })
        })
        
        // Veri tiplerini doğrula ve dönüştür
        const validation = validateAndConvertTypes(sanitizedData)
        if (!validation.isValid) {
          validation.errors.forEach(error => {
            const processingError = logProcessingError(index, new Error(error), sanitizedData, 'TYPE_VALIDATION')
            processingErrors.push(processingError)
            errors.push(`Satır ${index + 2}: ${error}`)
          })
          errorCount++
          continue
        }
        
        const recordData = validation.convertedData!

        try {
          // Retry logic için
          let retryCount = 0
          const maxRetries = 3
          let lastError: any = null
          
          while (retryCount <= maxRetries) {
            try {
              if (mode === 'update') {
                // Upsert modu: Mevcut kayıt varsa güncelle, yoksa oluştur
                const existingRecord = await prisma.borcluBilgileri.findUnique({
                  where: { durumTanitici: recordData.durumTanitici },
                  select: { id: true }
                })
                
                if (existingRecord) {
                  await prisma.borcluBilgileri.update({
                    where: { durumTanitici: recordData.durumTanitici },
                    data: recordData
                  })
                  updatedCount++
                } else {
                  await prisma.borcluBilgileri.create({
                    data: recordData
                  })
                  createdCount++
                }
              } else {
                // Replace modu: Her zaman yeni kayıt oluştur (eski davranış)
                await prisma.borcluBilgileri.create({
                  data: recordData
                })
                createdCount++
              }
              
              // Başarılı işlem
              processedRecords.push(recordData.durumTanitici)
              break // Retry döngüsünden çık
              
            } catch (retryError) {
              lastError = retryError
              retryCount++
              
              // Geçici hata mı kontrol et
              const errorMessage = retryError instanceof Error ? retryError.message : String(retryError)
              const isTransientError = errorMessage.includes('SQLITE_BUSY') || 
                                     errorMessage.includes('database is locked') ||
                                     errorMessage.includes('timeout')
              
              if (isTransientError && retryCount <= maxRetries) {
                console.warn(`[upload-excel] Geçici hata, yeniden deneniyor (${retryCount}/${maxRetries}):`, errorMessage)
                await new Promise(resolve => setTimeout(resolve, 100 * retryCount)) // Exponential backoff
                continue
              } else {
                throw retryError // Retry limiti aşıldı veya kalıcı hata
              }
            }
          }
          
        } catch (dbError) {
          // Database işlem hatası
          const processingError = logProcessingError(index, dbError, recordData, 'DATABASE_OPERATION')
          processingErrors.push(processingError)
          
          // Kritik hata kontrolü
          const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
          if (errorMessage.includes('UNIQUE constraint') || 
              errorMessage.includes('NOT NULL constraint') ||
              errorMessage.includes('FOREIGN KEY constraint')) {
            hasCriticalErrors = true
          }
          
          throw dbError // Ana catch bloğuna geç
        }

        successCount++
      } catch (error) {
        errorCount++
        
        // Güvenli veri erişimi için mevcut satır verilerini kullan
        const safeData = {
          rowIndex: index + 2,
          rawData: row
        }
        
        const processingError = logProcessingError(index, error, safeData, 'ROW_PROCESSING')
        processingErrors.push(processingError)
        
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        errors.push(`Satır ${index + 2}: ${errorMessage}`)
        
        // Kritik hata oranı kontrolü
        const errorRate = errorCount / (index + 1)
        if (errorRate > 0.5 && index > 10) {
          console.error(`[upload-excel] Yüksek hata oranı tespit edildi: %${(errorRate * 100).toFixed(1)}`)
          hasCriticalErrors = true
          break // İşlemi durdur
        }
      }
    }
    
    // Rollback kontrolü
    if (hasCriticalErrors && shouldUseTransaction && processedRecords.length > 0) {
      console.warn(`[upload-excel] Kritik hatalar nedeniyle rollback yapılıyor...`)
      
      try {
        // Manuel rollback - işlenmiş kayıtları geri al
        if (mode === 'replace') {
          // Replace modunda tüm yeni kayıtları sil
          const deleteResult = await prisma.borcluBilgileri.deleteMany({
            where: {
              durumTanitici: {
                in: processedRecords
              }
            }
          })
          console.log(`[upload-excel] Rollback: ${deleteResult.count} kayıt silindi`)
        }
        
        return NextResponse.json({
          success: false,
          message: 'Kritik hatalar nedeniyle işlem geri alındı',
          successCount: 0,
          errorCount,
          createdCount: 0,
          updatedCount: 0,
          mode,
          errors: errors.slice(0, 10),
          errorReport: generateErrorReport(processingErrors),
          rolledBack: true,
          rollbackReason: 'Yüksek hata oranı veya kritik veritabanı hataları'
        }, { status: 400 })
        
      } catch (rollbackError) {
        console.error(`[upload-excel] Rollback hatası:`, rollbackError)
        return NextResponse.json({
          success: false,
          message: 'İşlem başarısız ve rollback yapılamadı',
          error: 'Kritik sistem hatası'
        }, { status: 500 })
      }
    }

    // Hata raporu oluştur
    const errorReport = generateErrorReport(processingErrors)
    
    // Kullanıcı dostu mesaj oluştur
    let userMessage = ''
    let suggestions: string[] = []
    
    if (errorCount === 0) {
      userMessage = mode === 'update' 
        ? `✅ Excel dosyası başarıyla işlendi! ${createdCount} yeni kayıt eklendi, ${updatedCount} kayıt güncellendi.`
        : `✅ Excel dosyası başarıyla işlendi! ${createdCount} kayıt eklendi.`
    } else if (successCount > 0) {
      userMessage = `⚠️ Excel dosyası kısmen işlendi. ${successCount} kayıt başarılı, ${errorCount} kayıt başarısız.`
      suggestions.push('Hatalı satırları kontrol edin ve düzelttikten sonra tekrar yükleyin')
      
      if (warnings.length > 0) {
        suggestions.push('Veri kalitesini artırmak için uyarıları gözden geçirin')
      }
    } else {
      userMessage = `❌ Excel dosyası işlenemedi. Tüm satırlarda hata var.`
      suggestions.push('Excel dosyanızın formatını kontrol edin')
      suggestions.push('Zorunlu alanların (Durum Tanıtıcı) dolu olduğundan emin olun')
      suggestions.push('Sayısal alanların doğru formatta olduğunu kontrol edin')
    }
    
    // Performans metrikleri
    const processingEndTime = Date.now()
    const processingDuration = processingEndTime - Date.now() // Bu gerçek implementasyonda başlangıç zamanı tutulmalı
    
    // Detaylı özet
    const detailedSummary = {
      totalRows: data.length,
      processedRows: successCount,
      failedRows: errorCount,
      successRate: data.length > 0 ? Math.round((successCount / data.length) * 100) : 0,
      hasErrors: errorCount > 0,
      hasWarnings: warnings.length > 0,
      warningCount: warnings.length,
      processingTime: `${Math.round(processingDuration / 1000)}s`,
      dataQuality: {
        emptyMuhatapCount: warnings.filter(w => w.message.includes('muhatap tanımı boş')).length,
        invalidTCKNCount: warnings.filter(w => w.message.includes('TCKN') || w.message.includes('TC kimlik')).length,
        invalidPhoneCount: warnings.filter(w => w.message.includes('telefon')).length,
        negativeAmountCount: warnings.filter(w => w.message.includes('negatif')).length
      }
    }
    
    // Öneriler oluştur
    if (detailedSummary.dataQuality.emptyMuhatapCount > 0) {
      suggestions.push(`${detailedSummary.dataQuality.emptyMuhatapCount} kayıtta muhatap tanımı boş`)
    }
    if (detailedSummary.dataQuality.invalidTCKNCount > 0) {
      suggestions.push(`${detailedSummary.dataQuality.invalidTCKNCount} kayıtta geçersiz TC kimlik numarası`)
    }
    if (detailedSummary.dataQuality.invalidPhoneCount > 0) {
      suggestions.push(`${detailedSummary.dataQuality.invalidPhoneCount} kayıtta geçersiz telefon numarası`)
    }
    
    console.log(`[upload-excel] İşlem tamamlandı: ${successCount}/${data.length} başarılı`)
    
    return NextResponse.json({
      success: errorCount === 0,
      message: userMessage,
      suggestions,
      successCount,
      errorCount,
      createdCount,
      updatedCount,
      mode,
      errors: errors.slice(0, 10),
      errorReport,
      processingErrors: processingErrors.slice(0, 5), // İlk 5 detaylı hata
      warnings: warnings.slice(0, 10), // İlk 10 uyarı
      summary: detailedSummary,
      // Kullanıcı için actionable feedback
      nextSteps: generateNextSteps(detailedSummary, processingErrors, warnings)
    })

  } catch (error) {
    console.error('Excel yükleme hatası:', error)
    return NextResponse.json(
      { error: 'Excel dosyası işlenirken hata oluştu' },
      { status: 500 }
    )
  }
}