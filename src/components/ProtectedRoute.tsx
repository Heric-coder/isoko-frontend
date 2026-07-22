import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireSeller?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireSeller, requireAdmin }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireSeller && !user.is_approved_seller) return <Navigate to="/seller/apply" replace />
  if (requireAdmin && !user.is_staff) return <Navigate to="/" replace />

  return <>{children}</>
}
