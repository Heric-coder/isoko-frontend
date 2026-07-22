interface PriceTagProps {
  price: string | number
  discountPrice?: string | number | null
  className?: string
}

function formatRwf(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(num) + ' RWF'
}

export function PriceTag({ price, discountPrice, className = '' }: PriceTagProps) {
  const hasDiscount = discountPrice && parseFloat(String(discountPrice)) > 0

  return (
    <span className={`font-mono ${className}`}>
      {hasDiscount ? (
        <>
          <span className="font-semibold text-clay-500">{formatRwf(discountPrice!)}</span>
          <span className="ml-2 text-xs text-indigo-300 line-through">{formatRwf(price)}</span>
        </>
      ) : (
        <span className="font-semibold">{formatRwf(price)}</span>
      )}
    </span>
  )
}
