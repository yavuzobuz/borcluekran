'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Phone, Mail, Calendar, TrendingUp, Plus, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Debtor {
  // Kullanıcının verdiği tam sıralamaya göre düzenlenmiş alanlar
  ilgiliTCKN: string                    // İlgili TCKN
  avukatAtamaTarihi?: string            // Avukat Atama Tarihi
  durumTanitici: string                 // Durum tanıtıcısı
  muhatapTanimi: string                 // Muhatap tanımı
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
  guncelBorc: number                   // Güncel Borç
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
  isim?: string
  borcMiktari?: number
  telefon?: string
  email?: string
  adres?: string
  durum?: string
  kayitTarihi?: string
  sonGuncellemeTarihi?: string
}

interface PaymentPromise {
  id: number
  miktar: number
  tarih: string
  aciklama?: string
  olusturmaTarihi: string
  durum: 'Beklemede' | 'Tamamlandı' | 'Gecikmiş'
}

interface NewPromise {
  miktar: string
  tarih: string
  aciklama: string
}

export default function BorcluDetayPage() {
  const params = useParams()
  const durumTanitici = params.durumTanitici as string
  
  const [debtor, setDebtor] = useState<Debtor | null>(null)
  const [promises, setPromises] = useState<PaymentPromise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPromiseDialogOpen, setIsPromiseDialogOpen] = useState(false)
  const [newPromise, setNewPromise] = useState<NewPromise>({
    miktar: '',
    tarih: '',
    aciklama: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (durumTanitici) {
      fetchDebtorDetails()
      fetchPaymentPromises()
    }
  }, [durumTanitici])

  const fetchDebtorDetails = async () => {
    try {
      const response = await fetch(`/api/borclu/${durumTanitici}`)
      if (response.ok) {
        const data = await response.json()
        setDebtor(data)
      } else {
        // Hata durumunda örnek veri göster
        setDebtor({
          // Zorunlu alanlar
          ilgiliTCKN: '12345678901',
          durumTanitici: durumTanitici,
          muhatapTanimi: 'Ahmet Yılmaz / MERKEZ',
          durumTanimi: 'Aktif',
          sozlesmeHesabi: '5001693081',
          tcKimlikNo: '12345678901',
          
          // Opsiyonel alanlar
          avukatAtamaTarihi: '2023-06-15',
          icraDosyaNumarasi: '2024/12345',
          icraDairesiTanimi: 'Ankara 1. İcra Müdürlüğü',
          adresBilgileri: 'Atatürk Mah. Cumhuriyet Cad. No:123 Ankara',
          il: 'ANKARA',
          ilce: 'ÇANKAYA',
          telefon1: '0532 123 45 67',
          guncelBorc: 15000,
          asilAlacak: 12000,
          takipCikisMiktari: 15000,
          toplamAcikTutar: 15000,
          odemeDurumu: 'Aktif',
          borcluTipiTanimi: 'Gerçek Kişi',
          takipTarihi: '2023-06-15',
          
          // Eski alanlar (geriye uyumluluk)
          isim: 'Ahmet Yılmaz',
          borcMiktari: 15000,
          telefon: '0532 123 45 67',
          email: 'ahmet@email.com',
          adres: 'Atatürk Mah. Cumhuriyet Cad. No:123 Ankara',
          durum: 'Aktif',
          kayitTarihi: '2023-06-15T10:30:00Z',
          sonGuncellemeTarihi: '2024-01-15T14:20:00Z'
        })
      }
    } catch (error) {
      console.error('Borçlu detayları alınırken hata:', error)
      toast.error('Borçlu detayları yüklenemedi')
    }
  }

  const fetchPaymentPromises = async () => {
    try {
      const response = await fetch(`/api/odeme-sozu?durumTanitici=${durumTanitici}`)
      if (response.ok) {
        const data = await response.json()
        setPromises(data)
      } else {
        // Hata durumunda örnek veri göster
        setPromises([
          {
            id: 1,
            miktar: 5000,
            tarih: '2024-02-15',
            aciklama: 'İlk taksit ödemesi',
            olusturmaTarihi: '2024-01-15T10:00:00Z',
            durum: 'Beklemede'
          },
          {
            id: 2,
            miktar: 3000,
            tarih: '2024-01-10',
            aciklama: 'Kısmi ödeme',
            olusturmaTarihi: '2024-01-05T15:30:00Z',
            durum: 'Tamamlandı'
          }
        ])
      }
    } catch (error) {
      console.error('Ödeme sözleri alınırken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPromise = async () => {
    if (!newPromise.miktar || !newPromise.tarih) {
      toast.error('Miktar ve tarih alanları zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/odeme-sozu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          durumTanitici,
          miktar: parseFloat(newPromise.miktar),
          tarih: newPromise.tarih,
          aciklama: newPromise.aciklama
        })
      })

      if (response.ok) {
        toast.success('Ödeme sözü başarıyla eklendi')
        setIsPromiseDialogOpen(false)
        setNewPromise({ miktar: '', tarih: '', aciklama: '' })
        fetchPaymentPromises()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ödeme sözü eklenemedi')
      }
    } catch (error) {
      console.error('Ödeme sözü eklenirken hata:', error)
      toast.error('Ödeme sözü eklenemedi')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const getPromiseStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'text-green-600 bg-green-100'
      case 'Beklemede':
        return 'text-yellow-600 bg-yellow-100'
      case 'Gecikmiş':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!debtor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Borçlu Bulunamadı</h1>
            <p className="text-gray-600 mb-6">Aradığınız borçlu kaydı bulunamadı.</p>
            <Link href="/borclu-listesi">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Borçlu Listesine Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/borclu-listesi">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{debtor.muhatapTanimi || debtor.isim}</h1>
          <p className="text-gray-600">Durum Tanıtıcı: {debtor.durumTanitici}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Borçlu Bilgileri ve Ödeme Sözleri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Borçlu Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Borçlu Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Birinci Kolon - Temel Bilgiler */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">İlgili TCKN</Label>
                      <p className="text-lg font-semibold text-gray-900">{debtor.ilgiliTCKN}</p>
                    </div>
                    {debtor.avukatAtamaTarihi && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Avukat Atama Tarihi</Label>
                        <p className="text-gray-900">{debtor.avukatAtamaTarihi}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Durum Tanıtıcısı</Label>
                      <p className="text-lg font-semibold text-gray-900">{debtor.durumTanitici}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Muhatap Tanımı</Label>
                        <p className="text-gray-900">{debtor.muhatapTanimi || 'Bilgi yok'}</p>
                      </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Durum Tanımı</Label>
                        <p className="text-gray-900">{debtor.durumTanimi || 'Bilgi yok'}</p>
                      </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sözleşme Hesabı</Label>
                      <p className="text-gray-900">{debtor.sozlesmeHesabi}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">TC Kimlik No</Label>
                      <p className="text-gray-900">{debtor.tcKimlikNo}</p>
                    </div>
                    {debtor.vergiNo && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Vergi No</Label>
                        <p className="text-gray-900">{debtor.vergiNo}</p>
                      </div>
                    )}
                  </div>

                  {/* İkinci Kolon - İcra ve Adres Bilgileri */}
                  <div className="space-y-4">
                    {debtor.icraDosyaNumarasi && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">İcra Dosya Numarası</Label>
                        <p className="text-gray-900">{debtor.icraDosyaNumarasi}</p>
                      </div>
                    )}
                    {debtor.icraDairesiTanimi && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">İcra Dairesi Tanımı</Label>
                        <p className="text-gray-900">{debtor.icraDairesiTanimi}</p>
                      </div>
                    )}
                    {debtor.adresBilgileri && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Adres Bilgileri</Label>
                        <p className="text-gray-900">{debtor.adresBilgileri}</p>
                      </div>
                    )}
                    {debtor.il && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">İl</Label>
                        <p className="text-gray-900">{debtor.il}</p>
                      </div>
                    )}
                    {debtor.ilce && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">İlçe</Label>
                        <p className="text-gray-900">{debtor.ilce}</p>
                      </div>
                    )}
                    {debtor.telefon1 && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Telefon 1</Label>
                          <p className="text-gray-900">{debtor.telefon1}</p>
                        </div>
                      </div>
                    )}
                    {debtor.telefon2 && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Telefon 2</Label>
                          <p className="text-gray-900">{debtor.telefon2}</p>
                        </div>
                      </div>
                    )}
                    {debtor.aboneGrubu && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Abone Grubu</Label>
                        <p className="text-gray-900">{debtor.aboneGrubu}</p>
                      </div>
                    )}
                  </div>

                  {/* Üçüncü Kolon - Finansal Bilgiler */}
                  <div className="space-y-4">
                    {debtor.asilAlacak && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Asıl Alacak</Label>
                        <p className="text-lg font-semibold text-blue-600">{formatCurrency(debtor.asilAlacak)}</p>
                      </div>
                    )}
                    {debtor.takipCikisMiktari && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Takip Çıkış Miktarı</Label>
                        <p className="text-gray-900">{formatCurrency(debtor.takipCikisMiktari)}</p>
                      </div>
                    )}
                    {debtor.takipOncesiTahsilat && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Takip Öncesi Tahsilat</Label>
                        <p className="text-green-600">{formatCurrency(debtor.takipOncesiTahsilat)}</p>
                      </div>
                    )}
                    {debtor.takipSonrasiTahsilat && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Takip Sonrası Tahsilat</Label>
                        <p className="text-green-600">{formatCurrency(debtor.takipSonrasiTahsilat)}</p>
                      </div>
                    )}
                    {debtor.toplamAcikTutar && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Toplam Açık Tutar</Label>
                        <p className="text-orange-600">{formatCurrency(debtor.toplamAcikTutar)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Güncel Borç</Label>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(debtor.guncelBorc || debtor.borcMiktari || 0)}</p>
                    </div>
                    {debtor.vekaletUcreti && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Vekalet Ücreti</Label>
                        <p className="text-gray-900">{formatCurrency(debtor.vekaletUcreti)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ek Bilgiler Bölümü */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ek Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      {debtor.itirazDurumu && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">İtiraz Durumu</Label>
                          <p className="text-gray-900">{debtor.itirazDurumu}</p>
                        </div>
                      )}
                      {debtor.borcluTipiTanimi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Borçlu Tipi Tanımı</Label>
                          <p className="text-gray-900">{debtor.borcluTipiTanimi}</p>
                        </div>
                      )}
                      {debtor.hitamTarihi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Hitam Tarihi</Label>
                          <p className="text-gray-900">{debtor.hitamTarihi}</p>
                        </div>
                      )}
                      {debtor.takipTarihi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Takip Tarihi</Label>
                          <p className="text-gray-900">{debtor.takipTarihi}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {debtor.nedenTanimi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Neden Tanımı</Label>
                          <p className="text-gray-900">{debtor.nedenTanimi}</p>
                        </div>
                      )}
                      {debtor.durumTuru && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Durum Türü</Label>
                          <p className="text-gray-900">{debtor.durumTuru}</p>
                        </div>
                      )}
                      {debtor.durumTuruTanimi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Durum Türü Tanımı</Label>
                          <p className="text-gray-900">{debtor.durumTuruTanimi}</p>
                        </div>
                      )}
                      {debtor.tesisatDurumu && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Tesisat Durumu</Label>
                          <p className="text-gray-900">{debtor.tesisatDurumu}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {debtor.odemeDurumu && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Ödeme Durumu</Label>
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(debtor.odemeDurumu)}`}>
                            {debtor.odemeDurumu}
                          </span>
                        </div>
                      )}
                      {debtor.uyapDurumu && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Uyap Durumu</Label>
                          <p className="text-gray-900">{debtor.uyapDurumu}</p>
                        </div>
                      )}
                      {debtor.tesisat && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Tesisat</Label>
                          <p className="text-gray-900">{debtor.tesisat}</p>
                        </div>
                      )}
                      {debtor.tesisatDurumuTanimi && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Tesisat Durumu Tanımı</Label>
                          <p className="text-gray-900">{debtor.tesisatDurumuTanimi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {(debtor.kayitTarihi || debtor.sonGuncellemeTarihi) && (
                  <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {debtor.kayitTarihi && (
                      <div>
                        <span className="font-medium">Kayıt Tarihi:</span> {formatDateTime(debtor.kayitTarihi)}
                      </div>
                    )}
                    {debtor.sonGuncellemeTarihi && (
                      <div>
                        <span className="font-medium">Son Güncelleme:</span> {formatDateTime(debtor.sonGuncellemeTarihi)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ödeme Sözleri */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Ödeme Sözleri</span>
                  </CardTitle>
                  <Dialog open={isPromiseDialogOpen} onOpenChange={setIsPromiseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Söz Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Ödeme Sözü Ekle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="miktar">Miktar (TL)</Label>
                          <Input
                            id="miktar"
                            type="number"
                            placeholder="Ödeme miktarı"
                            value={newPromise.miktar}
                            onChange={(e) => setNewPromise(prev => ({ ...prev, miktar: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tarih">Ödeme Tarihi</Label>
                          <Input
                            id="tarih"
                            type="date"
                            value={newPromise.tarih}
                            onChange={(e) => setNewPromise(prev => ({ ...prev, tarih: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="aciklama">Açıklama (Opsiyonel)</Label>
                          <Textarea
                            id="aciklama"
                            placeholder="Ödeme sözü hakkında açıklama"
                            value={newPromise.aciklama}
                            onChange={(e) => setNewPromise(prev => ({ ...prev, aciklama: e.target.value }))}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleAddPromise}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsPromiseDialogOpen(false)}
                            className="flex-1"
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {promises.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz ödeme sözü bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promises.map((promise) => (
                      <div key={promise.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{formatDate(promise.tarih)}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPromiseStatusColor(promise.durum)}`}>
                            {promise.durum}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(promise.miktar)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(promise.olusturmaTarihi)}
                          </span>
                        </div>
                        {promise.aciklama && (
                          <p className="text-sm text-gray-600">{promise.aciklama}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon - Özet Bilgiler */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Özet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Toplam Borç:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(debtor.guncelBorc || debtor.borcMiktari || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Toplam Söz:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(promises.reduce((sum, p) => sum + p.miktar, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kalan Borç:</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency((debtor.guncelBorc || debtor.borcMiktari || 0) - promises.filter(p => p.durum === 'Tamamlandı').reduce((sum, p) => sum + p.miktar, 0))}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aktif Sözler:</span>
                    <span className="font-semibold">{promises.filter(p => p.durum === 'Beklemede').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tamamlanan:</span>
                    <span className="font-semibold text-green-600">{promises.filter(p => p.durum === 'Tamamlandı').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Geciken:</span>
                    <span className="font-semibold text-red-600">{promises.filter(p => p.durum === 'Gecikmiş').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}