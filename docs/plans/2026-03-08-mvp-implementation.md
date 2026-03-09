# Vela MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working web MVP of the Vela beauty intelligence platform — onboarding, cabinet management, alignment engine, product pages, home dashboard, explore, and settings.

**Architecture:** Next.js App Router with TypeScript. Supabase handles auth and Postgres database with RLS. Alignment engine runs as serverless API routes. TanStack React Query manages server state. Tailwind + shadcn/ui for styling.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, TanStack React Query, Zod, Vercel

**Reference docs (all in `Nicole Input/` folder):**
- `prd.docx` — Product requirements
- `alignment-engine-logic-spec.docx` — Engine scoring rules
- `data-model-spec.docx` — Database schema details
- `supabase-migration.sql` — Database DDL (run in Supabase SQL Editor)
- `design-system-spec.docx` — Colors, typography, components
- `content-copy-doc.docx` — All user-facing strings
- `wireframes-complete.jsx` — 10 screen wireframes with exact layout/copy
- `user-flow-diagrams.mermaid` — All user paths
- `api-spec.docx` — API endpoint definitions
- `Vela_Intelligence_Seed_Catalog.xlsx` — Seed product data
- `seed-data-import.py` — Script to import seed data into Supabase
- `column-mapping.docx` — Spreadsheet to DB column mapping
- `tagging-agent.py` — AI tagging system prompt

---

## Phase 0: Project Setup

### Task 0.1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

**Step 1: Scaffold Next.js with TypeScript**

```bash
cd "C:/Users/vcolosi/Desktop/Coding 1.23.2026/vela"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Select defaults when prompted. This creates the full Next.js project structure.

**Step 2: Verify it runs**

```bash
npm run dev
```

Expected: App running at http://localhost:3000

**Step 3: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with TypeScript and Tailwind"
```

---

### Task 0.2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install all project dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query zod
```

**Step 2: Install dev dependencies**

```bash
npm install -D @types/node supabase
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install supabase, react-query, zod dependencies"
```

---

### Task 0.3: Initialize shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`
- Modify: `tailwind.config.ts`

**Step 1: Initialize shadcn**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

**Step 2: Install commonly needed components**

```bash
npx shadcn@latest add button card input label tabs toggle switch dialog badge separator scroll-area
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: initialize shadcn/ui with base components"
```

---

### Task 0.4: Configure Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/lib/utils/constants.ts`

**Step 1: Update Tailwind config with Vela design tokens**

Reference: `Nicole Input/wireframes-complete.jsx` lines 3-8 for exact color values, `Nicole Input/design-system-spec.docx` for typography.

Update `tailwind.config.ts` to extend the theme with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1715",
        espresso: "#2c2520",
        walnut: "#3d352e",
        clay: "#6b6158",
        stone: "#9c948b",
        sand: "#cec8c0",
        parchment: "#e8e4de",
        cream: "#f4f2ee",
        "vela-white": "#fafaf8",
        "vela-blue": "#4a7c9b",
        "blue-wash": "#edf3f7",
        sage: "#5b7a5e",
        "sage-wash": "#eef3ee",
        warm: "#c4a882",
        "warm-light": "#e8ddd0",
        risk: "#b5705e",
        "risk-wash": "#f8f0ed",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

**Step 2: Add Google Fonts to root layout**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Vela — Make beauty make sense",
  description: "The intelligence layer between your collection and your next purchase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${outfit.variable} ${jetbrains.variable} font-sans antialiased bg-vela-white text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Create constants file**

Create `src/lib/utils/constants.ts`:

