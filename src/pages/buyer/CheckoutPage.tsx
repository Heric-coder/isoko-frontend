import { PhoneInput } from '@/components/PhoneInput'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '@/api/client'
import { ordersApi } from '@/api/orders'
import { promotionsApi } from '@/api'
import { LocationFields, type LocationValue } from '@/components/LocationFields'
import { PriceTag } from '@/components/PriceTag'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState<LocationValue>({ province: '', district: '', sector: '', cell: '' })
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mtn_momo' | 'airtel_money'>('cod')
  const [momoPhone, setMomoPhone] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoPreview, setPromoPreview] = useState<number | null>(null)
  const [acknowledgedCutoff, setAcknowledgedCutoff] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!cart || cart.items.length === 0) {
    return <p className="py-16 text-center text-indigo-500">{t('cart_empty')}</p>
  }

  const checkPromo = async () => {
    if (!promoCode) return setPromoPreview(null)
    try {
      const res = await promotionsApi.validateCode(promoCode, parseFloat(cart.total))
      setPromoPreview(res.valid ? res.discount_amount : null)
    } catch {
      setPromoPreview(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acknowledgedCutoff) {
      setError('Please confirm you understand the cancellation and editing policy before placing your order.')
      return
    }

    setIsSubmitting(true)
    try {
      const order = await ordersApi.checkout({
        delivery_full_name: fullName,
        delivery_phone: `+250${phone}`,
        delivery_province: location.province,
        delivery_district: location.district,
        delivery_sector: location.sector,
        delivery_cell: location.cell,
        delivery_notes: notes,
        payment_method: paymentMethod,
        momo_phone: paymentMethod !== 'cod' ? `+250${momoPhone}` : undefined,
        promo_code: promoCode || undefined,
      })
      await refreshCart()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : t('error_generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="card p-4">
          <h2 className="mb-3 font-semibold">{t('checkout_delivery_details')}</h2>
          <div className="space-y-3">
            <div>
              <label className="label">{t('checkout_full_name')}</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="label">{t('checkout_phone')}</label>
              <PhoneInput value={phone} onChange={setPhone} required />
            </div>
            <LocationFields value={location} onChange={setLocation} />
            <div>
              <label className="label">{t('checkout_notes')}</label>
              <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold">{t('checkout_payment_method')}</h2>
          <div className="space-y-2">
            {(['cod', 'mtn_momo', 'airtel_money'] as const).map((method) => (
              <label key={method} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method === 'cod' ? t('checkout_cod') : method === 'mtn_momo' ? t('checkout_mtn') : t('checkout_airtel')}
              </label>
            ))}
            {paymentMethod !== 'cod' && (
              <div className="mt-2">
                <PhoneInput value={momoPhone} onChange={setMomoPhone} required />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card h-fit space-y-3 p-4">
        <div>
          <label className="label">{t('checkout_promo_code')}</label>
          <div className="flex gap-2">
            <input className="input" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} onBlur={checkPromo} />
          </div>
          {promoPreview !== null && (
            <p className="mt-1 text-xs text-leaf-500">Discount: <PriceTag price={promoPreview} /></p>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>{t('cart_subtotal')}</span>
          <PriceTag price={cart.total} />
        </div>

        <label className="flex items-start gap-2 text-xs text-indigo-500">
          <input
            type="checkbox"
            checked={acknowledgedCutoff}
            onChange={(e) => setAcknowledgedCutoff(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span>
            I understand that once the seller queues my order, I won't be able to cancel it or edit the delivery address.
          </span>
        </label>

        {error && <p className="text-sm text-clay-500">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
          {isSubmitting ? t('loading') : t('checkout_place_order')}
        </button>
      </div>
    </form>
  )
}