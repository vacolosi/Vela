-- ═══════════════════════════════════════════════════════════
-- BEAUTY INTELLIGENCE PLATFORM — Supabase Migration
-- Run this in the Supabase SQL Editor to create all tables.
-- Version 1.0
-- ═══════════════════════════════════════════════════════════

-- ─── 1. PROFILES ─────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically on signup.

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  
  -- Skincare
  skincare_goals TEXT[] DEFAULT '{}',          -- max 2: anti-aging, hydration, acne, etc.
  skincare_concerns TEXT[] DEFAULT '{}',       -- max 3
  
  -- Makeup
  makeup_identity TEXT CHECK (makeup_identity IN ('essentialist','curator','enthusiast','creative')),
  makeup_frequency TEXT CHECK (makeup_frequency IN ('active','occasional')),
  
  -- Shade Profile
  shade_depth TEXT CHECK (shade_depth IN ('Fair','Light','Light-Medium','Medium','Medium-Deep','Deep','Deep-Dark')),
  shade_undertone TEXT CHECK (shade_undertone IN ('Warm','Cool','Neutral','Olive')),
  
  -- Category Participation
  category_skincare TEXT DEFAULT 'inactive' CHECK (category_skincare IN ('active','occasional','inactive')),
  category_makeup TEXT DEFAULT 'inactive' CHECK (category_makeup IN ('active','occasional','inactive')),
  category_hair TEXT DEFAULT 'inactive' CHECK (category_hair IN ('active','occasional','inactive')),
  category_body TEXT DEFAULT 'inactive' CHECK (category_body IN ('active','occasional','inactive')),
  category_fragrance TEXT DEFAULT 'inactive' CHECK (category_fragrance IN ('active','occasional','inactive')),
  category_nails TEXT DEFAULT 'inactive' CHECK (category_nails IN ('active','occasional','inactive')),
  category_tools TEXT DEFAULT 'inactive' CHECK (category_tools IN ('active','occasional','inactive')),
  category_accessories TEXT DEFAULT 'inactive' CHECK (category_accessories IN ('active','occasional','inactive')),
  
  -- Preferences
  preferences JSONB DEFAULT '{"clean":false,"fragrance_free":false,"vegan":false,"cruelty_free":false}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─── 2. PRODUCTS ─────────────────────────────────────────
-- One row per product (parent level). Read-only for users.

CREATE TABLE public.products (
  product_id TEXT PRIMARY KEY,                -- e.g. RB-M-SPLB
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skincare','makeup','body','hair','fragrance','nails','tools','accessories')),
  subcategory TEXT NOT NULL,                  -- e.g. Blush, Foundation, AHA, Retinoid
  zone TEXT CHECK (zone IN ('Face','Cheek','Lip','Eye')),  -- makeup only, null for skincare
  
  -- Product details
  finish TEXT,                                -- available finishes (summary)
  coverage TEXT,                              -- Sheer, Medium, Full (makeup) or null
  size TEXT,                                  -- Full, Mini, Travel
  shade_count INTEGER DEFAULT 0,
  
  -- Skincare intelligence
  primary_functions TEXT[] DEFAULT '{}',       -- functional categories: Hydration, Retinoids, etc.
  secondary_functions TEXT[] DEFAULT '{}',
  concentration_tier TEXT CHECK (concentration_tier IN ('Low','Moderate','High')),
  treatment_or_support TEXT CHECK (treatment_or_support IN ('Treatment','Support')),
  
  -- Makeup intelligence
  core_from TEXT CHECK (core_from IN ('Essentialist','Curator','Enthusiast','Creative')),
  overlap_rule TEXT,                          -- tier-specific overlap behavior description
  shade_relevance TEXT CHECK (shade_relevance IN ('High','Moderate','Low')),
  pairs_with TEXT[] DEFAULT '{}',             -- array of product_ids this pairs with
  
  -- Meta
  formula_notes TEXT,
  price NUMERIC(8,2),
  upc TEXT,                                   -- barcode
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('Complete','In Progress','Needs Review','Not Started')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_upc ON public.products(upc) WHERE upc IS NOT NULL;
CREATE INDEX idx_products_category ON public.products(category, subcategory);
CREATE INDEX idx_products_brand ON public.products(brand);


-- ─── 3. SHADES ───────────────────────────────────────────
-- One row per shade variant. Links to parent product.

CREATE TABLE public.shades (
  shade_id TEXT PRIMARY KEY,                  -- e.g. RB-M-SPLB-JOY
  product_id TEXT NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  shade_name TEXT NOT NULL,                   -- display name: Joy, 250W, Pillow Talk
  
  -- Matching fields
  undertone TEXT CHECK (undertone IN ('Warm','Cool','Neutral','Olive')),
  color_family TEXT,                          -- descriptive: Muted Peach, Fair Warm
  skin_depth_match TEXT CHECK (skin_depth_match IN ('Fair','Light','Light-Medium','Medium','Medium-Deep','Deep','Deep-Dark')),  -- Face only
  flattering_range TEXT,                      -- Color only: Universal, Light to Medium, etc.
  purpose TEXT CHECK (purpose IN ('Staple','Warm','Cool','Deep','Statement')),  -- Color only
  finish TEXT CHECK (finish IN ('Matte','Satin','Dewy','Natural','Shimmer','Metallic','Sheer','Cream','Velvet','Luminous')),
  availability TEXT DEFAULT 'Permanent' CHECK (availability IN ('Permanent','Limited Edition','Discontinued')),
  
  -- Shade notes (always encouraging, never gatekeeping)
  shade_description TEXT,                     -- 2-4 words: Soft muted peach
  primary_match TEXT,                         -- Best suited for [depth], [undertone]
  extended_match TEXT,                        -- Also flattering on [broader] for [effect]
  
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('Complete','In Progress','Needs Review'))
);

