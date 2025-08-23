'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SearchForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    durumTanitici: '',
    sozlesmeHesabi: '',
    telefon: '',
    tcKimlik: '',
    minBorc: '',
    maxBorc: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Form verilerini URL parametrelerine dönüştür
      const searchParams = new URLSearchParams()
      
      if (formData.name.trim()) {
        searchParams.set('name', formData.name.trim())
      }
      if (formData.durumTanitici.trim()) {
        searchParams.set('durumTanitici', formData.durumTanitici.trim())
      }
      if (formData.sozlesmeHesabi.trim()) {
        searchParams.set('sozlesmeHesabi', formData.sozlesmeHesabi.trim())
      }
      if (formData.telefon.trim()) {
        searchParams.set('telefon', formData.telefon.trim())
      }
      if (formData.tcKimlik.trim()) {
        searchParams.set('tcKimlik', formData.tcKimlik.trim())
      }
      if (formData.minBorc.trim()) {
        searchParams.set('minBorc', formData.minBorc.trim())
      }
      if (formData.maxBorc.trim()) {
        searchParams.set('maxBorc', formData.maxBorc.trim())
      }

      // Arama sayfasına yönlendir
      router.push(`/borclular?${searchParams.toString()}`)
    } catch (error) {
      console.error('Arama hatası:', error)
      toast.error('Arama sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      name: '',
      durumTanitici: '',
      sozlesmeHesabi: '',
      telefon: '',
      tcKimlik: '',
      minBorc: '',
      maxBorc: ''
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-4 h-4" />
          <span className="text-base">Borçlu Arama</span>
        </CardTitle>
        <CardDescription className="text-sm">
          İsim, durum tanıtıcı veya borç tutarına göre borçlu arayın
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">İsim</Label>
              <Input
                id="name"
                type="text"
                placeholder="Borçlu ismi girin..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="durumTanitici" className="text-sm">Durum Tanıtıcı</Label>
              <Input
                id="durumTanitici"
                type="text"
                placeholder="DT numarası girin..."
                value={formData.durumTanitici}
                onChange={(e) => handleInputChange('durumTanitici', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sozlesmeHesabi" className="text-sm">Sözleşme Hesabı</Label>
              <Input
                id="sozlesmeHesabi"
                type="text"
                placeholder="Sözleşme hesabı girin..."
                value={formData.sozlesmeHesabi}
                onChange={(e) => handleInputChange('sozlesmeHesabi', e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="telefon" className="text-sm">Telefon</Label>
              <Input
                id="telefon"
                type="text"
                placeholder="Telefon numarası girin..."
                value={formData.telefon}
                onChange={(e) => handleInputChange('telefon', e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="tcKimlik" className="text-sm">TC Kimlik No</Label>
              <Input
                id="tcKimlik"
                type="text"
                placeholder="TC kimlik numarası girin..."
                value={formData.tcKimlik}
                onChange={(e) => handleInputChange('tcKimlik', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="minBorc" className="text-sm">Minimum Borç (TL)</Label>
              <Input
                id="minBorc"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.minBorc}
                onChange={(e) => handleInputChange('minBorc', e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="maxBorc" className="text-sm">Maksimum Borç (TL)</Label>
              <Input
                id="maxBorc"
                type="number"
                placeholder="999999"
                min="0"
                step="0.01"
                value={formData.maxBorc}
                onChange={(e) => handleInputChange('maxBorc', e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-9"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Ara
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading}
              className="h-9"
              size="sm"
            >
              Temizle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}