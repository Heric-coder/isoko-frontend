interface RatingStarsProps {
  rating: string | number
  count?: number
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, count, size = 'sm' }: RatingStarsProps) {
  const value = typeof rating === 'string' ? parseFloat(rating) : rating
  const rounded = Math.round(value)
  const starSize = size === 'sm' ? 'text-xs' : 'text-base'

  return (
    <span className={`inline-flex items-center gap-1 ${starSize}`} aria-label={`Rated ${value} out of 5`}>
      <span className="text-gold-500" aria-hidden="true">
        {'★'.repeat(rounded)}
        <span className="text-indigo-100 dark:text-indigo-300">{'★'.repeat(5 - rounded)}</span>
      </span>
      {count !== undefined && <span className="text-indigo-300">({count})</span>}
    </span>
  )
}
