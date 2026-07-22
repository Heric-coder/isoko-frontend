import { useEffect, useState, type ReactNode } from 'react'
import { siteApi } from '@/api'
import { sellersApi } from '@/api/sellers'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import type { SellerProfile } from '@/types'

interface Metrics {
  total_sales: number
  commission_earned: number
  pending_seller_approvals: number
  active_sellers: number
  low_stock_products: number
  refund_dispute_queue: { pending: number; escalated: number }
  top_sellers: Array<{ seller__store_name: string; total_sales: number }>
}

function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-indigo-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [pendingSellers, setPendingSellers] = useState<SellerProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    Promise.all([
      siteApi.metrics() as Promise<Metrics>,
      sellersApi.applications('pending'),
    ]).then(([m, sellers]) => {
      setMetrics(m)
      setPendingSellers(sellers.results)
    }).finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  const decide = async (id: string, approve: boolean) => {
    await sellersApi.decide(id, approve)
    load()
  }

  if (isLoading) return <Spinner label="Loading…" />
  if (!metrics) return <p>Unable to load metrics.</p>

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total sales" value={<PriceTag price={metrics.total_sales} />} />
        <StatCard label="Commission earned" value={<PriceTag price={metrics.commission_earned} />} />
        <StatCard label="Active sellers" value={metrics.active_sellers} />
        <StatCard label="Low stock alerts" value={metrics.low_stock_products} />
      </div>

      <div className="mt-8 card p-4">
        <h2 className="mb-3 font-semibold">Pending seller applications ({pendingSellers.length})</h2>
        {pendingSellers.length === 0 && <p className="text-sm text-indigo-500">Nothing pending.</p>}
        {pendingSellers.map((seller) => (
          <div key={seller.id} className="flex items-center justify-between border-t border-indigo-50 py-3 first:border-0 dark:border-ink-soft">
            <div>
              <p className="text-sm font-medium">{seller.store_name}</p>
              <p className="text-xs text-indigo-500">{seller.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decide(seller.id, true)} className="btn-primary !px-3 !py-1.5 text-xs">Approve</button>
              <button onClick={() => decide(seller.id, false)} className="btn-ghost !px-3 !py-1.5 text-xs text-clay-500">Reject</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-4">
        <h2 className="mb-3 font-semibold">Dispute queue</h2>
        <p className="text-sm">Pending: {metrics.refund_dispute_queue.pending} · Escalated: {metrics.refund_dispute_queue.escalated}</p>
      </div>
    </div>
  )
}
