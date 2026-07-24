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
  const [originalImageIds, setOriginalImageIds] = useState<string[]>([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])
  const [newProductPhoto, setNewProductPhoto] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
      setOriginalImageIds(p.images.map((img) => img.id))
      setIsLoading(false)
    })
  }, [id])

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const visibleImages = images.filter((img) => !pendingDeleteIds.includes(img.id))

  const imagesChanged = () => {
    if (pendingDeleteIds.length > 0) return true
    const currentIds = images.map((img) => img.id)
    if (currentIds.length !== originalImageIds.length) return true
    return currentIds.some((imgId) => !originalImageIds.includes(imgId))
  }

  const handleAddImage = async (file: File) => {
    if (!id) return
    setIsUploading(true)
    setUploadMessage('')
    try {
      const uploaded = await productsApi.uploadImage(id, file, visibleImages.length === 0)
      setImages((prev) => [...prev, { id: uploaded.id, image: uploaded.image, is_main: visibleImages.length === 0, sort_order: prev.length, variant: null }])
      setUploadMessage('Photo uploaded.')
      setTimeout(() => setUploadMessage(''), 2500)
    } catch {
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (imageId: string) => {
    if (visibleImages.length <= 1) {
      if (!confirm('This is the last photo. It will only be removed once you add a replacement photo and save changes. Continue?')) return
      setPendingDeleteIds((prev) => [...prev, imageId])
      setUploadMessage('Marked for removal — add a replacement photo and save changes to confirm.')
      return
    }
    removeImageNow(imageId)
  }

  const removeImageNow = async (imageId: string) => {
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

  const handleUndoRemove = (imageId: string) => {
    setPendingDeleteIds((prev) => prev.filter((pid) => pid !== imageId))
  }

  const handleDeleteProduct = async () => {
    if (!id) return
    if (!confirm('Delete this product permanently? This cannot be undone.')) return
    setIsDeleting(true)
    try {
      await productsApi.remove(id)
      navigate('/seller/products')
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : 'Failed to delete product. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaveMessage('')

    if (!isEditing && !newProductPhoto) {
      setError('Please add a product photo before submitting.')
      return
    }

    if (isEditing && pendingDeleteIds.length > 0 && visibleImages.length === 0) {
      setError('Add a replacement photo before saving — a product must have at least one photo.')
      return
    }

    if (isEditing && JSON.stringify(form) === JSON.stringify(originalForm) && !imagesChanged()) {
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
        if (pendingDeleteIds.length > 0) {
          for (const imgId of pendingDeleteIds) {
            try {
              await productsApi.deleteImage(id, imgId)
            } catch {
              // continue attempting remaining deletions even if one fails
            }
          }
          setImages((prev) => prev.filter((img) => !pendingDeleteIds.includes(img.id)))
          setPendingDeleteIds([])
        }
      } else {
        const created = await productsApi.create(payload)
        if (newProductPhoto) {
          try {
            await productsApi.uploadImage(created.id, newProductPhoto, true)
          } catch {
            setError('Product created, but the photo failed to upload. You can add it from the edit page.')
          }
        }
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

        {isEditing && id ? (
          <div>
            <label className="label">Product photos</label>
            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((img) => {
                  const isPending = pendingDeleteIds.includes(img.id)
                  return (
                    <div
                      key={img.id}
                      className={`group relative aspect-square overflow-hidden rounded-md border border-indigo-100 dark:border-ink-soft ${isPending ? 'opacity-40' : ''}`}
                    >
                      <img src={img.image} alt="" className="h-full w-full object-cover" />
                      {img.is_main && !isPending && (
                        <span className="absolute left-1 top-1 rounded bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold text-ink">Main</span>
                      )}
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleUndoRemove(img.id)}
                          className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-[10px] font-semibold text-white"
                        >
                          Undo removal
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Remove photo"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {pendingDeleteIds.length > 0 && visibleImages.length === 0 && (
              <p className="mb-2 text-xs text-clay-500">Add a replacement photo before saving — this product must keep at least one photo.</p>
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
        ) : (
          <div>
            <label className="label">Product photo (required)</label>
            {newProductPhoto && (
              <div className="mb-3 aspect-square w-32 overflow-hidden rounded-md border border-indigo-100 dark:border-ink-soft">
                <img src={URL.createObjectURL(newProductPhoto)} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setNewProductPhoto(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {isEditing && (
          <p className="text-xs text-indigo-400">
            Additional photos can be added from this page any time.
          </p>
        )}

        {error && <p className="text-sm text-clay-500">{error}</p>}
        {saveMessage && <p className="text-sm text-leaf-500">{saveMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create product'}
        </button>

        {isEditing && id && (
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={isDeleting}
            className="w-full rounded-md border border-clay-500 py-2 text-sm font-medium text-clay-500 transition-colors hover:bg-clay-500 hover:text-white disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete product'}
          </button>
        )}
      </form>
    </div>
  )
}