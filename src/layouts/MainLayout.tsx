import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3 md:py-6">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}