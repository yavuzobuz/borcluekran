import { SearchForm } from '@/components/search-form'
import { RecentDebtors } from '@/components/recent-debtors'
import { StatsCards } from '@/components/stats-cards'
import { Header } from '@/components/header'
import { TodaysPaymentPromises } from '@/components/todays-payment-promises'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Borçlu Sorgulama Sistemi
          </h1>
          <p className="text-lg text-gray-600">
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
            <StatsCards />
            <TodaysPaymentPromises />
            <RecentDebtors />
          </div>
        </div>
      </main>
    </div>
  )
}
