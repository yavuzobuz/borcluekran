'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Borclu {
  // Prisma schema'ya uygun field'lar
  id: number
  ilgiliTCKN?: string
  avukatAtamaTarihi?: string
  durum?: string
  durumTanitici: string
  muhatapTanimi?: string
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
  muhatapTanimiEk?: string
  uyapDurumu?: string
  telefonTesisat?: string
  tesisatDurumuTanimi?: string
  kayitTarihi?: string
  guncellemeTarihi?: string
  
  // Eski alanlar (geriye uyumluluk için)
  isim?: string
  ad?: string
  soyad?: string
  tcKimlik?: string
  borcMiktari?: number
  sonOdemeTarihi?: string
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
      const response = await fetch('/api/search?q=&limit=1000')
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
            <Card key={borclu.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-primary">
                      {borclu.muhatapTanimi || `Borçlu (TC: ${borclu.ilgiliTCKN || borclu.tcKimlikNo || 'Bilinmiyor'})`}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {borclu.durumTanitici}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">İlgili TCKN:</span> {borclu.ilgiliTCKN || 'Belirtilmemiş'}
                    </p>
                    {borclu.il && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">İl:</span> {borclu.il}
                      </p>
                    )}
                    {borclu.telefon && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Telefon:</span> {borclu.telefon}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-green-700">
                      ₺{(borclu.guncelBorc || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Güncel Borç</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  {borclu.icraDosyaNumarasi && (
                    <span>İcra Dosya: {borclu.icraDosyaNumarasi}</span>
                  )}
                </div>
                <Link href={`/borclular/${borclu.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-700"
                  >
                    Detay Görüntüle
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}