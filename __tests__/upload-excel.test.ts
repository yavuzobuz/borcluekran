// Test edilecek fonksiyonları import et (normalde route.ts'den export edilmeli)
// Bu fonksiyonları test etmek için route.ts'den export etmemiz gerekiyor

describe('Excel Upload Data Processing Functions', () => {
  
  describe('parseTrNumber', () => {
    // parseTrNumber fonksiyonu için testler
    
    it('should parse Turkish number format correctly', () => {
      // Test cases for Turkish number formats
      expect(parseTrNumber('1.234,56')).toBe(1234.56)
      expect(parseTrNumber('1234,56')).toBe(1234.56)
      expect(parseTrNumber('1234.56')).toBe(1234.56)
      expect(parseTrNumber('1234')).toBe(1234)
    })
    
    it('should handle edge cases', () => {
      expect(parseTrNumber(undefined)).toBeUndefined()
      expect(parseTrNumber(null)).toBeUndefined()
      expect(parseTrNumber('')).toBeUndefined()
      expect(parseTrNumber('abc')).toBeUndefined()
      expect(parseTrNumber(123.45)).toBe(123.45)
    })
    
    it('should handle spaces and special characters', () => {
      expect(parseTrNumber(' 1.234,56 ')).toBe(1234.56)
      expect(parseTrNumber('1 234,56')).toBe(1234.56)
      expect(parseTrNumber('1.234.567,89')).toBe(1234567.89)
    })
  })
  
  describe('normalizeKey', () => {
    it('should normalize Turkish characters', () => {
      expect(normalizeKey('Müşteri Adı')).toBe('musteriad')
      expect(normalizeKey('Şirket İsmi')).toBe('sirketismi')
      expect(normalizeKey('Çalışan Görevli')).toBe('calisangorevli')
      expect(normalizeKey('Ğüzel Öğrenci')).toBe('guzelogrenci')
    })
    
    it('should remove spaces and special characters', () => {
      expect(normalizeKey('Ad Soyad')).toBe('adsoyad')
      expect(normalizeKey('Telefon-No')).toBe('telefonno')
      expect(normalizeKey('E-mail@domain.com')).toBe('emaildomaincom')
    })
    
    it('should handle empty and undefined values', () => {
      expect(normalizeKey('')).toBe('')
      expect(normalizeKey('   ')).toBe('')
    })
  })
  
  describe('validateAndConvertTypes', () => {
    it('should validate required fields', () => {
      const result = validateAndConvertTypes({})
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('durumTanitici alanı zorunludur ve boş olamaz')
    })
    
    it('should convert string fields correctly', () => {
      const data = {
        durumTanitici: '12345',
        muhatapTanimi: '  Test Müşteri  ',
        il: 'İSTANBUL'
      }
      
      const result = validateAndConvertTypes(data)
      expect(result.isValid).toBe(true)
      expect(result.convertedData?.durumTanitici).toBe('12345')
      expect(result.convertedData?.muhatapTanimi).toBe('Test Müşteri')
      expect(result.convertedData?.il).toBe('İSTANBUL')
    })
    
    it('should convert numeric fields correctly', () => {
      const data = {
        durumTanitici: '12345',
        guncelBorc: '1.234,56',
        asilAlacak: 1000
      }
      
      const result = validateAndConvertTypes(data)
      expect(result.isValid).toBe(true)
      expect(result.convertedData?.guncelBorc).toBe(1234.56)
      expect(result.convertedData?.asilAlacak).toBe(1000)
    })
    
    it('should reject negative numbers', () => {
      const data = {
        durumTanitici: '12345',
        guncelBorc: -100
      }
      
      const result = validateAndConvertTypes(data)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('guncelBorc alanı negatif olamaz')
    })
  })
  
  describe('sanitizeText', () => {
    it('should clean and trim text', () => {
      expect(sanitizeText('  Test Text  ')).toBe('Test Text')
      expect(sanitizeText('Multiple   Spaces')).toBe('Multiple Spaces')
      expect(sanitizeText('')).toBeUndefined()
      expect(sanitizeText(null)).toBeUndefined()
      expect(sanitizeText(undefined)).toBeUndefined()
    })
    
    it('should remove control characters', () => {
      expect(sanitizeText('Test\x00Text')).toBe('TestText')
      expect(sanitizeText('Line1\x0BLine2')).toBe('Line1Line2')
    })
  })
  
  describe('sanitizePhoneNumber', () => {
    it('should format Turkish phone numbers correctly', () => {
      expect(sanitizePhoneNumber('5551234567')).toBe('5551234567')
      expect(sanitizePhoneNumber('05551234567')).toBe('5551234567')
      expect(sanitizePhoneNumber('905551234567')).toBe('5551234567')
      expect(sanitizePhoneNumber('+90 555 123 45 67')).toBe('5551234567')
    })
    
    it('should handle invalid phone numbers', () => {
      expect(sanitizePhoneNumber('123')).toBeUndefined()
      expect(sanitizePhoneNumber('abc')).toBeUndefined()
      expect(sanitizePhoneNumber('')).toBeUndefined()
    })
  })
  
  describe('validateTCKN', () => {
    it('should validate Turkish ID numbers', () => {
      expect(validateTCKN('12345678901')).toBe('12345678901')
      expect(validateTCKN('  12345678901  ')).toBe('12345678901')
    })
    
    it('should reject invalid TCKN', () => {
      expect(validateTCKN('00000000000')).toBeUndefined()
      expect(validateTCKN('01234567890')).toBeUndefined()
      expect(validateTCKN('123456789')).toBeUndefined()
      expect(validateTCKN('abc')).toBeUndefined()
    })
  })
  
  describe('sanitizeDate', () => {
    it('should handle Excel serial dates', () => {
      const result = sanitizeDate('45821')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    })
    
    it('should handle regular date strings', () => {
      expect(sanitizeDate('2024-01-15')).toBe('2024-01-15')
      expect(sanitizeDate('15.01.2024')).toBe('15.01.2024')
    })
    
    it('should handle empty dates', () => {
      expect(sanitizeDate('')).toBeUndefined()
      expect(sanitizeDate(null)).toBeUndefined()
      expect(sanitizeDate(undefined)).toBeUndefined()
    })
  })
  
  describe('validateFieldIntegrity', () => {
    it('should generate warnings for invalid TCKN', () => {
      const warnings = validateFieldIntegrity('tcKimlikNo', '123', {})
      expect(warnings).toHaveLength(1)
      expect(warnings[0].message).toContain('geçersiz format')
    })
    
    it('should generate warnings for invalid phone numbers', () => {
      const warnings = validateFieldIntegrity('telefon', '123', {})
      expect(warnings).toHaveLength(1)
      expect(warnings[0].message).toContain('geçersiz format')
    })
    
    it('should generate warnings for negative amounts', () => {
      const warnings = validateFieldIntegrity('guncelBorc', -100, {})
      expect(warnings).toHaveLength(1)
      expect(warnings[0].message).toContain('negatif olamaz')
    })
    
    it('should generate warnings for empty muhatapTanimi', () => {
      const warnings = validateFieldIntegrity('muhatapTanimi', '', {})
      expect(warnings).toHaveLength(1)
      expect(warnings[0].message).toContain('boş')
    })
  })
  
  describe('categorizeErrors', () => {
    it('should categorize errors by type', () => {
      const errors = [
        { rowIndex: 1, errorType: 'TYPE_MISMATCH', message: 'Type error' },
        { rowIndex: 2, errorType: 'REQUIRED_FIELD', message: 'Required error' },
        { rowIndex: 3, errorType: 'TYPE_MISMATCH', message: 'Another type error' }
      ]
      
      const categorized = categorizeErrors(errors)
      expect(categorized.TYPE_MISMATCH).toHaveLength(2)
      expect(categorized.REQUIRED_FIELD).toHaveLength(1)
      expect(categorized.DATABASE_ERROR).toHaveLength(0)
    })
  })
  
  describe('generateErrorReport', () => {
    it('should generate summary report', () => {
      const errors = [
        { rowIndex: 1, errorType: 'TYPE_MISMATCH', message: 'Type error' },
        { rowIndex: 2, errorType: 'REQUIRED_FIELD', message: 'Required error' }
      ]
      
      const report = generateErrorReport(errors)
      expect(report).toContain('Veri Tipi Hataları: 1 hata')
      expect(report).toContain('Zorunlu Alan Hataları: 1 hata')
    })
    
    it('should return empty string for no errors', () => {
      const report = generateErrorReport([])
      expect(report).toBe('')
    })
  })
})

