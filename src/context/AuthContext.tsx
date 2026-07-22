import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth'
import { tokenStore, resolveMediaUrl } from '@/api/client'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const withResolvedAvatar = (u: User): User => ({ ...u, profile_picture: resolveMediaUrl(u.profile_picture) })

  const refreshUser = async () => {
    if (!tokenStore.getAccess()) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const me = await authApi.me()
      setUser(withResolvedAvatar(me))
    } catch {
      tokenStore.clear()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (payload: LoginPayload) => {
    const loggedInUser = await authApi.login(payload)
    setUser(withResolvedAvatar(loggedInUser))
  }

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload)
    // Account is created but unverified — the person confirms via email before logging in.
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}