```typescript
// Alignment engine weights (locked)
export const ENGINE_WEIGHTS = {
  risk: 0.45,
  goal: 0.35,
  balance: 0.20,
} as const;

// Alignment tiers (locked — no numeric scores shown to users)
export const ALIGNMENT_TIERS = ["Low", "Moderate", "High"] as const;
export type AlignmentTier = (typeof ALIGNMENT_TIERS)[number];

// Makeup zones
export const MAKEUP_ZONES = ["Face", "Cheek", "Lip", "Eye"] as const;
export type MakeupZone = (typeof MAKEUP_ZONES)[number];

// Color purposes
export const COLOR_PURPOSES = ["Staple", "Warm", "Cool", "Deep", "Statement"] as const;
export type ColorPurpose = (typeof COLOR_PURPOSES)[number];

// Identity tiers
export const IDENTITY_TIERS = ["Essentialist", "Curator", "Enthusiast", "Creative"] as const;
export type IdentityTier = (typeof IDENTITY_TIERS)[number];

// Category participation levels
export const PARTICIPATION_LEVELS = ["active", "occasional", "inactive"] as const;
export type ParticipationLevel = (typeof PARTICIPATION_LEVELS)[number];

// Skincare functional categories
export const SKINCARE_FUNCTIONS = [
  "Hydration",
  "Barrier Support",
  "Exfoliation (AHA)",
  "Exfoliation (BHA)",
  "Exfoliation (PHA)",
  "Retinoids",
  "Antioxidants",
  "Pigment Correction",
  "Acne Treatment",
  "SPF",
  "Soothing",
  "Oil Regulation",
] as const;

// Shade depths
export const SHADE_DEPTHS = [
  "Fair", "Light", "Light-Medium", "Medium",
  "Medium-Deep", "Deep", "Deep-Dark",
] as const;

// Undertones
export const UNDERTONES = ["Warm", "Cool", "Neutral", "Olive"] as const;

// Product categories
export const PRODUCT_CATEGORIES = ["skincare", "makeup", "body", "hair"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Conflict severity levels
export const CONFLICT_SEVERITIES = ["soft", "moderate", "severe", "critical"] as const;
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure Vela design tokens, fonts, and constants"
```

---

### Task 0.5: Configure Supabase Client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/middleware.ts`
- Create: `.env.local` (from `Nicole Input/env.example`)

**Step 1: Create `.env.local`**

```bash
cp "Nicole Input/env.example" .env.local
```

Then edit `.env.local` with your actual Supabase project URL and keys. Also add to `.gitignore` if not already there.

**Step 2: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 3: Create server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

**Step 4: Create middleware for auth session refresh**

Create `src/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login (except public pages)
  const publicPaths = ["/", "/login", "/signup"];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 5: Update `.env.local` variable names for Next.js**

Ensure `.env.local` uses `NEXT_PUBLIC_` prefix:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 7: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts .env.local
git commit -m "feat: configure Supabase client, server client, and auth middleware"
```

---

### Task 0.6: Set Up Providers

**Files:**
- Create: `src/providers/query-provider.tsx`
- Create: `src/providers/supabase-provider.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create React Query provider**

Create `src/providers/query-provider.tsx`:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Step 2: Create Supabase auth provider**

Create `src/providers/supabase-provider.tsx`:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type SupabaseContext = {
  user: User | null;
  loading: boolean;
};

const Context = createContext<SupabaseContext>({
  user: null,
  loading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <Context.Provider value={{ user, loading }}>{children}</Context.Provider>
  );
}

export const useUser = () => useContext(Context);
```

**Step 3: Wire providers into root layout**

Modify `src/app/layout.tsx` — wrap `{children}` with both providers:

```typescript
import { QueryProvider } from "@/providers/query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";

// ... (keep existing font and metadata code)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${outfit.variable} ${jetbrains.variable} font-sans antialiased bg-vela-white text-ink`}
      >
        <QueryProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add React Query and Supabase auth providers"
```

---

### Task 0.7: Set Up Supabase Database

**This task is done in the Supabase Dashboard, not in code.**

**Step 1: Create a Supabase project**

Go to supabase.com, create a new project. Copy the URL and keys into `.env.local`.

**Step 2: Run the migration SQL**

Open Supabase Dashboard → SQL Editor. Copy the entire contents of `Nicole Input/supabase-migration.sql` and run it. This creates all 8 tables, triggers, indexes, and RLS policies.

**Step 3: Import seed data**

```bash
pip install openpyxl supabase
python "Nicole Input/seed-data-import.py" --file "Nicole Input/Vela_Intelligence_Seed_Catalog.xlsx" --dry-run
```

If dry run looks good:

```bash
python "Nicole Input/seed-data-import.py" --file "Nicole Input/Vela_Intelligence_Seed_Catalog.xlsx"
```

**Step 4: Verify in Supabase Dashboard**

Check that `products`, `shades`, and `conflict_rules` tables have data.

---

## Phase 1: Onboarding & Auth

### Task 1.1: Landing / Hero Page

**Files:**
- Modify: `src/app/page.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 57-72 (OnboardingHero component), `Nicole Input/content-copy-doc.docx` for exact copy.

