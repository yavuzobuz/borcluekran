'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Debtor {
  // Kullanıcının verdiği tam sıralamaya göre düzenlenmiş alanlar
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
  
  // Eski alanlar (geriye uyumluluk için)
  id?: string
  name?: string
  amount?: number
  lastPayment?: string
  status?: 'active' | 'paid' | 'overdue'
  isim?: string
  borcMiktari?: number
  sonOdemeTarihi?: string
  durum?: string
}

export function RecentDebtors() {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentDebtors = async () => {
      try {
        const response = await fetch('/api/recent-debtors')
        if (response.ok) {
          const result = await response.json()
          setDebtors(result.data || [])
          setTodayCount(result.todayCount || 0)
        } else {
          console.error('Recent debtors API error:', response.statusText)
          setDebtors([])
        }
      } catch (error) {
        console.error('Recent debtors fetch error:', error)
        setDebtors([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDebtors()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
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
            <TrendingUp className="w-5 h-5" />
            <span>Son Borçlular</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Son Borçlular</span>
          </div>
          {todayCount > 0 && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <Calendar className="w-4 h-4" />
              <span>Bugün: {todayCount}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debtors.map((debtor) => (
            <div
              key={debtor.durumTanitici}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getDisplayName(debtor)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {debtor.durumTanitici} • {formatCurrency(debtor.guncelBorc || debtor.borcMiktari || 0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      İlgili TCKN: {debtor.ilgiliTCKN}
                    </p>
                    {debtor.sonOdemeTarihi && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Son Ödeme: {formatDate(debtor.sonOdemeTarihi)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(debtor.odemeDurumu || debtor.durum || 'Bilinmiyor')
                  }`}
                >
                  {debtor.odemeDurumu || debtor.durum || 'Bilinmiyor'}
                </span>
                <Link href={`/borclu/${debtor.durumTanitici}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Detay
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/borclular">
            <Button variant="outline" className="w-full">
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
  let cleanMuhatapTanimi = debtor.muhatapTanimi ? debtor.muhatapTanimi.trim() : ''
  // Muhatap tanımı gerçek isim içerdiği için sadece "Borçlu" kelimesi varsa temizle
  if (cleanMuhatapTanimi.toLowerCase() === 'borçlu' || cleanMuhatapTanimi.toLowerCase() === 'borclu') {
    cleanMuhatapTanimi = ''
  }
  
  // Muhatap tanımı ek'i temizle (eğer "Borçlu" içeriyorsa)
  let cleanMuhatapTanimiEk = debtor.muhatapTanimiEk ? debtor.muhatapTanimiEk.trim() : ''
  // Muhatap tanımı ek gerçek isim içerdiği için sadece "Borçlu" kelimesi varsa temizle
  if (cleanMuhatapTanimiEk.toLowerCase() === 'borçlu' || cleanMuhatapTanimiEk.toLowerCase() === 'borclu') {
    cleanMuhatapTanimiEk = ''
  }
  
  // Muhatap tanımını parçalara ayır ve "/ " ile ayrılmış kısımları kontrol et
  if (cleanMuhatapTanimi && cleanMuhatapTanimi.includes('/')) {
    // "CENGİZ KAMA / ÇAKMAK-MERKEZ" gibi formatta ise, ilk kısmı al
    const parts = cleanMuhatapTanimi.split('/')
    if (parts.length > 0 && parts[0].trim()) {
      cleanMuhatapTanimi = parts[0].trim()
    }
  }
  
  // Öncelik sırası: temizlenmiş muhatapTanimi > temizlenmiş muhatapTanimiEk > borcluTipiTanimi > durumTanitici
  return (
    (cleanMuhatapTanimi || undefined) ||
    (cleanMuhatapTanimiEk || undefined) ||
    (debtor.borcluTipiTanimi && !debtor.borcluTipiTanimi.toLowerCase().includes('borçlu') ? debtor.borcluTipiTanimi.trim() : undefined) ||
    debtor.durumTanitici || "İsimsiz Borçlu"
  )
}