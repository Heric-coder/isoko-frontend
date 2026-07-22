import type { ApiError } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const ACCESS_KEY = 'isoko_access_token'
const REFRESH_KEY = 'isoko_refresh_token'

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export class ApiRequestError extends Error {
  detail: string
  fields: Record<string, string[]> | null
  status: number

  constructor(payload: ApiError, status: number) {
    super(payload.detail)
    this.detail = payload.detail
    this.fields = payload.fields
    this.status = status
  }
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh()
  if (!refresh) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.access) {
          tokenStore.setAccess(data.access)
          return data.access as string
        }
        tokenStore.clear()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  isFormData?: boolean
  skipAuth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { body, isFormData, skipAuth, headers, ...rest } = options

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) }
  if (!isFormData) finalHeaders['Content-Type'] = 'application/json'

  const access = tokenStore.getAccess()
  if (access && !skipAuth) finalHeaders['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  if (res.status === 401 && !skipAuth && !isRetry) {
    const newAccess = await refreshAccessToken()
    if (newAccess) return request<T>(path, options, true)
  }

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiRequestError(
      data as ApiError,
      res.status,
    )
  }

  return data as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}

export { BASE_URL }

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = BASE_URL.replace(/\/api\/v1\/?$/, '')
  return `${origin}${path}`
}