import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products'
import { PriceTag } from '@/components/PriceTag'
import { Spinner } from '@/components/Spinner'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductListItem } from '@/types'

export default function SellerProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    productsApi.mine().then((res) => setProducts(res.results)).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Spinner label={t('loading')} />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Products</h1>
        <Link to="/seller/products/new" className="btn-accent">+ New product</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} to={`/seller/products/${p.id}/edit`} className="card overflow-hidden hover:shadow-md">
            {p.thumbnail && <img src={p.thumbnail} alt={p.name_en} className="aspect-square w-full object-cover" />}
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium">{p.name_en}</p>
              <PriceTag price={p.price} discountPrice={p.discount_price} className="text-sm" />
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="col-span-full text-indigo-500">No products yet — create your first one.</p>}
      </div>
    </div>
  )
}
