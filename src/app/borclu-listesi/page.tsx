'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Search, Filter, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
                {filteredDebtors.map((debtor) => (
                  <div
                    key={debtor.durumTanitici}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
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