import { Link } from 'react-router-dom'
import { PriceTag } from '@/components/PriceTag'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart()
  const { t } = useLanguage()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-indigo-500">{t('cart_empty')}</p>
        <Link to="/products" className="btn-primary">{t('cart_continue_shopping')}</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-4 text-xl font-bold">{t('cart_title')}</h1>
        {cart.grouped_by_seller.map((group) => (
          <div key={group.seller_id} className="card mb-4 p-4">
            <h2 className="mb-3 text-sm font-semibold text-indigo-900 dark:text-white">{group.seller_name}</h2>
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-indigo-50 py-3 last:border-0 dark:border-ink-soft">
                {item.thumbnail && <img src={item.thumbnail} alt="" className="h-16 w-16 rounded object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <PriceTag price={item.unit_price} className="text-sm" />
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, Number(e.target.value))}
                  className="input w-16 text-center"
                />
                <button onClick={() => removeItem(item.id)} className="text-sm text-clay-500 hover:underline">
                  {t('cart_remove')}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card h-fit p-4">
        <div className="flex justify-between text-sm">
          <span>{t('cart_subtotal')}</span>
          <PriceTag price={cart.total} />
        </div>
        <Link to="/checkout" className="btn-accent mt-4 w-full">{t('cart_checkout')}</Link>
      </div>
    </div>
  )
}