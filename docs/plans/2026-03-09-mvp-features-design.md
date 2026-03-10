# MVP Features Design — 2026-03-09

## Features

### 1. Product Search (Explore Page)
- Replace hardcoded "Selected" section with real products from DB (random/popular)
- Keep existing search — already queries Supabase via `/api/products/search`
- Remove placeholder "Trending Edits" and "Cabinets to Explore" sections
- Replace with category browse buttons (Skincare, Makeup, Hair, Body) that filter products

### 2. Add to Cabinet
- Already works end-to-end via product detail page
- No changes needed — flows once DB has products from scraper

### 3. Scan Page → Camera Product Recognition

**User flow:**
1. User taps "+" in nav → camera view opens
2. User takes photo of one or multiple products
3. Photo sent to Claude Haiku 4.5 vision API → returns detected brand + product names
4. App fuzzy-matches each detected name against products table in Supabase
5. Shows results list with confidence levels:
   - **High confidence** (strong match) → auto-checked, shows matched product
   - **Low confidence** (partial match) → unchecked, shows "Did you mean…?" with closest match
   - **No match** → shows "Not found", logs to product_requests table for scraper backfill
6. User reviews list, unchecks any incorrect matches
7. User taps "Add to Cabinet" → batch inserts all confirmed products into cabinet_items
8. Unmatched product names saved to product_requests table

**New table:**
```sql
CREATE TABLE public.product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create product requests" ON public.product_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.product_requests
  FOR SELECT USING (auth.uid() = user_id);
```

**Tech stack:**
- Claude Haiku 4.5 vision via Anthropic SDK (`@anthropic-ai/sdk`)
- Called from Next.js API route `/api/scan/recognize` (keeps API key server-side)
- Fuzzy matching via Postgres `ilike` and `similarity()` (pg_trgm extension)
- Camera access via browser `getUserMedia` API

**API route flow (`/api/scan/recognize`):**
1. Receive base64 image from client
2. Send to Claude Haiku 4.5 with prompt: "List every beauty product visible in this image. Return JSON array of {brand, product_name}."
3. For each detected product, query Supabase products table with fuzzy match
4. Return array of {detected_name, matched_product, confidence} to client

### 4. Onboarding Polish
- Add user-facing error messages on all 4 onboarding pages (replace console.log)
- Fix `makupActive` typo in skincare/page.tsx
- Fix saving state: ensure `setSaving(false)` runs on both success and error paths
- Add brief success indicator before redirect

## Dependencies
- Scraper must populate products table before search/scan features are useful
- Claude API key (ANTHROPIC_API_KEY) must be added to .env.local and Vercel env vars
- pg_trgm extension may need to be enabled in Supabase for fuzzy matching
