import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ordersApi } from '@/api/orders'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import type { SubOrder } from '@/types'

const STATUS_FLOW: Record<string, string[]> = {
  awaiting_payment: ['queued'],
  queued: ['confirmed'],
  confirmed: ['preparing'],
  preparing: ['shipped', 'ready_for_pickup'],
  shipped: ['delivered'],
  ready_for_pickup: ['delivered'],
  delivered: [],
  completed: [],
  cancellation_requested: [],
  cancelled: [],
}

const STATUS_LABELS: Record<string, string> = {
  queued: 'Add to queue',
  confirmed: 'Mark as confirmed',
  preparing: 'Mark as preparing',
  shipped: 'Mark as shipped',
  ready_for_pickup: 'Mark as ready for pickup',
  delivered: 'Mark as delivered',
}

export default function SellerOrdersPage() {
  const { id: highlightId } = useParams<{ id: string }>()
  const [subOrders, setSubOrders] = useState<SubOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const highlightRef = useRef<HTMLDivElement>(null)

  const load = () => {
    ordersApi.mySubOrders().then((res) => setSubOrders(res.results)).finally(() => setIsLoading(false))
  }
  useEffect(load, [])

  useEffect(() => {
    if (!isLoading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isLoading, highlightId])

  const advance = async (id: string, status: string) => {
    if (status === 'queued') {
      await ordersApi.markQueued(id)
    } else {
      await ordersApi.updateSubOrderStatus(id, status)
    }
    load()
  }

  const approveCancel = async (id: string) => {
    await ordersApi.approveCancellation(id)
    load()
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Orders to fulfill</h1>

      <div className="space-y-3">
        {subOrders.map((so) => (
          <div
            key={so.id}
            ref={so.id === highlightId ? highlightRef : null}
            className={`card p-4 ${so.id === highlightId ? 'ring-2 ring-gold-500' : ''}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Order #{so.order.slice(0, 8)}</p>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs capitalize text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
                {so.status.replace(/_/g, ' ')}
              </span>
            </div>

            {so.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm">
                <span>{item.product_name_snapshot} × {item.quantity}</span>
                <PriceTag price={item.subtotal} />
              </div>
            ))}

            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_FLOW[so.status]?.map((next) => (
                <button key={next} onClick={() => advance(so.id, next)} className="btn-primary !px-3 !py-1.5 text-xs">
                  {STATUS_LABELS[next] || next}
                </button>
              ))}
              {so.status === 'cancellation_requested' && (
                <button onClick={() => approveCancel(so.id)} className="btn-ghost !px-3 !py-1.5 text-xs text-clay-500">
                  Approve cancellation ({so.cancellation_reason})
                </button>
              )}
            </div>
          </div>
        ))}
        {subOrders.length === 0 && <p className="text-indigo-500">No orders yet.</p>}
      </div>
    </div>
  )
}