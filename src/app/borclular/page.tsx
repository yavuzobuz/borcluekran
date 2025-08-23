'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'

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
  const searchParams = useSearchParams()
  const [borclular, setBorclular] = useState<Borclu[]>([])
  const [paymentPromises, setPaymentPromises] = useState<{[key: string]: boolean}>({})
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

  // URL parametrelerini oku
  const urlParams = {
    name: searchParams.get('name') || '',
    durumTanitici: searchParams.get('durumTanitici') || '',
    sozlesmeHesabi: searchParams.get('sozlesmeHesabi') || '',
    telefon: searchParams.get('telefon') || '',
    tcKimlik: searchParams.get('tcKimlik') || '',
    minBorc: searchParams.get('minBorc') || '',
    maxBorc: searchParams.get('maxBorc') || ''
  }

  // Adres bilgilerini kontrol eden fonksiyon
  const isAddressLike = (text: string): boolean => {
    if (!text) return false
    const upperText = text.toUpperCase().trim()
    
    const addressKeywords = [
      'MAH', 'MAHALLE', 'MAHALLESI', 'SOK', 'SOKAK', 'SOKAĞI', 'CAD', 'CADDE', 'CADDESİ',
      'NO', 'NUMARA', 'APT', 'APARTMAN', 'APARTMANI', 'BLOK', 'KAT', 'DAİRE', 'DAIRE',
      'MERKEZ', 'KUZEY', 'GÜNEY', 'DOĞU', 'BATI', 'YENİ', 'ESKİ'
    ]
    
    const hasAddressKeywords = addressKeywords.some(keyword => upperText.includes(keyword))
    const hasNumberPattern = /\b\d+\s+[A-ZÇĞIİÖŞÜ]+|[A-ZÇĞIİÖŞÜ]+\s+\d+\b/.test(upperText)
    const isTooLong = upperText.length > 50
    const hasMultipleSlashes = (upperText.match(/\//g) || []).length > 1
    
    return hasAddressKeywords || hasNumberPattern || isTooLong || hasMultipleSlashes
  }

  // İsim/Şirket benzeri olup olmadığını kontrol eden fonksiyon
  const isNameLike = (text: string): boolean => {
    if (!text) return false
    const trimmed = text.trim()
    
    if (trimmed.length < 2 || trimmed.length > 100) return false
    
    if (isAddressLike(trimmed)) return false
    
    // Şirket isimleri için genişletilmiş pattern
    const namePattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü0-9\s\.\-&VE]+$/
    if (!namePattern.test(trimmed)) return false
    
    // Şirket anahtar kelimeleri
    const companyKeywords = [
      'LTD', 'ŞTİ', 'A.Ş', 'AŞ', 'LLC', 'INC', 'CORP', 'CO', 'COMPANY', 'ŞİRKETİ',
      'TİCARET', 'SANAYİ', 'İNŞAAT', 'GIDA', 'TEKSTİL', 'OTOMOTİV', 'ELEKTRONİK',
      'MARKET', 'MAĞAZA', 'RESTORAN', 'CAFE', 'OTEL', 'HASTANE', 'KLİNİK',
      'ECZANE', 'BERBER', 'KUAFÖR', 'TAMİR', 'SERVİS', 'ATÖLYE'
    ]
    
    const upperText = trimmed.toUpperCase()
    const hasCompanyKeyword = companyKeywords.some(keyword => upperText.includes(keyword))
    
    // Eğer şirket anahtar kelimesi varsa, kesinlikle isim benzeri
    if (hasCompanyKeyword) return true
    
    // Kişi ismi kontrolü
    const personNamePattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü\s]+$/
    if (personNamePattern.test(trimmed)) {
      if (!/^\d{11}$/.test(trimmed.replace(/\s/g, ''))) {
        return true
      }
    }
    
    // Karma isim/şirket (harf + sayı kombinasyonu)
    const mixedPattern = /^[A-ZÇĞIİÖŞÜa-zçğıiöşü][A-ZÇĞIİÖŞÜa-zçğıiöşü0-9\s\.\-&]*$/
    if (mixedPattern.test(trimmed)) {
      const digitCount = (trimmed.match(/\d/g) || []).length
      if (digitCount < trimmed.length / 2) {
        return true
      }
    }
    
    return false
  }

  // İsim oluşturma: temizlenmiş ve doğrulanmış muhatap tanımları -> ad+soyad -> TC kimlik -> "İsimsiz Borçlu"
  const composeName = (b: Borclu) => {
    // Ad ve soyad varsa birleştir
    const fullName = [b.ad, b.soyad].filter(Boolean).join(' ').trim()
    
    // Muhatap tanımını temizle ve doğrula
    let cleanMuhatapTanimi = b.muhatapTanimi ? b.muhatapTanimi.trim() : ''
    
    // "Borçlu" kelimesini içeren tanımları temizle
    if (cleanMuhatapTanimi.toLowerCase() === 'borçlu' || cleanMuhatapTanimi.toLowerCase() === 'borclu') {
      cleanMuhatapTanimi = ''
    }
    
    // TC kimlik numarası içeren tanımları temizle
    if (/^\d{11}$/.test(cleanMuhatapTanimi.replace(/\s/g, ''))) {
      cleanMuhatapTanimi = ''
    }
    
    // "CENGİZ KAMA / ÇAKMAK-MERKEZ" gibi formatta ise, ilk kısmı al ve doğrula
    if (cleanMuhatapTanimi && cleanMuhatapTanimi.includes('/')) {
      const parts = cleanMuhatapTanimi.split('/')
      if (parts.length > 0 && parts[0].trim()) {
        const firstPart = parts[0].trim()
        if (isNameLike(firstPart)) {
          cleanMuhatapTanimi = firstPart
        } else {
          cleanMuhatapTanimi = ''
        }
      }
    }
    
    // Adres benzeri metinleri temizle
    if (cleanMuhatapTanimi && isAddressLike(cleanMuhatapTanimi)) {
      cleanMuhatapTanimi = ''
    }
    
    // İsim benzeri değilse temizle
    if (cleanMuhatapTanimi && !isNameLike(cleanMuhatapTanimi)) {
      cleanMuhatapTanimi = ''
    }
    
    // Muhatap tanımı ek'i temizle ve doğrula
    let cleanMuhatapTanimiEk = b.muhatapTanimiEk ? b.muhatapTanimiEk.trim() : ''
    if (cleanMuhatapTanimiEk.toLowerCase().includes('borçlu') || cleanMuhatapTanimiEk.toLowerCase().includes('borclu')) {
      cleanMuhatapTanimiEk = ''
    }
    if (cleanMuhatapTanimiEk && (isAddressLike(cleanMuhatapTanimiEk) || !isNameLike(cleanMuhatapTanimiEk))) {
      cleanMuhatapTanimiEk = ''
    }
    
    // TC kimlik numarası varsa onu göster (son çare olarak)
    const tcKimlik = b.ilgiliTCKN || b.tcKimlikNo
    const tcDisplay = tcKimlik && tcKimlik !== 'Belirtilmemiş' ? `TC: ${tcKimlik}` : undefined
    
    return (
      (cleanMuhatapTanimi || undefined) ||
      (cleanMuhatapTanimiEk || undefined) ||
      (fullName || undefined) ||
      (b.isim?.trim() || undefined) ||
      tcDisplay ||
      'İsimsiz Borçlu'
    )
  }

  useEffect(() => {
    fetchBorclular()
  }, [urlParams.name, urlParams.durumTanitici, urlParams.minBorc, urlParams.maxBorc, urlParams.telefon, urlParams.tcKimlik])

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
    // Filtrelenmiş borçlular için ödeme sözü kontrolü yap
    if (filtered.length > 0) {
      checkPaymentPromises(filtered)
    }
  }, [searchTerm, borclular])

  const fetchBorclular = async () => {
    try {
      // Önce stats API'den gerçek istatistikleri al
      const statsResponse = await fetch('/api/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          toplam: statsData.totalDebtors,
          aktif: statsData.activeDebtors,
          odenen: statsData.paidDebtors,
          geciken: statsData.problematicDebtors,
          toplamBorc: statsData.totalDebt
        })
      }
      
      // URL parametrelerini API çağrısında kullan - tüm kayıtları getir
      const queryParams = new URLSearchParams({
        limit: '10000'
      })
      
      if (urlParams.name) {
        queryParams.set('isim', urlParams.name)
      }
      if (urlParams.durumTanitici) {
        queryParams.set('durumTanitici', urlParams.durumTanitici)
      }
      if (urlParams.minBorc) {
        queryParams.set('minBorcMiktari', urlParams.minBorc)
      }
      if (urlParams.maxBorc) {
        queryParams.set('maxBorcMiktari', urlParams.maxBorc)
      }
      if (urlParams.telefon) {
        queryParams.set('telefon', urlParams.telefon)
      }
      if (urlParams.sozlesmeHesabi) {
        queryParams.set('sozlesmeHesabi', urlParams.sozlesmeHesabi)
      }
      if (urlParams.tcKimlik) {
        queryParams.set('tcKimlik', urlParams.tcKimlik)
      }
      
      // Sonra borçlu listesini al
      const response = await fetch(`/api/search?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const raw: Borclu[] = Array.isArray(data.data) ? data.data : []
        
        // Daha agresif normalizasyon - her kayıt için muhatapTanimi'ni doldur
        const list: Borclu[] = raw.map((b) => {
          // Ad ve soyad varsa birleştir
          const fullName = [b.ad, b.soyad].filter(Boolean).join(' ').trim()
          
          // Muhatap tanımını temizle (eğer "Borçlu" içeriyorsa)
          let cleanMuhatapTanimi = b.muhatapTanimi ? b.muhatapTanimi.trim() : ''
          if (cleanMuhatapTanimi.toLowerCase().includes('borçlu') || cleanMuhatapTanimi.toLowerCase().includes('borclu')) {
            cleanMuhatapTanimi = ''
          }
          
          // Muhatap tanımı ek'i temizle (eğer "Borçlu" içeriyorsa)
          let cleanMuhatapTanimiEk = b.muhatapTanimiEk ? b.muhatapTanimiEk.trim() : ''
          if (cleanMuhatapTanimiEk.toLowerCase().includes('borçlu') || cleanMuhatapTanimiEk.toLowerCase().includes('borclu')) {
            cleanMuhatapTanimiEk = ''
          }
          
          // İsim öncelik sırası: temizlenmiş muhatapTanimi -> temizlenmiş muhatapTanimiEk -> ad+soyad -> isim -> "İsimsiz Borçlu"
          const normalizedName = 
            cleanMuhatapTanimi || 
            cleanMuhatapTanimiEk || 
            fullName || 
            (b.isim && b.isim.trim()) || 
            "İsimsiz Borçlu"
          
          return {
            ...b,
            muhatapTanimi: normalizedName
          }
        })
        
        setBorclular(list)
        // Ödeme sözü kontrolü yap
        checkPaymentPromises(list)
        // İstatistikler zaten stats API'den alındı, tekrar hesaplama
      }
    } catch (error) {
      console.error('Borçlular yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  // Ödeme sözü kontrolü fonksiyonu
  const checkPaymentPromises = async (borclularList: Borclu[]) => {
    try {
      const promises: {[key: string]: boolean} = {}
      
      // Her borçlu için ödeme sözü kontrolü yap
      for (const borclu of borclularList) {
        try {
          const response = await fetch(`/api/odeme-sozleri/${borclu.durumTanitici}`)
          if (response.ok) {
            const data = await response.json()
            promises[borclu.durumTanitici] = data.odeme_sozleri && data.odeme_sozleri.length > 0
          } else {
            promises[borclu.durumTanitici] = false
          }
        } catch (error) {
          promises[borclu.durumTanitici] = false
        }
      }
      
      setPaymentPromises(promises)
    } catch (error) {
      console.error('Ödeme sözü kontrolü hatası:', error)
    }
  }

  const calculateStats = (data: Borclu[]) => {
    const stats = {
      toplam: data.length,
      // Durum tanımına göre aktif olanları say
      aktif: data.filter(b => {
        const durum = b.durumTanimi?.toLowerCase() || b.durum?.toLowerCase() || ''
        return durum.includes('derdest') || durum.includes('takip') || durum.includes('icra') || durum.includes('aktif')
      }).length,
      // Ödenen/kapatılan durumları say
      odenen: data.filter(b => {
        const durum = b.durumTanimi?.toLowerCase() || b.durum?.toLowerCase() || ''
        return durum.includes('ödendi') || durum.includes('kapandı') || durum.includes('tahsil') || durum.includes('hitam')
      }).length,
      // Geciken/problemli durumları say
      geciken: data.filter(b => {
        const durum = b.durumTanimi?.toLowerCase() || b.durum?.toLowerCase() || ''
        const itiraz = b.itirazDurumu?.toLowerCase() || ''
        return durum.includes('gecik') || durum.includes('itiraz') || itiraz.includes('var') || durum.includes('problem')
      }).length,
      // Toplam borç hesapla
      toplamBorc: data.reduce((sum, b) => {
        const borc = b.guncelBorc || b.borcMiktari || b.toplamAcikTutar || 0
        return sum + (typeof borc === 'number' ? borc : 0)
      }, 0)
    }
    setStats(stats)
  }

  const getDurumBadge = (borclu: Borclu) => {
    const durumTanimi = borclu.durumTanimi || borclu.durum || 'Bilinmiyor'
    const durumLower = durumTanimi.toLowerCase()
    
    if (durumLower.includes('derdest') || durumLower.includes('takip') || durumLower.includes('icra')) {
      return <Badge variant="default">{durumTanimi}</Badge>
    } else if (durumLower.includes('ödendi') || durumLower.includes('kapandı') || durumLower.includes('tahsil')) {
      return <Badge variant="secondary">{durumTanimi}</Badge>
    } else if (durumLower.includes('gecik') || durumLower.includes('itiraz') || durumLower.includes('problem')) {
      return <Badge variant="destructive">{durumTanimi}</Badge>
    } else {
      return <Badge variant="outline">{durumTanimi}</Badge>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Borçlu Listesi</h1>
          <p className="text-lg text-gray-600">Tüm borçluları görüntüleyin ve yönetin</p>
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
              <Link href="/excel">
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
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-xl text-gray-900">
                      {composeName(borclu)}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {borclu.durumTanitici}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base text-gray-700">
                      <span className="font-semibold text-gray-900">İlgili TCKN:</span> <span className="font-medium">{borclu.ilgiliTCKN || borclu.tcKimlikNo || 'Belirtilmemiş'}</span>
                    </p>
                    {borclu.il && (
                      <p className="text-base text-gray-700">
                        <span className="font-semibold text-gray-900">İl:</span> <span className="font-medium">{borclu.il}</span>
                      </p>
                    )}
                    {borclu.telefon && (
                      <p className="text-base text-gray-700">
                        <span className="font-semibold text-gray-900">Telefon:</span> <span className="font-medium">{borclu.telefon}</span>
                      </p>
                    )}
                    {borclu.icraDosyaNumarasi && (
                      <p className="text-base text-gray-700">
                        <span className="font-semibold text-gray-900">İcra Dosya:</span> <span className="font-medium">{borclu.icraDosyaNumarasi}</span>
                      </p>
                    )}
                    {borclu.sozlesmeHesabi && (
                      <p className="text-base text-gray-700">
                        <span className="font-semibold text-gray-900">Sözleşme Hesabı:</span> <span className="font-medium">{borclu.sozlesmeHesabi}</span>
                      </p>
                    )}
                    {paymentPromises[borclu.durumTanitici] && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-base text-red-700 font-semibold flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Ödeme Taahhüdü Mevcut
                        </p>
                        <p className="text-sm text-red-600 mt-1 font-medium">
                          Bu borçlu için aktif ödeme sözü bulunmaktadır.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-800">
                      ₺{(borclu.guncelBorc || borclu.borcMiktari || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-green-700 font-semibold">Güncel Borç</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center pt-3 border-t">
                <Link href={`/borclular/${borclu.id}`}>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md px-4"
                  >
                    Detay Görüntüle
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
      </main>
    </div>
  )
}