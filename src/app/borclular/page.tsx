'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, FileText, Calendar, TrendingUp, Upload, FileImage, FileIcon, X } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { WhatsAppMessageTemplates } from '@/components/whatsapp-message-templates'

interface FileBase64 {
  data: string | ArrayBuffer | null
  filename: string
  type: string
}

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

  // Ödeme sözü bilgisi
  hasActivePaymentPromise?: boolean
}

function BorclularContent() {
  const searchParams = useSearchParams()
  const [borclular, setBorclular] = useState<Borclu[]>([])
  const [filteredBorclular, setFilteredBorclular] = useState<Borclu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    toplam: 0,
    aktif: 0,
    odenen: 0,
    geciken: 0,
    toplamBorc: 0
  })
  const [selectedBorclu, setSelectedBorclu] = useState<Borclu | null>(null)
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false)
  const [whatsAppMessage, setWhatsAppMessage] = useState({
    message: '',
    phoneNumber: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false)
  const [whatsAppStatus, setWhatsAppStatus] = useState<{
    isReady: boolean
    qrCode?: string | null
    message?: string
  } | null>(null)

  // Yardımcı fonksiyonlar
  const getDisplayName = (borclu: Borclu): string => {
    if (borclu.muhatapTanimi) return borclu.muhatapTanimi
    if (borclu.isim) return borclu.isim
    if (borclu.ad && borclu.soyad) return `${borclu.ad} ${borclu.soyad}`
    if (borclu.ad) return borclu.ad
    return 'İsimsiz Borçlu'
  }

  // WhatsApp fonksiyonları
  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-message')
      const data = await response.json()
      setWhatsAppStatus(data)
    } catch (error) {
      console.error('WhatsApp durum kontrolü hatası:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf'
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
        return isValidType && isValidSize
      })
      
      if (validFiles.length !== files.length) {
        alert('Sadece resim (JPG, PNG, GIF) ve PDF dosyaları, maksimum 10MB boyutunda kabul edilir.')
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleWhatsAppOpen = async (borclu: Borclu) => {
    setSelectedBorclu(borclu)
    setWhatsAppMessage({
      message: '',
      phoneNumber: borclu.telefon || ''
    })
    setIsWhatsAppDialogOpen(true)
    await checkWhatsAppStatus()
  }

  const convertFilesToBase64 = async (files: File[]): Promise<FileBase64[]> => {
    const filePromises = files.map(file => {
      return new Promise<FileBase64>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            data: reader.result,
            filename: file.name,
            type: file.type
          })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
    
    return Promise.all(filePromises)
  }

  const handleWhatsAppSend = async () => {
    if (!whatsAppMessage.phoneNumber || !whatsAppMessage.message) {
      alert('Telefon numarası ve mesaj gereklidir')
      return
    }

    setIsWhatsAppSending(true)
    try {
      // Dosyaları base64'e çevir
      let filesData = null
      if (selectedFiles.length > 0) {
        console.log('Converting files to base64:', selectedFiles.length)
        filesData = await convertFilesToBase64(selectedFiles)
        console.log('Files converted:', filesData.length)
      }

      console.log('Sending WhatsApp message with files:', !!filesData)
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: whatsAppMessage.phoneNumber,
          message: whatsAppMessage.message,
          debtorName: selectedBorclu ? getDisplayName(selectedBorclu) : 'Bilinmeyen Borçlu',
          durumTanitici: selectedBorclu?.durumTanitici || 'Bilinmeyen',
          files: filesData
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('WhatsApp mesajı başarıyla gönderildi')
        setIsWhatsAppDialogOpen(false)
        setWhatsAppMessage({ message: '', phoneNumber: '' })
        setSelectedBorclu(null)
        setSelectedFiles([])
      } else {
        // Handle session closed / needs reconnection
        if (result.needsReconnection) {
          setWhatsAppStatus({ isReady: false, qrCode: null, message: 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.' })
          alert('WhatsApp oturumu kapandı. Lütfen sayfayı yenileyip QR kodu ile tekrar bağlanın.')
        } else {
          setWhatsAppStatus({ isReady: false, qrCode: result.qrCode, message: result.error })
          if (!result.qrCode) {
            alert(result.error || 'Mesaj gönderilemedi')
          }
        }
      }
    } catch (error) {
      console.error('WhatsApp mesaj gönderme hatası:', error)
      alert('Mesaj gönderilirken hata oluştu')
    } finally {
      setIsWhatsAppSending(false)
    }
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

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
  }, [urlParams.name, urlParams.durumTanitici, urlParams.sozlesmeHesabi, urlParams.minBorc, urlParams.maxBorc, urlParams.telefon, urlParams.tcKimlik])

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

        console.log('API Response:', data)
        console.log('Processed list:', list)
        console.log('Ödeme sözü olan borçlular:', list.filter(b => b.hasActivePaymentPromise))
        setBorclular(list)
        // İstatistikler zaten stats API'den alındı, tekrar hesaplama
      }
    } catch (error) {
      console.error('Borçlular yüklenirken hata:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Borçlular yükleniyor...</div>
      </div>

      {/* WhatsApp Mesaj Gönderme Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">WhatsApp Mesaj</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedBorclu && getDisplayName(selectedBorclu)} için mesaj
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            {whatsAppStatus && !whatsAppStatus.isReady && whatsAppStatus.qrCode && (
              <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800 mb-1">
                  QR tarayın:
                </p>
                <img 
                  src={whatsAppStatus.qrCode} 
                  alt="WhatsApp QR Code" 
                  className="mx-auto max-w-[120px] border rounded"
                />
                <p className="text-xs text-yellow-700 mt-1">
                  Telefonunuzla QR kodu okuttuktan sonra tekrar deneyin.
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="whatsapp-phone" className="text-xs font-medium mb-1 block">
                Telefon
              </label>
              <Input
                id="whatsapp-phone"
                type="tel"
                placeholder="05xxxxxxxxx"
                value={whatsAppMessage.phoneNumber}
                onChange={(e) => setWhatsAppMessage({ ...whatsAppMessage, phoneNumber: e.target.value })}
                className="w-full text-sm h-8"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium mb-1 block">
                Şablonlar
              </label>
              <WhatsAppMessageTemplates
                onSelectTemplate={(template) => {
                  setWhatsAppMessage({ ...whatsAppMessage, message: template.content })
                }}
                debtorInfo={selectedBorclu ? {
                  name: getDisplayName(selectedBorclu),
                  debt: selectedBorclu.guncelBorc || 0,
                  dueDate: selectedBorclu.takipTarihi ? new Date(selectedBorclu.takipTarihi).toLocaleDateString('tr-TR') : undefined
                } : undefined}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">
                Dosya Ekle (Resim/PDF)
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Dosya Seç
                  </Button>
                  <span className="text-xs text-gray-500">
                    Resim veya PDF (max 10MB)
                  </span>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                        <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') ? (
                            <FileImage className="w-3 h-3 text-blue-500" />
                          ) : (
                            <FileIcon className="w-3 h-3 text-red-500" />
                          )}
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <span className="text-gray-400">
                            ({(file.size / 1024 / 1024).toFixed(1)}MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              
            <div>
              <label htmlFor="whatsapp-message" className="text-xs font-medium mb-1 block">
                Mesaj
              </label>
              <Textarea
                id="whatsapp-message"
                placeholder="Mesajınızı yazın..."
                value={whatsAppMessage.message}
                onChange={(e) => setWhatsAppMessage({ ...whatsAppMessage, message: e.target.value })}
                className="w-full text-sm"
                rows={2}
              />
            </div>
          </div>
            
            {whatsAppStatus && (
              <div className={`p-2 rounded text-xs ${
                whatsAppStatus.isReady 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                <strong>Durum:</strong> {whatsAppStatus.message || 'Bilinmiyor'}
              </div>
            )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsWhatsAppDialogOpen(false)
                setSelectedBorclu(null)
                setWhatsAppMessage({ message: '', phoneNumber: '' })
                setSelectedFiles([])
              }}
              disabled={isWhatsAppSending}
              size="sm"
            >
              İptal
            </Button>
            <Button
              onClick={handleWhatsAppSend}
              disabled={isWhatsAppSending || (whatsAppStatus ? !whatsAppStatus.isReady : false)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isWhatsAppSending ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam</p>
                <p className="text-lg font-bold">{stats.toplam}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Aktif</p>
                <p className="text-lg font-bold text-blue-600">{stats.aktif}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ödenen</p>
                <p className="text-lg font-bold text-green-600">{stats.odenen}</p>
              </div>
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Geciken</p>
                <p className="text-lg font-bold text-red-600">{stats.geciken}</p>
              </div>
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
          </Card>

          <Card className="p-3 md:col-span-1 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam Borç</p>
                <p className="text-lg font-bold">{stats.toplamBorc.toLocaleString('tr-TR')} ₺</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Arama */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Muhatap tanımı, TC kimlik, durum tanıtıcı veya icra dosya numarası ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Borçlu Listesi */}
        <div className="grid gap-3">
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
            filteredBorclular.map((borclu) => {
              console.log(`Borçlu ${borclu.durumTanitici} (${borclu.muhatapTanimi}): hasActivePaymentPromise = ${borclu.hasActivePaymentPromise}`)
              return (
                <Card key={borclu.id} className="p-3 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {composeName(borclu)}
                        </h3>
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 shrink-0">
                          {borclu.durumTanitici}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Kişisel Bilgiler */}
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-gray-50 px-3 py-1 rounded-full border">
                            <span className="text-xs font-medium text-gray-600">TCKN:</span>
                            <span className="text-xs font-mono text-gray-900 ml-1">
                              {borclu.ilgiliTCKN || borclu.tcKimlikNo || 'Belirtilmemiş'}
                            </span>
                          </div>
                          {borclu.telefon && (
                            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              <span className="text-xs font-medium text-green-600">Telefon:</span>
                              <span className="text-xs font-mono text-green-800 ml-1">{borclu.telefon}</span>
                            </div>
                          )}
                        </div>

                        {/* Lokasyon ve Hukuki Bilgiler */}
                        <div className="flex flex-wrap gap-2">
                          {borclu.il && (
                            <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              <span className="text-xs font-medium text-blue-600">İl:</span>
                              <span className="text-xs font-semibold text-blue-800 ml-1">{borclu.il}</span>
                            </div>
                          )}
                          {borclu.icraDosyaNumarasi && (
                            <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                              <span className="text-xs font-medium text-orange-600">İcra No:</span>
                              <span className="text-xs font-mono font-bold text-orange-800 ml-1">{borclu.icraDosyaNumarasi}</span>
                            </div>
                          )}
                        </div>

                        {/* Sözleşme Bilgisi */}
                        {borclu.sozlesmeHesabi && (
                          <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                            <span className="text-xs font-medium text-purple-600">Sözleşme Hesabı:</span>
                            <span className="text-xs font-mono text-purple-800 ml-2">{borclu.sozlesmeHesabi}</span>
                          </div>
                        )}
                      </div>
                      
                      {borclu.hasActivePaymentPromise && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <p className="text-yellow-700 font-medium flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Ödeme Taahhüdü Mevcut
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="bg-green-50 p-2 rounded border border-green-200 min-w-[120px]">
                        <p className="text-lg font-bold text-green-800">
                          ₺{(borclu.guncelBorc || borclu.borcMiktari || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-green-700 font-medium">Güncel Borç</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Link href={`/borclular/${borclu.id}`} className="w-full">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 w-full"
                          >
                            Detay
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

export default function BorclularPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <BorclularContent />
    </Suspense>
  )
}