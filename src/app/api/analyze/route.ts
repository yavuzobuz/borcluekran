import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const analyzeSchema = z.object({
  durumTaniticiList: z.array(z.string()).min(1, 'En az bir durum tanıtıcı gerekli'),
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı yapılandırılmamış' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { durumTaniticiList } = analyzeSchema.parse(body)

    // Borçluları getir
    const borclular = await prisma.borcluBilgileri.findMany({
      where: {
        durumTanitici: {
          in: durumTaniticiList
        }
      },
      include: {
        odemeSozleri: {
          orderBy: {
            sozTarihi: 'desc'
          }
        }
      }
    })

    if (borclular.length === 0) {
      return NextResponse.json(
        { error: 'Belirtilen durum tanıtıcılarına ait borçlu bulunamadı' },
        { status: 404 }
      )
    }

    // Gemini AI ile analiz
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Aşağıdaki borçlu bilgilerini analiz et ve her biri için ayrı ayrı değerlendirme yap:

${borclular.map((borclu, index) => `
${index + 1}. Borçlu:
- Durum Tanıtıcı: ${borclu.durumTanitici}
- İsim: ${borclu.isim || 'Belirtilmemiş'}
- Borç Tutarı: ${borclu.borcTutari || 0} TL
- Telefon: ${borclu.telefon || 'Belirtilmemiş'}
- Adres: ${borclu.adres || 'Belirtilmemiş'}
- Notlar: ${borclu.notlar || 'Yok'}
- Kayıt Tarihi: ${borclu.kayitTarihi.toLocaleDateString('tr-TR')}
- Ödeme Sözleri: ${borclu.odemeSozleri.length > 0 ? 
  borclu.odemeSozleri.map(soz => 
    `\n  * ${soz.sozTarihi.toLocaleDateString('tr-TR')} - ${soz.sozTutari} TL - ${soz.aciklama || 'Açıklama yok'}`
  ).join('') : 'Ödeme sözü yok'
}
`).join('\n')}

Her borçlu için şunları değerlendir:
1. Risk Seviyesi (Düşük/Orta/Yüksek) ve gerekçesi
2. Önerilen Ödeme Planı
3. Alınabilecek Önlemler
4. Borçluya Gönderilecek Bilgilendirme Mesajı

Cevabını JSON formatında ver:
{
  "analizler": [
    {
      "durumTanitici": "DT123",
      "riskSeviyesi": "Yüksek",
      "riskGerekce": "...",
      "odemeePlani": "...",
      "alinabilecekOnlemler": "...",
      "bilgilendirmeMesaji": "..."
    }
  ]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      // JSON yanıtını parse et
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('JSON formatında yanıt bulunamadı')
      }

      const analysisResult = JSON.parse(jsonMatch[0])
      
      return NextResponse.json({
        success: true,
        data: analysisResult,
        borclular: borclular
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'AI yanıtı işlenirken hata oluştu',
        rawResponse: text
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Analiz error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Analiz sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}