import { api } from './client'
import type { Cart } from '@/types'

export const cartApi = {
  get: () => api.get<Cart>('/cart/'),
  addItem: (product: string, quantity = 1, variant?: string) =>
    api.post<Cart>('/cart/', { product, quantity, variant }),
  updateItem: (itemId: string, quantity: number) => api.patch<Cart>(`/cart/${itemId}/`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}/`),
}