**Step 1: Build the hero page**

Replace `src/app/page.tsx`:

```typescript
import Link from "next/link";

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-vela-white flex flex-col">
      <div className="flex-1 flex flex-col justify-end px-8 pb-12">
        <h1 className="font-serif text-4xl font-light italic text-ink leading-tight mb-4">
          Make beauty
          <br />
          make sense.
        </h1>
        <p className="font-sans text-sm text-clay font-light leading-relaxed max-w-[280px]">
          The intelligence layer between your collection and your next purchase.
        </p>
      </div>
      <div className="px-8 pb-12">
        <Link
          href="/signup"
          className="block w-full py-4 bg-ink rounded-[10px] text-center"
        >
          <span className="font-sans text-[15px] text-cream font-normal">
            Start My Cabinet
          </span>
        </Link>
        <div className="text-center mt-3">
          <Link
            href="/login"
            className="font-sans text-[13px] text-stone font-light"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

```bash
npm run dev
```

Visit http://localhost:3000 — should see the hero page.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing hero page with brand copy"
```

---

### Task 1.2: Auth Pages (Login & Signup)

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`

**Step 1: Create signup page**

Create `src/app/(auth)/signup/page.tsx`:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/onboarding/categories");
    }
  }

  return (
    <div className="min-h-screen bg-vela-white flex flex-col justify-center px-8">
      <h1 className="font-serif text-3xl font-normal text-ink mb-2">
        Create your cabinet
      </h1>
      <p className="font-sans text-sm text-clay font-light mb-8">
        Add what you already own to begin.
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="font-sans text-xs text-stone uppercase tracking-widest">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 bg-cream border border-parchment rounded-lg font-sans text-sm text-ink focus:outline-none focus:border-stone"
            required
          />
        </div>
        <div>
          <label className="font-sans text-xs text-stone uppercase tracking-widest">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3 bg-cream border border-parchment rounded-lg font-sans text-sm text-ink focus:outline-none focus:border-stone"
            minLength={6}
            required
          />
        </div>

        {error && (
          <p className="font-sans text-sm text-risk">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-ink rounded-lg text-center disabled:opacity-50"
        >
          <span className="font-sans text-[13px] text-cream">
            {loading ? "Creating account..." : "Continue"}
          </span>
        </button>
      </form>

      <div className="text-center mt-4">
        <Link
          href="/login"
          className="font-sans text-[13px] text-stone font-light"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Create login page**

Create `src/app/(auth)/login/page.tsx` — same structure as signup but calls `supabase.auth.signInWithPassword` and redirects to `/home`.

**Step 3: Verify**

```bash
npm run dev
```

Visit /signup and /login — forms should render.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add login and signup pages with Supabase auth"
```

---

### Task 1.3: Onboarding Flow

