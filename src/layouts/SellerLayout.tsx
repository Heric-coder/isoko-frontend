import { NavLink, Outlet } from 'react-router-dom'

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ProductsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8M12 13v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function OrdersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M5 7h14l-1 13H6L5 7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const navItems = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/seller/products', label: 'Products', icon: ProductsIcon },
  { to: '/seller/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/seller/profile', label: 'Profile', icon: ProfileIcon },
]

export function SellerLayout() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <aside className="md:sticky md:top-20 md:w-56 md:shrink-0">
        <div className="overflow-hidden rounded-card bg-indigo-900 p-0 shadow-sm md:min-h-[calc(100vh-6rem)]">
          <div className="hidden border-b border-white/10 px-4 py-3 md:block">
  <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">Seller</p>
</div>
          <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
  ? 'bg-gold-500 text-ink shadow-sm'
  : 'text-indigo-100 hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}