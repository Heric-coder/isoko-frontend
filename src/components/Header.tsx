import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSiteSettings } from '@/context/SiteSettingsContext'

export function Header() {
  const { platform_name, logo } = useSiteSettings()
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [searchWarning, setSearchWarning] = useState('')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (search.trim().length === 1) {
      setSearchWarning('Type at least 2 characters to search.')
      setTimeout(() => setSearchWarning(''), 2500)
      return
    }
    setSearchWarning('')
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : '/products')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.location.reload()
    }
  }

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/95 backdrop-blur dark:border-ink-soft dark:bg-ink/95">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
        <Link to="/" onClick={handleLogoClick} className="flex shrink-0 items-center gap-1.5 font-display text-base font-extrabold text-indigo-900 sm:gap-2 sm:text-lg dark:text-white">
          {logo ? <img src={logo} alt={platform_name} className="h-6 w-6 rounded sm:h-8 sm:w-8" /> : null}
          {platform_name}
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="input"
          />
          {searchWarning && <p className="mt-1 text-xs text-clay-500">{searchWarning}</p>}
        </form>

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />

          <Link
            to="/wishlist"
            aria-label={t('nav_wishlist')}
            className={`hidden sm:block ${location.pathname === '/wishlist' ? 'text-gold-500' : 'text-indigo-500 hover:text-indigo-900 dark:text-indigo-100'}`}
          >
            {location.pathname === '/wishlist' ? '♥' : '♡'}
          </Link>

          <Link to="/cart" aria-label={t('nav_cart')} className="relative text-indigo-500 hover:text-indigo-900 dark:text-indigo-100">
            🛒
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative shrink-0" ref={menuRef}>
  <button
    onClick={() => setMenuOpen((v) => !v)}
    className="btn-ghost !px-2 !py-1 max-w-full"
    aria-expanded={menuOpen}
  >
    {user?.profile_picture ? (
      <img src={user.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
    ) : user ? (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
        {user.first_name.charAt(0).toUpperCase()}
      </span>
    ) : (
      <span className="block max-w-[70px] truncate sm:max-w-none">{t('nav_login')}</span>
    )}
  </button>

            {menuOpen && (
              <div className="card absolute right-0 top-10 w-52 p-2 text-sm">
                {user ? (
                  <>
                    <Link to="/profile" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_profile')}</Link>
                    <Link to="/orders" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_orders')}</Link>
                    <Link to="/wishlist" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft sm:hidden">{t('nav_wishlist')}</Link>
                    <Link to="/support" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">Support</Link>
                    {user.is_approved_seller ? (
                      <>
                        <Link to="/seller/dashboard" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_seller_dashboard')}</Link>
                        <Link to="/seller/orders" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">Orders to fulfill</Link>
                      </>
                    ) : (
                      <Link to="/seller/apply" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_become_seller')}</Link>
                    )}
                    {user.is_staff && (
                      <>
                        <Link to="/admin" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_admin')}</Link>
                        <Link to="/admin/settings" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">Site settings</Link>
                      </>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate('/') }}
                      className="block w-full rounded px-3 py-2 text-left text-clay-500 hover:bg-clay-100"
                    >
                      {t('nav_logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_login')}</Link>
                    <Link to="/register" className="block rounded px-3 py-2 hover:bg-indigo-50 dark:hover:bg-ink-soft">{t('nav_register')}</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="border-t border-indigo-100 px-4 py-2 md:hidden dark:border-ink-soft">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="input"
        />
        {searchWarning && <p className="mt-1 text-xs text-clay-500">{searchWarning}</p>}
      </form>
    </header>
  )
}