**Files:**
- Create: `src/app/onboarding/layout.tsx`
- Create: `src/app/onboarding/categories/page.tsx`
- Create: `src/app/onboarding/skincare/page.tsx`
- Create: `src/app/onboarding/makeup/page.tsx`
- Create: `src/app/onboarding/preferences/page.tsx`
- Create: `src/components/onboarding/category-picker.tsx`
- Create: `src/components/onboarding/identity-selector.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 77-133 for exact UI. `Nicole Input/content-copy-doc.docx` for copy. User flow: categories → skincare (if active) → makeup (if active) → preferences → redirect to /home.

**Step 1: Create onboarding layout with progress bar**

Create `src/app/onboarding/layout.tsx`:

```typescript
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-vela-white">
      {children}
    </div>
  );
}
```

**Step 2: Build categories page (Step 1 of 4)**

Create `src/app/onboarding/categories/page.tsx`:

Reference wireframe: OnboardingCategories component (lines 77-98). Each category (Skincare, Makeup, Hair, Body) has Active / Occasional / Not a user toggles. Save selections to Supabase `profiles` table (`category_skincare`, `category_makeup`, `category_hair`, `category_body` columns). Navigate to `/onboarding/skincare` if skincare is active/occasional, else skip to `/onboarding/makeup`.

**Step 3: Build skincare goals page (Step 2 of 4)**

Create `src/app/onboarding/skincare/page.tsx`:

Ask for: skincare goals (select up to 2), skincare concerns (select up to 3). Save to `profiles.skincare_goals` and `profiles.skincare_concerns`. Navigate to `/onboarding/makeup` if makeup is active/occasional, else skip to `/onboarding/preferences`.

**Step 4: Build makeup identity page (Step 3 of 4)**

Create `src/app/onboarding/makeup/page.tsx`:

Reference wireframe: OnboardingMakeup component (lines 103-133). Four identity tiers (Essentialist, Curator, Enthusiast, Creative) with descriptions. Active/Occasional frequency toggle. Save to `profiles.makeup_identity` and `profiles.makeup_frequency`. Navigate to `/onboarding/preferences`.

**Step 5: Build preferences page (Step 4 of 4)**

Create `src/app/onboarding/preferences/page.tsx`:

Toggles for: clean beauty, fragrance-free, vegan, cruelty-free. Save to `profiles.preferences` JSONB column. On completion, redirect to `/home`.

**Step 6: Build reusable onboarding components**

Create `src/components/onboarding/category-picker.tsx` — the Active/Occasional/Not a user toggle group.
Create `src/components/onboarding/identity-selector.tsx` — the four identity tier cards.

**Step 7: Verify full onboarding flow**

```bash
npm run dev
```

Sign up a new user → should flow through all 4 steps → land on /home.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add 4-step onboarding flow with profile creation"
```

---

## Phase 2: Cabinet & Core UI

### Task 2.1: App Shell & Bottom Navigation

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/layout/bottom-nav.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 35-52 (BottomNav component). Nav items: Home, Explore, + (scan action), Cabinet.

**Step 1: Build bottom nav component**

