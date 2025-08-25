'use client'

import React, { useState, useRef } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Info, RefreshCw, Wrench, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadResult {
  success: boolean
  message: string
  processedCount?: number
  errorCount?: number
  createdCount?: number
  updatedCount?: number
  mode?: string
  errors?: string[]
}

interface CleanupResult {
  success: boolean
  message: string
  totalRecords?: number
  fixedRecords?: number
  details?: any[]
}

// Veri Temizleme Bileşeni
function DataCleanupCard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/fix-muhatap', {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result)
        toast.success(`Analiz tamamlandı: ${result.problemRecords} problemli kayıt bulundu`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Analiz sırasında hata oluştu')
      }
    } catch (error) {
      console.error('Analiz hatası:', error)
      toast.error('Analiz sırasında hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFix = async () => {
    setIsFixing(true)
    setCleanupResult(null)
    try {
      const response = await fetch('/api/fix-muhatap', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setCleanupResult({
          success: true,
          message: result.message,
          totalRecords: result.totalRecords,
          fixedRecords: result.fixedRecords,
          details: result.details
        })
        toast.success(result.message)
        // Analizi yenile
        setAnalysisResult(null)
      } else {
        const error = await response.json()
        setCleanupResult({
          success: false,
          message: error.error || 'Temizleme sırasında hata oluştu'
        })
        toast.error(error.error || 'Temizleme sırasında hata oluştu')
      }
    } catch (error) {
      console.error('Temizleme hatası:', error)
      setCleanupResult({
        success: false,
        message: 'Temizleme sırasında beklenmeyen bir hata oluştu'
      })
      toast.error('Temizleme sırasında beklenmeyen bir hata oluştu')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900">Veri Temizleme</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-blue-700">
            Muhatap tanımı alanlarındaki adres bilgilerini temizleyin ve düzeltin.
          </p>

          <div className="flex space-x-2">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isFixing}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 mr-2" />
                  Problemleri Analiz Et
                </>
              )}
            </Button>

            <Button
              onClick={handleFix}
              disabled={isFixing || isAnalyzing}
              size="sm"
              className="flex-1"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Düzeltiliyor...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Problemleri Düzelt
                </>
              )}
            </Button>
          </div>

          {/* Analiz Sonuçları */}
          {analysisResult && (
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Analiz Sonuçları</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Toplam kayıt: {analysisResult.totalRecords}</p>
                <p>Problemli kayıt: {analysisResult.problemRecords}</p>
                {analysisResult.problemRecords > 0 && (
                  <p className="text-orange-600">
                    ⚠️ {analysisResult.problemRecords} kayıtta muhatap tanımı sorunu bulundu
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Temizleme Sonuçları */}
          {cleanupResult && (
            <div className={`p-3 rounded-lg border ${cleanupResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-start space-x-2">
                {cleanupResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${cleanupResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {cleanupResult.success ? 'Başarılı!' : 'Hata!'}
                  </h4>
                  <p className={`text-sm ${cleanupResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {cleanupResult.message}
                  </p>

                  {cleanupResult.success && cleanupResult.fixedRecords !== undefined && (
                    <div className="mt-1 text-xs text-green-600">
                      <p>Düzeltilen kayıt: {cleanupResult.fixedRecords}</p>
                      <p>Toplam kayıt: {cleanupResult.totalRecords}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            <p><strong>Bu işlem:</strong></p>
            <ul className="mt-1 space-y-1 ml-2">
              <li>• Adres bilgilerini muhatap tanımından temizler</li>
              <li>• TC kimlik numaralarını isim alanından çıkarır</li>
              <li>• "Borçlu" kelimelerini temizler</li>
              <li>• Ad/soyad bilgilerini düzenler</li>
            </ul>
          </div>

          {/* Debug Butonu */}
          <Button
            onClick={() => window.open('/api/debug-muhatap?problematic=true&limit=50', '_blank')}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            🔍 Problemli Kayıtları Görüntüle (Debug)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Veritabanı Temizleme Bileşeni
function DatabaseClearCard() {
  const [isClearing, setIsClearing] = useState(false)
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [clearResult, setClearResult] = useState<any>(null)

  const fetchRecordCount = async () => {
    try {
      const response = await fetch('/api/clear-database')
      if (response.ok) {
        const result = await response.json()
        setRecordCount(result.totalRecords)
      }
    } catch (error) {
      console.error('Kayıt sayısı alma hatası:', error)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ DİKKAT: Bu işlem tüm borçlu kayıtlarını kalıcı olarak silecektir. Bu işlem geri alınamaz! Devam etmek istediğinizden emin misiniz?')) {
      return
    }

    if (!confirm('Son uyarı: Tüm veriler silinecek. Gerçekten devam etmek istiyor musunuz?')) {
      return
    }

    setIsClearing(true)
    setClearResult(null)

    try {
      const response = await fetch('/api/clear-database', {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        setClearResult(result)
        setRecordCount(0)
        toast.success(result.message)
      } else {
        const error = await response.json()
        setClearResult({ success: false, message: error.error })
        toast.error(error.error || 'Veritabanı temizlenirken hata oluştu')
      }
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error)
      setClearResult({ success: false, message: 'Beklenmeyen bir hata oluştu' })
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setIsClearing(false)
    }
  }

  // Sayfa yüklendiğinde kayıt sayısını al
  React.useEffect(() => {
    fetchRecordCount()
  }, [])

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          <span className="text-red-900">Veritabanını Temizle</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">Tehlikeli İşlem!</h4>
                <p className="text-sm text-red-700 mt-1">
                  Bu işlem tüm borçlu kayıtlarını kalıcı olarak siler.
                  Bu işlem geri alınamaz!
                </p>
              </div>
            </div>
          </div>

          {recordCount !== null && (
            <div className="text-sm text-gray-700">
              <p>Mevcut kayıt sayısı: <strong>{recordCount}</strong></p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={fetchRecordCount}
              disabled={isClearing}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Kayıt Sayısını Yenile
            </Button>

            <Button
              onClick={handleClearDatabase}
              disabled={isClearing || recordCount === 0}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Temizleniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tüm Verileri Sil
                </>
              )}
            </Button>
          </div>

          {/* Temizleme Sonuçları */}
          {clearResult && (
            <div className={`p-3 rounded-lg border ${clearResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-start space-x-2">
                {clearResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${clearResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {clearResult.success ? 'Başarılı!' : 'Hata!'}
                  </h4>
                  <p className={`text-sm ${clearResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {clearResult.message}
                  </p>

                  {clearResult.success && clearResult.deletedCount !== undefined && (
                    <div className="mt-1 text-xs text-green-600">
                      <p>Silinen kayıt: {clearResult.deletedCount}</p>
                      <p>Önceki toplam: {clearResult.previousCount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <p><strong>Bu işlem:</strong></p>
            <ul className="mt-1 space-y-1 ml-2">
              <li>• Tüm borçlu kayıtlarını siler</li>
              <li>• İlişkili tüm verileri temizler</li>
              <li>• Geri alınamaz bir işlemdir</li>
              <li>• Development ortamında çalışır</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExcelPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadMode, setUploadMode] = useState<'replace' | 'update'>('update')
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
      formData.append('mode', uploadMode)

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message,
          processedCount: result.successCount,
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
                  {/* Yükleme Modu Seçimi */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Yükleme Modu</h4>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMode"
                          value="update"
                          checked={uploadMode === 'update'}
                          onChange={(e) => setUploadMode(e.target.value as 'update')}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-blue-900">Güncelleme Modu (Önerilen)</div>
                          <div className="text-sm text-blue-700">
                            Mevcut kayıtları günceller, yeni kayıtları ekler. Eski veriler korunur.
                          </div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="uploadMode"
                          value="replace"
                          checked={uploadMode === 'replace'}
                          onChange={(e) => setUploadMode(e.target.value as 'replace')}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-blue-900">Değiştirme Modu</div>
                          <div className="text-sm text-blue-700">
                            Sadece yeni kayıtlar ekler. Mevcut kayıtlar değişmez.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

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
                    <div className={`p-4 rounded-lg border ${uploadResult.success
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
                          <h4 className={`font-semibold ${uploadResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {uploadResult.success ? 'Başarılı!' : 'Hata!'}
                          </h4>
                          <p className={`text-sm ${uploadResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {uploadResult.message}
                          </p>

                          {uploadResult.success && uploadResult.processedCount !== undefined && (
                            <div className="mt-2 text-sm text-green-700">
                              <p>İşlenen kayıt: {uploadResult.processedCount}</p>
                              {uploadResult.mode === 'update' && (
                                <>
                                  {uploadResult.createdCount !== undefined && (
                                    <p>Yeni kayıt: {uploadResult.createdCount}</p>
                                  )}
                                  {uploadResult.updatedCount !== undefined && (
                                    <p>Güncellenen kayıt: {uploadResult.updatedCount}</p>
                                  )}
                                </>
                              )}
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
                    <li>• <strong>Muhatap Tanımı:</strong> Muhatap bilgisi (opsiyonel)</li>
                    <li>• <strong>Güncel Borç:</strong> Borç miktarı (opsiyonel)</li>
                    <li>• <strong>Telefon:</strong> Telefon numarası (opsiyonel)</li>
                    <li>• <strong>İl:</strong> İl bilgisi (opsiyonel)</li>
                  </ul>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                    <p className="font-medium mb-1">Yükleme Modları:</p>
                    <p><strong>Güncelleme:</strong> Durum tanıtıcısı aynı olan kayıtları günceller, yenilerini ekler</p>
                    <p><strong>Değiştirme:</strong> Sadece yeni kayıtlar ekler, mevcut kayıtlara dokunmaz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon - Dışa Aktarma ve Veri Temizleme */}
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

            {/* Veri Temizleme */}
            <DataCleanupCard />

            {/* Veritabanı Temizleme */}
            <DatabaseClearCard />

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