import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const searchSchema = z.object({
  isim: z.string().optional(),
  durumTanitici: z.string().optional(),
  sozlesmeHesabi: z.string().optional(),
  minBorcMiktari: z.string().optional(),
  maxBorcMiktari: z.string().optional(),
  durum: z.string().optional(),
  telefon: z.string().optional(),
  tcKimlik: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      isim: searchParams.get('isim') || undefined,
      durumTanitici: searchParams.get('durumTanitici') || undefined,
      sozlesmeHesabi: searchParams.get('sozlesmeHesabi') || undefined,
      minBorcMiktari: searchParams.get('minBorcMiktari') || undefined,
      maxBorcMiktari: searchParams.get('maxBorcMiktari') || undefined,
      durum: searchParams.get('durum') || undefined,
      telefon: searchParams.get('telefon') || undefined,
      tcKimlik: searchParams.get('tcKimlik') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    };

    const validatedParams = searchSchema.parse(params);
    
    const where: Prisma.BorcluBilgileriWhereInput = {};
    
    if (validatedParams.isim) {
      where.OR = [
        { isim: { contains: validatedParams.isim } },
        { ad: { contains: validatedParams.isim } },
        { soyad: { contains: validatedParams.isim } },
        { muhatapTanimi: { contains: validatedParams.isim } },
        { muhatapTanimiEk: { contains: validatedParams.isim } },
        { durumTanimi: { contains: validatedParams.isim } },
      ];
    }
    
    if (validatedParams.durumTanitici) {
      where.OR = where.OR || [];
      where.OR.push(
        { durumTanitici: { contains: validatedParams.durumTanitici } },
        { icraDosyaNumarasi: { contains: validatedParams.durumTanitici } },
        { sozlesmeHesabi: { contains: validatedParams.durumTanitici } }
      );
    }
    
    if (validatedParams.sozlesmeHesabi) {
      where.sozlesmeHesabi = { contains: validatedParams.sozlesmeHesabi };
    }
    
    if (validatedParams.minBorcMiktari || validatedParams.maxBorcMiktari) {
      where.OR = where.OR || [];
      const borcConditions = [];
      
      // guncelBorc alanında arama
      if (validatedParams.minBorcMiktari && validatedParams.maxBorcMiktari) {
        borcConditions.push({
          guncelBorc: {
            gte: Number(validatedParams.minBorcMiktari),
            lte: Number(validatedParams.maxBorcMiktari)
          }
        });
        borcConditions.push({
          toplamAcikTutar: {
            gte: Number(validatedParams.minBorcMiktari),
            lte: Number(validatedParams.maxBorcMiktari)
          }
        });
      } else if (validatedParams.minBorcMiktari) {
        borcConditions.push({ guncelBorc: { gte: Number(validatedParams.minBorcMiktari) } });
        borcConditions.push({ toplamAcikTutar: { gte: Number(validatedParams.minBorcMiktari) } });
      } else if (validatedParams.maxBorcMiktari) {
        borcConditions.push({ guncelBorc: { lte: Number(validatedParams.maxBorcMiktari) } });
        borcConditions.push({ toplamAcikTutar: { lte: Number(validatedParams.maxBorcMiktari) } });
      }
      
      where.OR.push(...borcConditions);
    }

    if (validatedParams.durum && validatedParams.durum !== 'ALL') {
      where.durum = validatedParams.durum;
    }

    if (validatedParams.telefon) {
      where.OR = where.OR || [];
      where.OR.push(
        { telefon: { contains: validatedParams.telefon } },
        { telefonTesisat: { contains: validatedParams.telefon } }
      );
    }

    if (validatedParams.tcKimlik) {
      where.OR = where.OR || [];
      where.OR.push(
        { tcKimlikNo: { contains: validatedParams.tcKimlik } },
        { ilgiliTCKN: { contains: validatedParams.tcKimlik } }
      );
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
          _count: {
            select: {
              odemeSozleri: {
                where: {
                  durum: 'Aktif'
                }
              }
            }
          }
        }
      }),
      prisma.borcluBilgileri.count({ where })
    ])

    // Ödeme sözü bilgisini ekle
    const borclularWithPaymentPromise = borclular.map(borclu => ({
      ...borclu,
      hasActivePaymentPromise: borclu._count.odemeSozleri > 0
    }))

    return NextResponse.json({
      data: borclularWithPaymentPromise,
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