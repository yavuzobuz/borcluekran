import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BarChart3, Settings, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const handleLogout = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Borçlu Sorgulama Sistemi
              </h1>
              <p className="text-sm text-gray-500">
                Hoş geldiniz, {user.email}
              </p>
            </div>
            <form action={handleLogout}>
              <Button variant="outline" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Borçlu Listesi */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Borçlu Listesi</CardTitle>
                  <CardDescription>
                    Mevcut borçluları görüntüle ve yönet
                  </CardDescription>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/borclular">
                <Button className="w-full">
                  Borçluları Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Excel İşlemleri */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Excel İşlemleri</CardTitle>
                  <CardDescription>
                    Excel dosyası yükle ve dışa aktar
                  </CardDescription>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/excel">
                <Button className="w-full">
                  Excel İşlemleri
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analiz */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analiz</CardTitle>
                  <CardDescription>
                    Borç analizi ve raporlar
                  </CardDescription>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/analiz">
                <Button className="w-full">
                  Analiz Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ödeme Sözleri */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ödeme Sözleri</CardTitle>
                  <CardDescription>
                    Ödeme sözlerini yönet
                  </CardDescription>
                </div>
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/odeme-sozleri">
                <Button className="w-full">
                  Ödeme Sözleri
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* WhatsApp Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WhatsApp Testi</CardTitle>
                  <CardDescription>
                    WhatsApp mesaj gönderme testi
                  </CardDescription>
                </div>
                <Settings className="h-8 w-8 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/whatsapp-test">
                <Button className="w-full">
                  WhatsApp Test
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hızlı Erişim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/borclular" className="block">
              <Card className="hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-gray-600">Toplam Borçlu</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/analiz" className="block">
              <Card className="hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-gray-600">Toplam Borç</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/odeme-sozleri" className="block">
              <Card className="hover:bg-gray-50 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">-</div>
                  <div className="text-sm text-gray-600">Aktif Ödeme Sözü</div>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="hover:bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">-</div>
                <div className="text-sm text-gray-600">Bu Ay Tahsilat</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
