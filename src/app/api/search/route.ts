import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchSchema = z.object({
  isim: z.string().optional(),
  durumTanitici: z.string().optional(),
  minBorcMiktari: z.string().optional(),
  maxBorcMiktari: z.string().optional(),
  durum: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      isim: searchParams.get('isim') || undefined,
      durumTanitici: searchParams.get('durumTanitici') || undefined,
      minBorcMiktari: searchParams.get('minBorcMiktari') || undefined,
      maxBorcMiktari: searchParams.get('maxBorcMiktari') || undefined,
      durum: searchParams.get('durum') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    };

    const validatedParams = searchSchema.parse(params);
    
    const where: any = {};
    
    if (validatedParams.isim) {
      where.OR = [
        { isim: { contains: validatedParams.isim, mode: 'insensitive' } },
        { ad: { contains: validatedParams.isim, mode: 'insensitive' } },
        { soyad: { contains: validatedParams.isim, mode: 'insensitive' } },
        { muhatapTanimi: { contains: validatedParams.isim, mode: 'insensitive' } },
      ];
    }
    
    if (validatedParams.durumTanitici) {
      where.durumTanitici = {
        contains: validatedParams.durumTanitici,
        mode: 'insensitive',
      };
    }
    
    if (validatedParams.minBorcMiktari || validatedParams.maxBorcMiktari) {
      where.borcMiktari = {};
      if (validatedParams.minBorcMiktari) {
        where.borcMiktari.gte = Number(validatedParams.minBorcMiktari);
      }
      if (validatedParams.maxBorcMiktari) {
        where.borcMiktari.lte = Number(validatedParams.maxBorcMiktari);
      }
    }

    if (validatedParams.durum && validatedParams.durum !== 'ALL') {
      where.durum = validatedParams.durum;
    }

    const skip = (validatedParams.page - 1) * validatedParams.limit
    
    const [borclular, total] = await Promise.all([
      prisma.borcluBilgileri.findMany({
        where,
        skip,
        take: validatedParams.limit,
        orderBy: {
          kayitTarihi: 'desc'
        }
      }),
      prisma.borcluBilgileri.count({ where })
    ])

    return NextResponse.json({
      data: borclular,
      total,
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