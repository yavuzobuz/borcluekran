'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Copy, Edit, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface MessageTemplate {
  id: string
  title: string
  content: string
  category: 'payment_reminder' | 'payment_plan' | 'legal_notice' | 'detailed_notice' | 'general'
  variables: string[]
}

interface WhatsAppMessageTemplatesProps {
  onSelectTemplate: (template: MessageTemplate) => void
  debtorInfo?: {
    name: string
    debt: number
    dueDate?: string
    contractNumber?: string
    statusDescription?: string
    executionOffice?: string
    executionNumber?: string
  }
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Ödeme Hatırlatması',
    content: `Sayın {name},

Borç takip süreciniz hakkında bilgilendirme yapmak istiyoruz.

📋 Dosya Bilgileri:
• Sözleşme Hesabı: {contractNumber}
• Durum: {statusDescription}
• İcra Dairesi: {executionOffice}
• Dosya No: {executionNumber}

💰 Güncel borcunuz: {debt} TL

Ödeme yapmak için lütfen en kısa sürede bizimle iletişime geçin.

Saygılarımızla,
Borç Takip Ekibi`,
    category: 'payment_reminder',
    variables: ['name', 'debt', 'contractNumber', 'statusDescription', 'executionOffice', 'executionNumber']
  },
  {
    id: '2',
    title: 'Ödeme Planı Teklifi',
    content: `Sayın {name},

Borcunuz için uygun bir ödeme planı oluşturmak istiyoruz.

📋 Dosya Bilgileri:
• Sözleşme Hesabı: {contractNumber}
• Durum: {statusDescription}
• İcra Dairesi: {executionOffice}

💰 Toplam borç: {debt} TL

Taksitli ödeme seçenekleri için lütfen bizimle görüşün.

Saygılarımızla,
Borç Takip Ekibi`,
    category: 'payment_plan',
    variables: ['name', 'debt', 'contractNumber', 'statusDescription', 'executionOffice']
  },
  {
    id: '3',
    title: 'Hukuki Süreç Uyarısı',
    content: `Sayın {name},

Borcunuzun ödenmemesi durumunda hukuki süreç başlatılacaktır.

📋 Dosya Bilgileri:
• Sözleşme Hesabı: {contractNumber}
• Durum: {statusDescription}
• İcra Dairesi: {executionOffice}
• Dosya No: {executionNumber}

⚖️ Son ödeme tarihi: {dueDate}
💰 Borç tutarı: {debt} TL

Hukuki süreçten kaçınmak için lütfen en kısa sürede ödeme yapın.

Saygılarımızla,
Hukuk Departmanı`,
    category: 'legal_notice',
    variables: ['name', 'debt', 'dueDate', 'contractNumber', 'statusDescription', 'executionOffice', 'executionNumber']
  },
  {
    id: '4',
    title: 'Detaylı Borç Bildirimi',
    content: `Sayın {name},

Borç takip süreciniz ile ilgili detaylı bilgilendirme:

📋 DOSYA BİLGİLERİ:
• Sözleşme Hesabı: {contractNumber}
• Durum Tanıtıcı: {statusDescription}
• İcra Dairesi: {executionOffice}
• İcra Dosya No: {executionNumber}

💰 FİNANSAL BİLGİLER:
• Güncel Borç: {debt} TL
• Son Ödeme Tarihi: {dueDate}

📞 İletişim için: 0850 XXX XX XX

Saygılarımızla,
Borç Takip Departmanı`,
    category: 'detailed_notice',
    variables: ['name', 'debt', 'dueDate', 'contractNumber', 'statusDescription', 'executionOffice', 'executionNumber']
  }
]

const categoryLabels = {
  payment_reminder: 'Ödeme Hatırlatması',
  payment_plan: 'Ödeme Planı',
  legal_notice: 'Hukuki Uyarı',
  detailed_notice: 'Detaylı Bildirim',
  general: 'Genel'
}

