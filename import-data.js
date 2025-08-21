const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const csv = require('csv-parser')

const prisma = new PrismaClient()

async function importData() {
  try {
    console.log('CSV verilerini okuyorum...')
    
    const results = []
    
    // CSV dosyasını oku
    await new Promise((resolve, reject) => {
      fs.createReadStream('test-data.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject)
    })
    
    console.log(`${results.length} adet kayıt bulundu.`)
    
    // Her kaydı veritabanına ekle
    for (const record of results) {
      try {
        await prisma.borcluBilgileri.upsert({
          where: {
            durumTanitici: record['Durum tanıtıcısı']
          },
          update: {
            ilgiliTCKN: record['İlgili TCKN'] || null,
            avukatAtamaTarihi: record['Avukat Atama Tarihi'] || null,
            muhatapTanimi: record['Muhatap Tanımı'] || null,
            guncelBorc: parseFloat(record['Güncel Borç']) || null,
            telefon: record['Telefon'] || null,
            adresBilgileri: record['Adres Bilgileri'] || null,
            il: record['İl'] || null,
            ilce: record['İlçe'] || null,
            tcKimlikNo: record['TC Kimlik No'] || null
          },
          create: {
            durumTanitici: record['Durum tanıtıcısı'],
            ilgiliTCKN: record['İlgili TCKN'] || null,
            avukatAtamaTarihi: record['Avukat Atama Tarihi'] || null,
            muhatapTanimi: record['Muhatap Tanımı'] || null,
            guncelBorc: parseFloat(record['Güncel Borç']) || null,
            telefon: record['Telefon'] || null,
            adresBilgileri: record['Adres Bilgileri'] || null,
            il: record['İl'] || null,
            ilce: record['İlçe'] || null,
            tcKimlikNo: record['TC Kimlik No'] || null
          }
        })
        console.log(`Kayıt işlendi: ${record['Durum tanıtıcısı']}`)
      } catch (error) {
        console.error(`Kayıt işlenirken hata: ${record['Durum tanıtıcısı']}`, error.message)
      }
    }
    
    // Toplam kayıt sayısını kontrol et
    const totalCount = await prisma.borcluBilgileri.count()
    console.log(`Veri import işlemi tamamlandı.`)
    console.log(`Veritabanında toplam ${totalCount} adet kayıt bulunuyor.`)
    
  } catch (error) {
    console.error('Import hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()