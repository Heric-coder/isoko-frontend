import { api } from './client'
import type { PaginatedResponse, SellerProfile } from '@/types'

export interface SellerApplicationPayload {
  store_name: string
  description?: string
  phone: string
  national_id?: string
  business_registration_number?: string
  location: string
  intended_category?: string
}

export interface SellerDashboard {
  total_sales: number
  total_commission_paid: number
  net_payout: number
  orders_pending: number
  orders_completed: number
  product_count: number
  best_performing: Array<{ id: string; name: string; sales_count: number }>
  worst_performing: Array<{ id: string; name: string; sales_count: number }>
  all_products: Array<{ id: string; name: string; sales_count: number; stock_quantity: number; is_low_stock: boolean }>
}

export const sellersApi = {
  apply: (payload: SellerApplicationPayload) => api.post<SellerProfile>('/sellers/apply/', payload),
  me: () => api.get<SellerProfile>('/sellers/me/'),
  updateMe: (payload: Partial<SellerApplicationPayload> | FormData) =>
    api.patch<SellerProfile>('/sellers/me/', payload, {
      isFormData: payload instanceof FormData,
    }),
  dashboard: () => api.get<SellerDashboard>('/sellers/dashboard/'),
  storefront: (slug: string) => api.get<SellerProfile>(`/sellers/storefront/${slug}/`, { skipAuth: true }),

  // Admin
  applications: (status?: string) =>
    api.get<PaginatedResponse<SellerProfile>>(`/sellers/admin/applications/${status ? `?status=${status}` : ''}`),
  decide: (id: string, approve: boolean, rejection_reason = '') =>
    api.post<SellerProfile>(`/sellers/admin/applications/${id}/decide/`, { approve, rejection_reason }),
}