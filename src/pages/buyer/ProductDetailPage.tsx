import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productsApi } from '@/api/products'
import { wishlistApi } from '@/api'
import { PriceTag } from '@/components/PriceTag'
import { ProductCard } from '@/components/ProductCard'
import { ProductReviews } from '@/components/ProductReviews'
import { RatingStars } from '@/components/RatingStars'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductDetail, ProductListItem, ProductVariant } from '@/types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useLanguage()
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [variant, setVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedMessage, setAddedMessage] = useState('')
  const [related, setRelated] = useState<ProductListItem[]>([])
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    productsApi
      .detail(id)
      .then(setProduct)
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    productsApi.related(id).then(setRelated).catch(() => setRelated([]))
  }, [id])

  useEffect(() => {
    if (!id || !user) return
    wishlistApi.list().then((res) => {
      const match = (res.results as { id: string; product: string }[]).find((w) => w.product === id)
      if (match) {
        setIsWishlisted(true)
        setWishlistItemId(match.id)
      }
    }).catch(() => {})
  }, [id, user])

  if (isLoading) return <Spinner label={t('loading')} />
  if (!product) return <p>Product not found.</p>

  const name = lang === 'rw' && product.name_rw ? product.name_rw : product.name_en
  const description = lang === 'rw' && product.description_rw ? product.description_rw : product.description_en
  const stock = variant ? variant.stock_quantity : product.stock_quantity
  const images = variant?.images.length ? variant.images : product.images

  const handleAddToCart = async () => {
    if (!user) return navigate('/login')
    await addItem(product.id, quantity, variant?.id)
    setAddedMessage('Added to cart!')
    setTimeout(() => setAddedMessage(''), 2000)
  }

  const handleWishlist = async () => {
    if (!user) return navigate('/login')
    if (isWishlisted && wishlistItemId) {
      await wishlistApi.remove(wishlistItemId)
      setIsWishlisted(false)
      setWishlistItemId(null)
    } else {
      const entry = await wishlistApi.add(product.id) as { id: string }
      setIsWishlisted(true)
      setWishlistItemId(entry.id)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-0 lg:grid-cols-2">
      <div>
        <div className="relative w-full overflow-hidden rounded-card bg-indigo-50 dark:bg-ink-soft" style={{ aspectRatio: '2/1' }}>
          {images[activeImage] && (
            <img src={images[activeImage].image} alt={name} className="h-full w-full object-contain object-center" />
          )}

          {images.length > 1 && (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 sm:right-4 sm:gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-10 w-10 overflow-hidden rounded-md border-2 bg-white sm:h-20 sm:w-20 ${i === activeImage ? 'border-gold-500' : 'border-transparent'}`}
                >
                  <img src={img.image} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{product.category_name}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white">{name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={product.rating_avg} count={product.rating_count} size="md" />
          <Link to={`/sellers/${product.seller_slug}`} className="text-sm text-indigo-500 hover:underline">
            by {product.seller_name}
          </Link>
        </div>

        <div className="mt-4">
          <PriceTag price={product.price} discountPrice={product.discount_price} className="text-2xl" />
        </div>

        {product.variants.length > 0 && (
          <div className="mt-4">
            <span className="label">Variant</span>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={`rounded-full border px-3 py-1 text-sm ${variant?.id === v.id ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-100'}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 whitespace-pre-line text-sm text-indigo-700 dark:text-indigo-100">{description}</p>

        <dl className="mt-4 space-y-1 text-sm text-indigo-500">
          <div className="flex justify-between"><dt>Condition</dt><dd className="capitalize">{product.condition}</dd></div>
          {product.warranty_info && <div className="flex justify-between"><dt>Warranty</dt><dd>{product.warranty_info}</dd></div>}
          {product.estimated_delivery_time && <div className="flex justify-between"><dt>Delivery</dt><dd>{product.estimated_delivery_time}</dd></div>}
          <div className="flex justify-between"><dt>Delivery fee</dt><dd><PriceTag price={product.delivery_fee} /></dd></div>
        </dl>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))}
            className="input w-20"
            disabled={stock === 0}
          />
          <button onClick={handleAddToCart} disabled={stock === 0} className="btn-primary flex-1">
            {stock === 0 ? t('out_of_stock') : t('add_to_cart')}
          </button>
          <button
            onClick={handleWishlist}
            aria-label={t('add_to_wishlist')}
            className={`btn-ghost ${isWishlisted ? 'text-gold-500' : ''}`}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        </div>
        {addedMessage && <p className="mt-2 text-sm text-leaf-500">{addedMessage}</p>}
      </div>

      <div className="lg:col-span-2">
        <ProductReviews productId={product.id} />
      </div>

      {related.length > 0 && (
        <div className="lg:col-span-2">
          <h2 className="mb-4 mt-6 text-lg font-bold text-ink dark:text-white">{t('related_products_title')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}