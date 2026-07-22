import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { sellersApi, type SellerDashboard } from '@/api/sellers'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import { useLanguage } from '@/context/LanguageContext'

function StatIcon({ path, bg, fg }: { path: string; bg: string; fg: string }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${fg}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      {icon}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-indigo-400">{label}</p>
        <p className="mt-0.5 break-words text-base font-bold sm:text-lg">{value}</p>
      </div>
    </div>
  )
}

function Wave({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="mt-4 h-12 w-full">
      <path
        d="M0,30 C60,55 140,5 200,25 C260,45 340,5 400,25 L400,60 L0,60 Z"
        fill={fill}
      />
    </svg>
  )
}

function PerformanceList({
  title,
  icon,
  wave,
  items,
}: {
  title: string
  icon: ReactNode
  wave: string
  items: { id: number | string; name: string; sales_count: number }[]
}) {
  return (
    <div className="card overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      {items.map((p) => (
        <div key={p.id} className="flex justify-between border-t border-indigo-100/60 py-2 text-sm first:border-t-0 dark:border-ink-soft">
          <span className="truncate">{p.name}</span>
          <span className="shrink-0 font-medium text-indigo-500">{p.sales_count} sold</span>
        </div>
      ))}
      <Wave fill={wave} />
    </div>
  )
}

export default function SellerDashboardPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<SellerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    sellersApi.dashboard().then(setData).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Spinner label={t('loading')} />
  if (!data) return <p>Unable to load dashboard.</p>

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('nav_seller_dashboard')} 👋</h1>
          <p className="text-sm text-indigo-400">Here's what's happening with your store.</p>
        </div>
        <Link to="/seller/products/new" className="btn-accent">+ New product</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<StatIcon path="M4 19V9m6 10V5m6 14v-7" bg="bg-indigo-100 dark:bg-ink-soft" fg="text-indigo-700 dark:text-indigo-100" />}
          label="Total sales"
          value={<PriceTag price={data.total_sales} />}
        />
        <StatCard
          icon={<StatIcon path="M3 7h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Zm0 0 2-3h14l2 3M16 13h.01" bg="bg-leaf-100" fg="text-leaf-500" />}
          label="Net payout"
          value={<PriceTag price={data.net_payout} />}
        />
        <StatCard
          icon={<StatIcon path="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" bg="bg-gold-100" fg="text-gold-700" />}
          label="Orders pending"
          value={data.orders_pending}
        />
        <StatCard
          icon={<StatIcon path="M21 8 12 3 3 8l9 5 9-5Zm-18 0v8l9 5 9-5V8" bg="bg-indigo-100 dark:bg-ink-soft" fg="text-indigo-700 dark:text-indigo-100" />}
          label="Products"
          value={data.product_count}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        
        <PerformanceList
  title="Best performing"
  icon={<span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-white">★</span>}
  wave="#F0C578"
  items={data.best_performing}
/>
<PerformanceList
  title="Needs attention"
  icon={<span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-500 text-white">!</span>}
  wave="#F8E2DF"
  items={data.worst_performing}
/>
        
      </div>

      <div className="mt-8 card overflow-x-auto p-4">
        <div className="mb-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path d="M21 8 12 3 3 8l9 5 9-5Zm-18 0v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <h2 className="font-semibold">All products</h2>
  </div>
          <Link to="/seller/products" className="text-sm font-medium text-indigo-500 hover:underline">Manage all →</Link>
        </div>
        <table className="w-full min-w-[420px] text-sm">
          <thead className="text-left text-indigo-400">
            <tr><th className="pb-2 font-medium">Product</th><th className="font-medium">Stock</th><th className="font-medium">Sold</th></tr>
          </thead>
          <tbody>
            {data.all_products.slice(0, 10).map((p) => (
              <tr key={p.id} className="border-t border-indigo-50 dark:border-ink-soft">
                <td className="py-2">{p.name}</td>
                <td className={p.is_low_stock ? 'font-semibold text-clay-500' : 'text-indigo-500'}>{p.stock_quantity}</td>
                <td>{p.sales_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}