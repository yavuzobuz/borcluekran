import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ durumTanitici: string }> }
) {
  try {
    const { durumTanitici } = await params

    if (!durumTanitici) {
      return NextResponse.json(
        { error: 'Durum tanıtıcı gerekli' },
        { status: 400 }
      )
    }

    // Önce borçluyu bul
    const borclu = await prisma.borcluBilgileri.findUnique({
      where: {
        durumTanitici: durumTanitici
      }
    })

    if (!borclu) {
      return NextResponse.json(
        { error: 'Borçlu bulunamadı' },
        { status: 404 }
      )
    }

    // Ödeme sözlerini getir
    const odemeSozleri = await prisma.odemeSozu.findMany({
      where: {
        borcluId: borclu.id
      },
      orderBy: {
        tarih: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      odeme_sozleri: odemeSozleri
    })

  } catch (error) {
    console.error('Ödeme sözleri getirme hatası:', error)
    return NextResponse.json(
      { error: 'Ödeme sözleri getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}