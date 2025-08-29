'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Debtor {
  ilgiliTCKN: string                    // İlgili TCKN
  avukatAtamaTarihi?: string            // Avukat Atama Tarihi
  durumTanitici: string                 // Durum tanıtıcısı
  muhatapTanimi: string                 // Muhatap tanımı
  muhatapTanimiEk?: string              // Muhatap tanımı (ek)
  durumTanimi: string                   // Durum Tanımı
  sozlesmeHesabi: string                // Sözleşme hesabı
  tcKimlikNo: string                    // TC kimlik no
  vergiNo?: string                      // Vergi No
  icraDosyaNumarasi?: string           // İcra Dosya Numarası
  icraDairesiTanimi?: string           // İcra Dairesi Tanımı
  adresBilgileri?: string              // Adres Bilgileri
  il?: string                          // İl
  ilce?: string                        // İlçe
  telefon?: string                     // Telefon
  telefon1?: string                    // Telefon (1. sıradaki)
  telefon2?: string                    // Telefon (2. sıradaki)
  aboneGrubu?: string                  // Abone Grubu
  asilAlacak?: number                  // Asıl Alacak
  takipCikisMiktari?: number           // Takip Çıkış Miktarı
  takipOncesiTahsilat?: number         // Takip Öncesi Tahsilat
  takipSonrasiTahsilat?: number        // Takip Sonrası Tahsilat
  toplamAcikTutar?: number             // Toplam Açık tutar
  guncelBorc?: number                  // Güncel Borç
  itirazDurumu?: string                // İtiraz Durumu
  borcluTipiTanimi?: string            // Borçlu Tipi Tanımı
  hitamTarihi?: string                 // Hitam Tarihi
  takipTarihi?: string                 // Takip Tarihi
  nedenTanimi?: string                 // Neden Tanımı
  durumTuru?: string                   // Durum Türü
  durumTuruTanimi?: string             // Durum Türü Tanımı
  tesisatDurumu?: string               // Tesisat Durumu
  odemeDurumu?: string                 // Ödeme Durumu
  vekaletUcreti?: number               // Vekalet Ücreti
  neden?: string                       // Neden
  muhatapTanimi2?: string              // Muhatap tanımı (2. sıradaki)
  muhatapTanimi3?: string              // Muhatap Tanımı (3. sıradaki)
  uyapDurumu?: string                  // Uyap Durumu
  telefon3?: string                    // Telefon (3. sıradaki)
  tesisat?: string                     // Tesisat
  tesisatDurumuTanimi?: string         // Tesisat Durumu Tanımı
  
  // Eski alanlar (geriye dönük uyumluluk için)
  id?: string
  name?: string
  amount?: number
  lastPayment?: string
  status?: 'active' | 'paid' | 'overdue'
  isim?: string
  borcMiktari?: number
  sonOdemeTarihi?: string
  durum?: string
  hasActivePaymentPromise?: boolean    // Aktif ödeme sözü durumu
}

