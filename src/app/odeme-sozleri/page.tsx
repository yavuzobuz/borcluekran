'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Search, Clock, CheckCircle, AlertCircle, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CustomDatePicker } from '@/components/ui/date-picker'

interface OdemeSozu {
  id: number
  borcluId: number
  tarih: string
  aciklama: string
  odemeMiktari?: number
  durum: string
  olusturmaTarihi: string
  borclu: {
    id: number
    durumTanitici: string
    muhatapTanimi?: string
    ad?: string
    soyad?: string
  }
}

interface Borclu {
  id: number
  durumTanitici: string
  muhatapTanimi?: string
  ad?: string
  soyad?: string
  guncelBorc?: number
}

export default function OdemeSozleriPage() {
  const [odemeSozleri, setOdemeSozleri] = useState<OdemeSozu[]>([])
  const [borclular, setBorclular] = useState<Borclu[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  
  // Form state
  const [selectedBorclu, setSelectedBorclu] = useState<number | null>(null)
  const [tarih, setTarih] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [odemeMiktari, setOdemeMiktari] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchOdemeSozleri()
    fetchBorclular()
  }, [])

  useEffect(() => {
    if (startDate || endDate) {
      fetchOdemeSozleri()
    }
  }, [startDate, endDate])

  const fetchOdemeSozleri = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const url = `/api/odeme-sozu${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        setOdemeSozleri(result.data || [])
      }
    } catch (error) {
      console.error('Ödeme sözleri yüklenirken hata:', error)
      toast.error('Ödeme sözleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchBorclular = async () => {
    try {
      const response = await fetch('/api/search?limit=1000')
      if (response.ok) {
        const result = await response.json()
        setBorclular(result.data || [])
      }
    } catch (error) {
      console.error('Borçlular yüklenirken hata:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBorclu || !tarih || !aciklama) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/odeme-sozu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          borcluId: selectedBorclu,
          tarih,
          aciklama,
          odemeMiktari: odemeMiktari ? parseFloat(odemeMiktari) : null
        })
      })

      if (response.ok) {
        toast.success('Ödeme sözü başarıyla eklendi')
        setShowAddForm(false)
        resetForm()
        fetchOdemeSozleri()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ödeme sözü eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Ödeme sözü ekleme hatası:', error)
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedBorclu(null)
    setTarih('')
    setAciklama('')
    setOdemeMiktari('')
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchOdemeSozleri()
  }

  const getBorcluName = (borclu: any) => {
    const fullName = [borclu.ad, borclu.soyad].filter(Boolean).join(' ').trim()
    return borclu.muhatapTanimi || fullName || `Borçlu ${borclu.durumTanitici}`
  }

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'Aktif':
        return <Badge variant="default">Aktif</Badge>
      case 'Tamamlandı':
        return <Badge variant="secondary">Tamamlandı</Badge>
      case 'İptal':
        return <Badge variant="destructive">İptal</Badge>
      default:
        return <Badge variant="outline">{durum}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy', { locale: tr })
    } catch (error) {
      return dateString
    }
  }

  const filteredOdemeSozleri = odemeSozleri.filter(sozu => 
    getBorcluName(sozu.borclu).toLowerCase().includes(searchTerm.toLowerCase()) ||
    sozu.borclu.durumTanitici.includes(searchTerm) ||
    sozu.aciklama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Ödeme sözleri yükleniyor...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme Sözleri</h1>
          <p className="text-gray-600">Borçlulardan alınan ödeme sözlerini yönetin</p>
        </div>

        {/* Üst Kontroller */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Borçlu adı, durum tanıtıcı veya açıklama ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={showDateFilter ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Tarih Filtresi
              </Button>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="ml-4">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ödeme Sözü
            </Button>
          </div>

          {/* Tarih Filtresi */}
          {showDateFilter && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Tarih Aralığı Filtresi</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDateFilter(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
                  <CustomDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="gg/aa/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                  <CustomDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="gg/aa/yyyy"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={clearDateFilter}
                    disabled={!startDate && !endDate}
                  >
                    Temizle
                  </Button>
                  {(startDate || endDate) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>Filtre aktif</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Ödeme Sözü Ekleme Formu */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Yeni Ödeme Sözü Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Borçlu Seçin *</label>
                    <select
                      value={selectedBorclu || ''}
                      onChange={(e) => setSelectedBorclu(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Borçlu seçin...</option>
                      {borclular.map((borclu) => (
                        <option key={borclu.id} value={borclu.id}>
                          {getBorcluName(borclu)} ({borclu.durumTanitici})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ödeme Tarihi *</label>
                    <CustomDatePicker
                      value={tarih}
                      onChange={setTarih}
                      placeholder="gg/aa/yyyy"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ödeme Miktarı (₺)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ödeme miktarı (opsiyonel)"
                    value={odemeMiktari}
                    onChange={(e) => setOdemeMiktari(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Açıklama *</label>
                  <Textarea
                    placeholder="Ödeme sözü detayları..."
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Ekleniyor...' : 'Ödeme Sözü Ekle'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Ödeme Sözleri Listesi */}
        <div className="grid gap-4">
          {filteredOdemeSozleri.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Henüz ödeme sözü kaydı bulunmuyor.</p>
              </CardContent>
            </Card>
          ) : (
            filteredOdemeSozleri.map((sozu) => (
              <Card key={sozu.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-primary">
                        {getBorcluName(sozu.borclu)}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {sozu.borclu.durumTanitici}
                      </span>
                      {getDurumBadge(sozu.durum)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        <span className="font-medium">Ödeme Tarihi:</span> {formatDate(sozu.tarih)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Açıklama:</span> {sozu.aciklama}
                      </p>
                      {sozu.odemeMiktari && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Ödeme Miktarı:</span> ₺{sozu.odemeMiktari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDate(sozu.olusturmaTarihi)}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}