Create `src/components/layout/bottom-nav.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Explore", href: "/explore" },
  { label: "+", href: "/scan", isAction: true },
  { label: "Cabinet", href: "/cabinet" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 bg-vela-white border-t border-parchment py-3 pb-2 flex justify-around">
      {navItems.map((item) =>
        item.isAction ? (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center -mt-5 shadow-lg">
              <span className="text-cream text-xl font-light leading-none">+</span>
            </div>
          </Link>
        ) : (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded ${
                pathname.startsWith(item.href)
                  ? "bg-ink"
                  : "border-[1.5px] border-sand"
              }`}
            />
            <span
              className={`font-sans text-[9px] ${
                pathname.startsWith(item.href)
                  ? "text-ink font-medium"
                  : "text-stone font-light"
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      )}
    </nav>
  );
}
```

**Step 2: Create authenticated app layout**

Create `src/app/(app)/layout.tsx`:

```typescript
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-vela-white flex flex-col">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
```

**Step 3: Create placeholder pages**

Create placeholder `page.tsx` for `/home`, `/explore`, `/cabinet`, `/scan`, `/settings` — each just showing the page name for now.

**Step 4: Verify navigation**

```bash
npm run dev
```

Navigate between tabs — bottom nav should highlight active tab.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add app shell with bottom navigation"
```

---

### Task 2.2: Cabinet Page

**Files:**
- Modify: `src/app/(app)/cabinet/page.tsx`
- Create: `src/components/cabinet/cabinet-list.tsx`
- Create: `src/components/cabinet/cabinet-item.tsx`
- Create: `src/components/product/product-dot.tsx`
- Create: `src/lib/hooks/use-cabinet.ts`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 266-306 (CabinetView). Tabs: All, Skincare, Makeup, Hair, Body. Each item shows brand, name, tag, lineup badge. Stats: total count + in lineup count.

**Step 1: Create React Query hook for cabinet data**

Create `src/lib/hooks/use-cabinet.ts`:

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCabinet() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ["cabinet", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cabinet_items")
        .select(`
          *,
          product:products(*),
          shade:shades(*)
        `)
        .eq("user_id", user!.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddToCabinet() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      shadeId,
    }: {
      productId: string;
      shadeId?: string;
    }) => {
      const { data, error } = await supabase
        .from("cabinet_items")
        .insert({
          user_id: user!.id,
          product_id: productId,
          shade_id: shadeId || null,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}

export function useToggleLineup() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("cabinet_items")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}

export function useRemoveFromCabinet() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cabinet_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}
```

**Step 2: Build cabinet-item component, cabinet-list component, product-dot component**

Reference wireframe lines 266-306 for layout. Each item: ProductDot | Brand (uppercase tiny) + Name | Tag badge + "In lineup" indicator.

**Step 3: Build cabinet page with tabs and stats**

**Step 4: Verify**

```bash
npm run dev
```

Visit /cabinet — should show empty state or products if user has added any.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add cabinet page with product list, tabs, and lineup toggles"
```

---

### Task 2.3: Product Search & Add to Cabinet

**Files:**
- Create: `src/app/api/products/search/route.ts`
- Create: `src/lib/hooks/use-products.ts`
- Modify: `src/app/(app)/scan/page.tsx`

**Step 1: Create product search API route**

Create `src/app/api/products/search/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`product_name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
```

**Step 2: Create product search hook**

Create `src/lib/hooks/use-products.ts` with a `useProductSearch(query)` hook that calls the API route and returns results via React Query.

**Step 3: Build scan/search page**

Reference wireframe: ScanFlow (lines 311-344). For MVP, focus on the search bar (barcode scanning is deferred). Search input + results list. Tapping a result navigates to `/product/[id]`.

**Step 4: Verify**

Search for "CeraVe" — should return products from seed data.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add product search API and scan/search page"
```

---

## Phase 3: Alignment Engine

### Task 3.1: Engine Types

**Files:**
- Create: `src/lib/engine/types.ts`

**Step 1: Define all engine types**

```typescript
import type { AlignmentTier } from "@/lib/utils/constants";

export interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  category: "skincare" | "makeup" | "body" | "hair";
  subcategory: string;
  zone: string | null;
  primary_functions: string[];
  secondary_functions: string[];
  concentration_tier: "Low" | "Moderate" | "High" | null;
  treatment_or_support: "Treatment" | "Support" | null;
  core_from: string | null;
  overlap_rule: string | null;
  shade_relevance: string | null;
  pairs_with: string[];
  formula_notes: string | null;
}

export interface UserProfile {
  skincare_goals: string[];
  skincare_concerns: string[];
  makeup_identity: string | null;
  makeup_frequency: string | null;
  shade_depth: string | null;
  shade_undertone: string | null;
  category_skincare: string;
  category_makeup: string;
  category_hair: string;
  category_body: string;
  preferences: Record<string, boolean>;
}

export interface CabinetItem {
  product_id: string;
  is_active: boolean;
  product: Product;
}

export interface ConflictRule {
  rule_id: string;
  category_a: string;
  category_b: string;
  severity: "soft" | "moderate" | "severe" | "critical";
  condition: string | null;
  max_alignment: string | null;
  explanation: string;
  resolutions: Array<{ type: string; message: string }>;
}

export interface AlignmentResult {
  tier: AlignmentTier;
  score: number; // internal only, never shown to user
  reasoning: {
    risk: RiskResult;
    overlap: OverlapResult;
    coverage: CoverageResult;
    compatibility: CompatibilityResult;
  };
  shadeAdvice?: string;
}

export interface RiskResult {
  hasConflict: boolean;
  conflicts: Array<{
    rule: ConflictRule;
    conflictingProduct: Product;
    explanation: string;
    resolutions: string[];
  }>;
  score: number; // 0-1, higher = more risk
}

export interface OverlapResult {
  hasOverlap: boolean;
  overlappingProducts: Array<{
    product: Product;
    overlapType: string;
    explanation: string;
  }>;
  score: number; // 0-1, higher = more overlap
}

export interface CoverageResult {
  expandsCoverage: boolean;
  gapsFilled: string[];
  explanation: string;
  score: number; // 0-1, higher = better coverage contribution
}

