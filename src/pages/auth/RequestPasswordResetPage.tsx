import { useState, type FormEvent } from 'react'
import { authApi } from '@/api/auth'

export default function RequestPasswordResetPage() {
  const [identifier, setIdentifier] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await authApi.requestPasswordReset(identifier)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center text-indigo-700 dark:text-indigo-100">
        If an account exists for that email, a reset link is on its way.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-xl font-bold">Reset your password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email or phone number</label>
          <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full">Send reset link</button>
      </form>
    </div>
  )
}
