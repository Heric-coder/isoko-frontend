import { PhoneInput } from '@/components/PhoneInput'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormError } from '@/hooks/useFormError'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { LocationFields, type LocationValue } from '@/components/LocationFields'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const { formError, handleError, clearErrors, fieldError } = useFormError()

  const [contactPhone, setContactPhone] = useState('')
  const [useEmail, setUseEmail] = useState(true)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [sex, setSex] = useState<'M' | 'F' | 'O'>('M')
  const [location, setLocation] = useState<LocationValue>({ province: '', district: '', sector: '', cell: '' })
  const [referral, setReferral] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (password !== passwordConfirm) {
      handleError(null, "Passwords don't match.")
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        [useEmail ? 'email' : 'phone']: emailOrPhone,
        ...(useEmail ? { phone: contactPhone } : {}),
        password,
        password_confirm: passwordConfirm,
        terms_accepted: termsAccepted,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob,
        sex,
        country: 'Rwanda',
        province: location.province,
        district: location.district,
        sector: location.sector,
        cell: location.cell,
        preferred_language: lang,
        referral_source: referral || undefined,
        profile_picture: profilePicture || undefined,
      })
      setSuccessMessage('Account created! Please check your email to verify your account before logging in.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      handleError(err, t('error_generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return <div className="mx-auto max-w-sm py-16 text-center text-leaf-500">{successMessage}</div>
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-xl font-bold">{t('nav_register')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
  <label className="label">{t('auth_first_name')}</label>
  <input
    className={`input ${fieldError('first_name') ? 'border-clay-500' : ''}`}
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    required
  />
  {fieldError('first_name') && <p className="mt-1 text-xs text-clay-500">{fieldError('first_name')}</p>}
</div>
<div>
  <label className="label">{t('auth_last_name')}</label>
  <input
    className={`input ${fieldError('last_name') ? 'border-clay-500' : ''}`}
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    required
  />
  {fieldError('last_name') && <p className="mt-1 text-xs text-clay-500">{fieldError('last_name')}</p>}
</div>
        </div>

        <div>
  <div className="mb-1 flex items-center justify-between">
    <label className="label !mb-0">{useEmail ? 'Email' : 'Phone number'}</label>
    <button type="button" onClick={() => setUseEmail((v) => !v)} className="text-xs text-indigo-500 hover:underline">
      {useEmail ? 'Use phone instead' : 'Use email instead'}
    </button>
  </div>
  <input
    type={useEmail ? 'email' : 'tel'}
    placeholder={useEmail ? 'you@example.com' : '07XX XXX XXX'}
    className={`input ${fieldError(useEmail ? 'email' : 'phone') ? 'border-clay-500' : ''}`}
    value={emailOrPhone}
    onChange={(e) => setEmailOrPhone(e.target.value)}
    required
  />
  {fieldError(useEmail ? 'email' : 'phone') && (
    <p className="mt-1 text-xs text-clay-500">{fieldError(useEmail ? 'email' : 'phone')}</p>
  )}

  {useEmail && (
  <div>
    <label className="label">Phone number</label>
    <PhoneInput value={contactPhone} onChange={setContactPhone} error={fieldError('phone')} required />
  </div>
)}

</div>
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="label">Password</label>
    <input
      type="password"
      className={`input ${fieldError('password') ? 'border-clay-500' : ''}`}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      minLength={8}
    />
    {fieldError('password') && <p className="mt-1 text-xs text-clay-500">{fieldError('password')}</p>}
  </div>
  <div>
    <label className="label">Confirm password</label>
    <input
      type="password"
      className={`input ${fieldError('password_confirm') ? 'border-clay-500' : ''}`}
      value={passwordConfirm}
      onChange={(e) => setPasswordConfirm(e.target.value)}
      required
      minLength={8}
    />
    {fieldError('password_confirm') && <p className="mt-1 text-xs text-clay-500">{fieldError('password_confirm')}</p>}
  </div>
</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
  <label className="label">{t('auth_dob')}</label>
  <input
    type="date"
    className={`input ${fieldError('date_of_birth') ? 'border-clay-500' : ''}`}
    value={dob}
    onChange={(e) => setDob(e.target.value)}
    required
  />
  {fieldError('date_of_birth') && <p className="mt-1 text-xs text-clay-500">{fieldError('date_of_birth')}</p>}
</div>
          <div>
            <label className="label">{t('auth_sex')}</label>
            <select className="input" value={sex} onChange={(e) => setSex(e.target.value as 'M' | 'F' | 'O')}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>

        <LocationFields value={location} onChange={setLocation} />

        <div>
          <label className="label">Profile picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
            className="input"
          />
        </div>

        <div>
          <label className="label">How did you hear about us? (optional)</label>
          <input className="input" value={referral} onChange={(e) => setReferral(e.target.value)} />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" required />
          <span>
            {t('auth_terms')} — <Link to="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link>
          </span>
        </label>

        {formError && <p className="text-sm text-clay-500">{formError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? t('loading') : t('auth_register_button')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-indigo-500">
        Already have an account? <Link to="/login" className="hover:underline">{t('nav_login')}</Link>
      </p>
    </div>
  )
}