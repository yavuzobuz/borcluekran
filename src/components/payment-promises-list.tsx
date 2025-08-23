'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Plus, Eye } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface PaymentPromise {
  id: number
  tarih: string
  aciklama: string
  odemeMiktari?: number
  durum: string
  createdAt?: string
  updatedAt?: string
}

interface PaymentPromisesListProps {
  durumTanitici: string
  onAddPromise?: () => void
}

export function PaymentPromisesList({ durumTanitici, onAddPromise }: PaymentPromisesListProps) {
  const [paymentPromises, setPaymentPromises] = useState<PaymentPromise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentPromises = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/odeme-sozleri/${durumTanitici}`)
        
        if (!response.ok) {
          throw new Error('Ödeme sözleri yüklenirken bir hata oluştu')
        }

        const data = await response.json()
        setPaymentPromises(data.odeme_sozleri || [])
      } catch (error) {
        console.error('Ödeme sözleri yükleme hatası:', error)
        setError('Ödeme sözleri yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    if (durumTanitici) {
      fetchPaymentPromises()
    }
  }, [durumTanitici])

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Belirtilmemiş'
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy', { locale: tr })
    } catch {
      return 'Geçersiz tarih'
    }
  }

  const getRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: tr })
    } catch {
      return null
    }
  }

  const getStatusColor = (durum: string) => {
    switch (durum?.toLowerCase()) {
      case 'aktif':
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800'
      case 'tamamlandı':
      case 'ödendi':
        return 'bg-green-100 text-green-800'
      case 'iptal':
      case 'iptal edildi':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Ödeme Sözleri</span>
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
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Ödeme Sözleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Ödeme Sözleri</span>
            <Badge variant="secondary">{paymentPromises.length}</Badge>
          </div>
          {onAddPromise && (
            <Button size="sm" onClick={onAddPromise}>
              <Plus className="w-4 h-4 mr-1" />
              Yeni Söz
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentPromises.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Henüz ödeme sözü bulunmuyor</p>
            {onAddPromise && (
              <Button variant="outline" onClick={onAddPromise}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Ödeme Sözünü Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paymentPromises.map((promise) => (
              <div
                key={promise.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(promise.tarih)}</span>
                    </div>
                    {promise.odemeMiktari && (
                      <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{formatCurrency(promise.odemeMiktari)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-900 mb-2">{promise.aciklama}</p>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(promise.durum)}>
                      {promise.durum || 'Beklemede'}
                    </Badge>
                    {getRelativeTime(promise.createdAt) && (
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(promise.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {paymentPromises.length > 3 && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Tüm Ödeme Sözlerini Görüntüle ({paymentPromises.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}