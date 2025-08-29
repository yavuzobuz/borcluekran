'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Search, Filter, Download, Upload, MessageCircle, Check, X, FileImage, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { WhatsAppMessageTemplates } from '@/components/whatsapp-message-templates'

interface Debtor {
  durumTanitici: string
  isim: string
  borcMiktari: number
  sonOdemeTarihi?: string
  durum: string
  telefon?: string
  email?: string
  muhatapTanimi?: string
  muhatapTanimiEk?: string
  ad?: string
  soyad?: string
  ilgiliTCKN?: string
}

interface SearchFilters {
  isim: string
  durumTanitici: string
  minBorcMiktari: string
  maxBorcMiktari: string
  durum: string
}

interface FileBase64 {
  data: string | ArrayBuffer | null
  filename: string
  type: string
}

export default function BorcluListesiPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [filteredDebtors, setFilteredDebtors] = useState<Debtor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({
    isim: '',
    durumTanitici: '',
    minBorcMiktari: '',
    maxBorcMiktari: '',
    durum: ''
  })
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([])
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false)
  const [whatsAppMessage, setWhatsAppMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false)
  const [whatsAppStatus, setWhatsAppStatus] = useState<{
    isReady: boolean
    message: string
    qrCode?: string
  } | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    fetchDebtors()
  }, [currentPage, filters])

  const fetchDebtors = async () => {
    setIsLoading(true)
    try {
      // Gerçek API çağrısı
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.isim && { isim: filters.isim }),
        ...(filters.durumTanitici && { durumTanitici: filters.durumTanitici }),
        ...(filters.minBorcMiktari && { minBorcMiktari: filters.minBorcMiktari }),
        ...(filters.maxBorcMiktari && { maxBorcMiktari: filters.maxBorcMiktari }),
        ...(filters.durum && { durum: filters.durum })
      })

      const response = await fetch(`/api/search?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        const list: Debtor[] = Array.isArray(data?.data) ? data.data : []
        setDebtors(list)
        setFilteredDebtors(list)
        const total = typeof data?.total === 'number' && data.total >= 0 ? data.total : list.length
        setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)))
      } else {
        // Hata durumunda örnek veri göster
        showSampleData()
      }
    } catch (error) {
      console.error('Borçlu verileri alınırken hata:', error)
      showSampleData()
    } finally {
      setIsLoading(false)
    }
  }

  const showSampleData = () => {
    const sampleData = [
      {
        durumTanitici: 'D001',
        isim: 'Ahmet Yılmaz',
        borcMiktari: 15000,
        sonOdemeTarihi: '2024-01-15',
        durum: 'Aktif',
        telefon: '0532 123 45 67',
        email: 'ahmet@email.com'
      },
      {
        durumTanitici: 'D002',
        isim: 'Fatma Kaya',
        borcMiktari: 8500,
        sonOdemeTarihi: '2024-01-20',
        durum: 'Beklemede',
        telefon: '0533 234 56 78',
        email: 'fatma@email.com'
      },
      {
        durumTanitici: 'D003',
        isim: 'Mehmet Demir',
        borcMiktari: 22000,
        sonOdemeTarihi: '2024-01-10',
        durum: 'Gecikmiş',
        telefon: '0534 345 67 89',
        email: 'mehmet@email.com'
      },
      {
        durumTanitici: 'D004',
        isim: 'Ayşe Şahin',
        borcMiktari: 12000,
        sonOdemeTarihi: '2024-01-25',
        durum: 'Aktif',
        telefon: '0535 456 78 90',
        email: 'ayse@email.com'
      },
      {
        durumTanitici: 'D005',
        isim: 'Ali Özkan',
        borcMiktari: 18500,
        sonOdemeTarihi: '2024-01-12',
        durum: 'Gecikmiş',
        telefon: '0536 567 89 01',
        email: 'ali@email.com'
      }
    ]
    setDebtors(sampleData)
    setFilteredDebtors(sampleData)
    setTotalPages(1)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const normalized = key === 'durum' && (value === 'ALL' || value === '') ? '' : value
    setFilters(prev => ({ ...prev, [key]: normalized }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      isim: '',
      durumTanitici: '',
      minBorcMiktari: '',
      maxBorcMiktari: '',
      durum: ''
    })
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/excel')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `borclu-listesi-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Excel dosyası başarıyla indirildi')
      } else {
        toast.error('Excel dosyası indirilemedi')
      }
    } catch (error) {
      console.error('Excel export hatası:', error)
      toast.error('Excel dosyası indirilemedi')
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

  const composeName = (d: Debtor) => {
    // Muhatap tanımını temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimi = d.muhatapTanimi ? d.muhatapTanimi.trim() : ''
    if (cleanMuhatapTanimi.toLowerCase() === 'borçlu' || cleanMuhatapTanimi.toLowerCase() === 'borclu') {
      cleanMuhatapTanimi = ''
    }
    
    // "CENGİZ KAMA / ÇAKMAK-MERKEZ" gibi formatta ise, ilk kısmı al
    if (cleanMuhatapTanimi && cleanMuhatapTanimi.includes('/')) {
      const parts = cleanMuhatapTanimi.split('/')
      if (parts.length > 0 && parts[0].trim()) {
        cleanMuhatapTanimi = parts[0].trim()
      }
    }
    
    // Muhatap tanımı ek'i temizle (eğer "Borçlu" içeriyorsa)
    let cleanMuhatapTanimiEk = d.muhatapTanimiEk ? d.muhatapTanimiEk.trim() : ''
    if (cleanMuhatapTanimiEk.toLowerCase() === 'borçlu' || cleanMuhatapTanimiEk.toLowerCase() === 'borclu') {
      cleanMuhatapTanimiEk = ''
    }
    
    // Öncelik sırası: temizlenmiş muhatapTanimi > temizlenmiş muhatapTanimiEk > durumTanitici
    return (
      (cleanMuhatapTanimi || undefined) ||
      (cleanMuhatapTanimiEk || undefined) ||
      d.durumTanitici ||
      "İsimsiz Borçlu"
    )
  }

  const handleSelectDebtor = (durumTanitici: string, checked?: boolean) => {
    setSelectedDebtors(prev => {
      if (checked !== undefined) {
        return checked 
          ? [...prev, durumTanitici]
          : prev.filter(id => id !== durumTanitici)
      }
      return prev.includes(durumTanitici)
        ? prev.filter(id => id !== durumTanitici)
        : [...prev, durumTanitici]
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDebtors(filteredDebtors.map(d => d.durumTanitici))
    } else {
      setSelectedDebtors([])
    }
  }

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-message')
      if (response.ok) {
        const data = await response.json()
        setWhatsAppStatus(data)
      }
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

  const handleWhatsAppOpen = async () => {
    await checkWhatsAppStatus()
    setIsWhatsAppDialogOpen(true)
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

  const handleBulkWhatsAppSend = async () => {
    if (!whatsAppMessage.trim() || selectedDebtors.length === 0) {
      toast.error('Lütfen mesaj yazın ve en az bir borçlu seçin')
      return
    }

    setIsWhatsAppSending(true)

    // Seçili borçluları hazırla
    const recipients = selectedDebtors.map(durumTanitici => {
      const debtor = filteredDebtors.find(d => d.durumTanitici === durumTanitici)
      return {
        durumTanitici,
        phoneNumber: debtor?.telefon || '',
        name: debtor ? composeName(debtor) : ''
      }
    })

    try {
      // Dosyaları base64'e çevir
      let filesData = null
      if (selectedFiles.length > 0) {
        console.log('Converting files to base64:', selectedFiles.length)
        filesData = await convertFilesToBase64(selectedFiles)
        console.log('Files converted:', filesData.length)
      }

      console.log('Sending bulk WhatsApp message with files:', !!filesData)
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: whatsAppMessage,
          recipients,
          files: filesData
        })
      })

      const result = await response.json()

      if (result.success) {
        const successCount = result.results.filter((r: any) => r.success).length
        const errorCount = result.results.filter((r: any) => !r.success).length

        if (successCount > 0) {
          toast.success(`${successCount} mesaj başarıyla gönderildi`)
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} mesaj gönderilemedi`)
        }
      } else {
        toast.error(result.error || 'Mesaj gönderilirken hata oluştu')
      }
    } catch (error) {
      console.error('Toplu mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilirken hata oluştu')
    } finally {
      setIsWhatsAppSending(false)
      setIsWhatsAppDialogOpen(false)
      setSelectedDebtors([])
      setWhatsAppMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Borçlu Listesi</h1>
          <p className="text-gray-600">Tüm borçluları görüntüleyin ve yönetin</p>
        </div>

        {/* Filtreler */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtreler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="isim">İsim</Label>
                <Input
                  id="isim"
                  placeholder="İsim ara..."
                  value={filters.isim}
                  onChange={(e) => handleFilterChange('isim', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="durumTanitici">Durum Tanıtıcı</Label>
                <Input
                  id="durumTanitici"
                  placeholder="Durum tanıtıcı..."
                  value={filters.durumTanitici}
                  onChange={(e) => handleFilterChange('durumTanitici', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="minBorç">Min. Borç</Label>
                <Input
                  id="minBorç"
                  type="number"
                  placeholder="0"
                  value={filters.minBorcMiktari}
                  onChange={(e) => handleFilterChange('minBorcMiktari', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxBorç">Max. Borç</Label>
                <Input
                  id="maxBorç"
                  type="number"
                  placeholder="999999"
                  value={filters.maxBorcMiktari}
                  onChange={(e) => handleFilterChange('maxBorcMiktari', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="durum">Durum</Label>
                <Select value={filters.durum} onValueChange={(value) => handleFilterChange('durum', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tümü</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Beklemede">Beklemede</SelectItem>
                    <SelectItem value="Gecikmiş">Gecikmiş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={clearFilters} variant="outline">
                Filtreleri Temizle
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Excel İndir
              </Button>
              <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleWhatsAppOpen}
                    disabled={selectedDebtors.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Gönder ({selectedDebtors.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Toplu WhatsApp Mesajı Gönder</DialogTitle>
                    <DialogDescription>
                      Seçili borçlulara toplu WhatsApp mesajı gönderin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {whatsAppStatus && !whatsAppStatus.isReady && whatsAppStatus.qrCode && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800 mb-3">
                          WhatsApp bağlantısı için QR kodu okutun:
                        </p>
                        <img 
                          src={whatsAppStatus.qrCode} 
                          alt="WhatsApp QR Code" 
                          className="mx-auto max-w-[200px] border rounded"
                        />
                        <p className="text-xs text-yellow-700 mt-2">
                          Telefonunuzla QR kodu okuttuktan sonra tekrar deneyin.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Seçili Borçlular ({selectedDebtors.length})
                      </h4>
                      <div className="text-sm text-blue-800">
                        {selectedDebtors.map(id => {
                          const debtor = filteredDebtors.find(d => d.durumTanitici === id)
                          return debtor ? (
                            <div key={id} className="flex justify-between items-center py-1">
                              <span>{composeName(debtor)}</span>
                              <span className="text-xs">{debtor.telefon || 'Telefon yok'}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <WhatsAppMessageTemplates
                        onSelectTemplate={(template) => {
                          setWhatsAppMessage(template.content)
                        }}
                        debtorInfo={{
                          name: 'Seçili Borçlular',
                          debt: 0
                        }}
                      />
                      
                      <div className="grid grid-cols-4 items-start gap-4">
                        <label htmlFor="bulk-whatsapp-message" className="text-right text-sm font-medium pt-2">
                          Mesaj
                        </label>
                        <Textarea
                          id="bulk-whatsapp-message"
                          placeholder="Toplu mesajınızı yazın veya yukarıdan şablon seçin..."
                          value={whatsAppMessage}
                          onChange={(e) => setWhatsAppMessage(e.target.value)}
                          className="col-span-3"
                          rows={8}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <label className="text-right text-sm font-medium pt-2">
                          Dosya Ekle (Resim/PDF)
                        </label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id="bulk-file-upload"
                              multiple
                              accept="image/*,.pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('bulk-file-upload')?.click()}
                              className="text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Dosya Seç
                            </Button>
                            <span className="text-xs text-gray-500">
                              Resim veya PDF (max 5MB)
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
                                      <FileText className="w-3 h-3 text-red-500" />
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
                    </div>
                    
                    {whatsAppStatus && (
                      <div className={`p-3 rounded-lg text-sm ${
                        whatsAppStatus.isReady 
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      }`}>
                        <strong>Durum:</strong> {whatsAppStatus.message || 'Bilinmiyor'}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsWhatsAppDialogOpen(false)}
                      disabled={isWhatsAppSending}
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleBulkWhatsAppSend}
                      disabled={isWhatsAppSending || (whatsAppStatus && !whatsAppStatus.isReady) || selectedDebtors.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isWhatsAppSending ? 'Gönderiliyor...' : `${selectedDebtors.length} Kişiye Gönder`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Borçlu Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Borçlular ({filteredDebtors?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (filteredDebtors?.length ?? 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Hiç borçlu bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 border-b">
                  <Checkbox
                    checked={selectedDebtors.length === filteredDebtors.length && filteredDebtors.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Tümünü Seç</span>
                </div>
                {filteredDebtors.map((debtor) => (
                  <div
                    key={debtor.durumTanitici}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedDebtors.includes(debtor.durumTanitici)}
                        onCheckedChange={(checked: boolean) => handleSelectDebtor(debtor.durumTanitici, checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{composeName(debtor)}</h4>
                            <p className="text-sm text-gray-500">
                              {debtor.durumTanitici} • {formatCurrency(debtor.borcMiktari)}
                            </p>
                            {debtor.sonOdemeTarihi && (
                              <p className="text-xs text-gray-400">
                                Son Ödeme: {formatDate(debtor.sonOdemeTarihi)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusColor(debtor.durum)
                        }`}
                      >
                        {debtor.durum}
                      </span>
                      <Link href={`/borclu/${debtor.durumTanitici}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}