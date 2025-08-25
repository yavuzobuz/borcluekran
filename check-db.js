const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.borcluBilgileri.count()
    console.log(`Veritabanında ${count} adet borçlu kaydı bulunuyor.`)
    
    if (count > 0) {
      // Son eklenen 5 kayıt
      const latestRecords = await prisma.borcluBilgileri.findMany({
        take: 5,
        orderBy: { id: 'desc' }
      })
      console.log('\nSon eklenen 5 kayıt:')
      latestRecords.forEach((record, i) => {
        console.log(`${i+1}. ${record.muhatapTanimi} - TCKN: ${record.ilgiliTCKN} - Borç: ${record.guncelBorc}`)
      })
      
      // YAVUZ ve GAYE'yi ara (daha geniş arama)
      const yavuzRecords = await prisma.borcluBilgileri.findMany({
        where: {
          OR: [
            { muhatapTanimi: { contains: 'YAVUZ' } },
            { ad: { contains: 'YAVUZ' } },
            { soyad: { contains: 'OBUZ' } },
            { ilgiliTCKN: '1020203040' }
          ]
        }
      })
      
      const gayeRecords = await prisma.borcluBilgileri.findMany({
        where: {
          OR: [
            { muhatapTanimi: { contains: 'GAYE' } },
            { ad: { contains: 'GAYE' } },
            { soyad: { contains: 'OBUZ' } },
            { ilgiliTCKN: '2051308360' }
          ]
        }
      })
      
      console.log(`\nYAVUZ OBUZ kayıtları: ${yavuzRecords.length} adet`)
      yavuzRecords.forEach(record => {
        console.log(`- ID: ${record.id}, TCKN: ${record.ilgiliTCKN}, Borç: ${record.guncelBorc}`)
      })
      
      console.log(`\nGAYE OBUZ kayıtları: ${gayeRecords.length} adet`)
      gayeRecords.forEach(record => {
        console.log(`- ID: ${record.id}, TCKN: ${record.ilgiliTCKN}, Borç: ${record.guncelBorc}`)
      })
      
      // Spesifik TCKN'leri ara
      const specificTCKN1 = await prisma.borcluBilgileri.findMany({
        where: { ilgiliTCKN: '1020203040' }
      })
      
      const specificTCKN2 = await prisma.borcluBilgileri.findMany({
        where: { ilgiliTCKN: '2051308360' }
      })
      
      console.log(`\nTCKN 1020203040 kayıtları: ${specificTCKN1.length} adet`)
      specificTCKN1.forEach(record => {
        console.log(`- ID: ${record.id}, Muhatap: ${record.muhatapTanimi}, Borç: ${record.guncelBorc}`)
      })
      
      console.log(`\nTCKN 2051308360 kayıtları: ${specificTCKN2.length} adet`)
      specificTCKN2.forEach(record => {
        console.log(`- ID: ${record.id}, Muhatap: ${record.muhatapTanimi}, Borç: ${record.guncelBorc}`)
      })
    }
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()