# Isoko Marketplace Frontend (React + TypeScript + Tailwind)

## Why it's built this way

- **Minimal dependencies** — only `react-router-dom` beyond React itself.
  No UI kit, no state management library, no axios. Context + hooks handle
  state; a hand-rolled `fetch` wrapper handles API calls. Smaller bundle,
  fewer things to break, easier for another developer to trace.
- **Every page is lazy-loaded** (`React.lazy`) — a buyer browsing products
  never downloads the seller dashboard or admin panel code. This is the
  single biggest lever for fast loading on slow connections.
- **One file per concern** — `api/` (server calls), `context/` (global
  state), `components/` (reusable UI), `pages/` (routed screens). No
  giant files mixing concerns.
- **Design tokens in `tailwind.config.js`** — colors, fonts, radii defined
  once. Change the brand there, not by hunting through components.

## Requirements

- Node.js 18+
- The backend running locally (see `backend/README.md`)

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Opens at `http://localhost:5173`. Make sure the backend is running at the
URL in `.env.local` (`VITE_API_BASE_URL`).

## Project structure

```
frontend/src/
├── api/                # One file per backend app — thin wrappers over fetch
│   ├── client.ts        # Core fetch wrapper: JWT auth header, auto-refresh on 401
│   ├── auth.ts, cart.ts, orders.ts, products.ts, sellers.ts, index.ts (the rest)
├── context/             # Global state via React Context
│   ├── AuthContext.tsx    # Logged-in user
│   ├── CartContext.tsx     # Cart state, synced with backend
│   ├── LanguageContext.tsx  # EN/RW, persisted, drives all UI text
│   ├── ThemeContext.tsx      # Light/dark, persisted
│   └── SiteSettingsContext.tsx # Branding (name/logo/colors) from admin panel
├── i18n/translations.ts # EN/RW dictionary — plain objects, no i18n library
├── data/rwandaLocations.ts # Province → District dataset for location dropdowns
├── components/           # Reusable UI: ProductCard, Header, Footer, form inputs...
├── layouts/MainLayout.tsx # Header + Footer wrapper around routed pages
├── pages/
│   ├── buyer/    # Browse, product detail, cart, checkout, orders, wishlist, profile
│   ├── auth/     # Login, register
│   ├── seller/   # Apply, dashboard, product management
│   └── admin/    # Admin dashboard
└── App.tsx        # Routes, all lazily loaded
```

## Design system

- **Colors:** deep indigo (`indigo-700`) as the primary brand color, warm
  gold (`gold-500`) as the accent for calls to action — a "modern &
  trustworthy" palette, not the generic AI-default cream/terracotta look.
- **Category accent rail:** every product card has a colored left border
  matching its category's `accent_color` from the admin branding panel —
  a functional device (fast visual scanning), not just decoration.
- **Fonts:** Manrope for headings, Inter for body/UI text, IBM Plex Mono
  for prices and SKUs.
- **Dark mode:** toggle in the header, persisted, respects
  `prefers-color-scheme` on first visit.

## What's implemented

- Full design system and layout (header, footer, language switcher, theme toggle, notification bell)
- Auth: register, login, protected routes, profile editing, password reset (request + confirm), email verification landing page
- Buyer flow: browse with filters/search/sort, product detail with reviews, cart,
  checkout (with promo code + delivery address), order history & detail
  (delivery confirmation, cancellation requests, leave product/seller reviews), wishlist, support tickets
- Seller: application form, dashboard (sales summary, product performance),
  product create/edit, order fulfillment (status updates, cancellation approval)
- Admin: dashboard (metrics, pending seller approvals), site branding editor,
  commission control (with retroactive toggle), broadcast publishing, support ticket replies
- Static page: Terms of Service (placeholder — needs legal review before launch)

## Still to come (minor, non-blocking)

- Admin UI for emergency alerts (backend endpoint exists; broadcasts UI is built, alerts UI is the same pattern — not yet wired)
- Seller promo code management UI (backend endpoint exists — `/promotions/`)
- Product image upload UI (currently done via Django admin; the create/edit
  form has a note pointing this out)
- A proper modal for the "emergency alert on next login" behavior described in the spec

None of these block using the app end-to-end — they're the remaining
"nice to finish" items before a v1 launch.

## Extending location data

`src/data/rwandaLocations.ts` covers all 5 provinces and 30 districts.
Sector and Cell (416 / 2,148 respectively) are free-text inputs to keep
the bundle light. To make those cascading dropdowns too, fetch a
sectors/cells JSON on district change instead of bundling it — e.g. serve
it as a static file from the backend's `/static/` folder.
