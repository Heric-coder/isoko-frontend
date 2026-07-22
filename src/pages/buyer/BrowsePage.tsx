import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { productsApi, type ProductQuery } from '@/api/products'
import { ProductCard } from '@/components/ProductCard'
import { Spinner } from '@/components/Spinner'
import { HotDealsWidget } from '@/components/HotDealsWidget'
import { useLanguage } from '@/context/LanguageContext'
import type { Category, ProductListItem } from '@/types'

export default function BrowsePage() {
  const { t, lang } = useLanguage()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const asideRef = useRef<HTMLElement>(null)
  const [asideHeight, setAsideHeight] = useState<number>()
  const [stickyTop, setStickyTop] = useState<number>(16)
  const [isMobile, setIsMobile] = useState(false)

  const query: ProductQuery = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    sort: (searchParams.get('sort') as ProductQuery['sort']) || undefined,
    on_discount: searchParams.get('on_discount') === 'true' || undefined,
    in_stock: true,
    price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
  }

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setIsLoading(true)
    productsApi
      .list(query)
      .then((res) => setProducts(res.results))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    function updateHeight() {
      if (!asideRef.current) return
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setAsideHeight(240)
        return
      }
      const headerEl = document.querySelector('header')
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0
      const gap = 16
      setStickyTop(headerHeight + gap)
      setAsideHeight(window.innerHeight - headerHeight - gap * 2)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-6 md:grid-cols-[220px_1fr] md:items-start">
      <aside
        ref={asideRef}
        className="md:sticky"
        style={{ top: isMobile ? undefined : stickyTop, height: isMobile ? undefined : asideHeight }}
      >
        <div className="flex h-full flex-col space-y-3 md:space-y-6 md:overflow-y-auto">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-indigo-900 dark:text-white">{t('filter_category')}</h3>
            <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', query.category === cat.id ? undefined : cat.id)}
                  className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors md:rounded-md"
                  style={{
                    borderColor: cat.accent_color,
                    backgroundColor: query.category === cat.id ? cat.accent_color : 'transparent',
                    color: query.category === cat.id ? '#fff' : cat.accent_color,
                  }}
                >
                  {lang === 'rw' && cat.name_rw ? cat.name_rw : cat.name_en}
                </button>
              ))}
              <Link
                to="/wishlist"
                aria-label={t('nav_wishlist')}
                className={`ml-auto md:hidden ${location.pathname === '/wishlist' ? 'text-gold-500' : 'text-indigo-500 dark:text-indigo-300'}`}
              >
                {location.pathname === '/wishlist' ? '♥' : '♡'}
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <HotDealsWidget />
          </div>
        </div>
      </aside>

      <div>
        <div className="mb-4 flex flex-nowrap items-center justify-between gap-3 text-sm sm:gap-4 sm:text-base">
          <p className="shrink-0 whitespace-nowrap text-ink dark:text-white">{products.length} results</p>
          <label className="mx-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-ink dark:text-white">
            <input
              type="checkbox"
              checked={query.on_discount === true}
              onChange={(e) => updateParam('on_discount', e.target.checked ? 'true' : undefined)}
            />
            <span>{t('filter_discount')}</span>
          </label>
          <select
            value={query.sort || ''}
            onChange={(e) => updateParam('sort', e.target.value || undefined)}
            className="input shrink-0 !w-auto !px-2 !text-sm sm:!text-base"
          >
            <option value="">{t('sort_by')}</option>
            <option value="newest">{t('sort_newest')}</option>
            <option value="price_asc">{t('sort_price_asc')}</option>
            <option value="price_desc">{t('sort_price_desc')}</option>
            <option value="best_selling">{t('sort_best_selling')}</option>
            <option value="top_rated">{t('sort_top_rated')}</option>
          </select>
        </div>

        {isLoading ? (
          <Spinner label={t('loading')} />
        ) : products.length === 0 && query.search ? (
          <p className="text-sm text-indigo-500">
            No products found for "{query.search}". Try a different search term.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}