export function RecentDebtors() {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todayCount, setTodayCount] = useState(0)

  const fetchDebtors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/recent-debtors')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        setDebtors(data.data)
        
        // API'den gelen bugünkü borçlu sayısını kullan
        setTodayCount(data.todayCount || 0)
      } else {
        console.error('Invalid data format:', data)
        setError('Veri formatı geçersiz')
      }
    } catch (error) {
      console.error('Error fetching debtors:', error)
      setError('Borçlu verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDebtors()
  }, [fetchDebtors])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Ödeme taahhüdü durumları artık API'den gelen hasActivePaymentPromise ile kontrol ediliyor

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Son Borçlular</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Son Borçlular</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <p className="text-red-600 mb-3">{error}</p>
            <Button onClick={fetchDebtors} variant="outline" size="sm">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (debtors.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Son Borçlular</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <p className="text-gray-500">Henüz borçlu kaydı bulunmuyor.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">Son Borçlular</span>
          </div>
          {todayCount > 0 && (
            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Bugün: {todayCount}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {debtors.map((debtor) => (
            <div
              key={debtor.durumTanitici}
              className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all duration-300"
            >
              {/* Renk çubuğu - Tüm kartlar aynı mavi renk */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-blue-500 to-blue-600"></div>
              
              <div className="ml-3 flex-1 min-w-0">
                {/* Üst kısım - İsim ve temel bilgiler */}
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors truncate">
                    {getDisplayName(debtor)}
                  </h3>
                  <p className="text-xs font-medium text-blue-700 mb-1 truncate">
                    <span className="text-gray-600">Durum Tanıcı:</span> {debtor.durumTanitici}
                  </p>
                  <p className="text-base font-bold text-green-700 mb-2">
                    {formatCurrency(debtor.guncelBorc || debtor.borcMiktari || 0)}
                  </p>
                </div>
                
                {/* Orta kısım - Detay bilgileri - Tüm yazılar mavi renkte */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs font-medium text-blue-700 flex-shrink-0">TCKN:</span>
                    <span className="text-xs text-blue-600 break-all">{debtor.ilgiliTCKN}</span>
                  </div>
                  {(debtor.telefon || debtor.telefon1) && (
                    <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs font-medium text-blue-700 flex-shrink-0">Tel:</span>
                      <span className="text-xs text-blue-600 break-all">{debtor.telefon || debtor.telefon1}</span>
                    </div>
                  )}
                  {debtor.sozlesmeHesabi && (
                    <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs font-medium text-blue-700 flex-shrink-0">Sözleşme:</span>
                      <span className="text-xs text-blue-600 break-all">{debtor.sozlesmeHesabi}</span>
                    </div>
                  )}
                </div>
                
                {/* İcra No - Mavi renkte */}
                {debtor.icraDosyaNumarasi && (
                  <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md mb-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs font-medium text-blue-700 flex-shrink-0">İcra No:</span>
                    <span className="text-xs text-blue-600 break-all">{debtor.icraDosyaNumarasi}</span>
                  </div>
                )}
                
                {/* Alt kısım - Durum ve Detay butonu */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                  {(debtor.odemeDurumu || debtor.durum) && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (debtor.odemeDurumu || debtor.durum) === 'Ödendi' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {debtor.odemeDurumu || debtor.durum}
                    </span>
                  )}
                  <Link href={`/borclu/${debtor.durumTanitici}`}>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detay
                    </Button>
                  </Link>
                </div>
                
                {debtor.hasActivePaymentPromise && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-md shadow-sm animate-pulse">
                    <div className="flex items-center space-x-1">
                      <div className="p-0.5 bg-amber-500 rounded-full">
                        <Calendar className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-xs text-amber-800 font-bold">
                        ⚠️ Ödeme Taahhüdü Mevcut - Takip Edilmeli!
                      </span>
                    </div>
                  </div>
                )}
                {debtor.sonOdemeTarihi && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-blue-100 border-l-2 border-blue-500 rounded-md shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="p-0.5 bg-blue-500 rounded-full">
                        <Calendar className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-xs text-blue-700 font-semibold">
                        Son Ödeme: {formatDate(debtor.sonOdemeTarihi)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/borclular">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-300 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 text-slate-700 hover:text-blue-700 font-medium py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Tüm Borçluları Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

const getDisplayName = (debtor: Debtor) => {
  // Muhatap tanımını temizle (eğer "Borçlu" içeriyorsa)
  let cleanName = debtor.muhatapTanimi
  
  // "Borçlu" kelimesini kaldır
  if (cleanName.includes('Borçlu')) {
    cleanName = cleanName.replace(/Borçlu\s*/gi, '').trim()
  }
  
  // Eğer temizlenmiş isim boşsa, orijinal ismi kullan
  if (!cleanName || cleanName.length < 2) {
    cleanName = debtor.muhatapTanimi
  }
  
  // Fallback olarak diğer isim alanlarını kontrol et
  if (!cleanName || cleanName.length < 2) {
    cleanName = debtor.isim || debtor.name || 'İsimsiz'
  }
  
  return cleanName
}