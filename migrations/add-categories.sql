-- ═══════════════════════════════════════════════════════════
-- ADD NEW CATEGORIES: Fragrance, Nails, Tools, Accessories
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── 1. UPDATE PRODUCTS TABLE CONSTRAINT ────────────────────
-- Drop old 4-category constraint, add 8-category constraint

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check
  CHECK (category IN ('skincare','makeup','body','hair','fragrance','nails','tools','accessories'));

-- ─── 2. ADD NEW PROFILE COLUMNS ─────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS category_fragrance TEXT DEFAULT 'inactive'
    CHECK (category_fragrance IN ('active','occasional','inactive')),
  ADD COLUMN IF NOT EXISTS category_nails TEXT DEFAULT 'inactive'
    CHECK (category_nails IN ('active','occasional','inactive')),
  ADD COLUMN IF NOT EXISTS category_tools TEXT DEFAULT 'inactive'
    CHECK (category_tools IN ('active','occasional','inactive')),
  ADD COLUMN IF NOT EXISTS category_accessories TEXT DEFAULT 'inactive'
    CHECK (category_accessories IN ('active','occasional','inactive'));

-- ─── 3. RE-CATEGORIZE BY SUBCATEGORY (reliable) ─────────────

-- Fragrance (from body subcategories)
UPDATE public.products SET category = 'fragrance'
WHERE category = 'body' AND subcategory IN (
  'eau de parfum', 'eau de toilette', 'perfume',
  'fragrance mist', 'perfume mist'
);

-- Fragrance (from hair — 2 perfume products)
UPDATE public.products SET category = 'fragrance'
WHERE category = 'hair' AND subcategory = 'perfume';

-- Move lip products from body → makeup
UPDATE public.products SET category = 'makeup'
WHERE category = 'body' AND subcategory IN ('lip balm', 'lip butter', 'lip oil');

-- Move skincare-categorized body products back to body (leave as-is, they're fine)
-- Move body-wash adjacent from skincare back (leave as-is)

-- ─── 4. RE-CATEGORIZE BODY/GENERAL BY KEYWORDS ──────────────
-- These 7,374 "general" items are a mix of everything

-- NAILS: nail care, polish, manicure tools
UPDATE public.products SET category = 'nails', subcategory = 'nail care'
WHERE category = 'body' AND subcategory = 'general'
AND (
  product_name ~* '\mnail\M'
  OR product_name ~* 'manicure|pedicure|cuticle|polish|lacquer'
);

-- TOOLS: brushes, applicators, hair tools, devices
UPDATE public.products SET category = 'tools', subcategory = 'tool'
WHERE category = 'body' AND subcategory = 'general'
AND (
  product_name ~* '\mbrush\M|\mbrushes\M'
  OR product_name ~* 'sponge|blender|curler|curling|tweezer|scissor|clipper|sharpener|applicator'
  OR product_name ~* 'dryer|flat iron|straightener|diffuser|trimmer|razor|waver'
  OR product_name ~* 'mirror|magnif|lash curler|dermaplaner|spatula|comb'
  OR product_name ~* 'eyelash curler|beauty tool|makeup tool'
);

-- ACCESSORIES: bags, cotton, candles, misc
UPDATE public.products SET category = 'accessories', subcategory = 'accessory'
WHERE category = 'body' AND subcategory = 'general'
AND (
  product_name ~* '\mbag\M|\mbags\M|pouch|organizer|holder|tote'
  OR product_name ~* 'headband|hair tie|scrunchie|hair clip'
  OR product_name ~* '\mcotton\M|cotton pad|cotton ball|cotton round'
  OR product_name ~* '\mwipe\M|\mwipes\M|towel|cloth|washcloth'
  OR product_name ~* 'candle|gift set|gift card|robe|slipper|sock'
);

-- FRAGRANCE: any remaining fragrance-related in general
UPDATE public.products SET category = 'fragrance', subcategory = 'fragrance'
WHERE category = 'body' AND subcategory = 'general'
AND product_name ~* 'perfume|cologne|fragrance|eau de|parfum|toilette';

-- ─── 5. VERIFY RESULTS ──────────────────────────────────────

SELECT category, COUNT(*) as count
FROM public.products
GROUP BY category
ORDER BY count DESC;
