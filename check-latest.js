const { PrismaClient } = require('@prisma/client');

async function checkLatest() {
  const prisma = new PrismaClient();
  
  try {
    // Toplam kayıt sayısı
    const count = await prisma.borclu_bilgileri.count();
    console.log('Toplam kayıt sayısı:', count);
    
    // Son eklenen 5 kayıt
    const latest = await prisma.borclu_bilgileri.findMany({
      take: 5,
      orderBy: { id: 'desc' }
    });
    
    console.log('\nSon eklenen 5 kayıt:');
    latest.forEach((record, i) => {
      console.log(`${i+1}. ${record.muhatap_tanimi} - TCKN: ${record.ilgili_tckn} - Borç: ${record.guncel_borc}`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatest();