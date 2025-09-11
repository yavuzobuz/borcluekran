'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Search, Users, BarChart3, Calendar, Menu, X, LogIn, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthProvider'

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Search },
    { name: 'Borçlu Listesi', href: '/borclular', icon: Users },
    { name: 'Ödeme Sözleri', href: '/odeme-sozleri', icon: Calendar },
    { name: 'Analiz', href: '/analiz', icon: BarChart3 },
    { name: 'Excel İşlemleri', href: '/excel', icon: FileSpreadsheet },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Borçlu Sistemi
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Giriş</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="flex items-center space-x-2">
                    <span>Kayıt Ol</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Menüyü aç/kapat"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Auth */}
              <div className="px-4 py-3 border-t border-gray-200 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-3">
                      {user.email}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" className="block">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-2">
                        <LogIn className="w-4 h-4" />
                        <span>Giriş</span>
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="block">
                      <Button size="sm" className="w-full">
                        Kayıt Ol
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}