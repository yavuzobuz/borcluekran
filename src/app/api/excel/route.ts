import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// Excel export endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'export') {
      // Tüm borçlu verilerini getir
      const borclular = await prisma.borcluBilgileri.findMany({
        include: {
          odemeSozleri: true
        },
        orderBy: {
          kayitTarihi: 'desc'
        }
      })

      // Excel formatına dönüştür
      const excelData = borclular.map(borclu => ({
        'Durum Tanıtıcı': borclu.durumTanitici,
        'İsim': borclu.isim || '',
        'Borç Tutarı': borclu.borcTutari || 0,
        'Telefon': borclu.telefon || '',
        'Adres': borclu.adres || '',
        'Notlar': borclu.notlar || '',
        'Kayıt Tarihi': borclu.kayitTarihi.toLocaleDateString('tr-TR'),
        'Güncelleme Tarihi': borclu.guncellemeTarihi.toLocaleDateString('tr-TR'),
        'Ödeme Sözü Sayısı': borclu.odemeSozleri.length,
        'Son Ödeme Sözü': borclu.odemeSozleri.length > 0 
          ? borclu.odemeSozleri[0].sozTarihi.toLocaleDateString('tr-TR')
          : 'Yok'
      }))

      // Excel dosyası oluştur
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Borçlu Listesi')

      // Buffer'a dönüştür
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      // Response headers
      const headers = new Headers()
      headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      headers.set('Content-Disposition', `attachment; filename="borclu-listesi-${new Date().toISOString().split('T')[0]}.xlsx"`)

      return new NextResponse(excelBuffer, { headers })
    }

    return NextResponse.json(
      { error: 'Geçersiz action parametresi' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json(
      { error: 'Excel dosyası oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Excel import endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      )
    }

    // Dosya tipini kontrol et
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Sadece Excel dosyaları (.xlsx, .xls) kabul edilir' },
        { status: 400 }
      )
    }

    // Dosyayı buffer'a dönüştür
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Excel dosyasını oku
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Her satırı işle
    for (const [index, row] of jsonData.entries()) {
      try {
        const rowData = row as any
        
        // Gerekli alanları kontrol et
        if (!rowData['Durum Tanıtıcı'] && !rowData['durum_tanitici']) {
          errors.push(`Satır ${index + 2}: Durum tanıtıcı eksik`)
          errorCount++
          continue
        }

        const durumTanitici = rowData['Durum Tanıtıcı'] || rowData['durum_tanitici'] || rowData['Durum tanıtıcısı']
        const isim = rowData['İsim'] || rowData['isim'] || null
        const borcTutari = parseFloat(rowData['Borç Tutarı'] || rowData['borc_tutari'] || rowData['Güncel Borç'] || rowData['guncel_borc'] || '0') || null
        const telefon = rowData['Telefon'] || rowData['telefon'] || null
        const adres = rowData['Adres'] || rowData['adres'] || null
        const notlar = rowData['Notlar'] || rowData['notlar'] || null

        // Upsert işlemi (varsa güncelle, yoksa ekle)
        await prisma.borcluBilgileri.upsert({
          where: {
            durumTanitici: durumTanitici.toString()
          },
          update: {
            isim,
            borcTutari,
            telefon,
            adres,
            notlar
          },
          create: {
            durumTanitici: durumTanitici.toString(),
            isim,
            borcTutari,
            telefon,
            adres,
            notlar
          }
        })

        successCount++
      } catch (rowError) {
        console.error(`Satır ${index + 2} işlenirken hata:`, rowError)
        errors.push(`Satır ${index + 2}: İşleme hatası`)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `İşlem tamamlandı. ${successCount} kayıt başarılı, ${errorCount} kayıt hatalı.`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // İlk 10 hatayı göster
    })

  } catch (error) {
    console.error('Excel import error:', error)
    return NextResponse.json(
      { error: 'Excel dosyası işlenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}