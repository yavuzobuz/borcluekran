const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.borcluBilgileri.count()
    console.log(`Veritabanında ${count} adet borçlu kaydı bulunuyor.`)
    
    if (count > 0) {
      const records = await prisma.borcluBilgileri.findMany({
        take: 5
      })
      console.log('İlk 5 kayıt:')
      console.log(records)
    }
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()