import { PhoneInput } from '@/components/PhoneInput'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '@/api/client'
import { sellersApi } from '@/api/sellers'
import { LocationFields, type LocationValue } from '@/components/LocationFields'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function SellerApplyPage() {
  const { t } = useLanguage()
  const { refreshUser } = useAuth()
  const navigate = useNavigate()

  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [idType, setIdType] = useState<'national_id' | 'business'>('national_id')
  const [idValue, setIdValue] = useState('')
  const [location, setLocation] = useState<LocationValue>({ province: '', district: '', sector: '', cell: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await sellersApi.apply({
        store_name: storeName,
        description,
        phone: `+250${phone}`,
        national_id: idType === 'national_id' ? idValue : undefined,
        business_registration_number: idType === 'business' ? idValue : undefined,
        location: `${location.cell}, ${location.sector}, ${location.district}, ${location.province}`,
      })
      await refreshUser()
      setSuccess(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : t('error_generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-leaf-500">
        Application submitted! We'll review it and notify you once approved.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-2 text-xl font-bold">{t('nav_become_seller')}</h1>
      <p className="mb-6 text-sm text-indigo-500">Tell us about your store — an admin will review your application.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Store name</label>
          <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
  <label className="label">{t('checkout_phone')}</label>
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
        </div>

        <LocationFields value={location} onChange={setLocation} />

        {error && <p className="text-sm text-clay-500">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
          {isSubmitting ? t('loading') : 'Submit application'}
        </button>
      </form>
    </div>
  )
}
