import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Spinner } from '@/components/Spinner'
import { MainLayout } from '@/layouts/MainLayout'

// Every page is its own chunk — a buyer browsing products never downloads
// the seller dashboard or admin panel code, which matters a lot on slow
// mobile connections.
const BrowsePage = lazy(() => import('@/pages/buyer/BrowsePage'))
const ProductDetailPage = lazy(() => import('@/pages/buyer/ProductDetailPage'))
const SellerStorefrontPage = lazy(() => import('@/pages/buyer/SellerStorefrontPage'))
const CartPage = lazy(() => import('@/pages/buyer/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/buyer/CheckoutPage'))
const OrdersPage = lazy(() => import('@/pages/buyer/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/buyer/OrderDetailPage'))
const WishlistPage = lazy(() => import('@/pages/buyer/WishlistPage'))
const ProfilePage = lazy(() => import('@/pages/buyer/ProfilePage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const RequestPasswordResetPage = lazy(() => import('@/pages/auth/RequestPasswordResetPage'))
const ConfirmPasswordResetPage = lazy(() => import('@/pages/auth/ConfirmPasswordResetPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))

const SupportPage = lazy(() => import('@/pages/buyer/SupportPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))

const SellerApplyPage = lazy(() => import('@/pages/seller/SellerApplyPage'))
const SellerLayout = lazy(() => import('@/layouts/SellerLayout').then(m => ({ default: m.SellerLayout })))
const SellerDashboardPage = lazy(() => import('@/pages/seller/SellerDashboardPage'))
const SellerProductsPage = lazy(() => import('@/pages/seller/SellerProductsPage'))
const SellerProductFormPage = lazy(() => import('@/pages/seller/SellerProductFormPage'))
const SellerOrdersPage = lazy(() => import('@/pages/seller/SellerOrdersPage'))
const SellerProfilePage = lazy(() => import('@/pages/seller/SellerProfilePage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminSupportPage = lazy(() => import('@/pages/admin/AdminSupportPage'))

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/products" element={<BrowsePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/sellers/:slug" element={<SellerStorefrontPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password-reset" element={<RequestPasswordResetPage />} />
            <Route path="/reset-password" element={<ConfirmPasswordResetPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

            <Route path="/seller/apply" element={<ProtectedRoute><SellerApplyPage /></ProtectedRoute>} />

<Route element={<ProtectedRoute requireSeller><SellerLayout /></ProtectedRoute>}>
  <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
  <Route path="/seller/products" element={<SellerProductsPage />} />
  <Route path="/seller/products/new" element={<SellerProductFormPage />} />
  <Route path="/seller/products/:id/edit" element={<SellerProductFormPage />} />
  <Route path="/seller/orders" element={<SellerOrdersPage />} />
  <Route path="/seller/profile" element={<SellerProfilePage />} />
</Route>

            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/support" element={<ProtectedRoute requireAdmin><AdminSupportPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}