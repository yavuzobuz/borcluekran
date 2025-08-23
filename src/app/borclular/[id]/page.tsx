'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, FileText, Plus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface OdemeSozu {
  id: number
  tarih: string
  aciklama: string
  odemeMiktari?: number
  durum: string
}

interface BorcluDetay {
  id: number
  ilgiliTCKN: string
  avukatAtamaTarihi?: string
  durum?: string
  durumTanitici: string
  muhatapTanimi: string
  durumTanimi?: string
  sozlesmeHesabi?: string
  tcKimlikNo?: string
  vergiNo?: string
  icraDosyaNumarasi?: string
  icraDairesiTanimi?: string
  adresBilgileri?: string
  il?: string
  ilce?: string
  telefon?: string
  telefonAboneGrubu?: string
  asilAlacak?: number
  takipCikisMiktari?: number
  takipOncesiTahsilat?: number
  takipSonrasiTahsilat?: number
  toplamAcikTutar?: number
  guncelBorc: number
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
  muhatapTanimiEk?: string
  uyapDurumu?: string
  telefonTesisat?: string
  tesisatDurumuTanimi?: string
  kayitTarihi: string
  guncellemeTarihi: string
  odemeSozleri?: OdemeSozu[]
  hasActivePaymentPromise?: boolean
}

export default function BorcluDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [borclu, setBorclu] = useState<BorcluDetay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [odemeSozu, setOdemeSozu] = useState({
    tarih: '',
    miktar: '',
    aciklama: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      fetchBorcluDetay()
    }
  }, [id])

  const fetchBorcluDetay = async () => {
    try {
      const response = await fetch(`/api/borclu/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBorclu(data)
      } else {
        console.error('Borçlu bulunamadı')
      }
    } catch (error) {
      console.error('Borçlu detayı yüklenirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '₺0,00'
    return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Belirtilmemiş'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

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
          borcluId: borclu?.id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Yükleniyor...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!borclu) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Borçlu Bulunamadı</h2>
              <p className="text-muted-foreground mb-4">Aradığınız borçlu kaydı bulunamadı.</p>
              <Link href="/borclular">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{borclu.muhatapTanimi}</h1>
              <p className="text-muted-foreground">Borçlu Detay Bilgileri</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {borclu.durumTanitici}
          </Badge>
        </div>

        {/* Ödeme Sözü Uyarısı */}
        {borclu.hasActivePaymentPromise && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Ödeme Taahhüdü Mevcut - Takip Edilmeli!</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Bu borçlunun aktif ödeme sözü bulunmaktadır. Ödeme durumunu takip ediniz.
                </p>
              </div>
              <Link href={`/odeme-sozleri?durumTanitici=${borclu?.durumTanitici}`}>
                <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Detay
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kişisel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-sm font-medium text-muted-foreground">Muhatap Tanımı</label>
                      <p className="font-semibold">{borclu.muhatapTanimi || `Borçlu (TC: ${borclu.ilgiliTCKN || borclu.tcKimlikNo || 'Bilinmiyor'})`}</p>
                    </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">İlgili TCKN</label>
                    <p className="font-semibold">{borclu.ilgiliTCKN}</p>
                  </div>
                  {borclu.tcKimlikNo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">TC Kimlik No</label>
                      <p className="font-semibold">{borclu.tcKimlikNo}</p>
                    </div>
                  )}
                  {borclu.vergiNo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                      <p className="font-semibold">{borclu.vergiNo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* İletişim Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {borclu.telefon && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                      <p className="font-semibold">{borclu.telefon}</p>
                    </div>
                  )}
                  {borclu.il && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">İl</label>
                      <p className="font-semibold">{borclu.il}</p>
                    </div>
                  )}
                  {borclu.ilce && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">İlçe</label>
                      <p className="font-semibold">{borclu.ilce}</p>
                    </div>
                  )}
                  {borclu.adresBilgileri && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Adres</label>
                      <p className="font-semibold">{borclu.adresBilgileri}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hukuki Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Hukuki Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {borclu.icraDosyaNumarasi && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">İcra Dosya No</label>
                      <p className="font-semibold">{borclu.icraDosyaNumarasi}</p>
                    </div>
                  )}
                  {borclu.icraDairesiTanimi && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">İcra Dairesi</label>
                      <p className="font-semibold">{borclu.icraDairesiTanimi}</p>
                    </div>
                  )}
                  {borclu.avukatAtamaTarihi && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Avukat Atama Tarihi</label>
                      <p className="font-semibold">{formatDate(borclu.avukatAtamaTarihi)}</p>
                    </div>
                  )}
                  {borclu.takipTarihi && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Takip Tarihi</label>
                      <p className="font-semibold">{formatDate(borclu.takipTarihi)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Borç Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Borç Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-red-600">Güncel Borç</label>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(borclu.guncelBorc)}</p>
                </div>
                
                {borclu.asilAlacak && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asıl Alacak</label>
                    <p className="font-semibold">{formatCurrency(borclu.asilAlacak)}</p>
                  </div>
                )}
                
                {borclu.takipCikisMiktari && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Takip Çıkış Miktarı</label>
                    <p className="font-semibold">{formatCurrency(borclu.takipCikisMiktari)}</p>
                  </div>
                )}
                
                {borclu.vekaletUcreti && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vekalet Ücreti</label>
                    <p className="font-semibold">{formatCurrency(borclu.vekaletUcreti)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Durum Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle>Durum Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Durum Tanıtıcı</label>
                  <Badge variant="outline" className="ml-2">{borclu.durumTanitici}</Badge>
                </div>
                
                {borclu.durumTanimi && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Durum Tanımı</label>
                    <p className="font-semibold">{borclu.durumTanimi}</p>
                  </div>
                )}
                
                {borclu.odemeDurumu && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ödeme Durumu</label>
                    <p className="font-semibold">{borclu.odemeDurumu}</p>
                  </div>
                )}
                
                {borclu.itirazDurumu && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">İtiraz Durumu</label>
                    <p className="font-semibold">{borclu.itirazDurumu}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarih Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tarih Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</label>
                  <p className="font-semibold">{formatDate(borclu.kayitTarihi)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Güncelleme Tarihi</label>
                  <p className="font-semibold">{formatDate(borclu.guncellemeTarihi)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ödeme Sözü Ekleme Butonu */}
        <div className="mt-8 flex justify-center space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
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
                    Tarih *
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
          <Link href={`/odeme-sozleri?durumTanitici=${borclu?.durumTanitici}`}>
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