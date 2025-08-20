import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { durumTanitici: string } }
) {
  try {
    const { durumTanitici } = params

    const borclu = await prisma.borcluBilgileri.findUnique({
      where: {
        durumTanitici: durumTanitici
      },
      include: {
        odemeSozleri: {
          orderBy: {
            sozTarihi: 'desc'
          }
        }
      }
    })

    if (!borclu) {
      return NextResponse.json(
        { error: 'Borçlu bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(borclu)
  } catch (error) {
    console.error('Borclu detay error:', error)
    return NextResponse.json(
      { error: 'Borçlu detayları getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}