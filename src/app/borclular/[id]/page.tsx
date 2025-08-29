'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Plus, AlertTriangle, MessageCircle, Upload, FileImage, FileText as FileIcon, X } from 'lucide-react'
import { PaymentPromisesList } from '@/components/payment-promises-list'
import { Header } from '@/components/header'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { WhatsAppMessageTemplates } from '@/components/whatsapp-message-templates'

interface FileBase64 {
  data: string | ArrayBuffer | null
  filename: string
  type: string
}

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

  const getDisplayName = (borclu: BorcluDetay) => {
    return borclu.muhatapTanimi || 'İsimsiz Borçlu'
  }

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-message')
      const data = await response.json()
      setWhatsAppStatus(data)
    } catch (error) {
      console.error('WhatsApp durumu kontrol edilirken hata:', error)
      setWhatsAppStatus({ isReady: false, message: 'Durum kontrol edilemedi' })
    }
  }

  const handleWhatsAppOpen = () => {
    if (borclu) {
      setWhatsAppMessage({
        message: '',
        phoneNumber: borclu.telefon || ''
      })
      setIsWhatsAppDialogOpen(true)
      checkWhatsAppStatus()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf'
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit (WhatsApp limit)
        return isValidType && isValidSize
      })

      if (validFiles.length !== files.length) {
        alert('Sadece resim (JPG, PNG, GIF) ve PDF dosyaları, maksimum 5MB boyutunda kabul edilir.')
      }

      console.log('Selected files:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
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
      alert('Lütfen telefon numarası ve mesaj alanlarını doldurun')
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: whatsAppMessage.phoneNumber,
          message: whatsAppMessage.message,
          debtorName: borclu ? getDisplayName(borclu) : 'Bilinmeyen Borçlu',
          durumTanitici: borclu?.durumTanitici || 'Bilinmeyen',
          files: filesData
        })
      })

      const result = await response.json()
      console.log('WhatsApp send result:', result)

      if (result.success) {
        alert('WhatsApp mesajı başarıyla gönderildi')
        setIsWhatsAppDialogOpen(false)
        setWhatsAppMessage({ message: '', phoneNumber: '' })
        setSelectedFiles([])
      } else {
        console.error('WhatsApp send failed:', result)

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
      console.error('WhatsApp mesajı gönderme hatası:', error)
      alert('Mesaj gönderilirken bir hata oluştu')
    } finally {
      setIsWhatsAppSending(false)
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {borclu.muhatapTanimi}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {borclu.durumTanitici}
                  </span>
                </div>
              </div>
            </div>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kişisel Bilgiler */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="text-base font-medium">Kişisel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">TC Kimlik No</label>
                  <p className="font-medium text-gray-900">{borclu.tcKimlikNo || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">İlgili TCKN</label>
                  <p className="font-medium text-gray-900">{borclu.ilgiliTCKN || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vergi No</label>
                  <p className="font-medium text-gray-900">{borclu.vergiNo || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Borçlu Tipi</label>
                  <p className="font-medium text-gray-900">{borclu.borcluTipiTanimi || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-green-500 text-white">
              <CardTitle className="text-base font-medium">İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Telefon</label>
                  <p className="font-medium text-gray-900">{borclu.telefon || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Telefon Abone Grubu</label>
                  <p className="font-medium text-gray-900">{borclu.telefonAboneGrubu || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tesisat Telefonu</label>
                  <p className="font-medium text-gray-900">{borclu.telefonTesisat || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-purple-500 text-white">
              <CardTitle className="text-base font-medium">Adres Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Detaylı Adres</label>
                  <p className="font-medium text-gray-900">{borclu.adresBilgileri || 'Belirtilmemiş'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">İl</label>
                    <p className="font-medium text-gray-900">{borclu.il || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">İlçe</label>
                    <p className="font-medium text-gray-900">{borclu.ilce || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finansal Bilgiler */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-emerald-500 text-white">
              <CardTitle className="text-base font-medium">Finansal Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Güncel Borç</label>
                  <p className="font-bold text-red-600">
                    {formatCurrency(borclu.guncelBorc)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Asıl Alacak</label>
                  <p className="font-medium text-gray-900">{formatCurrency(borclu.asilAlacak)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Takip Çıkış Miktarı</label>
                  <p className="font-medium text-gray-900">{formatCurrency(borclu.takipCikisMiktari)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Toplam Açık Tutar</label>
                  <p className="font-medium text-gray-900">{formatCurrency(borclu.toplamAcikTutar)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vekalet Ücreti</label>
                  <p className="font-medium text-gray-900">{formatCurrency(borclu.vekaletUcreti)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hukuki Bilgiler */}
          <div className="lg:col-span-2">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="bg-red-500 text-white">
                <CardTitle className="text-base font-medium">Hukuki Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sol Kolon */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sözleşme Hesabı</label>
                      <p className="font-mono text-sm font-medium text-gray-900 mt-1">{borclu.sozlesmeHesabi || '5001697618'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Takip Tarihi</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.takipTarihi ? new Date(borclu.takipTarihi).toLocaleDateString('tr-TR') : '10.12.2024'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avukat Atama Tarihi</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.avukatAtamaTarihi ? new Date(borclu.avukatAtamaTarihi).toLocaleDateString('tr-TR') : '10.12.2024'}</p>
                    </div>
                  </div>

                  {/* Orta Kolon */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">İcra Dairesi</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.icraDairesiTanimi || 'İstanbul Anadolu 23. İcra Dairesi'}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">İcra Dosya No</label>
                      <p className="font-mono text-sm font-bold text-gray-900 mt-1">{borclu.icraDosyaNumarasi || '2024/16087'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hitam Tarihi</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.hitamTarihi ? new Date(borclu.hitamTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</p>
                    </div>
                  </div>

                  {/* Sağ Kolon */}
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <label className="text-xs font-semibold text-green-600 uppercase tracking-wide">Durum Tanıtıcı</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.durumTanitici || '25 Derdest'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Durum Tanımı</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.durumTanimi || 'Belirtilmemiş'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">İtiraz Durumu</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{borclu.itirazDurumu || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ödeme Sözleri */}
          <div className="lg:col-span-2">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="bg-red-500 text-white">
                <CardTitle className="text-base font-medium">Ödeme Sözleri</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <PaymentPromisesList
                  durumTanitici={borclu.durumTanitici}
                  onAddPromise={() => setIsDialogOpen(true)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="lg:col-span-2 mt-8">
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ödeme Sözü Ekle */}
                <div
                  onClick={() => setIsDialogOpen(true)}
                  className="group cursor-pointer bg-white rounded-xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-green-700">Ödeme Sözü</h3>
                      <p className="text-sm text-gray-500 mt-1">Yeni taahhüt ekle</p>
                    </div>
                  </div>
                </div>

                {/* Ödeme Sözleri Görüntüle */}
                <Link href={`/odeme-sozleri?durumTanitici=${borclu?.durumTanitici}`}>
                  <div className="group cursor-pointer bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-700">Ödeme Sözleri</h3>
                        <p className="text-sm text-gray-500 mt-1">Taahhütleri görüntüle</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* WhatsApp Mesaj Gönder */}
                <div
                  onClick={handleWhatsAppOpen}
                  className="group cursor-pointer bg-white rounded-xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-green-700">WhatsApp</h3>
                      <p className="text-sm text-gray-500 mt-1">Mesaj gönder</p>
                    </div>
                  </div>
                </div>

                {/* Borçlu Listesi */}
                <Link href="/borclular">
                  <div className="group cursor-pointer bg-white rounded-xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-purple-700">Geri Dön</h3>
                        <p className="text-sm text-gray-500 mt-1">Borçlu listesine</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ödeme Sözü Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Ödeme Sözü Ekle</DialogTitle>
              <DialogDescription>
                Bu borçlu için yeni bir ödeme sözü ekleyin
              </DialogDescription>
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

        {/* WhatsApp Dialog */}
        <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">WhatsApp Mesaj</DialogTitle>
              <DialogDescription className="text-xs">
                {getDisplayName(borclu)} için mesaj
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
                  debtorInfo={{
                    name: getDisplayName(borclu),
                    debt: borclu?.guncelBorc || 0,
                    dueDate: borclu?.takipTarihi ? new Date(borclu.takipTarihi).toLocaleDateString('tr-TR') : undefined,
                    contractNumber: borclu?.sozlesmeHesabi || '5001697618',
                    statusDescription: borclu?.durumTanitici || '25 Derdest',
                    executionOffice: borclu?.icraDairesiTanimi || 'İstanbul Anadolu 23. İcra Dairesi',
                    executionNumber: borclu?.icraDosyaNumarasi || '2024/16087'
                  }}
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
              <div className={`p-2 rounded text-xs ${whatsAppStatus.isReady
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
    </div>
  )
}