export interface User {
  id: string
  email: string | null
  phone: string | null
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
  profile_picture: string | null
  is_email_verified: boolean
  is_phone_verified: boolean
  is_approved_seller: boolean
  is_staff: boolean
  date_joined: string
}

export interface Category {
  id: string
  name_en: string
  name_rw: string
  slug: string
  parent: string | null
  accent_color: string
  icon: string
  is_active: boolean
}

export interface ProductImage {
  id: string
  image: string
  is_main: boolean
  sort_order: number
  variant: string | null
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: string | null
  stock_quantity: number
  images: ProductImage[]
}

export interface ProductListItem {
  id: string
  name_en: string
  name_rw: string
  price: string
  discount_price: string | null
  effective_price: string
  thumbnail: string | null
  seller_name: string
  seller_slug: string
  category_name: string
  category_accent_color: string
  rating_avg: string
  rating_count: number
  is_available: boolean
  condition: 'new' | 'used' | 'refurbished'
}

export interface ProductDetail extends Omit<ProductListItem, 'thumbnail'> {
  description_en: string
  description_rw: string
  brand: string
  sku: string
  stock_quantity: number
  warranty_info: string
  return_policy: string
  delivery_fee: string
  pickup_location: string
  estimated_delivery_time: string
  category: string
  seller: string
  seller_slug: string
  images: ProductImage[]
  variants: ProductVariant[]
  video_url: string
  view_count: number
  sales_count: number
  status: string
  created_at: string
}

export interface CartItem {
  id: string
  product: string
  product_name: string
  variant: string | null
  quantity: number
  seller_id: string
  seller_name: string
  unit_price: string
  subtotal: string
  thumbnail: string | null
}

export interface CartSellerGroup {
  seller_id: string
  seller_name: string
  items: CartItem[]
  subtotal: string
  delivery_fee: string
}

export interface Cart {
  id: string
  items: CartItem[]
  grouped_by_seller: CartSellerGroup[]
  total: string
}

export interface SubOrderItem {
  id: string
  product: string
  variant: string | null
  product_name_snapshot: string
  unit_price: string
  quantity: number
  subtotal: string
}

export interface SubOrder {
  id: string
  order: string
  seller: string
  seller_name: string
  subtotal: string
  delivery_fee: string
  fulfillment_method: 'delivery' | 'pickup'
  status: string
  buyer_confirmed_at: string | null
  cancellation_reason: string
  items: SubOrderItem[]
  created_at: string
}

export interface Order {
  id: string
  delivery_full_name: string
  delivery_phone: string
  delivery_province: string
  delivery_district: string
  delivery_sector: string
  delivery_cell: string
  delivery_notes: string
  total_amount: string
  sub_orders: SubOrder[]
  created_at: string
}

export interface SellerProfile {
  id: string
  store_name: string
  slug: string
  description: string
  phone: string
  national_id: string
  business_registration_number: string
  location: string
  logo: string | null
  banner: string | null
  rating_avg: string
  rating_count: number
  status?: 'pending' | 'approved' | 'rejected'
  needs_reapproval?: boolean
  rejection_reason?: string
}

export interface SiteSettings {
  platform_name: string
  logo: string | null
  primary_color: string
  secondary_color: string
  homepage_banner: string | null
  footer_contact_email: string
  footer_whatsapp_link: string
  footer_telegram_link: string
  default_commission_rate: string
}

export interface PaginatedResponse<T> {
  count: number
  total_pages: number
  current_page: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  error: true
  detail: string
  fields: Record<string, string[]> | null
}
