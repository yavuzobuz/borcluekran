import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Toplam borçlu sayısı
    const totalDebtors = await prisma.borcluBilgileri.count()
    
    // Toplam borç miktarı
    const totalDebtResult = await prisma.borcluBilgileri.aggregate({
      _sum: {
        guncelBorc: true
      }
    })
    
    // Aktif durumlar (Derdest, İcra Takibi vs.)
    const activeDebtors = await prisma.borcluBilgileri.count({
      where: {
        OR: [
          { durumTanimi: { contains: 'Derdest' } },
          { durumTanimi: { contains: 'İcra Takibi' } },
          { durumTanimi: { contains: 'Takip' } },
          { durumTuruTanimi: { contains: 'İcra Takibi' } }
        ]
      }
    })
    
    // Ödenen/Kapatılan durumlar
    const paidDebtors = await prisma.borcluBilgileri.count({
      where: {
        OR: [
          { durumTanimi: { contains: 'Ödendi' } },
          { durumTanimi: { contains: 'Kapandı' } },
          { durumTanimi: { contains: 'Tahsil' } },
          { durumTanimi: { contains: 'Hitam' } }
        ]
      }
    })
    

    
    return NextResponse.json({
      totalDebtors,
      totalDebt: totalDebtResult._sum.guncelBorc || 0,
      activeDebtors,
      paidDebtors,
      // Eski alanlar (geriye uyumluluk için)
      thisMonthPromises: activeDebtors,
      overduePromises: 0
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}