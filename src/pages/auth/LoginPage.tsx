import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiRequestError } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

const RWANDA_PHONE_REGEX = /^(?:\+250|0)7[2389]\d{7}$/

function normalizeIdentifier(value: string) {
  if (value.includes('@')) return value // email — leave as-is
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('250')) return `+${digits}`
  return `+250${digits.replace(/^0/, '')}`
}

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const looksLikePhone = identifier.length > 0 && !identifier.includes('@')
  const isInvalidPhone = looksLikePhone && !RWANDA_PHONE_REGEX.test(identifier.replace(/\s/g, ''))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login({ identifier: normalizeIdentifier(identifier), password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : t('error_generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 text-xl font-bold">{t('nav_login')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth_email_or_phone')}</label>
          <input
            className="input"
            placeholder="you@example.com or 0788123456"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          {isInvalidPhone && (
            <p className="mt-1 text-xs text-clay-500">Enter a valid Rwandan number, e.g. 0788123456</p>
          )}
        </div>
        <div>
          <label className="label">{t('auth_password')}</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-clay-500">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? t('loading') : t('auth_login_button')}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-indigo-500">
        <Link to="/password-reset" className="hover:underline">{t('auth_forgot_password')}</Link>
        <Link to="/register" className="hover:underline">{t('nav_register')}</Link>
      </div>
    </div>
  )
}