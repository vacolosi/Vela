# Victor Update — March 23, 2026

Major wireframe redesign session. All core and social screens updated. Wireframes file is current — pull the latest from the shared drive.

---

## Navigation — Locked

**4 tabs: Home | Explore | + (scan) | Cabinet.**

Remove the Profile tab. Settings lives inside Cabinet via a gear icon in the top-right corner. Settings page shows breadcrumb: Cabinet › Settings.

---

## Screen-by-Screen Changes

### Home

- Header: "Hi Nicole" (personalized greeting, not "Home")
- Alignment score: `ALIGNMENT · HIGH` label above, `78/100` large number, tappable `+3` that expands to show change log (e.g., "Added SPF to morning routine (+5), Marked moisturizer as finished (-2)")
- Between score and Products For You: scan prompt card for new users (< 3 products in routine + no scan history), switches to recent scans row for returning users
- Products For You: tier dot on each product card (sage for High, warm for Moderate). Logic: gap-filling first, pairing second, curated fallback. Show High + Moderate products only.
- Category cards: only show categories the user enabled. No Body "Coming soon." Use "Haircare" not "Hair." "2 looks" not "2 edits."

### Product Page

- Alignment bar: animated on page load. Bar fills from left (CSS transition, ~0.7s ease-out), dot lands at actual score position (engine 0-1 maps to bar width), tier word fades in after bar lands. Color: sage for High, warm for Moderate, risk for Low.
- Badges (Vegan, Clean, Cruelty Free): small pills below the price line
- Risk block: collapsed inside the alignment card (was separate). One-line preview with "Details" tap to expand.
- Reasoning (Overlap / Coverage / Compatibility): collapsed inside alignment card via "See full analysis ›" link. Not a separate section below buttons.
- Action buttons: **sticky bottom bar, always visible.** Never scroll off screen.
- "Buy" → "Shop": opens a retailer selector bottom sheet. Show available retailers with prices. For MVP, just Ulta. No placeholders.

### Cabinet (major redesign)

- **Centered profile** (Cormorant Garamond, same as original wireframes)
- Avatar, name, @username, bio (150 char free text), stats (Products + In Routine)
- Alignment NOT in stats row — gets its own tappable card below. Shows 78/100 + High. Tapping goes to My Routine.
- **Gear icon** top-right corner for Settings
- **No Routine/Collection sub-tabs.** Both sections on one scrollable page:
  - "My routine · 12 products" with horizontal swipe cards + AM/PM badges + "Full view ›" link
  - "Collection" with vertical list preview + "See all 35 ›" link
- AM/PM badges on routine cards: warm color for AM, blue for PM, joined split badge (warm|blue) for "Both" products
- Category tabs: show all three always. Disabled categories dimmed.
- "Add prescription" link somewhere on Cabinet page
- **Public vs private:** Bio, products, stats = public. Identity tier, skin type, concerns, shade profile = private (in Settings only).

### New profile fields needed:
- `bio` TEXT (150 char limit) on profiles table
- `username` TEXT UNIQUE on profiles table (already in previous update)

### Scan (simplified)

- **Single scan mode.** Remove the Check/Add toggle entirely.
- Instruction: "Show the front label" (not "Point at product")
- **Text + visual recognition:** Update Claude Haiku prompt to identify products by text, brand logo, package shape, and color — not just text. Same API call, just a richer prompt.
- "Bulk add ›" link below search bar — always available, not first-time-only. Opens a separate bulk add flow: scan → confirmation toast → camera stays hot → running list → "Done" adds all.
- **Recent scans** row below search bar on the scan screen. Dark-themed cards (espresso background). Only place scan history lives — not on Home or Cabinet.

### Explore

- Products For You: tier dots on product cards (matching Home)
- "Trending Edits" → **"Trending Looks"** — founder-curated for MVP. Same UI, just renamed.
- Aligned Cabinets: card shows creator bio (pulled from their profile) + product count + "X in common." **No tier labels** (Highly aligned / Aligned / etc.) on individual cards — ranking handles prioritization silently.
- **Cold start (0 products):** Section header says "Cabinets you might like" instead of "Aligned Cabinets." Profile-based matching (concerns, skin type, identity) from day one. Switches to "Aligned Cabinets" at 3+ products.
- **Alignment ranking logic** (can build later): uses product overlap + concern overlap + skin type match + identity match. Private data powers the ranking, but display only shows public signals.

