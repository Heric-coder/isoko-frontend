import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ordersApi } from '@/api/orders'
import { reviewsApi } from '@/api'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import { StarInput } from '@/components/StarInput'
import { useLanguage } from '@/context/LanguageContext'
import type { Order, SubOrder } from '@/types'

function SubOrderReviews({ subOrder }: { subOrder: SubOrder }) {
  const [sellerRating, setSellerRating] = useState(0)
  const [sellerComment, setSellerComment] = useState('')
  const [sellerSubmitted, setSellerSubmitted] = useState(false)

  const [itemRatings, setItemRatings] = useState<Record<string, number>>({})
  const [itemComments, setItemComments] = useState<Record<string, string>>({})
  const [itemSubmitted, setItemSubmitted] = useState<Record<string, boolean>>({})

  const submitSellerReview = async () => {
    if (!sellerRating) return
    await reviewsApi.addSellerReview(subOrder.id, sellerRating, sellerComment)
    setSellerSubmitted(true)
  }

  const submitItemReview = async (itemId: string) => {
    const rating = itemRatings[itemId]
    if (!rating) return
    await reviewsApi.addProductReview(itemId, rating, itemComments[itemId] || '')
    setItemSubmitted((prev) => ({ ...prev, [itemId]: true }))
  }

  return (
    <div className="mt-3 space-y-3 rounded-md bg-indigo-50 p-3 dark:bg-ink-soft">
      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-100">Leave a review</p>

      {subOrder.items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex-1">{item.product_name_snapshot}</span>
          {itemSubmitted[item.id] ? (
            <span className="text-xs text-leaf-500">Thanks for your review!</span>
          ) : (
            <>
              <StarInput value={itemRatings[item.id] || 0} onChange={(v) => setItemRatings((p) => ({ ...p, [item.id]: v }))} />
              <input
                className="input w-32 text-xs"
                placeholder="Comment (optional)"
                value={itemComments[item.id] || ''}
                onChange={(e) => setItemComments((p) => ({ ...p, [item.id]: e.target.value }))}
              />
              <button onClick={() => submitItemReview(item.id)} className="btn-ghost !px-2 !py-1 text-xs">Submit</button>
            </>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 border-t border-indigo-100 pt-2 text-sm dark:border-ink">
        <span className="flex-1 font-medium">Rate {subOrder.seller_name}</span>
        {sellerSubmitted ? (
          <span className="text-xs text-leaf-500">Thanks for your review!</span>
        ) : (
          <>
            <StarInput value={sellerRating} onChange={setSellerRating} />
            <input className="input w-32 text-xs" placeholder="Comment (optional)" value={sellerComment} onChange={(e) => setSellerComment(e.target.value)} />
            <button onClick={submitSellerReview} className="btn-ghost !px-2 !py-1 text-xs">Submit</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cancelReason, setCancelReason] = useState<Record<string, string>>({})

  const load = () => {
    if (!id) return
    ordersApi.orderDetail(id).then(setOrder).finally(() => setIsLoading(false))
  }

  useEffect(load, [id])

  if (isLoading) return <Spinner label={t('loading')} />
  if (!order) return <p>Order not found.</p>

  const handleConfirm = async (subOrderId: string) => {
    await ordersApi.confirmDelivery(subOrderId)
    load()
  }

  const handleCancelRequest = async (subOrderId: string) => {
    const reason = cancelReason[subOrderId]
    if (!reason) return
    await ordersApi.requestCancellation(subOrderId, reason)
    load()
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
      <p className="mb-6 text-sm text-indigo-500">{new Date(order.created_at).toLocaleString()}</p>

      <div className="mb-6 card p-4 text-sm">
        <h2 className="mb-2 font-semibold">{t('checkout_delivery_details')}</h2>
        <p>{order.delivery_full_name} — {order.delivery_phone}</p>
        <p>{order.delivery_sector}, {order.delivery_district}, {order.delivery_province}</p>
        {order.delivery_notes && <p className="text-indigo-500">{order.delivery_notes}</p>}
      </div>

      <div className="space-y-4">
        {order.sub_orders.map((so) => (
          <div key={so.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{so.seller_name}</h3>
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

            <div className="mt-2 flex justify-between border-t border-indigo-50 pt-2 text-sm font-medium dark:border-ink-soft">
              <span>Subtotal</span>
              <PriceTag price={so.subtotal} />
            </div>

            {so.status === 'delivered' && (
              <button onClick={() => handleConfirm(so.id)} className="btn-primary mt-3 w-full">
                {t('order_status_confirm_delivery')}
              </button>
            )}

            {so.status === 'completed' && <SubOrderReviews subOrder={so} />}

            {!['completed', 'cancelled', 'cancellation_requested'].includes(so.status) && (
              <div className="mt-3 flex gap-2">
                <input
                  className="input"
                  placeholder="Reason for cancellation"
                  value={cancelReason[so.id] || ''}
                  onChange={(e) => setCancelReason((prev) => ({ ...prev, [so.id]: e.target.value }))}
                />
                <button onClick={() => handleCancelRequest(so.id)} className="btn-ghost whitespace-nowrap">
                  {t('order_status_request_cancel')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between border-t border-indigo-100 pt-4 text-lg font-bold dark:border-ink-soft">
        <span>Total</span>
        <PriceTag price={order.total_amount} />
      </div>
    </div>
  )
}
