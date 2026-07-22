import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { wishlistApi } from '@/api'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import { useLanguage } from '@/context/LanguageContext'

interface WishlistEntry {
  id: string
  product: string
  product_name: string
  price: string
  thumbnail: string | null
  is_available: boolean
}

export default function WishlistPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<WishlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    wishlistApi.list().then((res) => setItems(res.results as WishlistEntry[])).finally(() => setIsLoading(false))
  }
  useEffect(load, [])

  const remove = async (id: string) => {
    await wishlistApi.remove(id)
    load()
  }

  if (isLoading) return <Spinner label={t('loading')} />
  if (items.length === 0) return <p className="py-16 text-center text-indigo-500">{t('nav_wishlist')}: nothing saved yet.</p>

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{t('nav_wishlist')}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <Link to={`/products/${item.product}`}>
              {item.thumbnail && <img src={item.thumbnail} alt={item.product_name} className="aspect-square w-full object-cover" />}
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium">{item.product_name}</p>
                <PriceTag price={item.price} className="text-sm" />
              </div>
            </Link>
            <button onClick={() => remove(item.id)} className="w-full border-t border-indigo-50 py-2 text-xs text-clay-500 hover:bg-clay-100 dark:border-ink-soft">
              {t('cart_remove')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
