// ─── Alignment Engine Types ───────────────────────────────────────────
// Core interfaces for Vela's beauty-intelligence alignment engine.
// These types flow through conflicts, overlap, coverage, and the
// final alignment calculation.

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
  price: number | null;
  source_url: string | null;
  image_url: string | null;
  description: string | null;
  ingredients: string[] | null;
  badges: string[] | null;
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
  id: string;
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

// ─── Sub-results ──────────────────────────────────────────────────────

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
  score: number;
}

// ─── Final alignment output ──────────────────────────────────────────

export interface AlignmentResult {
  tier: "Low" | "Moderate" | "High";
  score: number;
  reasoning: {
    risk: RiskResult;
    overlap: OverlapResult;
    coverage: CoverageResult;
    compatibility: CompatibilityResult;
  };
}
