interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function PhoneInput({ value, onChange, error, required }: PhoneInputProps) {
  return (
    <div>
      <div className="flex">
        <span className="input flex items-center rounded-r-none border-r-0 !w-16 justify-center bg-indigo-50 dark:bg-ink-soft text-indigo-500">
          +250
        </span>
        <input
          type="tel"
          placeholder="788123456"
          maxLength={9}
          className={`input rounded-l-none ${error ? 'border-clay-500' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
          required={required}
        />
      </div>
      {error && <p className="mt-1 text-xs text-clay-500">{error}</p>}
      {value && !/^7[2389]\d{7}$/.test(value) && (
        <p className="mt-1 text-xs text-clay-500">Enter 9 digits starting with 72, 73, 78, or 79</p>
      )}
    </div>
  )
}