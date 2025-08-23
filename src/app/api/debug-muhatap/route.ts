import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const showProblematic = searchParams.get('problematic') === 'true'

    let whereClause = {}
    
    if (showProblematic) {
      // Problemli kayıtları bul
      whereClause = {
        OR: [
          // Muhatap tanımı adres benzeri
          {
            muhatapTanimi: {
              contains: 'MAH'
            }
          },
          {
            muhatapTanimi: {
              contains: 'SOK'
            }
          },
          {
            muhatapTanimi: {
              contains: 'CAD'
            }
          },
          {
            muhatapTanimi: {
              contains: 'NO'
            }
          },
          {
            muhatapTanimi: {
              contains: 'APT'
            }
          },
          {
            muhatapTanimi: {
              contains: '/'
            }
          },
          // TC kimlik numarası benzeri
          {
            muhatapTanimi: {
              regex: '^\\d{11}$'
            }
          }
        ]
      }
    }

    const borclular = await prisma.borcluBilgileri.findMany({
      where: whereClause,
      select: {
        id: true,
        durumTanitici: true,
        muhatapTanimi: true,
        muhatapTanimiEk: true,
        ad: true,
        soyad: true,
        ilgiliTCKN: true,
        tcKimlikNo: true,
        il: true,
        telefon: true
      },
      take: limit,
      orderBy: {
        id: 'desc'
      }
    })

    // Her kayıt için problem analizi
    const analyzedRecords = borclular.map(borclu => {
      const problems: string[] = []
      
      // Muhatap tanımı problemleri
      if (borclu.muhatapTanimi) {
        const muhatap = borclu.muhatapTanimi.toUpperCase()
        
        if (muhatap.includes('MAH') || muhatap.includes('SOK') || muhatap.includes('CAD') || 
            muhatap.includes('NO') || muhatap.includes('APT') || muhatap.includes('BLOK')) {
          problems.push('Adres benzeri muhatap tanımı')
        }
        
        if (muhatap.includes('/')) {
          problems.push('Slash içeren muhatap tanımı')
        }
        
        if (/^\d{11}$/.test(borclu.muhatapTanimi.replace(/\s/g, ''))) {
          problems.push('TC kimlik numarası benzeri muhatap tanımı')
        }
        
        if (muhatap.length > 50) {
          problems.push('Çok uzun muhatap tanımı')
        }
        
        if (muhatap === 'BORÇLU' || muhatap === 'BORCLU') {
          problems.push('"Borçlu" kelimesi')
        }
      }
      
      // Muhatap tanımı ek problemleri
      if (borclu.muhatapTanimiEk) {
        const muhatapEk = borclu.muhatapTanimiEk.toUpperCase()
        
        if (muhatapEk.includes('MAH') || muhatapEk.includes('SOK') || muhatapEk.includes('CAD')) {
          problems.push('Adres benzeri muhatap tanımı ek')
        }
        
        if (muhatapEk.includes('BORÇLU') || muhatapEk.includes('BORCLU')) {
          problems.push('"Borçlu" kelimesi (ek)')
        }
      }

      return {
        ...borclu,
        problems,
        hasProblems: problems.length > 0
      }
    })

    const totalCount = await prisma.borcluBilgileri.count({ where: whereClause })
    const problematicCount = analyzedRecords.filter(r => r.hasProblems).length

    return NextResponse.json({
      records: analyzedRecords,
      totalCount,
      problematicCount,
      showingProblematic: showProblematic,
      limit
    })

  } catch (error) {
    console.error('Debug muhatap hatası:', error)
    return NextResponse.json(
      { error: 'Debug işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}