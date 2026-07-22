import { api, tokenStore } from './client'
import type { User } from '@/types'

export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  email?: string
  phone?: string
  password: string
  password_confirm: string
  terms_accepted: boolean
  first_name: string
  last_name: string
  date_of_birth: string
  sex: 'M' | 'F' | 'O'
  country: string
  province: string
  district: string
  sector: string
  cell: string
  preferred_language: 'en' | 'rw'
  referral_source?: string
  profile_picture?: File
}

function toFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    fd.append(key, value instanceof File ? value : String(value))
  })
  return fd
}

export const authApi = {
  register: (payload: RegisterPayload) => {
    const { profile_picture, ...rest } = payload
    if (profile_picture) {
      return api.post<{ user: User; message: string }>(
        '/auth/register/', toFormData({ ...rest, profile_picture }), { isFormData: true },
      )
    }
    return api.post<{ user: User; message: string }>('/auth/register/', rest)
  },

  login: async (payload: LoginPayload) => {
    const data = await api.post<{ user: User; tokens: { access: string; refresh: string } }>(
      '/auth/login/', payload, { skipAuth: true },
    )
    tokenStore.set(data.tokens.access, data.tokens.refresh)
    return data.user
  },

  logout: () => tokenStore.clear(),

  me: () => api.get<User>('/auth/me/'),
  updateMe: (payload: Partial<Omit<User, 'profile_picture'>> & { profile_picture?: File}) => {
    const { profile_picture, ...rest } = payload
    if (profile_picture) {
      return api.patch<User>('/auth/me/', toFormData({ ...rest, profile_picture }), { isFormData: true })
    }
    return api.patch<User>('/auth/me/', rest)
  },

  verifyEmail: (token: string) => api.post<{ detail: string }>('/auth/verify-email/', { token }),
  changePassword: (old_password: string, new_password: string) =>
    api.post<{ detail: string }>('/auth/password/change/', { old_password, new_password }),
  requestPasswordReset: (identifier: string) =>
    api.post<{ detail: string }>('/auth/password/reset/', { identifier }, { skipAuth: true }),
  confirmPasswordReset: (token: string, new_password: string) =>
    api.post<{ detail: string }>('/auth/password/reset/confirm/', { token, new_password }, { skipAuth: true }),
}