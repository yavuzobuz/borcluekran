'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Borclu {
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
  isim?: string
  ad?: string
  soyad?: string
  tcKimlik?: string
  borcMiktari?: number
  sonOdemeTarihi?: string
  durum?: string
  vadeTarihi?: string
}

export default function BorclularPage() {
  const [borclular, setBorclular] = useState<Borclu[]>([])
  const [filteredBorclular, setFilteredBorclular] = useState<Borclu[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    toplam: 0,
    aktif: 0,
    odenen: 0,
    geciken: 0,
    toplamBorc: 0
  })

  useEffect(() => {
    fetchBorclular()
  }, [])

  useEffect(() => {
    const filtered = borclular.filter(borclu => 
      (borclu.muhatapTanimi?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (borclu.ad?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (borclu.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (borclu.tcKimlikNo?.includes(searchTerm) || false) ||
      (borclu.tcKimlik?.includes(searchTerm) || false) ||
      (borclu.ilgiliTCKN?.includes(searchTerm) || false) ||
      borclu.durumTanitici.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (borclu.icraDosyaNumarasi?.includes(searchTerm) || false)
    )
    setFilteredBorclular(filtered)
  }, [searchTerm, borclular])

  const fetchBorclular = async () => {
    try {
      const response = await fetch('/api/search?q=')
      if (response.ok) {
        const data = await response.json()
        setBorclular(data.results || [])
        calculateStats(data.results || [])
      }
    } catch (error) {
      console.error('Borçlular yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Borclu[]) => {
    const stats = {
      toplam: data.length,
      aktif: data.filter(b => b.odemeDurumu === 'aktif' || b.durum === 'aktif').length,
      odenen: data.filter(b => b.odemeDurumu === 'odendi' || b.durum === 'odendi').length,
      geciken: data.filter(b => b.odemeDurumu === 'gecikme' || b.durum === 'gecikme').length,
      toplamBorc: data.reduce((sum, b) => sum + (b.guncelBorc || b.borcMiktari || 0), 0)
    }
    setStats(stats)
  }

  const getDurumBadge = (borclu: Borclu) => {
    const durum = borclu.odemeDurumu || borclu.durum || 'bilinmiyor'
    switch (durum) {
      case 'aktif':
        return <Badge variant="default">Aktif</Badge>
      case 'odendi':
        return <Badge variant="secondary">Ödendi</Badge>
      case 'gecikme':
        return <Badge variant="destructive">Gecikme</Badge>
      default:
        return <Badge variant="outline">{durum}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Borçlular yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Borçlu Listesi</h1>
        <p className="text-muted-foreground">Tüm borçluları görüntüleyin ve yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borçlu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.toplam}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.aktif}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ödenen</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.odenen}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geciken</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.geciken}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.toplamBorc.toLocaleString('tr-TR')} ₺</div>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Muhatap tanımı, TC kimlik, durum tanıtıcı veya icra dosya numarası ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Borçlu Listesi */}
      <div className="grid gap-4">
        {filteredBorclular.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Henüz borçlu kaydı bulunmuyor.</p>
              <Link href="/analiz">
                <Button className="mt-4">
                  Excel Dosyası Yükle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredBorclular.map((borclu) => (
            <Card key={borclu.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">
                        {borclu.muhatapTanimi || `${borclu.ad || ''} ${borclu.soyad || ''}`.trim()}
                      </h3>
                      {getDurumBadge(borclu)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">İlgili TCKN:</span> {borclu.ilgiliTCKN}
                      </div>
                      <div>
                        <span className="font-medium">Durum Tanıtıcı:</span> {borclu.durumTanitici}
                      </div>
                      <div>
                        <span className="font-medium">Güncel Borç:</span> {(borclu.guncelBorc || borclu.borcMiktari || 0).toLocaleString('tr-TR')} ₺
                      </div>
                      <div>
                        <span className="font-medium">TC Kimlik No:</span> {borclu.tcKimlikNo || borclu.tcKimlik}
                      </div>
                    </div>
                    {(borclu.icraDosyaNumarasi || borclu.il || borclu.telefon1) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-2">
                        {borclu.icraDosyaNumarasi && (
                          <div>
                            <span className="font-medium">İcra Dosya No:</span> {borclu.icraDosyaNumarasi}
                          </div>
                        )}
                        {borclu.il && (
                          <div>
                            <span className="font-medium">İl:</span> {borclu.il}
                          </div>
                        )}
                        {borclu.telefon1 && (
                          <div>
                            <span className="font-medium">Telefon:</span> {borclu.telefon1}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/borclu/${borclu.durumTanitici}`}>
                      <Button variant="outline" size="sm">
                        Detay
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}