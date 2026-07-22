import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { wishlistApi } from '@/api'
import { PriceTag } from './PriceTag'
import { RatingStars } from './RatingStars'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { ProductListItem } from '@/types'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://isoko-backend-zsb6.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')

export function ProductCard({ product }: { product: ProductListItem }) {
  const { lang, t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const name = lang === 'rw' && product.name_rw ? product.name_rw : product.name_en

  useEffect(() => {
    if (!user) return
    wishlistApi.list().then((res) => {
      const match = (res.results as { id: string; product: string }[]).find((w) => w.product === product.id)
      if (match) {
        setIsWishlisted(true)
        setWishlistItemId(match.id)
      }
    }).catch(() => {})
  }, [user, product.id])

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/login')
    try {
      if (isWishlisted && wishlistItemId) {
        await wishlistApi.remove(wishlistItemId)
        setIsWishlisted(false)
        setWishlistItemId(null)
      } else {
        const entry = await wishlistApi.add(product.id) as { id: string }
        setIsWishlisted(true)
        setWishlistItemId(entry.id)
      }
    } catch {
      /* request failed — no-op */
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const shareUrl = `${API_ORIGIN}/share/products/${product.id}/`
    const priceText = `${Number(product.effective_price ?? product.price).toLocaleString()} RWF`
    const shareText = `${name} — ${priceText}`

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: shareText, url: shareUrl })
      } catch {
        /* user cancelled the share sheet — nothing to do */
      }
      return
    }

    // Desktop fallback: open WhatsApp Web share with text + link
    const waText = encodeURIComponent(`${shareText}\n${shareUrl}`)
    window.open(`https://wa.me/?text=${waText}`, '_blank')
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="card accent-rail group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
      style={{ borderLeftColor: product.category_accent_color || '#24344D' }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-indigo-50 dark:bg-ink">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-indigo-300">{t('loading')}</div>
        )}
        <button
          onClick={handleWishlist}
          aria-label={t('add_to_wishlist')}
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-ink/80"
        >
          <span className={isWishlisted ? 'text-gold-500' : 'text-indigo-700 dark:text-white'}>
            {isWishlisted ? '♥' : '♡'}
          </span>
        </button>
        <button
          onClick={handleShare}
          aria-label="Share"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-sm hover:bg-white dark:bg-ink/80 dark:text-white"
        >
          ⤴
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">{product.category_name}</span>
        <h3 className="line-clamp-2 text-sm font-semibold text-ink dark:text-white">{name}</h3>
        <Link
          to={`/sellers/${product.seller_slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-indigo-500 hover:underline dark:text-indigo-300"
        >
          {product.seller_name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag price={product.price} discountPrice={product.discount_price} className="text-sm" />
          <RatingStars rating={product.rating_avg} count={product.rating_count} />
        </div>

        {!product.is_available && (
          <span className="mt-1 w-fit rounded-full bg-clay-100 px-2 py-0.5 text-xs font-medium text-clay-500">
            {t('out_of_stock')}
          </span>
        )}
      </div>
    </Link>
  )
}