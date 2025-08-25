import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // WhatsApp send-message endpoint'ine GET isteği gönder
    const response = await fetch('http://localhost:3000/api/whatsapp/send-message', {
      method: 'GET'
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('WhatsApp durum kontrolü hatası:', error)
    return NextResponse.json(
      { 
        success: false,
        isReady: false, 
        message: 'WhatsApp durumu kontrol edilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}