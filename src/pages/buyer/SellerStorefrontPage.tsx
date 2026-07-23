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
  const [showReviews, setShowReviews] = useState(false)

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

  // Lock page scroll while the reviews modal is open
  useEffect(() => {
    document.body.style.overflow = showReviews ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showReviews])

  if (isLoading) return <Spinner label={t('loading')} />
  if (!seller) return <p>Seller not found.</p>

  const marqueeStyle = `
    @keyframes storefront-marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-storefront-marquee {
      animation: storefront-marquee 22s linear infinite;
    }
  `

  return (
    <div>
      <style>{marqueeStyle}</style>
      <div className="flex flex-wrap items-stretch gap-4 sm:h-48 sm:flex-nowrap">
        <div className="flex w-full shrink-0 gap-4 sm:w-72">
          {seller.logo ? (
            <img src={seller.logo} alt={seller.store_name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
              {seller.store_name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-ink dark:text-white">{seller.store_name}</h1>
            <div className="mt-1 flex flex-col gap-0.5">
              <RatingStars rating={seller.rating_avg} count={seller.rating_count} />
              <span className="text-sm leading-tight text-indigo-500">{seller.location}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowReviews(true)}
              className="mt-1 flex w-fit items-center gap-1 text-sm text-indigo-200 hover:text-white"
              aria-haspopup="dialog"
              aria-expanded={showReviews}
            >
              {`See reviews (${seller.rating_count})`}
              <svg
                className={`h-4 w-4 transition-transform ${showReviews ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seller.description && (
              <div className="mt-1 w-full overflow-hidden">
                <p
                  className={`whitespace-nowrap text-sm text-indigo-700 dark:text-indigo-100 ${
                    seller.description.length > 40 ? 'inline-block animate-storefront-marquee' : 'truncate'
                  }`}
                >
                  {seller.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {seller.banner && (
          <div className="h-48 min-w-[200px] flex-1 overflow-hidden rounded-card bg-indigo-50 dark:bg-ink-soft">
            <img src={seller.banner} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        
      </div>

      <h2 className="mb-4 mt-4 text-lg font-bold text-ink dark:text-white">Products</h2>
      {products.length === 0 ? (
        <p className="text-indigo-500">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {showReviews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowReviews(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-card bg-white shadow-lg dark:bg-ink-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-indigo-100 px-4 py-3 dark:border-ink">
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                Reviews ({seller.rating_count})
              </h3>
              <button
                type="button"
                onClick={() => setShowReviews(false)}
                aria-label="Close"
                className="rounded-full p-1 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-ink dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-3">
              <SellerReviews sellerId={seller.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}