# TNA Co., Ltd — Medical Supplement Platform

> **Stack:** Next.js 14 · FastAPI · PostgreSQL · Redis · Tailwind CSS  
> **Framework:** Antigravity (full-stack monorepo)

---

## 📦 Project Structure

```
tna-supplement/
├── frontend/          # Next.js 14 App Router
│   ├── app/           # Pages, layouts, API routes
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utils, hooks, i18n
│   └── public/        # Static assets
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   └── core/      # Config, security, DB
│   ├── alembic/       # DB migrations
│   └── tests/         # Pytest test suite
├── docker-compose.yml
├── .env.example
└── claude.md          # AI assistant rules
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### 1. Clone & Configure

```bash
git clone https://github.com/tna-co/supplement-platform.git
cd tna-supplement
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start with Docker (recommended)

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- pgAdmin: http://localhost:5050

### 3. Manual Dev Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for all required variables.

Key sections:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `SECRET_KEY` — JWT signing secret (generate with `openssl rand -hex 32`)
- `STRIPE_SECRET_KEY` — Stripe payment processing
- `OMISE_SECRET_KEY` — Thai PromptPay (Omise)
- `RESEND_API_KEY` — Transactional email
- `S3_BUCKET` — Product image storage

---

## 🧪 Testing

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm run test

# E2E
npm run test:e2e
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [prd.md](./prd.md) | Product Requirements Document |
| [implementation.md](./implementation.md) | Technical implementation guide |
| [frontend.md](./frontend.md) | Frontend architecture & components |
| [backend.md](./backend.md) | Backend API reference |
| [claude.md](./claude.md) | AI assistant rules & skillset |

---

## 🌐 Deployment

### Production (Docker)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEBUG=false`
- [ ] Configure real Stripe keys (live mode)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure CORS origins
- [ ] Set up database backups (pg_dump cron)
- [ ] Configure CDN for static assets

---

## 📋 License

Proprietary — TNA Co., Ltd © 2026. All rights reserved.
