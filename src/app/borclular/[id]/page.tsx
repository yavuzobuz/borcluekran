'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'

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
}

export default function BorcluDetayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [borclu, setBorclu] = useState<BorcluDetay | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      </div>
    </div>
  )
}