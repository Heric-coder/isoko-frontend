import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '@/api/orders'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import { useLanguage } from '@/context/LanguageContext'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ordersApi.myOrders().then((res) => setOrders(res.results)).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Spinner label={t('loading')} />
  if (orders.length === 0) return <p className="py-16 text-center text-indigo-500">{t('orders_empty')}</p>

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{t('orders_title')}</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="card block p-4 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-indigo-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <PriceTag price={order.total_amount} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {order.sub_orders.map((so) => (
                <span key={so.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
                  {so.seller_name}: {so.status.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
