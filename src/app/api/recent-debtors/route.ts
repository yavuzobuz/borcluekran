import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Bugünün tarihini al
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Önce bugün eklenen borçluları getir
    const todayDebtors = await prisma.borcluBilgileri.findMany({
      where: {
        kayitTarihi: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: {
        kayitTarihi: 'desc'
      },
      take: 5,
      select: {
        id: true,
        ilgiliTCKN: true,
        durumTanitici: true,
        muhatapTanimi: true,
        muhatapTanimiEk: true,
        durumTanimi: true,
        sozlesmeHesabi: true,
        tcKimlikNo: true,
        ad: true,
        soyad: true,
        guncelBorc: true,
        odemeDurumu: true,
        il: true,
        telefon: true,
        icraDosyaNumarasi: true,
        borcluTipiTanimi: true,
        kayitTarihi: true,
        odemeSozleri: {
          select: {
            id: true
          }
        }
      }
    })

    // Eğer bugün eklenen borçlu sayısı 5'ten azsa, genel son borçlularla tamamla
    let recentDebtors = todayDebtors
    if (todayDebtors.length < 5) {
      const additionalDebtors = await prisma.borcluBilgileri.findMany({
        where: {
          kayitTarihi: {
            lt: startOfDay
          }
        },
        orderBy: {
          kayitTarihi: 'desc'
        },
        take: 5 - todayDebtors.length,
        select: {
          id: true,
          ilgiliTCKN: true,
          durumTanitici: true,
          muhatapTanimi: true,
          muhatapTanimiEk: true,
          durumTanimi: true,
          sozlesmeHesabi: true,
          tcKimlikNo: true,
          ad: true,
          soyad: true,
          guncelBorc: true,
          odemeDurumu: true,
          il: true,
          telefon: true,
          icraDosyaNumarasi: true,
          borcluTipiTanimi: true,
          kayitTarihi: true,
          odemeSozleri: {
             select: {
               id: true
             }
           }
        }
      })
      recentDebtors = [...todayDebtors, ...additionalDebtors]
    }
    
    // Ödeme sözü bilgisini ekle
    const recentDebtorsWithPaymentPromise = recentDebtors.map(borclu => ({
      ...borclu,
      hasActivePaymentPromise: borclu.odemeSozleri.length > 0
    }))
    
    return NextResponse.json({
      data: recentDebtorsWithPaymentPromise,
      todayCount: todayDebtors.length,
      totalCount: recentDebtors.length
    })
  } catch (error) {
    console.error('Recent debtors API error:', error)
    return NextResponse.json(
      { error: 'Son borçlular alınırken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}