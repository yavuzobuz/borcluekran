'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PaymentPromise {
  id: number
  tarih: string
  aciklama: string
  odemeMiktari?: number
  durum: string
  borclu: {
    id: number
    durumTanitici: string
    muhatapTanimi?: string
    muhatapTanimiEk?: string
    ad?: string
    soyad?: string
    guncelBorc?: number
    odemeDurumu?: string
    il?: string
    telefon?: string
    borcluTipiTanimi?: string
    ilgiliTCKN?: string
  }
}

export function TodaysPaymentPromises() {
  const [paymentPromises, setPaymentPromises] = useState<PaymentPromise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const fetchTodaysPaymentPromises = async () => {
      try {
        const response = await fetch('/api/todays-payment-promises')
        if (response.ok) {
          const result = await response.json()
          setPaymentPromises(result.data || [])
          setCurrentDate(result.date || new Date().toLocaleDateString('tr-TR'))
        } else {
          console.error('Todays payment promises API error:', response.statusText)
          setPaymentPromises([])
        }
      } catch (error) {
        console.error('Todays payment promises fetch error:', error)
        setPaymentPromises([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodaysPaymentPromises()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDisplayName = (borclu: PaymentPromise['borclu']) => {
    // Muhatap tanımını temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimi = borclu.muhatapTanimi ? borclu.muhatapTanimi.trim() : ''
    if (cleanMuhatapTanimi.toLowerCase() === 'borçlu' || cleanMuhatapTanimi.toLowerCase() === 'borclu') {
      cleanMuhatapTanimi = ''
    }
    
    // Muhatap tanımı ek'i temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimiEk = borclu.muhatapTanimiEk ? borclu.muhatapTanimiEk.trim() : ''
    if (cleanMuhatapTanimiEk.toLowerCase() === 'borçlu' || cleanMuhatapTanimiEk.toLowerCase() === 'borclu') {
      cleanMuhatapTanimiEk = ''
    }
    
    // Muhatap tanımını parçalara ayır ve "/" ile ayrılmış kısımları kontrol et
    if (cleanMuhatapTanimi && cleanMuhatapTanimi.includes('/')) {
      const parts = cleanMuhatapTanimi.split('/')
      if (parts.length > 0 && parts[0].trim()) {
        cleanMuhatapTanimi = parts[0].trim()
      }
    }
    
    // Öncelik sırası: temizlenmiş muhatapTanimi > temizlenmiş muhatapTanimiEk > borcluTipiTanimi > durumTanitici
    return (
      (cleanMuhatapTanimi || undefined) ||
      (cleanMuhatapTanimiEk || undefined) ||
      (borclu.borcluTipiTanimi && !borclu.borcluTipiTanimi.toLowerCase().includes('borçlu') ? borclu.borcluTipiTanimi.trim() : undefined) ||
      borclu.durumTanitici || "İsimsiz Borçlu"
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'text-green-600 bg-green-100'
      case 'Beklemede':
        return 'text-yellow-600 bg-yellow-100'
      case 'Gecikmiş':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Bugünkü Ödeme Sözleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Bugünkü Ödeme Sözleri</span>
          </div>
          <div className="flex items-center space-x-2 text-base text-blue-700 font-medium">
            <Calendar className="w-5 h-5" />
            <span>{currentDate}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentPromises.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Bugün için ödeme sözü bulunmuyor</p>
            <p className="text-sm text-gray-400">Tarih: {currentDate}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentPromises.map((promise) => (
              <div
                key={promise.id}
                className="flex items-center justify-between p-5 border rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-blue-500 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {getDisplayName(promise.borclu)}
                      </h4>
                      <p className="text-base text-blue-700 font-semibold mb-1">
                        {promise.borclu.durumTanitici}
                      </p>
                      <p className="text-lg text-green-700 font-bold mb-1">
                        {formatCurrency(promise.borclu.guncelBorc || 0)}
                      </p>
                      {promise.borclu.telefon && (
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          Telefon: <span className="font-normal">{promise.borclu.telefon}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 font-medium">
                        {promise.aciklama}
                      </p>
                      {promise.odemeMiktari && (
                        <p className="text-sm text-green-700 font-semibold mt-2 bg-green-50 px-2 py-1 rounded">
                          Söz Verilen: {formatCurrency(promise.odemeMiktari)}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">
                          Saat: {formatTime(promise.tarih)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getStatusColor(promise.borclu.odemeDurumu || 'Bilinmiyor')
                    }`}
                  >
                    {promise.borclu.odemeDurumu || 'Bilinmiyor'}
                  </span>
                  <Link href={`/borclu/${promise.borclu.durumTanitici}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Detay
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {paymentPromises.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/odeme-sozleri">
              <Button variant="outline" className="w-full">
                Tüm Ödeme Sözlerini Görüntüle
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}