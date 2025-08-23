'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, FileText, Plus } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getDisplayName(debtor)}
              </h1>
              <p className="text-gray-600">Durum Tanıtıcı: {debtor.durumTanitici}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kişisel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Kişisel Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">TC Kimlik No</label>
                  <p className="text-gray-900">{debtor.tcKimlikNo || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">İlgili TCKN</label>
                  <p className="text-gray-900">{debtor.ilgiliTCKN || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vergi No</label>
                  <p className="text-gray-900">{debtor.vergiNo || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Borçlu Tipi</label>
                  <p className="text-gray-900">{debtor.borcluTipiTanimi || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>İletişim Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon 1</label>
                  <p className="text-gray-900">{debtor.telefon1 || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon 2</label>
                  <p className="text-gray-900">{debtor.telefon2 || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon 3</label>
                  <p className="text-gray-900">{debtor.telefon3 || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Adres Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">İl</label>
                  <p className="text-gray-900">{debtor.il || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">İlçe</label>
                  <p className="text-gray-900">{debtor.ilce || 'Belirtilmemiş'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Adres</label>
                <p className="text-gray-900">{debtor.adresBilgileri || 'Belirtilmemiş'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Finansal Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Finansal Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Güncel Borç</label>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(debtor.guncelBorc)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Asıl Alacak</label>
                  <p className="text-gray-900">{formatCurrency(debtor.asilAlacak)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Takip Çıkış Miktarı</label>
                  <p className="text-gray-900">{formatCurrency(debtor.takipCikisMiktari)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Toplam Açık Tutar</label>
                  <p className="text-gray-900">{formatCurrency(debtor.toplamAcikTutar)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vekalet Ücreti</label>
                  <p className="text-gray-900">{formatCurrency(debtor.vekaletUcreti)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ödeme Durumu</label>
                  <p className="text-gray-900">{debtor.odemeDurumu || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Sözleri */}
          <div className="lg:col-span-2">
            <PaymentPromisesList 
              durumTanitici={debtor.durumTanitici} 
              onAddPromise={() => setIsDialogOpen(true)}
            />
          </div>

          {/* Hukuki Bilgiler */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Hukuki Bilgiler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Sözleşme Hesabı</label>
                  <p className="text-gray-900">{debtor.sozlesmeHesabi || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">İcra Dosya No</label>
                  <p className="text-gray-900">{debtor.icraDosyaNumarasi || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">İcra Dairesi</label>
                  <p className="text-gray-900">{debtor.icraDairesiTanimi || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Durum Tanımı</label>
                  <p className="text-gray-900">{debtor.durumTanimi || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Takip Tarihi</label>
                  <p className="text-gray-900">{formatDate(debtor.takipTarihi)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hitam Tarihi</label>
                  <p className="text-gray-900">{formatDate(debtor.hitamTarihi)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Avukat Atama Tarihi</label>
                  <p className="text-gray-900">{formatDate(debtor.avukatAtamaTarihi)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">İtiraz Durumu</label>
                  <p className="text-gray-900">{debtor.itirazDurumu || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aksiyonlar */}
        <div className="mt-6 flex justify-center space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ödeme Sözü Ekle
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
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Ödeme Sözleri
            </Button>
          </Link>
          <Link href="/borclular">
            <Button variant="outline">
              Borçlu Listesi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}