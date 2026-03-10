# MVP Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up product search, camera-based product recognition, add-to-cabinet flow, and fix onboarding bugs.

**Architecture:** Next.js App Router with Supabase backend. Camera scan uses Claude Haiku 4.5 vision API via server-side API route. Product matching uses Supabase ilike queries. All state management via TanStack Query.

**Tech Stack:** Next.js 15, Supabase, Claude Haiku 4.5 (vision), TanStack React Query, Tailwind CSS

---

### Task 1: Onboarding Error Handling & Bug Fixes

**Files:**
- Modify: `src/app/onboarding/categories/page.tsx`
- Modify: `src/app/onboarding/skincare/page.tsx`
- Modify: `src/app/onboarding/makeup/page.tsx`
- Modify: `src/app/onboarding/preferences/page.tsx`

**Step 1: Fix all four onboarding pages**

Add `error` state and display error messages. Fix `makupActive` typo. Ensure `setSaving(false)` on all paths.

In each page's `handleContinue` (or `handleFinish`), change the error handling from:
```tsx
if (error) {
  console.error("Error updating profile:", error);
  setSaving(false);
  return;
}
```
To:
```tsx
if (error) {
  setError("Something went wrong. Please try again.");
  setSaving(false);
  return;
}
```

Add state: `const [error, setError] = useState<string | null>(null);`

Add error display above the Continue button:
```tsx
{error && (
  <p className="font-sans text-sm text-risk text-center">{error}</p>
)}
```

In `skincare/page.tsx`, rename `makupActive` to `makeupActive` (line 33 and line 87).

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/app/onboarding/
git commit -m "fix: add error feedback and fix typo in onboarding pages"
```

---

### Task 2: Explore Page — Replace Hardcoded Data with Real Products

**Files:**
- Modify: `src/app/api/products/search/route.ts`
- Create: `src/app/api/products/featured/route.ts`
- Modify: `src/app/(app)/explore/page.tsx`
- Create: `src/lib/hooks/use-featured-products.ts`

**Step 1: Create featured products API route**

Create `src/app/api/products/featured/route.ts`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("product_id, brand, product_name, category, subcategory, price")
    .order("created_at", { ascending: false })
    .limit(10);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
```

**Step 2: Create hook**

Create `src/lib/hooks/use-featured-products.ts`:
```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  category: string;
  subcategory: string;
  price: number | null;
}

export function useFeaturedProducts(category?: string) {
  return useQuery({
    queryKey: ["products", "featured", category ?? "all"],
    queryFn: async () => {
      const params = category ? `?category=${category}` : "";
      const res = await fetch(`/api/products/featured${params}`);
      const data = await res.json();
      return data.products as Product[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
```

**Step 3: Rewrite Explore page**

Replace the entire `src/app/(app)/explore/page.tsx` with:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProductSearch } from "@/lib/hooks/use-products";
import { useFeaturedProducts } from "@/lib/hooks/use-featured-products";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Hair" },
  { key: "body", label: "Body" },
];

