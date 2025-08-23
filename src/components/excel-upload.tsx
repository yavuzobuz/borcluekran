'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react'

interface UploadResult {
  message: string
  successCount: number
  errorCount: number
  errors: string[]
}

export function ExcelUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Excel dosyası kontrolü
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
        setResult(null)
      } else {
        setError('Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setFile(null)
        // Input'u temizle
        const fileInput = document.getElementById('excel-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Dosya yüklenirken hata oluştu')
      }
    } catch (err) {
      setError('Dosya yüklenirken hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel Dosyası Yükle
        </CardTitle>
        <CardDescription>
          Borçlu bilgilerini içeren Excel dosyasını yükleyerek veritabanına toplu veri ekleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="excel-file" className="text-sm font-medium">
            Excel Dosyası Seç
          </label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Seçilen dosya: {file.name}
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Dosyayı Yükle
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{result.message}</p>
                <div className="text-sm">
                  <p>✅ Başarılı: {result.successCount} kayıt</p>
                  {result.errorCount > 0 && (
                    <>
                      <p>❌ Hatalı: {result.errorCount} kayıt</p>
                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Hatalar:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.errors.map((error, index) => (
                              <li key={index} className="text-xs">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Beklenen sütun başlıkları:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>TC Kimlik No (zorunlu değil)</li>
            <li>Durum Tanıtıcı (zorunlu)</li>
            <li>Ad Soyad (önerilen)</li>
            <li>Güncel Borç</li>
            <li>İl</li>
            <li>Telefon</li>
            <li>Borçlu Tipi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}