// Mock functions for testing (these would need to be exported from route.ts)
function parseTrNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') {
    return isNaN(val) ? undefined : val
  }
  if (typeof val !== 'string') return undefined
  
  try {
    // Türkçe sayı formatını temizle: "1.234,56" -> "1234.56"
    let cleaned = val.trim().replace(/\s/g, '') // Boşlukları kaldır
    
    // Eğer hem nokta hem virgül varsa, Türkçe format (1.234,56)
    if (cleaned.includes('.') && cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.')
    }
    // Sadece virgül varsa, ondalık ayırıcı (1234,56)
    else if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(/,/g, '.')
    }
    // Sadece nokta varsa, kontrol et: binlik mi ondalık mı?
    else if (cleaned.includes('.') && !cleaned.includes(',')) {
      const parts = cleaned.split('.')
      // Son kısım 2 haneli ise ondalık, değilse binlik ayırıcı
      if (parts.length === 2 && parts[1].length <= 2) {
        // Ondalık nokta, değiştirme
      } else {
        // Binlik ayırıcı, kaldır
        cleaned = cleaned.replace(/\./g, '')
      }
    }
    
    if (cleaned === '') return undefined
    
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  } catch (error) {
    return undefined
  }
}

function normalizeKey(key: string) {
  return key
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]+/g, '')
}

