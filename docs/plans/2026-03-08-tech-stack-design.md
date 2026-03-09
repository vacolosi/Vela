# Vela — Tech Stack & Architecture Design

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth & Database | Supabase (Postgres + Auth + RLS) |
| State Management | TanStack React Query + React Context |
| Alignment Engine | Next.js API Routes (serverless) |
| Deployment | Vercel |
| Package Manager | npm |

### Key Libraries
- `@supabase/supabase-js` + `@supabase/ssr` — Supabase client with Next.js SSR support
- `@tanstack/react-query` — Server state caching/syncing
- `tailwindcss` + `shadcn/ui` — Styling + component primitives
- `zod` — Runtime validation for API inputs and engine data

### Design Tokens
- Fonts: Cormorant Garamond (serif), Outfit (sans), JetBrains Mono (mono)
- Colors: ink, espresso, walnut, clay, stone, sand, parchment, cream, white, blue, sage, warm, risk + wash variants

---

## Project Structure

```
vela/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   ├── page.tsx                  # Landing/hero page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── onboarding/
│   │   │   ├── layout.tsx            # Onboarding shell (progress bar)
│   │   │   ├── categories/page.tsx   # Step 1: category participation
│   │   │   ├── skincare/page.tsx     # Step 2: goals & concerns
│   │   │   ├── makeup/page.tsx       # Step 3: identity tier
│   │   │   └── preferences/page.tsx  # Step 4: global preferences
│   │   ├── (app)/                    # Authenticated app shell
│   │   │   ├── layout.tsx            # Bottom nav + auth guard
│   │   │   ├── home/page.tsx         # Home dashboard
│   │   │   ├── explore/page.tsx      # Explore & search
│   │   │   ├── cabinet/page.tsx      # Cabinet view
│   │   │   ├── scan/page.tsx         # Scan/search flow
│   │   │   ├── product/[id]/page.tsx # Product page + alignment
│   │   │   └── settings/page.tsx     # Settings & profile
│   │   └── api/
│   │       ├── alignment/
│   │       │   ├── check/route.ts    # Single product alignment
│   │       │   └── batch/route.ts    # Batch alignment
│   │       └── products/
│   │           └── search/route.ts   # Product search
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── bottom-nav.tsx
│   │   │   └── phone-shell.tsx
│   │   ├── product/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-dot.tsx
│   │   │   └── alignment-bar.tsx
│   │   ├── cabinet/
│   │   │   ├── cabinet-list.tsx
│   │   │   └── cabinet-item.tsx
│   │   └── onboarding/
│   │       ├── category-picker.tsx
│   │       └── identity-selector.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   ├── middleware.ts          # Auth middleware
│   │   │   └── types.ts              # Auto-generated DB types
│   │   ├── engine/
│   │   │   ├── alignment.ts          # Main alignment calculator
│   │   │   ├── conflicts.ts          # 10 conflict rules
│   │   │   ├── overlap.ts            # Overlap detection
│   │   │   ├── coverage.ts           # Coverage gap analysis
│   │   │   ├── shade-matching.ts     # Shade profile logic
│   │   │   └── types.ts              # Engine types
│   │   ├── hooks/
│   │   │   ├── use-cabinet.ts        # Cabinet CRUD queries
│   │   │   ├── use-profile.ts        # Profile queries
│   │   │   ├── use-alignment.ts      # Alignment check queries
│   │   │   └── use-products.ts       # Product search queries
│   │   └── utils/
│   │       ├── constants.ts          # Design tokens, enums
│   │       └── helpers.ts
│   └── providers/
│       ├── query-provider.tsx        # React Query provider
│       └── supabase-provider.tsx     # Supabase auth context
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Data Flow

### Authentication
User → Supabase Auth → middleware checks session → Redirects unauthenticated to /login, missing onboarding to /onboarding → Auth context via supabase-provider

### Core Data
Components → React Query hooks → Supabase client → Postgres (RLS enforced)

### Alignment Engine
1. Client calls POST /api/alignment/check with product_id
2. API route fetches: user profile, cabinet items, candidate product, conflict rules
3. Engine runs: conflicts (Risk 45%) → coverage (Goal 35%) → overlap (Balance 20%) → shade matching
4. Returns: { tier: Low|Moderate|High, reasoning: { risk, overlap, coverage, compatibility }, shadeAdvice? }
5. Result cached in React Query + stored in alignment_history

### Cabinet CRUD
- Add: React Query mutation → Supabase insert → invalidate cache
- Toggle lineup: optimistic update → Supabase update → confirm/rollback
- Remove: confirm dialog → Supabase delete → invalidate cache

---

## MVP Build Order

### Phase 0: Project Setup
- Scaffold Next.js + TypeScript + Tailwind + shadcn/ui
- Configure Supabase, run migration SQL, import seed data
- Design tokens in Tailwind config
- Auth setup (Supabase + middleware + providers)

### Phase 1: Onboarding & Auth
- Landing/hero page
- Sign up / sign in
- 4-step onboarding
- Profile creation

### Phase 2: Cabinet & Core UI
- Bottom nav shell
- Cabinet page (list, tabs, lineup toggles)
- Product search
- Add to cabinet flow

### Phase 3: Alignment Engine
- Conflict detection (10 rules)
- Overlap analysis (tier-aware)
- Coverage gap detection
- Score calculation
- API routes

### Phase 4: Product Page
- Product detail view
- Alignment bar
- Risk block
- Reasoning sections
- Actions

### Phase 5: Home Dashboard
- Alignment summary
- Selected products rail
- Category cards
- Unlock prompts

### Phase 6: Explore & Search
- Search bar
- Selected products
- Trending edits (static MVP)

### Phase 7: Polish & Deploy
- Settings page
- Empty/error/loading states
- Mobile responsive
- Vercel deployment

### Deferred
- Barcode scanning, public/creator cabinets, affiliate links, premium subscription, advanced shade AI, native iOS
