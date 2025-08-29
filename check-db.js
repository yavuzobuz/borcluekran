const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const count = await prisma.borcluBilgileri.count();
    console.log('Toplam kayıt sayısı:', count);
    
    if (count === 0) {
      console.log('Veritabanı boş, örnek veri ekleniyor...');
      await prisma.borcluBilgileri.create({
        data: {
          ilgiliTCKN: '16112424528',
          durumTanitici: '21138656',
          muhatapTanimi: 'Ahmet YILMAZ',
          guncelBorc: 208.2,
          il: 'İSTANBUL',
          telefon: '5318290267',
          borcluTipiTanimi: 'Gerçek Kişi'
        }
      });
      console.log('Örnek veri eklendi!');
    } else {
      const records = await prisma.borcluBilgileri.findMany();
      console.log('Mevcut kayıtlar:', records);
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();