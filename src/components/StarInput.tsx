interface StarInputProps {
  value: number
  onChange: (value: number) => void
}

export function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex gap-1 text-xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= value ? 'text-gold-500' : 'text-indigo-100 dark:text-indigo-300'}
        >
          ★
        </button>
      ))}
    </div>
  )
}
