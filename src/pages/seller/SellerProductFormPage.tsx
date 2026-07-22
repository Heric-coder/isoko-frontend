import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiRequestError } from '@/api/client'
import { productsApi } from '@/api/products'
import { Spinner } from '@/components/Spinner'
import type { Category, ProductImage } from '@/types'

const emptyForm = {
  category: '',
  name_en: '',
  name_rw: '',
  description_en: '',
  description_rw: '',
  brand: '',
  price: '',
  discount_price: '',
  stock_quantity: '0',
  condition: 'new',
  delivery_fee: '0',
  estimated_delivery_time: '',
}

export default function SellerProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [originalForm, setOriginalForm] = useState(emptyForm)
  const [images, setImages] = useState<ProductImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    productsApi.categories().then(setCategories)
  }, [])

  useEffect(() => {
    if (!id) return
    productsApi.detail(id).then((p) => {
      const loaded = {
        category: p.category,
        name_en: p.name_en,
        name_rw: p.name_rw,
        description_en: p.description_en,
        description_rw: p.description_rw,
        brand: p.brand,
        price: p.price,
        discount_price: p.discount_price || '',
        stock_quantity: String(p.stock_quantity),
        condition: p.condition,
        delivery_fee: p.delivery_fee,
        estimated_delivery_time: p.estimated_delivery_time,
      }
      setForm(loaded)
      setOriginalForm(loaded)
      setImages(p.images)
      setIsLoading(false)
    })
  }, [id])

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleAddImage = async (file: File) => {
    if (!id) return
    setIsUploading(true)
    setUploadMessage('')
    try {
      const uploaded = await productsApi.uploadImage(id, file, images.length === 0)
      setImages((prev) => [...prev, { id: uploaded.id, image: uploaded.image, is_main: images.length === 0, sort_order: prev.length, variant: null }])
      setUploadMessage('Photo uploaded.')
      setTimeout(() => setUploadMessage(''), 2500)
    } catch {
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!id) return
    if (!confirm('Remove this photo?')) return
    try {
      await productsApi.deleteImage(id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      setUploadMessage('Photo removed.')
      setTimeout(() => setUploadMessage(''), 2500)
    } catch {
      alert('Failed to remove photo')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaveMessage('')

    if (isEditing && JSON.stringify(form) === JSON.stringify(originalForm)) {
      setSaveMessage('No changes to save.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        discount_price: form.discount_price || null,
        stock_quantity: Number(form.stock_quantity),
      }
      if (isEditing && id) {
        await productsApi.update(id, payload)
      } else {
        await productsApi.create(payload)
      }
      setSaveMessage(isEditing ? 'Changes saved.' : 'Product created.')
      setTimeout(() => navigate('/seller/products'), 900)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : 'Something went wrong. Please check the form and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 text-xl font-bold">{isEditing ? 'Edit product' : 'New product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Name (English)</label>
            <input className="input" value={form.name_en} onChange={(e) => update('name_en', e.target.value)} />
          </div>
          <div>
            <label className="label">Name (Kinyarwanda)</label>
            <input className="input" value={form.name_rw} onChange={(e) => update('name_rw', e.target.value)} />
          </div>
        </div>
        <p className="-mt-2 text-xs text-indigo-400">Provide at least one language.</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Description (English)</label>
            <textarea className="input" rows={3} value={form.description_en} onChange={(e) => update('description_en', e.target.value)} />
          </div>
          <div>
            <label className="label">Description (Kinyarwanda)</label>
            <textarea className="input" rows={3} value={form.description_rw} onChange={(e) => update('description_rw', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Brand (optional)</label>
          <input className="input" value={form.brand} onChange={(e) => update('brand', e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Price (RWF)</label>
            <input type="number" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} required />
          </div>
          <div>
            <label className="label">Discount price (optional)</label>
            <input type="number" className="input" value={form.discount_price} onChange={(e) => update('discount_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Stock quantity</label>
            <input type="number" className="input" value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Condition</label>
            <select className="input" value={form.condition} onChange={(e) => update('condition', e.target.value)}>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
          <div>
            <label className="label">Delivery fee (RWF)</label>
            <input type="number" className="input" value={form.delivery_fee} onChange={(e) => update('delivery_fee', e.target.value)} />
          </div>
          <div>
            <label className="label">Est. delivery time</label>
            <input className="input" placeholder="e.g. 2-3 days" value={form.estimated_delivery_time} onChange={(e) => update('estimated_delivery_time', e.target.value)} />
          </div>
        </div>

        {isEditing && id && (
          <div>
            <label className="label">Product photos</label>
            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-indigo-100 dark:border-ink-soft">
                    <img src={img.image} alt="" className="h-full w-full object-cover" />
                    {img.is_main && (
                      <span className="absolute left-1 top-1 rounded bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold text-ink">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                await handleAddImage(file)
                e.target.value = ''
              }}
            />
            {isUploading && <p className="mt-1 text-xs text-indigo-400">Uploading…</p>}
            {uploadMessage && <p className="mt-1 text-xs text-leaf-500">{uploadMessage}</p>}
          </div>
        )}

        <p className="text-xs text-indigo-400">
          Photos are uploaded from the product management screen after saving — image uploads use a separate endpoint to keep this form fast.
        </p>

        {error && <p className="text-sm text-clay-500">{error}</p>}
        {saveMessage && <p className="text-sm text-leaf-500">{saveMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  )
}