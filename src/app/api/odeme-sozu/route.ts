import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const odemeSozuSchema = z.object({
  durumTanitici: z.string().min(1, 'Durum tanıtıcı gerekli'),
  sozTarihi: z.string().transform((str) => new Date(str)),
  sozTutari: z.number().positive('Söz tutarı pozitif olmalı'),
  aciklama: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = odemeSozuSchema.parse(body)

    // Borçlunun var olup olmadığını kontrol et
    const borclu = await prisma.borcluBilgileri.findUnique({
      where: {
        durumTanitici: validatedData.durumTanitici
      }
    })

    if (!borclu) {
      return NextResponse.json(
        { error: 'Borçlu bulunamadı' },
        { status: 404 }
      )
    }

    // Ödeme sözü ekle
    const odemeSozu = await prisma.odemeSozu.create({
      data: {
        durumTanitici: validatedData.durumTanitici,
        sozTarihi: validatedData.sozTarihi,
        sozTutari: validatedData.sozTutari,
        aciklama: validatedData.aciklama,
      }
    })

    return NextResponse.json(odemeSozu, { status: 201 })
  } catch (error) {
    console.error('Ödeme sözü ekleme error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ödeme sözü eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const durumTanitici = searchParams.get('durumTanitici')

    if (!durumTanitici) {
      return NextResponse.json(
        { error: 'Durum tanıtıcı gerekli' },
        { status: 400 }
      )
    }

    const odemeSozleri = await prisma.odemeSozu.findMany({
      where: {
        durumTanitici: durumTanitici
      },
      orderBy: {
        sozTarihi: 'desc'
      }
    })

    return NextResponse.json(odemeSozleri)
  } catch (error) {
    console.error('Ödeme sözleri getirme error:', error)
    return NextResponse.json(
      { error: 'Ödeme sözleri getirilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}