export default function ExplorePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchResults, isLoading: searchLoading } = useProductSearch(debouncedQuery);
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(selectedCategory);
  const isSearching = debouncedQuery.length >= 2;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="font-serif text-[26px] italic text-ink">Explore</h1>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sand"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products or brands..."
          className="w-full bg-cream rounded-lg border border-parchment py-2.5 pl-9 pr-4 font-sans text-xs text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
        />
      </div>

      {/* Search results */}
      {isSearching ? (
        <div className="flex-1 overflow-y-auto">
          {searchLoading && <LoadingSpinner className="py-8" />}
          {!searchLoading && searchResults && searchResults.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try a different search term."
            />
          )}
          {searchResults?.map((product) => (
            <button
              key={product.product_id}
              onClick={() => router.push(`/product/${product.product_id}`)}
              className="w-full text-left px-3 py-3 border-b border-parchment hover:bg-cream/50 transition-colors"
            >
              <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">
                {product.brand}
              </p>
              <p className="text-ink text-sm leading-snug">
                {product.product_name}
              </p>
              {product.price != null && (
                <p className="text-clay text-[11px] mt-0.5">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Category filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-ink text-cream"
                  : "border border-sand text-clay"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-3 py-1.5 font-sans text-[11px] whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key
                    ? "bg-ink text-cream"
                    : "border border-sand text-clay"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured products */}
          {featuredLoading ? (
            <LoadingSpinner className="py-8" />
          ) : featured && featured.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Products are being added. Check back soon!"
            />
          ) : (
            <div className="flex flex-col gap-1">
              {featured?.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => router.push(`/product/${product.product_id}`)}
                  className="w-full text-left px-3 py-3 border-b border-parchment hover:bg-cream/50 transition-colors"
                >
                  <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">
                    {product.brand}
                  </p>
                  <p className="text-ink text-sm leading-snug">
                    {product.product_name}
                  </p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="font-sans text-[10px] text-stone capitalize">
                      {product.subcategory}
                    </span>
                    {product.price != null && (
                      <span className="text-clay text-[10px]">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/api/products/featured/ src/lib/hooks/use-featured-products.ts src/app/\(app\)/explore/page.tsx
git commit -m "feat: replace hardcoded explore page with real product data"
```

---

### Task 3: Install Anthropic SDK & Add API Key

**Files:**
- Modify: `package.json`
- Modify: `.env.local`

**Step 1: Install Anthropic SDK**

Run: `npm install @anthropic-ai/sdk`

**Step 2: Add API key to .env.local**

Add to `.env.local`:
```
ANTHROPIC_API_KEY=your-api-key-here
```

User must provide their actual Anthropic API key. Also add to Vercel env vars.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Anthropic SDK for camera product recognition"
```

---

### Task 4: Create Product Requests Table

**Files:**
- Create: `src/lib/sql/product-requests.sql` (reference only, run manually)

**Step 1: Run SQL in Supabase SQL Editor**

```sql
CREATE TABLE public.product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_requests_status ON public.product_requests(status);

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create product requests" ON public.product_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.product_requests
  FOR SELECT USING (auth.uid() = user_id);
```

**Step 2: Verify table exists**

Run in SQL Editor: `SELECT count(*) FROM product_requests;`
Expected: 0 rows, no error.

---

### Task 5: Scan Page — Camera & Claude Vision API Route

**Files:**
- Create: `src/app/api/scan/recognize/route.ts`

**Step 1: Create the recognition API route**

Create `src/app/api/scan/recognize/route.ts`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { image } = await request.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Step 1: Send image to Claude Haiku for product name extraction
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: image,
            },
          },
          {
            type: "text",
            text: `Look at this image of beauty/skincare/makeup/hair products. List every product you can identify. For each product, extract the brand name and product name as accurately as possible.

Return ONLY valid JSON in this exact format, no other text:
[{"brand": "Brand Name", "product_name": "Product Name"}, ...]

If you cannot identify any products, return an empty array: []`,
          },
        ],
      },
    ],
  });

  // Parse Claude's response
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  let detectedProducts: { brand: string; product_name: string }[];
  try {
    detectedProducts = JSON.parse(responseText);
  } catch {
    detectedProducts = [];
  }

  if (detectedProducts.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Step 2: Match each detected product against the database
  const supabase = await createClient();
  const results = [];

  for (const detected of detectedProducts) {
    const searchTerm = `${detected.brand} ${detected.product_name}`;

    // Try exact-ish match first (brand + name)
    const { data: exactMatch } = await supabase
      .from("products")
      .select("product_id, brand, product_name, category, subcategory, price")
      .ilike("brand", `%${detected.brand}%`)
      .ilike("product_name", `%${detected.product_name}%`)
      .limit(1);

    if (exactMatch && exactMatch.length > 0) {
      results.push({
        detected_name: searchTerm,
        matched_product: exactMatch[0],
        confidence: "high",
      });
      continue;
    }

    // Try fuzzy match on product name only
    const { data: fuzzyMatch } = await supabase
      .from("products")
      .select("product_id, brand, product_name, category, subcategory, price")
      .or(
        `product_name.ilike.%${detected.product_name}%,brand.ilike.%${detected.brand}%`
      )
      .limit(3);

    if (fuzzyMatch && fuzzyMatch.length > 0) {
      results.push({
        detected_name: searchTerm,
        matched_product: fuzzyMatch[0],
        confidence: "low",
      });
    } else {
      results.push({
        detected_name: searchTerm,
        matched_product: null,
        confidence: "none",
      });
    }
  }

  return NextResponse.json({ results });
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/scan/recognize/
git commit -m "feat: add Claude vision API route for product recognition"
```

---

### Task 6: Scan Page — Camera UI & Results Flow

**Files:**
- Modify: `src/app/(app)/scan/page.tsx`

**Step 1: Rewrite the scan page**

Replace the entire `src/app/(app)/scan/page.tsx` with:
```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Search, Check, Loader2 } from "lucide-react";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { useProductSearch } from "@/lib/hooks/use-products";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

interface ScanResult {
  detected_name: string;
  matched_product: {
    product_id: string;
    brand: string;
    product_name: string;
    category: string;
    subcategory: string;
    price: number | null;
  } | null;
  confidence: "high" | "low" | "none";
  confirmed: boolean;
}

type Phase = "camera" | "processing" | "results" | "manual-search";

export default function ScanPage() {
  const router = useRouter();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("camera");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual search state
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { data: searchResults } = useProductSearch(searchQuery);

  const addToCabinet = useAddToCabinet();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Unable to access camera. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    stopCamera();
    setPhase("processing");
    setError(null);

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    try {
      const res = await fetch("/api/scan/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setPhase("camera");
        return;
      }

      const scanResults: ScanResult[] = (data.results || []).map(
        (r: Omit<ScanResult, "confirmed">) => ({
          ...r,
          confirmed: r.confidence === "high",
        })
      );

      setResults(scanResults);
      setPhase("results");
    } catch {
      setError("Failed to process image. Please try again.");
      setPhase("camera");
    }
  }, [stopCamera]);

  const toggleConfirm = (index: number) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, confirmed: !r.confirmed } : r
      )
    );
  };

  const replaceWithSearchResult = (
    index: number,
    product: ScanResult["matched_product"]
  ) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, matched_product: product, confidence: "high", confirmed: true }
          : r
      )
    );
    setEditingIndex(null);
    setSearchQuery("");
  };

  const requestProduct = async (detectedName: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("product_requests").insert({
      detected_name: detectedName,
      user_id: user.id,
    });
  };

  const handleAddAll = async () => {
    const confirmed = results.filter(
      (r) => r.confirmed && r.matched_product
    );
    if (confirmed.length === 0) return;

    setAdding(true);

    // Request unmatched products
    const unmatched = results.filter(
      (r) => !r.matched_product || (r.confidence === "none" && !r.confirmed)
    );
    for (const item of unmatched) {
      await requestProduct(item.detected_name);
    }

    // Add confirmed products to cabinet
    for (const item of confirmed) {
      try {
        await addToCabinet.mutateAsync({
          productId: item.matched_product!.product_id,
        });
      } catch {
        // Skip duplicates silently
      }
    }

    setAdding(false);
    setAdded(true);
    setTimeout(() => router.push("/cabinet"), 1500);
  };

  const confirmedCount = results.filter(
    (r) => r.confirmed && r.matched_product
  ).length;

  // ── Camera phase ──
  if (phase === "camera") {
    return (
      <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col relative">
        <button
          onClick={() => { stopCamera(); router.back(); }}
          className="absolute top-4 left-4 text-stone z-10"
        >
          <X size={22} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone mb-4">
            Take a photo of your products
          </p>

          <div className="relative w-64 h-64 mb-6 rounded-lg overflow-hidden bg-espresso">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => videoRef.current?.play()}
              className="w-full h-full object-cover"
            />
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cream/50 rounded-tl-sm" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cream/50 rounded-tr-sm" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cream/50 rounded-bl-sm" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cream/50 rounded-br-sm" />
          </div>

          {error && (
            <p className="text-risk text-xs text-center mb-4">{error}</p>
          )}

          <button
            onClick={() => { startCamera(); }}
            className="bg-walnut text-cream rounded-full px-6 py-3 font-sans text-sm mb-3"
          >
            Open Camera
          </button>

          <button
            onClick={captureAndRecognize}
            className="bg-cream text-ink rounded-full p-4"
          >
            <Camera size={24} />
          </button>

          <p className="text-clay text-[10px] text-center mt-4 max-w-xs">
            Point your camera at one or more products, then tap the capture button.
          </p>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ── Processing phase ──
  if (phase === "processing") {
    return (
      <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-6">
        <Loader2 size={32} className="text-cream animate-spin mb-4" />
        <p className="text-cream font-sans text-sm">Identifying products...</p>
        <p className="text-stone text-xs mt-2">This may take a few seconds</p>
      </div>
    );
  }

  // ── Results phase ──
  return (
    <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => { setPhase("camera"); setResults([]); }} className="text-stone">
          <X size={22} />
        </button>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
          {results.length} product{results.length !== 1 ? "s" : ""} detected
        </p>
        <div className="w-[22px]" />
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-5">
        {results.map((result, index) => (
          <div
            key={index}
            className="border-b border-espresso py-4"
          >
            {editingIndex === index ? (
              // Manual search mode for this item
              <div>
                <p className="text-stone text-[10px] mb-2">
                  Searching for: {result.detected_name}
                </p>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-clay" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type product name..."
                    autoFocus
                    className="w-full bg-espresso rounded-lg py-2 pl-8 pr-3 text-cream text-sm placeholder:text-clay focus:outline-none"
                  />
                </div>
                {searchResults?.map((p) => (
                  <button
                    key={p.product_id}
                    onClick={() => replaceWithSearchResult(index, p as ScanResult["matched_product"])}
                    className="w-full text-left px-2 py-2 hover:bg-espresso/50 rounded"
                  >
                    <p className="text-stone text-[9px] uppercase">{p.brand}</p>
                    <p className="text-cream text-sm">{p.product_name}</p>
                  </button>
                ))}
                <button
                  onClick={() => { setEditingIndex(null); setSearchQuery(""); }}
                  className="text-stone text-xs mt-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              // Normal result display
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => result.matched_product && toggleConfirm(index)}
                  className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                    result.confirmed
                      ? "bg-sage border-sage"
                      : "border-stone"
                  }`}
                >
                  {result.confirmed && <Check size={12} className="text-cream" />}
                </button>

                <div className="flex-1">
                  {result.matched_product ? (
                    <>
                      <p className="text-stone text-[9px] uppercase tracking-[0.15em]">
                        {result.matched_product.brand}
                      </p>
                      <p className="text-cream text-sm">
                        {result.matched_product.product_name}
                      </p>
                      {result.confidence === "low" && (
                        <p className="text-warm text-[10px] mt-0.5">
                          Partial match — is this right?
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-cream text-sm">{result.detected_name}</p>
                      <p className="text-stone text-[10px] mt-0.5">
                        Not found in database
                      </p>
                    </>
                  )}
                </div>

                {/* Edit / Request button */}
                <button
                  onClick={() => {
                    if (result.matched_product && result.confidence === "low") {
                      setEditingIndex(index);
                    } else if (!result.matched_product) {
                      requestProduct(result.detected_name);
                    } else {
                      setEditingIndex(index);
                    }
                  }}
                  className="text-vela-blue text-[11px] font-sans mt-1"
                >
                  {result.matched_product ? "Edit" : "Request"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom action */}
      <div className="px-5 pb-6 pt-3">
        {added ? (
          <div className="bg-sage rounded-lg py-3 text-center">
            <p className="text-cream font-sans text-sm">
              Added {confirmedCount} product{confirmedCount !== 1 ? "s" : ""}!
            </p>
          </div>
        ) : (
          <button
            onClick={handleAddAll}
            disabled={adding || confirmedCount === 0}
            className="w-full bg-cream rounded-lg py-3 font-sans text-sm text-ink disabled:opacity-40 transition-opacity"
          >
            {adding
              ? "Adding..."
              : `Add ${confirmedCount} Product${confirmedCount !== 1 ? "s" : ""} to Cabinet`}
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/\(app\)/scan/page.tsx
git commit -m "feat: camera-based product recognition with Claude vision"
```

---

### Task 7: Final Build Verification & Push

**Step 1: Full build check**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Commit any remaining changes and push**

```bash
git push
```

---

## Environment Variables Checklist

Add these to both `.env.local` and Vercel dashboard:
- `ANTHROPIC_API_KEY` — required for camera scan feature

## SQL to Run in Supabase

Run the `product_requests` table creation SQL from Task 4 in the Supabase SQL Editor.
