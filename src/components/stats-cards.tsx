'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'

interface Stats {
  totalDebtors: number
  totalDebt: number
  thisMonthPromises: number
  overduePromises: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalDebtors: 0,
    totalDebt: 0,
    thisMonthPromises: 0,
    overduePromises: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Gerçek API çağrısı yerine örnek veri
    // TODO: Gerçek API endpoint'i oluşturulduğunda burası güncellenecek
    setTimeout(() => {
      setStats({
        totalDebtors: 1247,
        totalDebt: 2850000,
        thisMonthPromises: 89,
        overduePromises: 23
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const cards = [
    {
      title: 'Toplam Borçlu',
      value: stats.totalDebtors.toLocaleString('tr-TR'),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Toplam Borç',
      value: formatCurrency(stats.totalDebt),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Bu Ay Sözler',
      value: stats.thisMonthPromises.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Geciken Sözler',
      value: stats.overduePromises.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">İstatistikler</h3>
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}