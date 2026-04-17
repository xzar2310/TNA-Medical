# Implementation Guide
## TNA Co., Ltd — Medical Supplement Platform

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    USERS / BROWSERS                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│          Next.js 14 Frontend (Port 3000)             │
│   App Router · RSC · Tailwind · NextAuth.js          │
└──────────────────────┬──────────────────────────────┘
                       │ REST / JSON (JWT)
┌──────────────────────▼──────────────────────────────┐
│            FastAPI Backend (Port 8000)               │
│   SQLAlchemy · Pydantic · Alembic · Celery           │
└──────┬────────────────────────┬─────────────────────┘
       │                        │
┌──────▼──────┐         ┌───────▼──────┐
│ PostgreSQL  │         │    Redis     │
│  (Port 5432)│         │  (Port 6379) │
└─────────────┘         └─────────────┘
```

---

## 2. Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer', -- customer | admin | staff
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_en TEXT,
    description_th TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    stock_qty INTEGER DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_th VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'pending',
    -- pending | confirmed | processing | shipped | delivered | cancelled | refunded
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'unpaid',
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    body TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20), -- percent | fixed
    discount_value DECIMAL(10,2),
    min_order DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);
```

---

## 3. Authentication Flow

```
1. User submits email + password
2. Backend verifies credentials → issues JWT access token (15 min) + refresh token (30 days)
3. Frontend stores access token in memory; refresh token in httpOnly cookie
4. API requests include: Authorization: Bearer <access_token>
5. Token refresh: POST /api/auth/refresh with cookie
6. Social login (Google) via NextAuth.js → backend validates + issues same JWT pair
```

---

## 4. Payment Flow

### Stripe (Credit Card)
```
1. Frontend: stripe.createPaymentIntent() → client_secret
2. User fills card via Stripe Elements
3. stripe.confirmPayment() → success/failure
4. Backend: Stripe webhook → update order.payment_status
```

### Omise PromptPay (Thai)
```
1. Backend: create Omise charge (type: promptpay) → QR code URL
2. Frontend: display QR code, poll /api/orders/{id}/status every 5s
3. Omise webhook → update order status
```

---

## 5. Image Upload Pipeline

```
Frontend → POST /api/admin/upload (multipart)
         → Backend validates (max 5MB, JPG/PNG/WebP)
         → Resize to [800x800, 400x400, 100x100] with Pillow
         → Upload all sizes to S3/R2
         → Return { original, medium, thumb } URLs
         → Store URLs in product_images table
```

---

## 6. Caching Strategy

| Resource | Cache | TTL |
|---|---|---|
| Product list | Redis | 5 min |
| Product detail | Redis | 10 min |
| Categories | Redis | 1 hour |
| User cart | Redis | 7 days |
| Inventory count | Redis | 30 sec |

Cache invalidation: on product update/create → `DEL product:*`

---

## 7. i18n Strategy

- Next.js `next-intl` package
- Translation files: `frontend/messages/en.json`, `frontend/messages/th.json`
- Locale in URL: `/en/products`, `/th/products`
- Default locale: `th` (Thai)
- Database stores `name_en`, `name_th`, `description_en`, `description_th`
- API accepts `Accept-Language: th` header → returns correct fields

---

## 8. Development Workflow

```bash
# Feature branch
git checkout -b feature/product-filters

# Run linting
cd frontend && npm run lint
cd backend && ruff check .

# Run tests before PR
cd backend && pytest
cd frontend && npm run test

# Commit convention
git commit -m "feat(products): add category filter API"
# Types: feat | fix | docs | refactor | test | chore
```

---

## 9. Deployment Pipeline

```
GitHub Push → GitHub Actions CI:
  1. Lint + test (frontend + backend)
  2. Build Docker images
  3. Push to registry (ghcr.io)
  4. SSH deploy to VPS:
     - docker-compose pull
     - docker-compose up -d
     - alembic upgrade head
     - Clear Redis cache
```

---

## 10. Security Checklist

- [ ] All endpoints require auth except: products, categories, auth routes
- [ ] Admin endpoints check `role = admin`
- [ ] SQL injection: use SQLAlchemy ORM only (no raw SQL)
- [ ] XSS: sanitize HTML inputs with `bleach`
- [ ] CSRF: SameSite cookie + CSRF token on state-changing POSTs
- [ ] Rate limiting: 100 req/min per IP (FastAPI `slowapi`)
- [ ] PDPA: consent checkbox on registration, data export/delete endpoints
- [ ] Passwords: bcrypt with cost factor 12
- [ ] Secrets: never commit `.env`; use Railway/Render env vars in prod
