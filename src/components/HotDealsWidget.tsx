import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductListItem } from '@/types'

export function HotDealsWidget() {
  const { lang } = useLanguage()
  const [deals, setDeals] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    productsApi
      .list({ is_hot_deal: true })
      .then((res) => setDeals(res.results.slice(0, 5)))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (deals.length < 2) return
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % deals.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [deals.length])

  const active = deals[activeIndex]

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-2 text-sm font-semibold text-indigo-900 dark:text-white">Hot Deals</h3>

      {isLoading ? (
        <p className="text-xs text-indigo-400 dark:text-indigo-200">Loading...</p>
      ) : deals.length === 0 ? (
        <p className="text-xs text-indigo-400 dark:text-indigo-200">No hot deals right now.</p>
      ) : (
        <Link
          key={active.id}
          to={`/products/${active.id}`}
          className="group flex flex-col overflow-hidden rounded-xl md:rounded-md md:flex-1"
        >
          <div className="relative flex h-40 overflow-hidden rounded-xl md:h-auto md:flex-1 md:rounded-md bg-indigo-100 dark:bg-ink-soft">
            {active.thumbnail ? (
              <img
                src={active.thumbnail}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-indigo-300">
                No image
              </div>
            )}

            {deals.length > 1 && (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {deals.map((d, i) => (
                  <span
                    key={d.id}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i === activeIndex ? 'bg-gold-500' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 pb-1">
            <p className="truncate text-xs font-medium text-ink dark:text-white">
              {lang === 'rw' && active.name_rw ? active.name_rw : active.name_en}
            </p>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-bold text-gold-600 dark:text-gold-500">
                {Number(active.effective_price).toLocaleString()} RWF
              </span>
              {active.discount_price && (
                <span className="text-xs text-indigo-400 line-through dark:text-indigo-300">
                  {Number(active.price).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}