CREATE INDEX idx_shades_product ON public.shades(product_id);


-- ─── 4. CONFLICT RULES ──────────────────────────────────
-- Engine conflict rules. Read-only for users.

CREATE TABLE public.conflict_rules (
  rule_id TEXT PRIMARY KEY,                   -- e.g. CR-001
  category_a TEXT NOT NULL,                   -- functional category A: Retinoids
  category_b TEXT NOT NULL,                   -- functional category B: Exfoliation (AHA)
  severity TEXT NOT NULL CHECK (severity IN ('soft','moderate','severe','critical')),
  condition TEXT,                             -- when it triggers: Moderate+ concentration
  max_alignment TEXT,                         -- score cap: Moderate, Low
  explanation TEXT NOT NULL,                  -- user-facing advisory text
  resolutions JSONB DEFAULT '[]'             -- [{type, message}] — alternate, am_pm, swap, reduce, add
);


-- ─── 5. CABINET ITEMS ────────────────────────────────────
-- Every product a user owns.

CREATE TABLE public.cabinet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(product_id),
  shade_id TEXT REFERENCES public.shades(shade_id),  -- nullable: skincare has no shades
  is_active BOOLEAN DEFAULT FALSE,            -- true = in active lineup
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,                                 -- user notes: 'use at night', 'almost empty'
  
  UNIQUE(user_id, product_id, shade_id)       -- prevent exact duplicates
);

CREATE INDEX idx_cabinet_user ON public.cabinet_items(user_id, is_active);
CREATE INDEX idx_cabinet_product ON public.cabinet_items(product_id);


-- ─── 6. LINEUP EDITS ────────────────────────────────────
-- Saved makeup looks.

CREATE TABLE public.lineup_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                         -- Everyday Glam, Date Night
  shade_ids TEXT[] DEFAULT '{}',              -- array of shade_id values
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edits_user ON public.lineup_edits(user_id);
CREATE INDEX idx_edits_public ON public.lineup_edits(is_public) WHERE is_public = TRUE;


-- ─── 7. ALIGNMENT HISTORY ───────────────────────────────
-- Log of every alignment check.

CREATE TABLE public.alignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(product_id),
  shade_id TEXT REFERENCES public.shades(shade_id),
  tier TEXT NOT NULL CHECK (tier IN ('Low','Moderate','High')),
  score NUMERIC(4,3),                         -- internal score, never shown to user
  reasoning JSONB,                            -- {overlap, coverage, compatibility, risk}
  action_taken TEXT CHECK (action_taken IN ('added','dismissed','bought')),
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_user ON public.alignment_history(user_id, checked_at DESC);


-- ─── 8. USER OVERRIDES ──────────────────────────────────
-- "Works for Me" overrides.

CREATE TABLE public.user_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(product_id),
  override_type TEXT NOT NULL CHECK (override_type IN ('conflict','overlap','shade')),
  related_product_id TEXT REFERENCES public.products(product_id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overrides_user ON public.user_overrides(user_id);


-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conflict_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabinet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineup_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_overrides ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: read-only for all authenticated users
CREATE POLICY "Products are readable by all" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Shades: read-only for all authenticated users
CREATE POLICY "Shades are readable by all" ON public.shades
  FOR SELECT USING (auth.role() = 'authenticated');

-- Conflict rules: read-only for all authenticated users
CREATE POLICY "Conflict rules are readable by all" ON public.conflict_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cabinet: users can CRUD their own items
CREATE POLICY "Users can view own cabinet" ON public.cabinet_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own cabinet" ON public.cabinet_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cabinet" ON public.cabinet_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from own cabinet" ON public.cabinet_items
  FOR DELETE USING (auth.uid() = user_id);

-- Lineup edits: users can CRUD their own + read public
CREATE POLICY "Users can view own edits" ON public.lineup_edits
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Users can create own edits" ON public.lineup_edits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own edits" ON public.lineup_edits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own edits" ON public.lineup_edits
  FOR DELETE USING (auth.uid() = user_id);

-- Alignment history: users can CRUD their own
CREATE POLICY "Users can view own history" ON public.alignment_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON public.alignment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User overrides: users can CRUD their own
CREATE POLICY "Users can view own overrides" ON public.user_overrides
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own overrides" ON public.user_overrides
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own overrides" ON public.user_overrides
  FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- DONE. Run this entire file in Supabase SQL Editor.
-- Then import seed data using the import script.
-- ═══════════════════════════════════════════════════════════
