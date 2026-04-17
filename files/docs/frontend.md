# Frontend Architecture
## TNA Co., Ltd — Next.js 14 Application

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| State | Zustand (cart) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js v5 |
| i18n | next-intl 3.22+ |
| Animations | Framer Motion |
| Icons | Lucide React |
| Payments | @stripe/react-stripe-js |
| Testing | Vitest + Playwright |

---

## Directory Structure

```
frontend/
├── app/
│   ├── [locale]/                      # i18n route group (en | th)
│   │   ├── layout.tsx                 # Root layout — fonts, PDPA banner, providers
│   │   ├── (public)/                  # Public pages (no auth required)
│   │   │   ├── page.tsx               # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # Product listing
│   │   │   │   └── [slug]/page.tsx    # Product detail (ingredient panel, trust badges)
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   └── blog/
│   │   ├── (auth)/                    # Auth pages — redirects if already logged in
│   │   │   ├── login/page.tsx         # Email + Google sign-in
│   │   │   └── register/page.tsx      # Registration with PDPA consent checkbox
│   │   ├── account/                   # Protected — redirect to /login if no session
│   │   │   ├── orders/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── admin/                     # Role-guarded (admin only) — server-side check
│   │       ├── layout.tsx             # Server-side role guard + AdminSidebar
│   │       ├── page.tsx               # Dashboard overview (KPIs, charts)
│   │       ├── products/page.tsx
│   │       ├── orders/page.tsx
│   │       └── customers/page.tsx
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts  # NextAuth.js v5 route handler
│   └── globals.css                    # Tailwind directives
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # Sticky navbar — locale toggle, cart badge, auth
│   │   ├── Footer.tsx
│   │   └── AdminSidebar.tsx           # Admin nav with active-state highlighting
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── IngredientPanel.tsx        # Transparency — ingredients + PubMed links
│   │   ├── CertificationBadges.tsx
│   │   └── ReviewSection.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── StripePayment.tsx
│   │   └── PromptPayQR.tsx
│   └── common/
│       ├── TrustBadges.tsx            # FDA / GMP / ISO badges
│       ├── PDPABanner.tsx             # Cookie consent (PDPA — Thai data privacy law)
│       └── StarRating.tsx
├── lib/
│   ├── api.ts                         # Axios client — JWT interceptors, error normalization
│   ├── auth.ts                        # NextAuth.js v5 config (Credentials + Google)
│   ├── store/
│   │   ├── cartStore.ts               # Zustand cart store with persist middleware
│   │   └── uiStore.ts
│   └── hooks/
│       ├── useProducts.ts             # TanStack Query — list + detail
│       ├── useCart.ts
│       └── useOrders.ts
├── i18n/
│   └── request.ts                     # next-intl server config (getRequestConfig)
├── messages/
│   ├── en.json                        # English translations
│   └── th.json                        # Thai translations
├── public/
│   ├── images/
│   └── icons/
├── .env.local.example                 # Frontend env template (copy to .env.local)
├── tailwind.config.ts
├── next.config.mjs                    # next-intl plugin + image domains
├── middleware.ts                      # next-intl routing + NextAuth session guard
└── package.json
```

---

## Design System

### Color Palette (TNA Brand)

| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#f0fdf4` | Background tints |
| `brand-500` | `#22c55e` | Primary green |
| `brand-600` | `#16a34a` | Button default |
| `brand-700` | `#15803d` | Button hover |
| `brand-900` | `#14532d` | Dark text on light |
| `gold-400` | `#fbbf24` | Trust badge accents |
| `orange-500` | Tailwind default | CTA buttons, price highlights |

### Typography
- Display: `Kanit` (Thai-friendly, Google Fonts) — headings via `next/font/google`
- Body: `Sarabun` (Thai-friendly) — body text via `next/font/google`
- Code: `JetBrains Mono` — admin/technical via `next/font/google`

> [!IMPORTANT]
> Always use `next/font/google` — never CDN `<link>` tags. Font variables are set in `app/[locale]/layout.tsx`.

### Component Conventions

```tsx
// Standard component interface pattern (from claude.md):
interface ProductCardProps {
  product: Product
  locale: 'en' | 'th'
  className?: string
}

export function ProductCard({ product, locale, className }: ProductCardProps) {
  const name = locale === 'th' ? product.name_th : product.name_en
  // ...
}
```

---

## Middleware

`middleware.ts` chains two responsibilities:

1. **Locale routing** (`next-intl`) — Redirects `/` → `/en/`, `/th/*` etc.
2. **Auth protection** — Reads `next-auth.session-token` cookie. Unauthenticated requests to `/account/*` or `/admin/*` are redirected to `/{locale}/login?callbackUrl=...`

Admin role enforcement is also performed **server-side** in `app/[locale]/admin/layout.tsx` via `getServerSession`.

```
Public routes:   /products, /categories, /blog, /login, /register
Protected:       /account/* → requires session
Admin-only:      /admin/*   → requires session + role=admin
```

---

## State Management

### Cart Store (Zustand + persist)
```typescript
// lib/store/cartStore.ts
interface CartStore {
  items: CartItem[]
  coupon: Coupon | null
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
  clearCart: () => void
  subtotal: () => number
  discount: () => number
  total: () => number
  itemCount: () => number
}
```

### Server State (TanStack Query)
```typescript
// lib/hooks/useProducts.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 min per frontend spec
  })
}
```

---

## i18n Usage

```tsx
// Server Component
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('Product')

// Client Component
import { useTranslations } from 'next-intl'
const t = useTranslations('Product')

// Usage
t('addToCart')  // → "Add to Cart" (en) | "เพิ่มในตะกร้า" (th)
```

Translation key convention: `Namespace.camelCaseKey`

```json
// messages/en.json
{ "Product": { "addToCart": "Add to Cart" } }

// messages/th.json
{ "Product": { "addToCart": "เพิ่มในตะกร้า" } }
```

> [!IMPORTANT]
> Every new user-facing string needs entries in **both** `en.json` and `th.json`. No hardcoded Thai or English text in components.

---

## Compliance & Regulatory Components

| Component | Rule | File |
|---|---|---|
| `PDPABanner` | Thai PDPA — cookie consent | `components/common/PDPABanner.tsx` |
| `TrustBadges` | FDA / GMP / ISO display | `components/common/TrustBadges.tsx` |
| `IngredientPanel` | Thai FDA ingredient transparency + PubMed links | `components/product/IngredientPanel.tsx` |
| PDPA checkbox | Registration must collect consent | `app/[locale]/(auth)/register/page.tsx` |

---

## Environment Variables

Copy `frontend/.env.local.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -hex 32>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Development

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000

pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
```

---

## Performance Optimizations

- Product listing: SSR with `generateStaticParams` for top 100 products
- Images: `next/image` with `sizes` + WebP — never raw `<img>` tags
- Fonts: `next/font/google` — zero layout shift (CLS = 0)
- API cache: stale-while-revalidate via TanStack Query (5–10 min stale times)
- Bundle: dynamic imports for Chart.js, Stripe, and other heavy components
- PWA: `next-pwa` service worker + offline shell
