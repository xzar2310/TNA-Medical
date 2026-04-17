# Backend Architecture
## TNA Co., Ltd — FastAPI Service

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Language | Python 3.11 |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | python-jose (JWT) + passlib (bcrypt) |
| Task Queue | Celery + Redis |
| Email | Resend SDK |
| Storage | boto3 (S3/R2) |
| Image Processing | Pillow |
| Testing | Pytest + httpx |
| Linting | Ruff + mypy |

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── core/
│   │   ├── config.py        # Pydantic Settings (reads .env)
│   │   ├── database.py      # Async SQLAlchemy engine + session
│   │   ├── security.py      # JWT, password hashing
│   │   ├── redis.py         # Redis client
│   │   └── deps.py          # FastAPI dependencies (get_db, get_current_user)
│   ├── api/
│   │   ├── router.py        # API v1 router aggregator
│   │   └── endpoints/
│   │       ├── auth.py      # POST /auth/login, /auth/register, /auth/refresh
│   │       ├── users.py     # GET/PUT /users/me
│   │       ├── products.py  # CRUD /products
│   │       ├── categories.py
│   │       ├── orders.py    # CRUD /orders, status updates
│   │       ├── cart.py      # GET/POST/DELETE /cart
│   │       ├── reviews.py
│   │       ├── coupons.py
│   │       ├── payments.py  # Stripe + Omise webhooks
│   │       ├── upload.py    # Image upload
│   │       └── admin/
│   │           ├── dashboard.py  # Stats & metrics
│   │           ├── products.py   # Admin product management
│   │           └── orders.py     # Admin order management
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── review.py
│   │   └── coupon.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── common.py        # Pagination, response wrappers
│   ├── services/
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py
│   │   ├── email_service.py
│   │   └── storage_service.py
│   └── tasks/
│       ├── celery_app.py
│       ├── email_tasks.py   # Async email sending
│       └── inventory_tasks.py
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_products.py
│   └── test_orders.py
├── requirements.txt
└── Dockerfile
```

---

## API Endpoints Reference

### Auth
```
POST   /api/v1/auth/register        Register new user
POST   /api/v1/auth/login           Login → JWT tokens
POST   /api/v1/auth/refresh         Refresh access token
POST   /api/v1/auth/logout          Revoke refresh token
POST   /api/v1/auth/forgot-password Send reset email
POST   /api/v1/auth/reset-password  Reset with token
```

### Products
```
GET    /api/v1/products             List products (paginated, filterable)
GET    /api/v1/products/{slug}      Get product detail
GET    /api/v1/products/search      Full-text search
GET    /api/v1/categories           List categories
```

### Cart
```
GET    /api/v1/cart                 Get current cart (session/user)
POST   /api/v1/cart/items           Add item
PUT    /api/v1/cart/items/{id}      Update quantity
DELETE /api/v1/cart/items/{id}      Remove item
POST   /api/v1/cart/coupon          Apply coupon code
```

### Orders
```
POST   /api/v1/orders               Create order from cart
GET    /api/v1/orders               List user's orders
GET    /api/v1/orders/{id}          Get order detail
POST   /api/v1/orders/{id}/cancel   Cancel order
```

### Payments
```
POST   /api/v1/payments/stripe/intent       Create Stripe payment intent
POST   /api/v1/payments/stripe/webhook      Stripe webhook handler
POST   /api/v1/payments/omise/charge        Create Omise PromptPay charge
POST   /api/v1/payments/omise/webhook       Omise webhook handler
```

### Admin (require role=admin)
```
GET    /api/v1/admin/dashboard/stats         Revenue, orders, users summary
GET    /api/v1/admin/products                All products (including inactive)
POST   /api/v1/admin/products               Create product
PUT    /api/v1/admin/products/{id}          Update product
DELETE /api/v1/admin/products/{id}          Delete product
GET    /api/v1/admin/orders                  All orders
PUT    /api/v1/admin/orders/{id}/status     Update order status
GET    /api/v1/admin/customers              All customers
POST   /api/v1/admin/upload                 Upload product image
GET    /api/v1/admin/reports/sales          Sales report (CSV)
```

---

## Key Code Patterns

### Async Session Dependency
```python
# app/core/deps.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Protected Route Pattern
```python
# app/api/endpoints/users.py
@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return current_user
```

### Admin Guard
```python
# app/core/deps.py
async def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

### Pagination Schema
```python
# app/schemas/common.py
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int
```

---

## Running Migrations

```bash
# Create migration
alembic revision --autogenerate -m "add subscription table"

# Apply all migrations
alembic upgrade head

# Rollback one
alembic downgrade -1
```

---

## Environment Variables (Backend)

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/tna_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OMISE_SECRET_KEY=skey_...
OMISE_PUBLIC_KEY=pkey_...
RESEND_API_KEY=re_...
S3_BUCKET=tna-products
S3_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
FRONTEND_URL=https://tna-supplement.com
DEBUG=false
```
