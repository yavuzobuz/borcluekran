'use client'

import { useState, useRef } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

interface UploadResult {
  success: boolean
  message: string
  processedCount?: number
  errorCount?: number
  errors?: string[]
}

export default function ExcelPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Dosya türü kontrolü
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Lütfen sadece Excel dosyası (.xlsx veya .xls) yükleyin')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/excel', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          processedCount: result.processedCount,
          errorCount: result.errorCount,
          errors: result.errors
        })
        toast.success('Excel dosyası başarıyla işlendi')
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Dosya yüklenirken hata oluştu'
        })
        toast.error(result.error || 'Dosya yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Upload hatası:', error)
      setUploadResult({
        success: false,
        message: 'Dosya yüklenirken beklenmeyen bir hata oluştu'
      })
      toast.error('Dosya yüklenirken beklenmeyen bir hata oluştu')
    } finally {
      setIsUploading(false)
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
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
        const error = await response.json()
        toast.error(error.error || 'Excel dosyası indirilemedi')
      }
    } catch (error) {
      console.error('Download hatası:', error)
      toast.error('Excel dosyası indirilemedi')
    } finally {
      setIsDownloading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel İşlemleri</h1>
          <p className="text-gray-600">Borçlu verilerini Excel dosyası ile içe/dışa aktarın</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon - İçe Aktarma */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Excel Dosyası Yükle</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Excel Dosyası Seçin</h3>
                    <p className="text-gray-600 mb-4">
                      Borçlu verilerini içeren .xlsx veya .xls dosyasını yükleyin
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button 
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      variant="outline"
                    >
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Dosya Seç
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Yükleme Sonucu */}
                  {uploadResult && (
                    <div className={`p-4 rounded-lg border ${
                      uploadResult.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {uploadResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            uploadResult.success ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {uploadResult.success ? 'Başarılı!' : 'Hata!'}
                          </h4>
                          <p className={`text-sm ${
                            uploadResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {uploadResult.message}
                          </p>
                          
                          {uploadResult.success && uploadResult.processedCount !== undefined && (
                            <div className="mt-2 text-sm text-green-700">
                              <p>İşlenen kayıt: {uploadResult.processedCount}</p>
                              {uploadResult.errorCount !== undefined && uploadResult.errorCount > 0 && (
                                <p>Hatalı kayıt: {uploadResult.errorCount}</p>
                              )}
                            </div>
                          )}
                          
                          {uploadResult.errors && uploadResult.errors.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-red-700 mb-1">Hatalar:</p>
                              <ul className="text-xs text-red-600 space-y-1">
                                {uploadResult.errors.slice(0, 5).map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                                {uploadResult.errors.length > 5 && (
                                  <li>... ve {uploadResult.errors.length - 5} hata daha</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Excel Format Bilgisi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Excel Format Bilgisi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Gerekli Sütunlar:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Durum tanıtıcısı:</strong> Benzersiz tanımlayıcı (zorunlu)</li>
                    <li>• <strong>İlgili TCKN:</strong> TC Kimlik Numarası (opsiyonel)</li>
                    <li>• <strong>Avukat Atama Tarihi:</strong> Atama tarihi (opsiyonel)</li>
                    <li>• <strong>Muhatap Tanımı:</strong> Muhatap bilgisi (opsiyonel)</li>
                    <li>• <strong>Güncel Borç:</strong> Borç miktarı (opsiyonel)</li>
                    <li>• <strong>Telefon:</strong> Telefon numarası (opsiyonel)</li>
                    <li>• <strong>Adres Bilgileri:</strong> Adres bilgisi (opsiyonel)</li>
                    <li>• <strong>İl:</strong> İl bilgisi (opsiyonel)</li>
                    <li>• <strong>İlçe:</strong> İlçe bilgisi (opsiyonel)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    * Mevcut kayıtlar güncellenecek, yeni kayıtlar eklenecektir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon - Dışa Aktarma */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Excel Dosyası İndir</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-8">
                    <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tüm Verileri İndir</h3>
                    <p className="text-gray-600 mb-6">
                      Sistemdeki tüm borçlu verilerini Excel formatında indirin
                    </p>
                    <Button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full"
                    >
                      {isDownloading ? (
                        <>
                          <Download className="w-4 h-4 mr-2 animate-spin" />
                          İndiriliyor...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Excel İndir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* İndirme Bilgisi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>İndirme Bilgisi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">İndirilecek Veriler:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Tüm borçlu bilgileri</li>
                    <li>• Durum tanıtıcıları</li>
                    <li>• İletişim bilgileri</li>
                    <li>• Borç miktarları</li>
                    <li>• Kayıt ve güncelleme tarihleri</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    * Dosya adı otomatik olarak tarih ile oluşturulur.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Güvenlik Uyarısı */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Güvenlik Uyarısı</h4>
                    <p className="text-sm text-yellow-700">
                      Excel dosyaları hassas kişisel verileri içerir. 
                      İndirilen dosyaları güvenli bir şekilde saklayın ve 
                      yetkisiz kişilerle paylaşmayın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}