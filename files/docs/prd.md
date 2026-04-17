# Product Requirements Document (PRD)
## TNA Co., Ltd — Medical Supplement E-Commerce Platform

**Version:** 1.0.0  
**Date:** 2026-04-17  
**Owner:** TNA Co., Ltd  
**Stack:** Antigravity (Next.js 14 App Router + FastAPI + PostgreSQL)

---

## 1. Executive Summary

TNA Co., Ltd requires a modern, trustworthy e-commerce platform for selling medical-grade supplements. The platform must build consumer confidence through clinical transparency, support Thai and English languages, handle product catalog management, secure checkout, subscription options, and a lightweight CRM dashboard for admins.

---

## 2. Goals & Success Metrics

| Goal | KPI | Target |
|---|---|---|
| Increase online revenue | Monthly GMV | ฿500,000 / month by M6 |
| Build trust | Bounce rate | < 40% |
| Repeat customers | Retention rate | > 30% after first purchase |
| Operational efficiency | Order processing time | < 2 min per order |

---

## 3. User Personas

### 3.1 Health-Conscious Consumer (Primary)
- Age 30–55, urban Thailand
- Researches ingredients and clinical studies before buying
- Needs: clear ingredient lists, certifications, dosage guides

### 3.2 Caregiver / Family Buyer
- Purchases for elderly parents
- Needs: simple navigation, easy reorder, Thai language support

### 3.3 Admin / Operations Staff (Internal)
- Manages inventory, orders, promotions
- Needs: dashboard, CSV export, low-code customization

---

## 4. Feature Scope

### 4.1 Public Storefront (P0 — Must Have)
- [ ] Homepage with hero, featured products, trust badges
- [ ] Product listing page with filters (category, health goal, price)
- [ ] Product detail page (ingredients, certifications, reviews, dosage)
- [ ] Shopping cart (persistent, guest + logged-in)
- [ ] Secure checkout (Stripe / PromptPay / COD)
- [ ] Order confirmation email (Thai + English)
- [ ] User account: registration, login, order history
- [ ] Thai / English language toggle (i18n)

### 4.2 Trust & Compliance (P0)
- [ ] FDA / GMP / ISO badge display
- [ ] Ingredient transparency panel per product
- [ ] Clinical reference links (PubMed)
- [ ] Age gate for certain products
- [ ] PDPA consent banner (Thai data privacy law)

### 4.3 Admin Dashboard (P1)
- [ ] Product CRUD (name, SKU, price, stock, images, description)
- [ ] Order management (status pipeline: pending → processing → shipped → delivered)
- [ ] Customer list with purchase history
- [ ] Inventory alerts (low stock)
- [ ] Discount / coupon code management
- [ ] Sales reports (daily, weekly, monthly) with CSV export

### 4.4 Subscriptions (P2)
- [ ] Subscribe & Save (10% discount, recurring monthly)
- [ ] Manage subscriptions in user account
- [ ] Dunning management for failed payments

### 4.5 Marketing (P2)
- [ ] Blog / Article CMS (health tips)
- [ ] Email capture / newsletter
- [ ] Referral code system
- [ ] Product bundles / kits

---

## 5. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | LCP < 2.5s, FID < 100ms (Core Web Vitals) |
| Security | HTTPS, OWASP Top 10 compliance, JWT auth |
| Uptime | 99.9% SLA |
| SEO | SSR/SSG pages, structured data (JSON-LD), sitemap.xml |
| Accessibility | WCAG 2.1 AA |
| Mobile | Responsive, PWA-ready |
| Data residency | Thailand (or Singapore fallback) |

---

## 6. Tech Stack (Antigravity Framework)

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:    FastAPI (Python 3.11) + SQLAlchemy + Alembic
Database:   PostgreSQL 15 + Redis (cache/sessions)
Auth:       NextAuth.js (frontend) + JWT (API)
Storage:    AWS S3 / Cloudflare R2 (product images)
Payment:    Stripe + Omise (Thai PromptPay)
Email:      Resend (transactional)
CMS:        Contentlayer (blog MDX)
Deployment: Docker Compose → Railway / Render / VPS
```

---

## 7. Out of Scope (v1)

- Mobile native app
- Live chat / chatbot
- ERP integration
- Wholesale / B2B portal