export interface CompatibilityResult {
  explanation: string;
  score: number; // 0-1, higher = better compatibility
}
```

**Step 2: Commit**

```bash
git add src/lib/engine/types.ts
git commit -m "feat: define alignment engine type system"
```

---

### Task 3.2: Conflict Detection

**Files:**
- Create: `src/lib/engine/conflicts.ts`

**Reference:** `Nicole Input/alignment-engine-logic-spec.docx` for all 10 conflict rules. Key rules include: retinoid + AHA/BHA, multiple strong exfoliants, vitamin C + niacinamide (soft), benzoyl peroxide + retinoid, etc.

**Step 1: Implement conflict detection**

Create `src/lib/engine/conflicts.ts`:

The function takes: candidate product, user's active lineup products, and conflict rules from the database. It checks each rule against the candidate + each lineup product. Returns a RiskResult with all detected conflicts, their explanations, and resolution paths.

Key logic:
- Match on `primary_functions` overlap between candidate and lineup products
- Check `concentration_tier` against rule conditions
- If severity is "severe" or "critical", cap alignment at Moderate or Low
- Use advisory language: "may increase" not "will cause"

**Step 2: Commit**

```bash
git add src/lib/engine/conflicts.ts
git commit -m "feat: implement skincare conflict detection with 10 rules"
```

---

### Task 3.3: Overlap Detection

**Files:**
- Create: `src/lib/engine/overlap.ts`

**Reference:** `Nicole Input/alignment-engine-logic-spec.docx` for tier-aware overlap rules.

**Step 1: Implement overlap detection**

The function checks if the candidate product duplicates a function already in the user's cabinet. Overlap sensitivity depends on the user's makeup identity tier:
- Essentialist: flag almost any duplicate
- Curator: flag duplicates, frame as upgrade logic
- Enthusiast: flag same subcategory + same purpose + same finish
- Creative: flag near-identical only

For skincare: compare `primary_functions` arrays. If candidate shares a primary function with an existing lineup product, that's overlap.

**Step 2: Commit**

```bash
git add src/lib/engine/overlap.ts
git commit -m "feat: implement tier-aware overlap detection"
```

---

### Task 3.4: Coverage Gap Analysis

**Files:**
- Create: `src/lib/engine/coverage.ts`

**Step 1: Implement coverage analysis**

The function checks whether the candidate product fills a gap in the user's routine. For skincare: compare user's stated goals against functional categories already covered by lineup products. If the user wants "anti-aging" but has no retinoid, a retinoid product fills a gap. Also detect structural weaknesses (all treatment, no support products; using actives but no SPF).

**Step 2: Commit**

```bash
git add src/lib/engine/coverage.ts
git commit -m "feat: implement coverage gap analysis"
```

---

### Task 3.5: Main Alignment Calculator

**Files:**
- Create: `src/lib/engine/alignment.ts`

**Step 1: Implement the main alignment function**

Create `src/lib/engine/alignment.ts`:

```typescript
import { ENGINE_WEIGHTS, type AlignmentTier } from "@/lib/utils/constants";
import { detectConflicts } from "./conflicts";
import { detectOverlap } from "./overlap";
import { analyzeCoverage } from "./coverage";
import type {
  AlignmentResult,
  CabinetItem,
  ConflictRule,
  Product,
  UserProfile,
} from "./types";

