import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ödeme sözü ekleme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { borcluId, durumTanitici, tarih, aciklama, odemeMiktari } = body

    if (!tarih || !aciklama) {
      return NextResponse.json(
        { error: 'Tarih ve açıklama zorunludur' },
        { status: 400 }
      )
    }

    let borclu
    
    // Borçluyu borcluId veya durumTanitici ile bul
    if (borcluId) {
      borclu = await prisma.borcluBilgileri.findUnique({
        where: { id: parseInt(borcluId) }
      })
    } else if (durumTanitici) {
      borclu = await prisma.borcluBilgileri.findUnique({
        where: { durumTanitici: durumTanitici }
      })
    } else {
      return NextResponse.json(
        { error: 'Borçlu ID veya durum tanıtıcı gerekli' },
        { status: 400 }
      )
    }

    if (!borclu) {
      return NextResponse.json(
        { error: 'Borçlu bulunamadı' },
        { status: 404 }
      )
    }

    const odemeSozu = await prisma.odemeSozu.create({
      data: {
        borcluId: borclu.id,
        tarih: new Date(tarih),
        aciklama,
        odemeMiktari: odemeMiktari ? parseFloat(odemeMiktari) : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ödeme sözü başarıyla eklendi',
      data: odemeSozu
    })

  } catch (error) {
    console.error('Ödeme sözü ekleme hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme sözü eklenirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Ödeme sözlerini listeleme
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const borcluId = searchParams.get('borcluId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    let whereClause: any = {}
    if (borcluId) {
      whereClause.borcluId = parseInt(borcluId)
    }

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      whereClause.tarih = {}
      if (startDate) {
        whereClause.tarih.gte = new Date(startDate)
      }
      if (endDate) {
        // Bitiş tarihine günün sonunu ekle
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        whereClause.tarih.lte = endDateTime
      }
    }

    const odemeSozleri = await prisma.odemeSozu.findMany({
      where: whereClause,
      include: {
        borclu: {
          select: {
            id: true,
            durumTanitici: true,
            muhatapTanimi: true,
            ad: true,
            soyad: true
          }
        }
      },
      orderBy: {
        tarih: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: odemeSozleri,
      count: odemeSozleri.length
    })

  } catch (error) {
    console.error('Ödeme sözleri listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme sözleri listelenirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}