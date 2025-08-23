import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Önce mevcut kayıt sayısını al
    const totalCount = await prisma.borcluBilgileri.count()
    
    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'Veritabanı zaten boş',
        deletedCount: 0
      })
    }

    // Tüm kayıtları sil
    const deleteResult = await prisma.borcluBilgileri.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} kayıt başarıyla silindi`,
      deletedCount: deleteResult.count,
      previousCount: totalCount
    })

  } catch (error) {
    console.error('Veritabanı temizleme hatası:', error)
    return NextResponse.json(
      { error: 'Veritabanı temizlenirken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Kayıt sayısını almak için GET endpoint'i
export async function GET(request: NextRequest) {
  try {
    const totalCount = await prisma.borcluBilgileri.count()
    
    return NextResponse.json({
      totalRecords: totalCount
    })

  } catch (error) {
    console.error('Kayıt sayısı alma hatası:', error)
    return NextResponse.json(
      { error: 'Kayıt sayısı alınırken hata oluştu' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}