export function calculateAlignment(
  candidate: Product,
  profile: UserProfile,
  cabinetItems: CabinetItem[],
  conflictRules: ConflictRule[]
): AlignmentResult {
  const activeLineup = cabinetItems.filter((item) => item.is_active);

  // 1. Risk assessment (45%)
  const risk = detectConflicts(candidate, activeLineup, conflictRules);

  // 2. Coverage / goal attainment (35%)
  const coverage = analyzeCoverage(candidate, profile, activeLineup);

  // 3. Overlap / structural balance (20%)
  const overlap = detectOverlap(candidate, profile, cabinetItems);

  // Calculate weighted score
  const riskScore = 1 - risk.score; // invert: lower risk = higher alignment
  const coverageScore = coverage.score;
  const balanceScore = 1 - overlap.score; // invert: less overlap = higher alignment

  let score =
    riskScore * ENGINE_WEIGHTS.risk +
    coverageScore * ENGINE_WEIGHTS.goal +
    balanceScore * ENGINE_WEIGHTS.balance;

  // Apply conflict caps
  const hasSevereConflict = risk.conflicts.some(
    (c) => c.rule.severity === "severe" || c.rule.severity === "critical"
  );
  if (hasSevereConflict) {
    score = Math.min(score, 0.5); // cannot be High
  }

  const hasCriticalConflict = risk.conflicts.some(
    (c) => c.rule.severity === "critical"
  );
  if (hasCriticalConflict) {
    score = Math.min(score, 0.33); // should be Low
  }

  // Map to tier
  let tier: AlignmentTier;
  if (score >= 0.66) tier = "High";
  else if (score >= 0.33) tier = "Moderate";
  else tier = "Low";

  return {
    tier,
    score,
    reasoning: {
      risk,
      overlap,
      coverage,
      compatibility: {
        explanation: generateCompatibilityExplanation(candidate, activeLineup),
        score: coverageScore,
      },
    },
  };
}

function generateCompatibilityExplanation(
  candidate: Product,
  lineup: CabinetItem[]
): string {
  const compatible = lineup.filter(
    (item) =>
      item.product.category === candidate.category ||
      item.product.pairs_with?.includes(candidate.product_id)
  );

  if (compatible.length === 0) {
    return "No related products in your lineup to compare.";
  }

  return `Integrates with ${compatible.length} product${compatible.length > 1 ? "s" : ""} in your lineup.`;
}
```

**Step 2: Commit**

```bash
git add src/lib/engine/alignment.ts
git commit -m "feat: implement main alignment calculator with weighted scoring"
```

---

### Task 3.6: Alignment API Route

**Files:**
- Create: `src/app/api/alignment/check/route.ts`
- Create: `src/lib/hooks/use-alignment.ts`

**Step 1: Create the API route**

Create `src/app/api/alignment/check/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { calculateAlignment } from "@/lib/engine/alignment";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  product_id: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all needed data in parallel
  const [profileRes, productRes, cabinetRes, rulesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("products").select("*").eq("product_id", parsed.data.product_id).single(),
    supabase.from("cabinet_items").select("*, product:products(*)").eq("user_id", user.id),
    supabase.from("conflict_rules").select("*"),
  ]);

  if (productRes.error || !productRes.data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const result = calculateAlignment(
    productRes.data,
    profileRes.data,
    cabinetRes.data || [],
    rulesRes.data || []
  );

  // Store in history
  await supabase.from("alignment_history").insert({
    user_id: user.id,
    product_id: parsed.data.product_id,
    tier: result.tier,
    score: result.score,
    reasoning: result.reasoning,
  });

  return NextResponse.json(result);
}
```

**Step 2: Create alignment hook**

Create `src/lib/hooks/use-alignment.ts` with a `useAlignment(productId)` hook that calls the API route via React Query mutation.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add alignment check API route and React Query hook"
```

---

## Phase 4: Product Page

### Task 4.1: Product Detail Page

**Files:**
- Create: `src/app/(app)/product/[id]/page.tsx`
- Create: `src/components/product/alignment-bar.tsx`
- Create: `src/components/product/product-card.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 203-261 (ProductPage). Layout: product image → brand/name/price → alignment card (Low/Moderate/High bar) → risk block (if triggered) → action buttons → reasoning sections (Overlap, Coverage, Compatibility).

**Step 1: Build alignment bar component**

Shows Low — Moderate — High with a positioned dot. Tier label and one-line summary below.

**Step 2: Build product page**

Fetches product by ID from Supabase, runs alignment check, displays full product intelligence page with:
- Product info (brand, name, price)
- Alignment bar
- Risk block (conditional, shown first when triggered)
- Action buttons: "Add to Cabinet" (primary), "Buy" (secondary)
- Reasoning sections: Overlap, Coverage, Compatibility

**Step 3: Verify**

Navigate to a product from search — should see full intelligence page.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add product page with alignment intelligence and actions"
```

---

## Phase 5: Home Dashboard

### Task 5.1: Home Page

