'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, FileText, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { PaymentPromisesList } from '@/components/payment-promises-list'

interface Debtor {
  id: number
  ilgiliTCKN: string
  avukatAtamaTarihi?: string
  durumTanitici: string
  muhatapTanimi: string
  muhatapTanimiEk?: string
  durumTanimi: string
  sozlesmeHesabi: string
  tcKimlikNo: string
  vergiNo?: string
  icraDosyaNumarasi?: string
  icraDairesiTanimi?: string
  adresBilgileri?: string
  il?: string
  ilce?: string
  telefon1?: string
  telefon2?: string
  aboneGrubu?: string
  asilAlacak?: number
  takipCikisMiktari?: number
  takipOncesiTahsilat?: number
  takipSonrasiTahsilat?: number
  toplamAcikTutar?: number
  guncelBorc?: number
  itirazDurumu?: string
  borcluTipiTanimi?: string
  hitamTarihi?: string
  takipTarihi?: string
  nedenTanimi?: string
  durumTuru?: string
  durumTuruTanimi?: string
  tesisatDurumu?: string
  odemeDurumu?: string
  vekaletUcreti?: number
  neden?: string
  muhatapTanimi2?: string
  muhatapTanimi3?: string
  uyapDurumu?: string
  telefon3?: string
  tesisat?: string
  tesisatDurumuTanimi?: string
  kayitTarihi: string
  guncellemeTarihi: string
}

export default function BorcluDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [debtor, setDebtor] = useState<Debtor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [odemeSozu, setOdemeSozu] = useState({
    tarih: '',
    miktar: '',
    aciklama: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const id = params.id as string

  useEffect(() => {
    const fetchDebtor = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/borclu/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Borçlu bulunamadı')
          } else {
            setError('Borçlu bilgileri yüklenirken bir hata oluştu')
          }
          return
        }

        const data = await response.json()
        setDebtor(data)
      } catch (error) {
        console.error('Borçlu detayı yükleme hatası:', error)
        setError('Borçlu bilgileri yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchDebtor()
    }
  }, [id])

  const handleOdemeSozuKaydet = async () => {
    if (!odemeSozu.tarih || !odemeSozu.aciklama) {
      alert('Lütfen tarih ve açıklama alanlarını doldurun')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/odeme-sozu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durumTanitici: debtor?.durumTanitici,
          tarih: odemeSozu.tarih,
          aciklama: odemeSozu.aciklama,
          odemeMiktari: odemeSozu.miktar ? parseFloat(odemeSozu.miktar) : null
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert('Ödeme sözü başarıyla kaydedildi')
        setIsDialogOpen(false)
        setOdemeSozu({ tarih: '', miktar: '', aciklama: '' })
      } else {
        alert(result.error || 'Ödeme sözü kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Ödeme sözü kaydetme hatası:', error)
      alert('Ödeme sözü kaydedilirken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '0 ₺'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Belirtilmemiş'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getDisplayName = (debtor: Debtor) => {
    // Muhatap tanımını temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimi = debtor.muhatapTanimi ? debtor.muhatapTanimi.trim() : ''
    if (cleanMuhatapTanimi.toLowerCase() === 'borçlu' || cleanMuhatapTanimi.toLowerCase() === 'borclu') {
      cleanMuhatapTanimi = ''
    }
    
    // Muhatap tanımı ek'i temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimiEk = debtor.muhatapTanimiEk ? debtor.muhatapTanimiEk.trim() : ''
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
    
    return (
      (cleanMuhatapTanimi || undefined) ||
      (cleanMuhatapTanimiEk || undefined) ||
      (debtor.borcluTipiTanimi && !debtor.borcluTipiTanimi.toLowerCase().includes('borçlu') ? debtor.borcluTipiTanimi.trim() : undefined) ||
      debtor.durumTanitici || "İsimsiz Borçlu"
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !debtor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
            <p className="text-gray-600 mb-6">{error || 'Borçlu bulunamadı'}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 border-blue-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {getDisplayName(debtor)}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {debtor.durumTanitici}
                  </span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-600 text-sm font-medium">Borçlu Detayları</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kişisel Bilgiler */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">Kişisel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">TC Kimlik No</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.tcKimlikNo || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İlgili TCKN</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.ilgiliTCKN || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vergi No</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.vergiNo || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Borçlu Tipi</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.borcluTipiTanimi || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">İletişim Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Telefon 1</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.telefon1 || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Telefon 2</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.telefon2 || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Telefon 3</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.telefon3 || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">Adres Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İl</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.il || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İlçe</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.ilce || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Adres</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.adresBilgileri || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finansal Bilgiler */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">Finansal Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Güncel Borç</label>
                  <p className="text-xl font-bold text-red-700 mt-1">
                    {formatCurrency(debtor.guncelBorc)}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Asıl Alacak</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(debtor.asilAlacak)}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Takip Çıkış Miktarı</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(debtor.takipCikisMiktari)}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-600">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Toplam Açık Tutar</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(debtor.toplamAcikTutar)}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-700">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vekalet Ücreti</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(debtor.vekaletUcreti)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ödeme Durumu</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.odemeDurumu || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Sözleri */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-semibold">Ödeme Sözleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PaymentPromisesList 
                  durumTanitici={debtor.durumTanitici} 
                  onAddPromise={() => setIsDialogOpen(true)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Hukuki Bilgiler */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">Hukuki Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sözleşme Hesabı</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.sozlesmeHesabi || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İcra Dosya No</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.icraDosyaNumarasi || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İcra Dairesi</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.icraDairesiTanimi || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-700">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Durum Tanımı</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.durumTanimi || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Takip Tarihi</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(debtor.takipTarihi)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hitam Tarihi</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(debtor.hitamTarihi)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avukat Atama Tarihi</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(debtor.avukatAtamaTarihi)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-700">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">İtiraz Durumu</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{debtor.itirazDurumu || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aksiyonlar */}
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold">Aksiyonlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-5 h-5" />
                    <span>Ödeme Sözü Ekle</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Ödeme Sözü Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="tarih" className="text-right text-sm font-medium">
                        Tarih
                      </label>
                      <Input
                        id="tarih"
                        type="date"
                        value={odemeSozu.tarih}
                        onChange={(e) => setOdemeSozu({ ...odemeSozu, tarih: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="aciklama" className="text-right text-sm font-medium">
                        Açıklama *
                      </label>
                      <Textarea
                        id="aciklama"
                        placeholder="Ödeme sözü ile ilgili açıklama..."
                        value={odemeSozu.aciklama}
                        onChange={(e) => setOdemeSozu({ ...odemeSozu, aciklama: e.target.value })}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="miktar" className="text-right text-sm font-medium">
                        Miktar (₺)
                      </label>
                      <Input
                        id="miktar"
                        type="number"
                        step="0.01"
                        placeholder="0.00 (opsiyonel)"
                        value={odemeSozu.miktar}
                        onChange={(e) => setOdemeSozu({ ...odemeSozu, miktar: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleOdemeSozuKaydet}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Link href={`/odeme-sozleri?durumTanitici=${debtor.durumTanitici}`}>
                <Button variant="outline" className="w-full flex items-center justify-center space-x-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Calendar className="w-5 h-5" />
                  <span>Ödeme Sözleri</span>
                </Button>
              </Link>
              
              <Link href="/borclular">
                <Button variant="outline" className="w-full flex items-center justify-center space-x-3 border-2 border-gray-500 text-gray-600 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Borçlu Listesi</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}