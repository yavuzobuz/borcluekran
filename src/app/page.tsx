'use client'

import { Header } from '@/components/header'
import { SearchForm } from '@/components/search-form'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Lazy load components
const RecentDebtors = dynamic(() => import('@/components/recent-debtors').then(mod => ({ default: mod.RecentDebtors })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
})

const StatsCards = dynamic(() => import('@/components/stats-cards').then(mod => ({ default: mod.StatsCards })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
})

const TodaysPaymentPromises = dynamic(() => import('@/components/todays-payment-promises').then(mod => ({ default: mod.TodaysPaymentPromises })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Borçlu Sorgulama Sistemi
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Modern ve güvenli borçlu takip sistemi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Arama Formu */}
          <div className="lg:col-span-2">
            <SearchForm />
          </div>
          
          {/* İstatistikler */}
          <div className="space-y-6">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>}>
              <StatsCards />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>}>
              <TodaysPaymentPromises />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>}>
              <RecentDebtors />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
