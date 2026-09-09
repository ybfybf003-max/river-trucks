import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <Header title="River Trucks" subtitle="تسجيل تذاكر الشاحنات وحساب الأوزان" />
      <div className="mx-auto max-w-md px-4 py-6">
        <Dashboard />
      </div>
    </main>
  )
}
