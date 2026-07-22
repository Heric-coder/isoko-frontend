import { useEffect, useState, type FormEvent } from 'react'
import { ApiRequestError } from '@/api/client'
import { sellersApi } from '@/api/sellers'
import { LocationFields, type LocationValue } from '@/components/LocationFields'
import { PhoneInput } from '@/components/PhoneInput'
import { useLanguage } from '@/context/LanguageContext'
import { Spinner } from '@/components/Spinner'
import type { SellerProfile } from '@/types'

export default function SellerProfilePage() {
  const { t } = useLanguage()

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [idType, setIdType] = useState<'national_id' | 'business'>('national_id')
  const [idValue, setIdValue] = useState('')
  const [location, setLocation] = useState<LocationValue>({ province: '', district: '', sector: '', cell: '' })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acknowledgedReapproval, setAcknowledgedReapproval] = useState(false)

  useEffect(() => {
    sellersApi.me().then((s) => {
      setSeller(s)
      setStoreName(s.store_name)
      setDescription(s.description)
      setPhone(s.phone.replace('+250', ''))
      setIdType(s.business_registration_number ? 'business' : 'national_id')
      setIdValue(s.business_registration_number || s.national_id || '')
      setLogoPreview(s.logo || '')
      setBannerPreview(s.banner || '')

      const [cell, sector, district, province] = s.location.split(',').map((part) => part.trim())
      setLocation({ province: province || '', district: district || '', sector: sector || '', cell: cell || '' })
    }).finally(() => setIsLoading(false))
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!seller) return
    setError('')
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('store_name', storeName)
      formData.append('description', description)
      formData.append('phone', `+250${phone}`)
      formData.append('national_id', idType === 'national_id' ? idValue : seller.national_id)
      formData.append('business_registration_number', idType === 'business' ? idValue : seller.business_registration_number)
      if (location.cell) {
        formData.append('location', `${location.cell}, ${location.sector}, ${location.district}, ${location.province}`)
      }
      if (logoFile) formData.append('logo', logoFile)
      if (bannerFile) formData.append('banner', bannerFile)

      const updated = await sellersApi.updateMe(formData)
      setSeller(updated)
      setAcknowledgedReapproval(false)
      setSavedMessage('Saved!')
      setTimeout(() => setSavedMessage(''), 2000)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : t('error_generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <Spinner label={t('loading')} />
  if (!seller) return <p>Seller profile not found.</p>

  const willTriggerReapproval =
    storeName !== seller.store_name ||
    (idType === 'national_id' ? idValue !== seller.national_id : idValue !== seller.business_registration_number)

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="mb-2 text-xl font-bold">Shop profile</h1>
      {seller.needs_reapproval && (
        <p className="mb-4 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700 dark:bg-ink-soft dark:text-gold-300">
          Your recent changes are pending admin re-approval.
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">Store name</label>
          <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          <p className="mt-1 text-xs text-indigo-500">Changing this requires admin re-approval.</p>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="label">Phone</label>
          <PhoneInput value={phone} onChange={setPhone} required />
        </div>

        <div>
          <label className="label">Identification</label>
          <div className="mb-2 flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input type="radio" checked={idType === 'national_id'} onChange={() => setIdType('national_id')} />
              National ID
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={idType === 'business'} onChange={() => setIdType('business')} />
              Business registration
            </label>
          </div>
          <input className="input" value={idValue} onChange={(e) => setIdValue(e.target.value)} required />
          <p className="mt-1 text-xs text-indigo-500">Changing this requires admin re-approval.</p>
        </div>

        <div>
          <label className="label">Location</label>
          <p className="mb-2 text-sm text-indigo-500">Current: {seller.location}</p>
          <LocationFields value={location} onChange={setLocation} />
        </div>

        <div>
          <label className="label">Logo</label>
          {logoPreview && <img src={logoPreview} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />}
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </div>

        <div>
          <label className="label">Banner</label>
          {bannerPreview && <img src={bannerPreview} alt="" className="mb-2 h-28 w-full rounded-card object-cover" />}
          <input type="file" accept="image/*" onChange={handleBannerChange} />
        </div>

        {willTriggerReapproval && (
          <label className="flex items-start gap-2 text-sm text-clay-500">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={acknowledgedReapproval}
              onChange={(e) => setAcknowledgedReapproval(e.target.checked)}
            />
            Note that you will wait for re-approval from admin
          </label>
        )}

        {error && <p className="text-sm text-clay-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || (willTriggerReapproval && !acknowledgedReapproval)}
          className="btn-primary w-full"
        >
          {isSubmitting ? t('loading') : 'Save changes'}
        </button>
        {savedMessage && <p className="text-sm text-leaf-500">{savedMessage}</p>}
      </form>
    </div>
  )
}