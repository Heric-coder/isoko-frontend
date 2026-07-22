import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Spinner } from '@/components/Spinner'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      {status === 'loading' && <Spinner label="Verifying…" />}
      {status === 'success' && (
        <>
          <p className="text-leaf-500">Your email is verified!</p>
          <Link to="/login" className="btn-primary mt-4 inline-flex">Log in</Link>
        </>
      )}
      {status === 'error' && <p className="text-clay-500">This verification link is invalid or has expired.</p>}
    </div>
  )
}
