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

export function SellerReviews({ sellerId }: { sellerId: string }) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    reviewsApi.sellerReviews(sellerId).then((res: any) => setReviews(res.results || res)).finally(() => setIsLoading(false))
  }, [sellerId])

  return (
    <section className="mt-2">
      <h2 className="mb-2 text-lg font-bold">{t('reviews')}</h2>
      {isLoading && <p className="text-sm text-indigo-500">{t('loading')}</p>}
      {!isLoading && reviews.length === 0 && <p className="text-sm text-indigo-500">{t('no_reviews_yet')}</p>}

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`border-indigo-50 dark:border-ink-soft ${
              index === reviews.length - 1 ? '' : 'border-b pb-4'
            }`}
          >
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
    </section>
  )
}