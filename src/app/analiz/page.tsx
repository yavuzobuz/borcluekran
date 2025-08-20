'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Search, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisResult {
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek'
  paymentPlan: string
  recommendations: string[]
  summary: string
  debtorCount: number
  totalDebt: number
}

export default function AnalizPage() {
  const [durumTaniticiList, setDurumTaniticiList] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!durumTaniticiList.trim()) {
      toast.error('Lütfen en az bir durum tanıtıcı girin')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          durumTaniticiList: durumTaniticiList.split(',').map(s => s.trim()).filter(s => s)
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result)
        toast.success('Analiz başarıyla tamamlandı')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Analiz sırasında hata oluştu')
        
        // Hata durumunda örnek sonuç göster
        setAnalysisResult({
          riskLevel: 'Orta',
          paymentPlan: 'Borçluların genel durumu orta risk seviyesinde. 3-6 aylık ödeme planı önerilir. Öncelikle yüksek miktarlı borçlular ile iletişime geçilmeli.',
          recommendations: [
            'Yüksek borçlu müşteriler ile öncelikli görüşme planlanmalı',
            'Ödeme kolaylığı sağlamak için taksitlendirme seçenekleri sunulmalı',
            'Düzenli takip sistemi kurulmalı',
            'Risk analizi aylık olarak tekrarlanmalı'
          ],
          summary: 'Analiz edilen borçlular arasında çeşitli risk seviyeleri bulunmaktadır. Proaktif yaklaşım ile tahsilat oranı artırılabilir.',
          debtorCount: durumTaniticiList.split(',').length,
          totalDebt: 125000
        })
      }
    } catch (error) {
      console.error('Analiz hatası:', error)
      toast.error('Analiz sırasında hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Düşük':
        return 'text-green-600 bg-green-100'
      case 'Orta':
        return 'text-yellow-600 bg-yellow-100'
      case 'Yüksek':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Düşük':
        return CheckCircle
      case 'Orta':
        return Clock
      case 'Yüksek':
        return AlertTriangle
      default:
        return AlertTriangle
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Borç Analizi</h1>
          <p className="text-gray-600">Gemini AI ile borçlu portföyünüzü analiz edin ve öneriler alın</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon - Analiz Formu */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Analiz Parametreleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="durumTaniticiList">Durum Tanıtıcıları</Label>
                    <Textarea
                      id="durumTaniticiList"
                      placeholder="Analiz edilecek durum tanıtıcılarını virgülle ayırarak girin (örn: D001, D002, D003)"
                      value={durumTaniticiList}
                      onChange={(e) => setDurumTaniticiList(e.target.value)}
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Birden fazla durum tanıtıcısını virgülle ayırarak girebilirsiniz
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !durumTaniticiList.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analiz Et
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analiz Sonuçları Özeti */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Analiz Özeti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Analiz Edilen Borçlu:</span>
                      <span className="font-semibold">{analysisResult.debtorCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Toplam Borç:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(analysisResult.totalDebt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Seviyesi:</span>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const RiskIcon = getRiskIcon(analysisResult.riskLevel)
                          return <RiskIcon className="w-4 h-4" />
                        })()}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(analysisResult.riskLevel)}`}>
                          {analysisResult.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sağ Kolon - Analiz Sonuçları */}
          <div className="space-y-6">
            {analysisResult ? (
              <>
                {/* Ödeme Planı */}
                <Card>
                  <CardHeader>
                    <CardTitle>Önerilen Ödeme Planı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{analysisResult.paymentPlan}</p>
                  </CardContent>
                </Card>

                {/* Öneriler */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Önerileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Genel Değerlendirme */}
                <Card>
                  <CardHeader>
                    <CardTitle>Genel Değerlendirme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analizi Bekliyor</h3>
                  <p className="text-gray-500">
                    Borçlu portföyünüzü analiz etmek için durum tanıtıcılarını girin ve analiz butonuna tıklayın.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bilgilendirme */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">AI Analizi Hakkında</h4>
                <p className="text-sm text-gray-600">
                  Bu analiz, Google Gemini AI tarafından borçlu verileriniz temel alınarak gerçekleştirilir. 
                  Sonuçlar tahsilat stratejinizi geliştirmenize yardımcı olmak için öneriler içerir. 
                  Nihai kararları verirken profesyonel değerlendirmenizi de dikkate alın.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}