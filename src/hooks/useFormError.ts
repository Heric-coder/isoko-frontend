import { useState } from 'react'
import { ApiRequestError } from '@/api/client'

export function useFormError() {
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleError = (err: unknown, fallback: string) => {
    if (err instanceof ApiRequestError) {
      setFormError(err.detail || fallback)
      setFieldErrors(err.fields || {})
    } else {
      setFormError(fallback)
      setFieldErrors({})
    }
  }

  const clearErrors = () => {
    setFormError('')
    setFieldErrors({})
  }

  const fieldError = (name: string) => fieldErrors[name]?.[0]

  return { formError, fieldErrors, handleError, clearErrors, fieldError }
}