import { api } from './client'
import type { PaginatedResponse, SiteSettings } from '@/types'

export const siteApi = {
  settings: () => api.get<SiteSettings>('/adminpanel/settings/', { skipAuth: true }),
  updateSettings: (payload: Partial<SiteSettings>) => api.patch<SiteSettings>('/adminpanel/settings/', payload),
  updateCommission: (default_commission_rate: number, apply_retroactively: boolean) =>
    api.post('/adminpanel/settings/commission/', { default_commission_rate, apply_retroactively }),
  metrics: () => api.get('/adminpanel/metrics/'),
  activeBroadcasts: () => api.get('/adminpanel/broadcasts/active/'),
  activeAlerts: () => api.get('/adminpanel/emergency-alerts/active/'),
}

export const wishlistApi = {
  list: () => api.get<PaginatedResponse<unknown>>('/wishlist/'),
  add: (product: string) => api.post('/wishlist/', { product }),
  remove: (id: string) => api.delete(`/wishlist/${id}/`),
}

export const reviewsApi = {
  productReviews: (productId: string) => api.get(`/reviews/products/?product=${productId}`, { skipAuth: true }),
  addProductReview: (sub_order_item: string, rating: number, comment: string) =>
    api.post('/reviews/products/', { sub_order_item, rating, comment }),

  sellerReviews: (sellerId: string) => api.get(`/reviews/sellers/?seller=${sellerId}`, { skipAuth: true }),
  addSellerReview: (sub_order: string, rating: number, comment: string) =>
    api.post('/reviews/sellers/', { sub_order, rating, comment }),

  respond: (kind: 'products' | 'sellers', id: string, seller_response: string) =>
    api.post(`/reviews/${kind}/${id}/respond/`, { seller_response }),
}

export const promotionsApi = {
  validateCode: (code: string, subtotal: number, seller_id?: string) =>
    api.post<{ valid: boolean; discount_amount: number; discount_type: string }>(
      '/promotions/validate_code/', { code, subtotal, seller_id },
    ),
  mine: () => api.get('/promotions/'),
  create: (payload: Record<string, unknown>) => api.post('/promotions/', payload),
}

export const supportApi = {
  myTickets: () => api.get('/support/'),
  create: (subject: string, message: string) => api.post('/support/', { subject, message }),
  reply: (id: string, admin_response: string, status: string) =>
    api.post(`/support/${id}/reply/`, { admin_response, status }),
}

export const notificationsApi = {
  list: () => api.get('/notifications/'),
  markRead: (id: string) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
}
