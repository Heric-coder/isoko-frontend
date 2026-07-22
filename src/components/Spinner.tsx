export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-indigo-500">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-100 border-t-gold-500"
        role="status"
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
