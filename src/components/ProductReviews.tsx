import { useEffect, useState } from 'react'
import { reviewsApi } from '@/api'
import { RatingStars } from './RatingStars'
import { useLanguage } from '@/context/LanguageContext'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  comment: string
  seller_response: string
  created_at: string
}

export function ProductReviews({ productId }: { productId: string }) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    reviewsApi.productReviews(productId).then((res: any) => setReviews(res.results || res)).finally(() => setIsLoading(false))
  }, [productId])

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold">{t('reviews')}</h2>
      {isLoading && <p className="text-sm text-indigo-500">{t('loading')}</p>}
      {!isLoading && reviews.length === 0 && <p className="text-sm text-indigo-500">{t('no_reviews_yet')}</p>}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-indigo-50 pb-4 dark:border-ink-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{review.reviewer_name}</span>
              <RatingStars rating={review.rating} />
            </div>
            {review.comment && <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-100">{review.comment}</p>}
            {review.seller_response && (
              <div className="mt-2 rounded-md bg-indigo-50 p-2 text-xs dark:bg-ink-soft">
                <span className="font-semibold">Seller response: </span>{review.seller_response}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-indigo-400">
        You can leave a review from your order history once an order is marked complete.
      </p>
    </section>
  )
}
