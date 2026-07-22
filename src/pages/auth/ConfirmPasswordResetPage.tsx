import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiRequestError } from '@/api/client'
import { authApi } from '@/api/auth'

export default function ConfirmPasswordResetPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await authApi.confirmPasswordReset(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.detail : 'This reset link is invalid or has expired.')
    }
  }

  if (!token) return <p className="py-16 text-center text-clay-500">Missing reset token — please use the link from your email.</p>
  if (success) return <p className="py-16 text-center text-leaf-500">Password reset! Redirecting to login…</p>

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-xl font-bold">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-clay-500">{error}</p>}
        <button type="submit" className="btn-primary w-full">Reset password</button>
      </form>
    </div>
  )
}
