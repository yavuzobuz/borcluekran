import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Bugünün tarihini al
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Bugün için ödeme sözü verilmiş dosyaları getir
    const todaysPaymentPromises = await prisma.odemeSozu.findMany({
      where: {
        tarih: {
          gte: startOfDay,
          lt: endOfDay
        },
        durum: 'Aktif' // Sadece aktif ödeme sözlerini getir
      },
      include: {
        borclu: {
          select: {
            id: true,
            durumTanitici: true,
            muhatapTanimi: true,
            muhatapTanimiEk: true,
            ad: true,
            soyad: true,
            guncelBorc: true,
            odemeDurumu: true,
            il: true,
            telefon: true,
            borcluTipiTanimi: true,
            ilgiliTCKN: true
          }
        }
      },
      orderBy: {
        tarih: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: todaysPaymentPromises,
      count: todaysPaymentPromises.length,
      date: today.toLocaleDateString('tr-TR')
    })
  } catch (error) {
    console.error('Todays payment promises API error:', error)
    return NextResponse.json(
      { error: 'Günün ödeme sözleri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}