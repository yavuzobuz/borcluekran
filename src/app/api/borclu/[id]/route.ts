import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID formatı' },
        { status: 400 }
      )
    }

    const borclu = await prisma.borcluBilgileri.findUnique({
      where: {
        id: id
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
    console.error('Borçlu detayı getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}