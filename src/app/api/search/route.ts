import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  name: z.string().optional(),
  durumTanitici: z.string().optional(),
  minBorc: z.number().optional(),
  maxBorc: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      name: searchParams.get('name') || undefined,
      durumTanitici: searchParams.get('durumTanitici') || undefined,
      minBorc: searchParams.get('minBorc') ? Number(searchParams.get('minBorc')) : undefined,
      maxBorc: searchParams.get('maxBorc') ? Number(searchParams.get('maxBorc')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    }

    const validatedParams = searchSchema.parse(params)
    
    const where: any = {}
    
    if (validatedParams.name) {
      where.isim = {
        contains: validatedParams.name,
        mode: 'insensitive'
      }
    }
    
    if (validatedParams.durumTanitici) {
      where.durumTanitici = {
        contains: validatedParams.durumTanitici
      }
    }
    
    if (validatedParams.minBorc || validatedParams.maxBorc) {
      where.borcTutari = {}
      if (validatedParams.minBorc) {
        where.borcTutari.gte = validatedParams.minBorc
      }
      if (validatedParams.maxBorc) {
        where.borcTutari.lte = validatedParams.maxBorc
      }
    }

    const skip = (validatedParams.page - 1) * validatedParams.limit
    
    const [borclular, total] = await Promise.all([
      prisma.borcluBilgileri.findMany({
        where,
        skip,
        take: validatedParams.limit,
        orderBy: {
          kayitTarihi: 'desc'
        },
        include: {
          odemeSozleri: {
            orderBy: {
              sozTarihi: 'desc'
            },
            take: 1
          }
        }
      }),
      prisma.borcluBilgileri.count({ where })
    ])

    return NextResponse.json({
      data: borclular,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}