import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productsApi } from '@/api/products'
import { sellersApi } from '@/api/sellers'
import { ProductCard } from '@/components/ProductCard'
import { SellerReviews } from '@/components/SellerReviews'
import { RatingStars } from '@/components/RatingStars'
import { Spinner } from '@/components/Spinner'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductListItem, SellerProfile } from '@/types'

export default function SellerStorefrontPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useLanguage()

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    sellersApi
      .storefront(slug)
      .then((s) => {
        setSeller(s)
        return productsApi.list({ seller: s.id })
      })
      .then((res) => setProducts(res.results))
      .finally(() => setIsLoading(false))
  }, [slug])

  if (isLoading) return <Spinner label={t('loading')} />
  if (!seller) return <p>Seller not found.</p>

  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-4 sm:h-48 sm:flex-nowrap">
        <div className="flex gap-4">
          {seller.logo ? (
            <img src={seller.logo} alt={seller.store_name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
              {seller.store_name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">{seller.store_name}</h1>
            <div className="mt-1 flex flex-col gap-0.5">
              <RatingStars rating={seller.rating_avg} count={seller.rating_count} />
              <span className="text-sm leading-tight text-indigo-500">{seller.location}</span>
            </div>
            <div className="mt-2">
              <SellerReviews sellerId={seller.id} />
            </div>
            {seller.description && (
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-indigo-700 dark:text-indigo-100">{seller.description}</p>
            )}
          </div>
        </div>

        {seller.banner && (
          <div className="h-48 min-w-[200px] flex-1 overflow-hidden rounded-card bg-indigo-50 dark:bg-ink-soft">
            <img src={seller.banner} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        
      </div>

      <h2 className="mb-4 mt-2 text-lg font-bold text-ink dark:text-white">Products</h2>
      {products.length === 0 ? (
        <p className="text-indigo-500">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}