### Creator Cabinet

- **"Save" button only.** Remove "Compare" button entirely (deferred post-MVP).
- Save = bookmark. After saving, show toast: "Cabinet saved. Get notified when they add products?" [Yes] / [No thanks]. Saved cabinets accessible from Explore.
- Stats row: "Looks" not "Edits"
- Tab labels: "Haircare" not "Hair"
- "You share X products" card stays

### Settings (via gear icon from Cabinet)

- Breadcrumb: Cabinet › Settings
- Structure:

```
PROFILE
  Shade Profile        Medium, Warm
  Skin Type            Combo
  Skincare Concerns    Fine lines, Dark spots, Dullness
  Haircare Concerns    Dryness, Frizz, Thinning
  Bio                  Edit

MAKEUP
  Identity             Curator

CATEGORIES
  Skincare             [toggle on]
  Makeup               [toggle on]
  Haircare             [toggle off]

PREFERENCES
  Clean beauty         [toggle]
  Fragrance-free       [toggle]
  Vegan                [toggle]
  Cruelty-free         [toggle]

ACCOUNT
  Subscription
  Reset Profile
  Clear Cabinet
  Sign Out
```

---

## New Features

### Shade Profile Prompt

Triggered: first time user adds a face product (foundation, concealer, bronzer, contour) and has no shade profile set.

- Bottom sheet after "Add to Cabinet" tap
- Two input paths: (1) shade search — "Enter a foundation shade you wear," supports multiple entries, cross-references our shade database to triangulate depth + undertone; (2) manual fallback — depth selector + undertone selector
- If foundation already in cabinet: auto-detect and show "Based on [Product], you're approximately Medium, Warm. Does this look right?"
- "Skip for now" always available
- Only appears once

### Prescription Entry

- **Entry points:** (1) Scan screen — when product not found in database, prompt "Is this a prescription product?" → pre-fill form from scan; (2) Cabinet — "Add prescription" link
- **Form:** Active ingredient (dropdown: Tretinoin, Adapalene, Hydroquinone, Azelaic Acid, Clindamycin, BP Rx, Dapsone, Spironolactone, Other) + Concentration (optional text) + Brand/provider (optional text)
- Engine auto-sets concentration_tier = High. No new engine logic.

### Gift Sets

- When user adds a product flagged as `needs_split`: auto-add all child products to cabinet as inactive
- Confirmation: "This set contains 3 products. Adding all to your cabinet."
- User promotes individual products to routine as they choose
- **Requires:** parent/child data model (parent_product_id field, which was already spec'd)

### Bulk Add Flow

- Separate from main scan. Accessed via "Bulk add ›" link on scan screen.
- Camera stays hot between scans. Confirmation toast per product. Running list at bottom.
- "Done — add X products to cabinet" button adds all as inactive.
- Persistent feature — not first-time-only.

---

## Data Model Additions

```sql
ALTER TABLE profiles ADD COLUMN bio TEXT;
-- username already added in previous update
-- bio has 150 character limit enforced at app level
```

---

## Priority Order

1. Run the tagging batch (if not already running)
2. Build onboarding flow (spec from previous update)
3. Update Home screen with new layout
4. Update Product Page (animated bar, sticky buttons, collapsed risk, badges, Shop → retailer sheet)
5. Rebuild Cabinet with centered profile + Concept D layout
6. Simplify Scan (remove toggle, add bulk add link, add recent scans)
7. Update Explore (tier dots, Trending Looks rename, Aligned Cabinets with bio)
8. Update Creator Cabinet (Save only, no Compare, Looks stat)
9. Update Settings (new structure, gear icon from Cabinet)
10. Build shade profile prompt (bottom sheet on first face product)
11. Build prescription entry (form + scan pre-fill)
12. Add bio field to profiles table