export function WhatsAppMessageTemplates({ onSelectTemplate, debtorInfo }: WhatsAppMessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isNewTemplate, setIsNewTemplate] = useState(false)

  const replaceVariables = (content: string, variables: string[] = []) => {
    let result = content
    
    if (debtorInfo) {
      if (variables.includes('name')) {
        result = result.replace(/{name}/g, debtorInfo.name)
      }
      if (variables.includes('debt')) {
        result = result.replace(/{debt}/g, debtorInfo.debt.toLocaleString('tr-TR'))
      }
      if (variables.includes('dueDate') && debtorInfo.dueDate) {
        result = result.replace(/{dueDate}/g, debtorInfo.dueDate)
      }
      if (variables.includes('contractNumber') && debtorInfo.contractNumber) {
        result = result.replace(/{contractNumber}/g, debtorInfo.contractNumber)
      }
      if (variables.includes('statusDescription') && debtorInfo.statusDescription) {
        result = result.replace(/{statusDescription}/g, debtorInfo.statusDescription)
      }
      if (variables.includes('executionOffice') && debtorInfo.executionOffice) {
        result = result.replace(/{executionOffice}/g, debtorInfo.executionOffice)
      }
      if (variables.includes('executionNumber') && debtorInfo.executionNumber) {
        result = result.replace(/{executionNumber}/g, debtorInfo.executionNumber)
      }
    }
    
    return result
  }

  const handleSelectTemplate = (template: MessageTemplate) => {
    const processedTemplate = {
      ...template,
      content: replaceVariables(template.content, template.variables)
    }
    onSelectTemplate(processedTemplate)
  }

  const handleCopyTemplate = async (template: MessageTemplate) => {
    try {
      const processedContent = replaceVariables(template.content, template.variables)
      await navigator.clipboard.writeText(processedContent)
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000) // 2 saniye sonra kopyalama durumunu sıfırla
    } catch (error) {
      console.error('Kopyalama hatası:', error)
      // Fallback: Eski tarayıcılar için
      const textArea = document.createElement('textarea')
      textArea.value = replaceVariables(template.content, template.variables)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate({ ...template })
    setIsEditDialogOpen(true)
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      if (isNewTemplate) {
        // Yeni şablon ekle
        const newTemplate = {
          ...editingTemplate,
          id: Date.now().toString() // Basit ID oluşturma
        }
        setTemplates(prev => [...prev, newTemplate])
      } else {
        // Mevcut şablonu güncelle
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? editingTemplate : t
        ))
      }
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
      setIsNewTemplate(false)
    }
  }

  const handleNewTemplate = () => {
    const newTemplate: MessageTemplate = {
      id: '',
      title: 'Yeni Şablon',
      content: 'Sayın {name},\n\n\n\nSaygılarımızla,\nBorç Takip Ekibi',
      category: 'general',
      variables: ['name']
    }
    setEditingTemplate(newTemplate)
    setIsNewTemplate(true)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Mesaj Şablonları</h4>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-xs px-2"
          onClick={handleNewTemplate}
        >
          <Plus className="w-3 h-3 mr-1" />
          Yeni
        </Button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {templates.map((template) => (
          <div key={template.id} className="border rounded p-2 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center space-x-1">
                <h5 className="text-xs font-medium">{template.title}</h5>
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {categoryLabels[template.category]}
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-5 w-5 p-0 ${copiedId === template.id ? 'text-green-600' : ''}`}
                  onClick={() => handleCopyTemplate(template)}
                  title="Mesajı kopyala"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={() => handleEditTemplate(template)}
                  title="Şablonu düzenle"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mb-2 line-clamp-2">
              {replaceVariables(template.content, template.variables).substring(0, 80)}...
            </p>
            <Button
              size="sm"
              onClick={() => handleSelectTemplate(template)}
              className="w-full h-6 text-[10px] bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Kullan
            </Button>
          </div>
        ))}
      </div>

      {/* Şablon Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isNewTemplate ? 'Yeni Şablon Oluştur' : 'Şablon Düzenle'}</DialogTitle>
            <DialogDescription>
              {isNewTemplate ? 'Yeni bir mesaj şablonu oluşturun' : 'Mesaj şablonunu düzenleyin'}
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Başlık</label>
                <Input
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    title: e.target.value
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    category: e.target.value as MessageTemplate['category']
                  })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="payment_reminder">Ödeme Hatırlatması</option>
                  <option value="payment_plan">Ödeme Planı</option>
                  <option value="legal_notice">Hukuki Uyarı</option>
                  <option value="general">Genel</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Mesaj İçeriği</label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  })}
                  className="mt-1 min-h-[150px]"
                  rows={6}
                />
              </div>
              <div className="text-xs text-gray-500">
                Değişkenler: {'{name}'} - İsim, {'{debt}'} - Borç tutarı, {'{dueDate}'} - Son ödeme tarihi
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Kaydet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}