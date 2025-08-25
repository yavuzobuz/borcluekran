import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// Test Excel dosyaları oluşturmak için yardımcı fonksiyonlar

export function createValidTestExcel(): Buffer {
  const testData = [
    {
      'Durum tanıtıcısı': '20240001',
      'Muhatap tanımı': 'Ahmet Yılmaz',
      'İl': 'İSTANBUL',
      'İlçe': 'KADIKÖY',
      'TC kimlik no': '12345678901',
      'Telefon': '5551234567',
      'Güncel Borç': '1.500,75',
      'Asıl Alacak': '1.200,00',
      'Durum Tanımı': 'Aktif',
      'Borçlu Tipi Tanımı': 'Gerçek Kişi'
    },
    {
      'Durum tanıtıcısı': '20240002',
      'Muhatap tanımı': 'Fatma Kaya',
      'İl': 'ANKARA',
      'İlçe': 'ÇANKAYA',
      'TC kimlik no': '12345678902',
      'Telefon': '5559876543',
      'Güncel Borç': '2.750,50',
      'Asıl Alacak': '2.500,00',
      'Durum Tanımı': 'Aktif',
      'Borçlu Tipi Tanımı': 'Gerçek Kişi'
    },
    {
      'Durum tanıtıcısı': '20240003',
      'Muhatap tanımı': 'ABC Ticaret Ltd. Şti.',
      'İl': 'İZMİR',
      'İlçe': 'KONAK',
      'Vergi No': '1234567890',
      'Telefon': '5555555555',
      'Güncel Borç': '15.000,00',
      'Asıl Alacak': '12.000,00',
      'Durum Tanımı': 'Aktif',
      'Borçlu Tipi Tanımı': 'Tüzel Kişi'
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Borçlu Listesi')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function createInvalidTestExcel(): Buffer {
  const testData = [
    {
      'Durum tanıtıcısı': '', // Boş - hata
      'Muhatap tanımı': 'Test Müşteri 1',
      'Güncel Borç': 'geçersiz_sayı', // Geçersiz sayı - hata
      'TC kimlik no': '123' // Geçersiz TCKN - uyarı
    },
    {
      'Durum tanıtıcısı': '20240002',
      'Muhatap tanımı': '', // Boş muhatap - uyarı
      'Güncel Borç': '-500,00', // Negatif sayı - hata
      'Telefon': '123' // Geçersiz telefon - uyarı
    },
    {
      'Durum tanıtıcısı': '20240003',
      'Muhatap tanımı': 'Geçerli Müşteri',
      'Güncel Borç': '1.000,00', // Geçerli
      'TC kimlik no': '12345678901' // Geçerli
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hatalı Veri')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function createTurkishCharacterTestExcel(): Buffer {
  const testData = [
    {
      'Durum tanıtıcısı': '20240001',
      'Muhatap tanımı': 'Öğretmen Müdürü Şükrü Çağlar',
      'İl': 'İSTANBUL',
      'İlçe': 'ÜSKÜDAR',
      'Adres Bilgileri': 'Çamlıca Mah. Göztepe Sok. No:5 Üsküdar/İstanbul',
      'Güncel Borç': '1.234.567,89'
    },
    {
      'Durum tanıtıcısı': '20240002',
      'Muhatap tanımı': 'Güneş Enerji Sistemleri A.Ş.',
      'İl': 'İZMİR',
      'İlçe': 'BORNOVA',
      'Adres Bilgileri': 'Ege Üniversitesi Teknoloji Geliştirme Bölgesi',
      'Güncel Borç': '500.000,50'
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Türkçe Karakterler')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function createLargeTestExcel(rowCount: number = 1000): Buffer {
  const testData = Array.from({ length: rowCount }, (_, index) => ({
    'Durum tanıtıcısı': `${100000 + index}`,
    'Muhatap tanımı': `Test Müşteri ${index + 1}`,
    'İl': ['İSTANBUL', 'ANKARA', 'İZMİR', 'BURSA', 'ANTALYA'][index % 5],
    'İlçe': ['MERKEZ', 'ÇANKAYA', 'KONAK', 'NİLÜFER', 'MURATPAŞA'][index % 5],
    'TC kimlik no': `1234567890${index % 10}`,
    'Telefon': `555${String(index).padStart(7, '0')}`,
    'Güncel Borç': `${((index + 1) * 100).toLocaleString('tr-TR')},00`,
    'Asıl Alacak': `${((index + 1) * 80).toLocaleString('tr-TR')},00`,
    'Durum Tanımı': index % 3 === 0 ? 'Aktif' : 'Pasif',
    'Borçlu Tipi Tanımı': index % 4 === 0 ? 'Tüzel Kişi' : 'Gerçek Kişi'
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Büyük Veri')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function createDuplicateTestExcel(): Buffer {
  const testData = [
    {
      'Durum tanıtıcısı': '20240001',
      'Muhatap tanımı': 'İlk Kayıt',
      'Güncel Borç': '1.000,00'
    },
    {
      'Durum tanıtıcısı': '20240001', // Duplicate
      'Muhatap tanımı': 'Duplicate Kayıt',
      'Güncel Borç': '2.000,00'
    },
    {
      'Durum tanıtıcısı': '20240002',
      'Muhatap tanımı': 'Geçerli Kayıt',
      'Güncel Borç': '1.500,00'
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Duplicate Test')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function createMixedColumnNamesExcel(): Buffer {
  // Farklı sütun adı varyasyonları test et
  const testData = [
    {
      'durum_tanitici': '20240001', // Snake case
      'Muhatap Tanımı': 'Test 1', // Farklı büyük/küçük harf
      'il': 'İSTANBUL', // Küçük harf
      'GÜNCEL BORÇ': '1.000,00' // Büyük harf
    },
    {
      'Durum tanıtıcısı': '20240002', // Normal
      'muhatap tanimi': 'Test 2', // Türkçe karakter yok
      'İL': 'ANKARA', // Büyük harf
      'guncel_borc': '2.000,00' // Snake case
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(testData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mixed Columns')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

// Test dosyalarını fiziksel olarak oluştur
export function generateTestFiles() {
  const fixturesDir = path.join(__dirname, 'excel-files')
  
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true })
  }
  
  // Test dosyalarını oluştur
  fs.writeFileSync(path.join(fixturesDir, 'valid-test.xlsx'), createValidTestExcel())
  fs.writeFileSync(path.join(fixturesDir, 'invalid-test.xlsx'), createInvalidTestExcel())
  fs.writeFileSync(path.join(fixturesDir, 'turkish-test.xlsx'), createTurkishCharacterTestExcel())
  fs.writeFileSync(path.join(fixturesDir, 'large-test.xlsx'), createLargeTestExcel(100))
  fs.writeFileSync(path.join(fixturesDir, 'duplicate-test.xlsx'), createDuplicateTestExcel())
  fs.writeFileSync(path.join(fixturesDir, 'mixed-columns-test.xlsx'), createMixedColumnNamesExcel())
  
  console.log('Test Excel dosyaları oluşturuldu:', fixturesDir)
}

// Eğer bu dosya doğrudan çalıştırılırsa test dosyalarını oluştur
if (require.main === module) {
  generateTestFiles()
}