**Files:**
- Modify: `src/app/(app)/home/page.tsx`
- Create: `src/lib/hooks/use-profile.ts`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 138-198 (HomePage). Layout: alignment score + delta → "Selected for you" product rail → category cards stacked vertically (Skincare, Makeup, Hair, Body) each with status signal + alignment + counts.

**Step 1: Create profile hook**

Create `src/lib/hooks/use-profile.ts` — fetches user profile from Supabase.

**Step 2: Build home page**

- Top: overall alignment expression (calculated from category averages)
- "Selected for you" horizontal product rail (products with High alignment the user doesn't own)
- Category cards: each shows category name, status descriptor (e.g., "Coverage complete"), alignment figure, active/total counts
- Inactive categories show "Add 1 product to unlock" prompt

**Step 3: Verify**

```bash
npm run dev
```

Visit /home — should show dashboard with category cards.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add home dashboard with alignment summary and category cards"
```

---

## Phase 6: Explore & Search

### Task 6.1: Explore Page

**Files:**
- Modify: `src/app/(app)/explore/page.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 349-428 (ExplorePage). Layout: search bar → "Selected" product cards → "Trending Edits" cards → "Cabinets to Explore" (static for MVP).

**Step 1: Build explore page**

- Search bar at top (reuses product search hook)
- "Selected" section: horizontal scroll of product cards (curated from seed data or high-alignment products)
- "Trending Edits" section: static cards for MVP (Summer Glow, Glass Skin, 90s Brown Lip from wireframe data)
- "Cabinets to Explore" section: static placeholder cards for MVP

**Step 2: Verify and commit**

```bash
git add -A
git commit -m "feat: add explore page with search, selected products, and trending edits"
```

---

## Phase 7: Polish & Deploy

### Task 7.1: Settings Page

**Files:**
- Modify: `src/app/(app)/settings/page.tsx`

**Reference:** `Nicole Input/wireframes-complete.jsx` lines 493-536 (SettingsView). Sections: Profile (shade, goals, concerns), Makeup (identity, frequency), Categories (participation toggles), Preferences (clean, fragrance-free, vegan, cruelty-free toggles), Account (subscription, reset, clear, sign out).

**Step 1: Build settings page**

All fields read from and write to the `profiles` table. Sign out calls `supabase.auth.signOut()` and redirects to `/`.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add settings page with profile editing and sign out"
```

---

### Task 7.2: Empty States, Loading States, Error States

**Files:**
- Create: `src/components/ui/loading-spinner.tsx`
- Create: `src/components/ui/empty-state.tsx`
- Modify: all page files to add loading/empty/error handling

**Step 1: Create reusable loading and empty state components**

**Step 2: Add loading states to all pages using React Query's `isLoading`**

**Step 3: Add empty states for cabinet (no products), home (new user), explore (no results)**

Reference `Nicole Input/content-copy-doc.docx` for empty state copy.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add loading, empty, and error states across all pages"
```

---

### Task 7.3: Mobile Responsive Polish

**Files:**
- Modify: various component files

**Step 1: Ensure all pages work at mobile widths (375px baseline from wireframes)**

The wireframes are designed mobile-first at 375px width. Ensure Tailwind responsive classes handle larger screens gracefully (centered max-width container on desktop).

**Step 2: Commit**

```bash
git add -A
git commit -m "fix: mobile responsive polish across all pages"
```

---

### Task 7.4: Vercel Deployment

**Step 1: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Connect to Vercel**

- Go to vercel.com → Import Git Repository
- Select the repo
- Framework preset: Next.js (auto-detected)
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Step 3: Deploy**

Vercel auto-deploys on push to main. Verify the live URL works.

**Step 4: Commit any deployment fixes**

```bash
git add -A
git commit -m "chore: vercel deployment configuration"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 0 | 0.1–0.7 | Working Next.js project with Supabase, design system, seed data |
| 1 | 1.1–1.3 | Landing page, auth, 4-step onboarding |
| 2 | 2.1–2.3 | App shell, cabinet page, product search |
| 3 | 3.1–3.6 | Full alignment engine with API |
| 4 | 4.1 | Product intelligence page |
| 5 | 5.1 | Home dashboard |
| 6 | 6.1 | Explore page |
| 7 | 7.1–7.4 | Settings, polish, deploy to Vercel |
