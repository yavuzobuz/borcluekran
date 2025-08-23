import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Örnek borçlu verileri
  const debtors = [
    {
      ilgiliTCKN: '16112424528',
      durumTanitici: '21138656',
      muhatapTanimi: 'Ahmet YILMAZ',
      guncelBorc: 208.2,
      il: 'İSTANBUL',
      telefon: '5318290267',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '46084847810',
      durumTanitici: '21138689',
      muhatapTanimi: 'Mehmet KAYA',
      guncelBorc: 1500.75,
      il: 'İSTANBUL',
      telefon: '5353471261',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '30956369494',
      durumTanitici: '21138631',
      muhatapTanimi: 'Fatma DEMİR',
      guncelBorc: 850.0,
      il: 'İSTANBUL',
      telefon: '5424313461',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      durumTanitici: '21138590',
      muhatapTanimi: 'Ali ÖZKAN',
      guncelBorc: 95.0,
      il: 'İSTANBUL',
      telefon: '5072612043',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      durumTanitici: '21138779',
      muhatapTanimi: 'Ayşe ÇELIK',
      guncelBorc: 2300.50,
      il: 'İSTANBUL',
      telefon: '05456677030',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '12345678901',
      durumTanitici: '21138800',
      muhatapTanimi: 'Hasan YILDIZ',
      guncelBorc: 750.25,
      il: 'ANKARA',
      telefon: '5321234567',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '23456789012',
      durumTanitici: '21138801',
      muhatapTanimi: 'Zeynep ARSLAN',
      guncelBorc: 1200.00,
      il: 'İZMİR',
      telefon: '5339876543',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '34567890123',
      durumTanitici: '21138802',
      muhatapTanimi: 'Mustafa KOÇAK',
      guncelBorc: 3500.75,
      il: 'BURSA',
      telefon: '5445556677',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '45678901234',
      durumTanitici: '21138803',
      muhatapTanimi: 'Elif ŞAHIN',
      guncelBorc: 890.50,
      il: 'ANTALYA',
      telefon: '5551112233',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '56789012345',
      durumTanitici: '21138804',
      muhatapTanimi: 'Oğuz KARA',
      guncelBorc: 1750.00,
      il: 'ADANA',
      telefon: '5662223344',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '67890123456',
      durumTanitici: '21138805',
      muhatapTanimi: 'Selin DOĞAN',
      guncelBorc: 425.75,
      il: 'GAZİANTEP',
      telefon: '5773334455',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '78901234567',
      durumTanitici: '21138806',
      muhatapTanimi: 'Emre YILMAZ',
      guncelBorc: 2100.25,
      il: 'KONYA',
      telefon: '5884445566',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '89012345678',
      durumTanitici: '21138807',
      muhatapTanimi: 'Deniz ÖZTÜRK',
      guncelBorc: 675.00,
      il: 'TRABZON',
      telefon: '5995556677',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '90123456789',
      durumTanitici: '21138808',
      muhatapTanimi: 'Canan AKIN',
      guncelBorc: 1825.50,
      il: 'ESKİŞEHİR',
      telefon: '5006667788',
      borcluTipiTanimi: 'Gerçek Kişi'
    },
    {
      ilgiliTCKN: '01234567890',
      durumTanitici: '21138809',
      muhatapTanimi: 'Burak GÜNEŞ',
      guncelBorc: 950.75,
      il: 'SAMSUN',
      telefon: '5117778899',
      borcluTipiTanimi: 'Gerçek Kişi'
    }
  ]

  console.log('Veritabanına örnek veriler ekleniyor...')

  for (const debtor of debtors) {
    await prisma.borcluBilgileri.create({
      data: debtor
    })
  }

  console.log('Örnek veriler başarıyla eklendi!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })