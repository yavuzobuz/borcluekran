'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function WhatsAppTestPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState({
    phoneNumber: '',
    message: 'Test mesajı'
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/send-message')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Status check error:', error)
      setStatus({ error: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  const disconnectWhatsApp = async () => {
    try {
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'DELETE'
      })
      const data = await response.json()
      console.log('Disconnect result:', data)
      setStatus(null)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const restartWhatsApp = async () => {
    setLoading(true)
    try {
      // First disconnect
      await disconnectWhatsApp()
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Then check status (which will reinitialize)
      await checkStatus()
    } catch (error) {
      console.error('Restart error:', error)
    } finally {
      setLoading(false)
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
        alert('Sadece resim ve PDF dosyaları, maksimum 5MB boyutunda kabul edilir.')
      }
      
      console.log('Selected files:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
      setSelectedFiles(validFiles)
    }
  }

  const convertFilesToBase64 = async (files: File[]): Promise<any[]> => {
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            data: reader.result,
            filename: file.name,
            mimetype: file.type
          })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
    
    return Promise.all(filePromises)
  }

  const sendTestMessage = async () => {
    if (!testMessage.phoneNumber || !testMessage.message) {
      alert('Telefon numarası ve mesaj gerekli')
      return
    }

    setSending(true)
    try {
      let filesData = null
      if (selectedFiles.length > 0) {
        filesData = await convertFilesToBase64(selectedFiles)
      }

      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testMessage.phoneNumber,
          message: testMessage.message,
          debtorName: 'Test Kullanıcı',
          durumTanitici: 'TEST',
          files: filesData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Mesaj başarıyla gönderildi!')
        setTestMessage({ phoneNumber: '', message: 'Test mesajı' })
        setSelectedFiles([])
      } else {
        alert('Hata: ' + (result.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('Gönderme hatası: ' + error)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    checkStatus()
    
    // Auto-refresh status every 5 seconds if not ready
    const interval = setInterval(() => {
      if (!status?.isReady) {
        checkStatus()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [status?.isReady])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Bağlantı Testi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkStatus} disabled={loading}>
              {loading ? 'Kontrol Ediliyor...' : 'Durumu Kontrol Et'}
            </Button>
            <Button onClick={restartWhatsApp} disabled={loading} variant="outline">
              {loading ? 'Yeniden Başlatılıyor...' : 'Yeniden Başlat'}
            </Button>
            <Button onClick={disconnectWhatsApp} variant="destructive">
              Bağlantıyı Kes
            </Button>
          </div>

          {status && (
            <div className="mt-4 p-4 border rounded">
              <h3 className="font-semibold mb-2">Durum:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
              
              {status.qrCode && (
                <div className="mt-4 text-center">
                  <p className="mb-2">QR Kodu ile WhatsApp'a bağlanın:</p>
                  <img 
                    src={status.qrCode} 
                    alt="WhatsApp QR Code" 
                    className="mx-auto border rounded"
                    style={{ maxWidth: '300px' }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {status?.isReady && (
        <Card>
          <CardHeader>
            <CardTitle>Test Mesajı Gönder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefon Numarası</label>
              <Input
                type="tel"
                placeholder="05xxxxxxxxx"
                value={testMessage.phoneNumber}
                onChange={(e) => setTestMessage({ ...testMessage, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mesaj</label>
              <Textarea
                placeholder="Test mesajınız..."
                value={testMessage.message}
                onChange={(e) => setTestMessage({ ...testMessage, message: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dosya Ekle (Test)</label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Seçilen dosyalar: {selectedFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            <Button 
              onClick={sendTestMessage} 
              disabled={sending}
              className="w-full"
            >
              {sending ? 'Gönderiliyor...' : 'Test Mesajı Gönder'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}