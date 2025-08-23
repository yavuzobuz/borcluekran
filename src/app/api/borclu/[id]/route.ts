import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    
    // Önce ID olarak dene
    const numericId = parseInt(idParam)
    let borclu = null
    
    if (!isNaN(numericId)) {
      borclu = await prisma.borcluBilgileri.findUnique({
        where: {
          id: numericId
        }
      })
    }
    
    // ID ile bulunamadıysa durumTanitici ile dene
    if (!borclu) {
      borclu = await prisma.borcluBilgileri.findFirst({
        where: {
          durumTanitici: idParam
        }
      })
    }

    if (!borclu) {
      return NextResponse.json(
        { error: 'Borçlu bulunamadı' },
        { status: 404 }
      )
    }

    // Ödeme sözü bilgisini de al
    const odemeSozleri = await prisma.odemeSozu.findMany({
      where: {
        borcluId: borclu.id,
        durum: 'Aktif'
      },
      orderBy: {
        tarih: 'desc'
      }
    })

    return NextResponse.json({
      ...borclu,
      odemeSozleri,
      hasActivePaymentPromise: odemeSozleri.length > 0
    })
  } catch (error) {
    console.error('Borçlu detayı getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}