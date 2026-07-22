import { api } from './client'
import type { Category, PaginatedResponse, ProductDetail, ProductListItem } from '@/types'

export interface ProductQuery {
  search?: string
  category?: string
  seller?: string
  price_min?: number
  price_max?: number
  rating_min?: number
  condition?: string
  on_discount?: boolean
  in_stock?: boolean
  is_hot_deal?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'top_rated'
  page?: number
}

function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const productsApi = {
  list: (query: ProductQuery = {}) =>
    api.get<PaginatedResponse<ProductListItem>>(`/products/${toQueryString(query)}`, { skipAuth: true }),

  detail: (id: string) => api.get<ProductDetail>(`/products/${id}/`, { skipAuth: true }),

  related: (id: string) => api.get<ProductListItem[]>(`/products/${id}/related/`, { skipAuth: true }),

  mine: (page = 1) => api.get<PaginatedResponse<ProductListItem>>(`/products/mine/?page=${page}`),

  create: (payload: Record<string, unknown>) => api.post<ProductDetail>('/products/', payload),
  update: (id: string, payload: Record<string, unknown>) => api.patch<ProductDetail>(`/products/${id}/`, payload),
  remove: (id: string) => api.delete(`/products/${id}/`),

  categories: () => api.get<Category[]>('/products/categories/', { skipAuth: true }),
  uploadImage: (productId: string, file: File, isMain = false) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('is_main', String(isMain))
    return api.post<{ id: string; image: string }>(`/products/${productId}/images/`, formData, { isFormData: true })
  },

  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/?image_id=${imageId}`),
}