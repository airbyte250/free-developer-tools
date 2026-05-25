# Multi-Tenant Quiz Platform

A highly scalable, multi-tenant, dynamic multi-page quiz platform designed for high-CPM Google AdSense/AdX monetization with centralized management.

## Architecture

```
quiz-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (Tenants, Categories, AdsTxt)
│   └── seed.ts                # Database seed with sample data
├── src/
│   ├── proxy.ts               # Multi-tenant host detection (Next.js 16 Proxy)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── redis.ts           # Redis client for caching
│   │   └── tenant.ts          # Tenant resolution & caching logic
│   ├── components/
│   │   ├── QuizEngine.tsx     # 5-step quiz with ad injection
│   │   └── admin/
│   │       ├── TenantManager.tsx   # CRUD tenants with 1-min provisioning
│   │       └── CategoryManager.tsx # Quiz JSON editor
│   └── app/
│       ├── page.tsx           # Compliance landing page (dynamic per tenant)
│       ├── quiz/page.tsx      # Quiz assessment page
│       ├── privacy/page.tsx   # Auto-generated privacy policy
│       ├── terms/page.tsx     # Auto-generated terms of service
│       ├── contact/page.tsx   # Contact page
│       ├── ads.txt/route.ts   # Dynamic ads.txt per domain
│       ├── admin/             # Admin dashboard
│       │   ├── page.tsx       # Dashboard overview
│       │   ├── tenants/       # Tenant CRUD
│       │   └── categories/    # Category/Quiz CRUD
│       └── api/
│           ├── admin/tenants/route.ts    # Tenant API
│           ├── admin/categories/route.ts # Category API
│           └── tenant-config/route.ts    # Public config endpoint
├── .env.example               # Environment variables template
└── next.config.ts             # Next.js configuration
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Prisma 7 ORM
- **Caching**: Redis (ioredis) for sub-second domain lookups
- **Styling**: Tailwind CSS 4
- **Multi-Tenancy**: Next.js Proxy (host header detection)

## Quick Start

### 1. Install Dependencies
```bash
cd quiz-platform
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL and Redis connection strings
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push     # Create tables
npm run db:seed        # Seed sample data
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Admin Dashboard
Navigate to `http://localhost:3000/admin`

## Multi-Tenant Provisioning (1-Minute Setup)

1. Go to Admin Dashboard → Tenants
2. Click "Add New Tenant (1-Min Provisioning)"
3. Fill in:
   - **Hostname**: The domain/subdomain (e.g., `crm.myblog.com`)
   - **Category**: Select quiz niche
   - **Publisher ID**: Your AdSense `ca-pub-XXXXX`
   - **Ad Slot IDs**: Banner, Interstitial, and Anchor slots
   - **Analytics ID**: Optional Google Analytics ID
   - **Ads.txt Lines**: Custom ads.txt entries
4. Click "Provision Tenant & Go Live"

## Key Features

### Isolated Ad Ecosystem
Each tenant has unique publisher IDs and ad slots. No shared ad codes across domains.

### 5-Step Quiz with High-CPM Optimization
- **URL State Routing**: Each step pushes to URL (`/quiz?step=2`) triggering fresh ad auctions
- **Step 4 Interstitial**: 3-second artificial delay with animated loader fires high-CPM interstitial ads
- **Ad Placements**: Top banner, bottom banner, sticky anchor, and interstitial

### Dynamic Compliance Pages
Root URL (`/`) renders a professional landing page with auto-generated Privacy Policy, Terms of Service, and Contact pages using the current domain name.

### Dynamic ads.txt
`/ads.txt` route dynamically serves the correct publisher configuration per domain.

### Redis Caching
Domain-to-config lookups are cached in Redis (5-minute TTL) for zero-latency frontend rendering.

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```
Set environment variables in Vercel dashboard.

### Docker
```bash
docker build -t quiz-platform .
docker run -p 3000:3000 quiz-platform
```

### DNS Configuration
Point each tenant domain to your deployment. The platform automatically detects the hostname and serves the appropriate content.
