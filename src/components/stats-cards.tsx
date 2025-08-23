'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, TrendingUp, Calendar } from 'lucide-react'

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
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Stats API error:', response.statusText)
          // Fallback to example data
          setStats({
            totalDebtors: 0,
            totalDebt: 0,
            thisMonthPromises: 0,
            overduePromises: 0
          })
        }
      } catch (error) {
        console.error('Stats fetch error:', error)
        // Fallback to example data
        setStats({
          totalDebtors: 0,
          totalDebt: 0,
          thisMonthPromises: 0,
          overduePromises: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
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
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Aktif Takipler',
      value: (stats as any).activeDebtors?.toLocaleString('tr-TR') || stats.thisMonthPromises.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
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
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">İstatistikler</h3>
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow border-l-3 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
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