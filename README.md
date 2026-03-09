# Beauty Intelligence Platform — Deliverables Package

## What This Is

Complete handoff package for building an inventory-aware beauty intelligence app. Contains product requirements, database schema, engine logic, UI wireframes, brand direction, seed data, and working scripts. A developer can go from these files to a running prototype.

## Core Concept

An alignment engine that evaluates any beauty product relative to what you already own — surfacing conflicts, overlap, gaps, and compatibility before you buy. "Does this make sense with what I already have?"

---

## File Index

### Start Here
| # | File | What It Is |
|---|---|---|
| 1 | `README.md` | This file. Start here. |
| 2 | `prd.docx` | Product requirements. Vision, success metrics, feature prioritization, scope boundaries, technical architecture, risks. Read this first to understand the product. |
| 3 | `.env.example` | Environment variables needed for scripts. |

### Design & UI
| # | File | What It Is |
|---|---|---|
| 4 | `wireframes-complete.jsx` | 10 screen wireframes: Onboarding (3), Core app (4), Social (3). React component — render in any React environment or Claude.ai. |
| 5 | `design-system-spec.docx` | Colors, typography, components, spacing, states, visual principles. Everything needed to implement the UI consistently. |
| 6 | `vela-mood-board.jsx` | Brand visual direction. Palette, type pairings, voice samples, texture references. Working name TBD. |
| 7 | `content-copy-doc.docx` | Every string in the app. Onboarding copy, engine language templates, shade advice format, empty states, error messages, voice guide. |
| 8 | `user-flow-diagrams.mermaid` | Every user path: onboarding → home → scan → product page → cabinet → explore → settings. Mermaid format — renders in GitHub, VS Code, or any Mermaid viewer. |

### Engine & Logic
| # | File | What It Is |
|---|---|---|
| 9 | `alignment-engine-logic-spec.docx` | The engineering spec. Scoring weights, score caps, all 10 conflict rules with resolution paths, overlap logic per identity tier, coverage gap detection, shade matching, and 10 acceptance test cases. |
| 10 | `engine-blueprint.jsx` | Interactive pseudocode. 9 expandable modules covering the full engine implementation. Closer to real code than the spec doc — good for pair-programming with Cursor. |

### Database & Data
| # | File | What It Is |
|---|---|---|
| 11 | `data-model-spec.docx` | 8 Supabase tables documented with every column, type, constraint, and relationship. Plus indexes and RLS policies. |
| 12 | `supabase-migration.sql` | Run this in Supabase SQL Editor. Creates all tables, triggers, indexes, and RLS policies. |
| 13 | `beauty_intelligence_seed_catalog.xlsx` | Product seed data. 10 sheets: Skincare (128 products), Makeup (30 products), Makeup Shades (162 variants), Body & Hair (26 products), Skincare Ontology, Conflict Rules, Schema Reference, Shade Coverage, ID System Reference, Progress Tracker. |
| 14 | `column-mapping.docx` | Maps every spreadsheet column to its database column. Covers all 5 data sheets. Includes 7 key import rules for edge cases. |
| 15 | `seed-data-import.py` | Python script that reads the Excel catalog and inserts into Supabase. Handles column mapping, zone inference, and formula notes merging. Has --dry-run mode. |

### API & Integration
| # | File | What It Is |
|---|---|---|
| 16 | `api-spec.docx` | Every API endpoint: alignment engine (single + batch), product lookup (barcode + search), cabinet CRUD, profile management, overrides, social/explore, error codes. |
| 17 | `tagging-agent.py` | AI product tagging system. Complete system prompt + Python script for calling Claude API to tag new products using the locked schema. Includes usage examples and review workflow. |

### Tracking
| # | File | What It Is |
|---|---|---|
| 18 | `beauty-intelligence-tracker.jsx` | Development milestone tracker. Phase 0-8. Needs updating with latest session work. |

---

## Setup Sequence

When you're ready to build, follow this order:

### 1. Read the product (30 min)
- Read `prd.docx` end to end
- Scan `alignment-engine-logic-spec.docx` for the scoring system
- Review `wireframes-complete.jsx` to see what you're building

### 2. Set up Supabase (15 min)
- Create a Supabase project
- Copy contents of `supabase-migration.sql` into the SQL Editor
- Run it — all 8 tables, triggers, indexes, and RLS policies created

### 3. Import seed data (15 min)
- Copy `.env.example` to `.env` and fill in your Supabase credentials
- Run: `pip install openpyxl supabase`
- Run: `python seed-data-import.py --file beauty_intelligence_seed_catalog.xlsx --dry-run`
- If dry run looks good: `python seed-data-import.py --file beauty_intelligence_seed_catalog.xlsx`

### 4. Build the engine (the real work)
- Use `engine-blueprint.jsx` as your implementation guide
- Start with data types and scoring functions
- Implement skincare conflict detection using the 10 rules
- Implement makeup overlap logic using the identity tier system
- Validate against the 10 test cases in the engine logic spec

### 5. Build the UI
- Follow `design-system-spec.docx` for visual consistency
- Use `content-copy-doc.docx` for all user-facing text
- Reference `wireframes-complete.jsx` for layout and component structure

### 6. Expand the database
- Use `tagging-agent.py` to tag new products via Claude API
- Founder reviews agent output before inserting
- Refer to `column-mapping.docx` for any data format questions

---

## Locked Decisions

These decisions are final and documented across the deliverables:

- **Scoring weights:** Risk 45% / Goal 35% / Balance 20%
- **Output tiers:** Low / Moderate / High only — no numeric scores shown
- **Four makeup categories:** Face / Cheek / Lip / Eye
- **Five color purposes:** Staple / Warm / Cool / Deep / Statement
- **Four identity tiers:** Essentialist / Curator / Enthusiast / Creative
- **Shade philosophy:** Always encouraging, never gatekeeping
- **Action hierarchy:** Add to Cabinet (primary) / Buy (secondary)
- **Advisory phrasing:** "May increase" not "will cause" — we are not dermatologists
- **Platform:** React + Supabase + Vercel (Stage 1 web), then native iOS (Stage 2)

---

## Questions?

If anything in these files conflicts with something in another file, the order of authority is:
1. `alignment-engine-logic-spec.docx` (engine rules)
2. `prd.docx` (product decisions)
3. `data-model-spec.docx` (database schema)
4. Everything else follows from the above
