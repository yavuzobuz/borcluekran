const XLSX = require('xlsx');

// Test verisi oluştur
const testData = [
  {
    'Durum tanıtıcısı': 'TEST004',
    'Güncel Borç': 5000.00,
    'Telefon': '05551111111',
    'Adres Bilgileri': 'Test Adres 4',
    'İlgili TCKN': '12345678904',
    'Avukat Atama Tarihi': '2024-04-15',
    'Muhatap Tanımı': 'Muhatap 4',
    'İl': 'Bursa',
    'İlçe': 'Nilüfer',
    'TC Kimlik No': '12345678904'
  },
  {
    'Durum tanıtıcısı': 'TEST005',
    'Güncel Borç': 7500.25,
    'Telefon': '05552222222',
    'Adres Bilgileri': 'Test Adres 5',
    'İlgili TCKN': '12345678905',
    'Avukat Atama Tarihi': '2024-05-20',
    'Muhatap Tanımı': 'Muhatap 5',
    'İl': 'Antalya',
    'İlçe': 'Muratpaşa',
    'TC Kimlik No': '12345678905'
  }
];

// Worksheet oluştur
const worksheet = XLSX.utils.json_to_sheet(testData);

// Workbook oluştur
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Data');

// Excel dosyasını kaydet
XLSX.writeFile(workbook, 'test-excel-upload.xlsx');

console.log('Test Excel dosyası oluşturuldu: test-excel-upload.xlsx');