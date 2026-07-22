import { api } from './client'
import type { Order, PaginatedResponse, SubOrder } from '@/types'

export interface CheckoutPayload {
  delivery_full_name: string
  delivery_phone: string
  delivery_province: string
  delivery_district: string
  delivery_sector: string
  delivery_cell: string
  delivery_notes?: string
  payment_method: 'cod' | 'mtn_momo' | 'airtel_money'
  momo_phone?: string
  promo_code?: string
}

export const ordersApi = {
  checkout: (payload: CheckoutPayload) => api.post<Order>('/orders/checkout/', payload),
  myOrders: () => api.get<PaginatedResponse<Order>>('/orders/'),
  orderDetail: (id: string) => api.get<Order>(`/orders/${id}/`),

  mySubOrders: () => api.get<PaginatedResponse<SubOrder>>('/orders/sub-orders/'),
  updateSubOrderStatus: (id: string, status: string) =>
    api.patch<SubOrder>(`/orders/sub-orders/${id}/update_status/`, { status }),
  confirmDelivery: (id: string) => api.post<SubOrder>(`/orders/sub-orders/${id}/confirm_delivery/`),
  requestCancellation: (id: string, reason: string) =>
    api.post<SubOrder>(`/orders/sub-orders/${id}/request_cancellation/`, { reason }),
  approveCancellation: (id: string) => api.post<SubOrder>(`/orders/sub-orders/${id}/approve_cancellation/`),

  raiseDispute: (subOrderId: string, reason: string) =>
    api.post('/orders/disputes/', { sub_order: subOrderId, reason }),
}

export const paymentsApi = {
  reportReference: (paymentId: string, momo_reference: string) =>
    api.post(`/payments/${paymentId}/report/`, { momo_reference }),
  verify: (paymentId: string, approve: boolean, admin_notes = '') =>
    api.post(`/payments/${paymentId}/verify/`, { approve, admin_notes }),
}