function validateAndConvertTypes(data: any): { isValid: boolean; errors: string[]; convertedData?: any } {
  const errors: string[] = []
  const convertedData: any = {}
  
  if (!data.durumTanitici || String(data.durumTanitici).trim() === '') {
    errors.push('durumTanitici alanı zorunludur ve boş olamaz')
  } else {
    convertedData.durumTanitici = String(data.durumTanitici).trim()
  }
  
  // String fields
  const stringFields = ['muhatapTanimi', 'il', 'ilce']
  stringFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const stringValue = String(data[field]).trim()
      convertedData[field] = stringValue !== '' ? stringValue : undefined
    }
  })
  
  // Numeric fields
  const numericFields = ['guncelBorc', 'asilAlacak']
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const numValue = parseTrNumber(data[field])
      if (numValue !== undefined && numValue < 0) {
        errors.push(`${field} alanı negatif olamaz`)
      }
      convertedData[field] = numValue
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    convertedData: errors.length === 0 ? convertedData : undefined
  }
}

function sanitizeText(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const text = String(value).trim()
  if (text === '') return undefined
  
  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return cleaned !== '' ? cleaned : undefined
}

function sanitizePhoneNumber(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const phone = String(value).trim()
  if (phone === '') return undefined
  
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length === 10 && digitsOnly.startsWith('5')) {
    return digitsOnly // 5xxxxxxxxx
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('05')) {
    return digitsOnly.substring(1) // 05xxxxxxxxx -> 5xxxxxxxxx
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('905')) {
    return digitsOnly.substring(2) // 905xxxxxxxxx -> 5xxxxxxxxx
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('905')) {
    return digitsOnly.substring(2) // +905xxxxxxxxx -> 5xxxxxxxxx
  } else if (digitsOnly.length >= 7) {
    return digitsOnly // Diğer formatlar için ham veriyi döndür
  }
  
  return undefined
}

function validateTCKN(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const tckn = String(value).trim().replace(/\D/g, '')
  if (tckn.length !== 11) return undefined
  
  if (tckn === '00000000000' || tckn[0] === '0') return undefined
  
  return tckn
}

function sanitizeDate(value: any): string | undefined {
  if (value === undefined || value === null) return undefined
  
  const dateStr = String(value).trim()
  if (dateStr === '') return undefined
  
  if (/^\d{5}$/.test(dateStr)) {
    try {
      const excelDate = new Date((parseInt(dateStr) - 25569) * 86400 * 1000)
      return excelDate.toISOString().split('T')[0]
    } catch {
      return dateStr
    }
  }
  
  return dateStr
}

function validateFieldIntegrity(fieldName: string, value: any, rowData: any): any[] {
  const warnings: any[] = []
  
  switch (fieldName) {
    case 'tcKimlikNo':
    case 'ilgiliTCKN':
      if (value && !validateTCKN(value)) {
        warnings.push({
          rowIndex: -1,
          field: fieldName,
          message: `${fieldName} geçersiz format (11 haneli olmalı)`
        })
      }
      break
      
    case 'telefon':
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

function categorizeErrors(errors: any[]): any {
  const categorized: any = {
    TYPE_MISMATCH: [],
    REQUIRED_FIELD: [],
    DATABASE_ERROR: [],
    VALIDATION_ERROR: [],
    PROCESSING_ERROR: []
  }
  
  errors.forEach(error => {
    categorized[error.errorType].push(error)
  })
  
  return categorized
}

function generateErrorReport(errors: any[]): string {
  if (errors.length === 0) return ''
  
  const categorized = categorizeErrors(errors)
  const report: string[] = []
  
  Object.entries(categorized).forEach(([type, typeErrors]: [string, any]) => {
    if (typeErrors.length > 0) {
      let categoryName = ''
      switch (type) {
        case 'TYPE_MISMATCH':
          categoryName = 'Veri Tipi Hataları'
          break
        case 'REQUIRED_FIELD':
          categoryName = 'Zorunlu Alan Hataları'
          break
        case 'DATABASE_ERROR':
          categoryName = 'Veritabanı Hataları'
          break
        case 'VALIDATION_ERROR':
          categoryName = 'Doğrulama Hataları'
          break
        case 'PROCESSING_ERROR':
          categoryName = 'İşlem Hataları'
          break
      }
      
      report.push(`${categoryName}: ${typeErrors.length} hata`)
    }
  })
  
  return report.join(', ')
}