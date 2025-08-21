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
        orderBy: {
          kayitTarihi: 'desc'
        }
      })

      // Excel formatına dönüştür
      const excelData = borclular.map(borclu => ({
        'Durum tanıtıcısı': borclu.durumTanitici,
        'İlgili TCKN': borclu.ilgiliTCKN || '',
        'Avukat Atama Tarihi': borclu.avukatAtamaTarihi || '',
        'Muhatap Tanımı': borclu.muhatapTanimi || '',
        'Güncel Borç': borclu.guncelBorc || 0,
        'Telefon': borclu.telefon || '',
        'Adres Bilgileri': borclu.adresBilgileri || '',
        'İl': borclu.il || '',
        'İlçe': borclu.ilce || '',
        'TC Kimlik No': borclu.tcKimlikNo || '',
        'Asıl Alacak': borclu.asilAlacak || 0,
        'Toplam Açık Tutar': borclu.toplamAcikTutar || 0,
        'Kayıt Tarihi': borclu.kayitTarihi.toLocaleDateString('tr-TR'),
        'Güncelleme Tarihi': borclu.guncellemeTarihi.toLocaleDateString('tr-TR')
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
        if (!rowData['Durum Tanıtıcı'] && !rowData['durum_tanitici'] && !rowData['Durum tanıtıcısı']) {
          errors.push(`Satır ${index + 2}: Durum tanıtıcı eksik`)
          errorCount++
          continue
        }

        const durumTanitici = rowData['Durum Tanıtıcı'] || rowData['durum_tanitici'] || rowData['Durum tanıtıcısı']
        const ilgiliTCKN = rowData['İlgili TCKN'] || rowData['ilgili_tckn'] || null
        
        // Excel tarih formatını string'e dönüştür
        let avukatAtamaTarihi = rowData['Avukat Atama Tarihi'] || rowData['avukat_atama_tarihi'] || null
        if (avukatAtamaTarihi && typeof avukatAtamaTarihi === 'number') {
          // Excel serial date'i JavaScript Date'e dönüştür
          const excelDate = new Date((avukatAtamaTarihi - 25569) * 86400 * 1000)
          avukatAtamaTarihi = excelDate.toISOString().split('T')[0] // YYYY-MM-DD formatı
        }
        const muhatapTanimi = rowData['Muhatap Tanımı'] || rowData['muhatap_tanimi'] || null
        const guncelBorc = parseFloat(rowData['Güncel Borç'] || rowData['guncel_borc'] || '0') || null
        const telefon = rowData['Telefon'] || rowData['telefon'] || null
        const adresBilgileri = rowData['Adres Bilgileri'] || rowData['adres_bilgileri'] || rowData['Adres'] || null
        const il = rowData['İl'] || rowData['il'] || null
        const ilce = rowData['İlçe'] || rowData['ilce'] || null
        const tcKimlikNo = rowData['TC Kimlik No'] || rowData['tc_kimlik_no'] || null
        const asilAlacak = parseFloat(rowData['Asıl Alacak'] || rowData['asil_alacak'] || '0') || null
        const toplamAcikTutar = parseFloat(rowData['Toplam Açık Tutar'] || rowData['toplam_acik_tutar'] || '0') || null

        // Upsert işlemi (varsa güncelle, yoksa ekle)
        await prisma.borcluBilgileri.upsert({
          where: {
            durumTanitici: durumTanitici.toString()
          },
          update: {
            ilgiliTCKN,
            avukatAtamaTarihi,
            muhatapTanimi,
            guncelBorc: guncelBorc || undefined,
            telefon,
            adresBilgileri,
            il,
            ilce,
            tcKimlikNo,
            asilAlacak,
            toplamAcikTutar
          },
          create: {
            durumTanitici: durumTanitici.toString(),
            ilgiliTCKN,
            avukatAtamaTarihi,
            muhatapTanimi,
            guncelBorc,
            telefon,
            adresBilgileri,
            il,
            ilce,
            tcKimlikNo,
            asilAlacak,
            toplamAcikTutar
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