// ─── Coverage Gap Analysis ────────────────────────────────────────────
// Maps the user's stated skincare goals to functional categories, then
// checks whether the candidate product fills a gap in their lineup.

import type { Product, UserProfile, CabinetItem, CoverageResult } from "./types";

// ─── Goal → function mapping ─────────────────────────────────────────

const GOAL_FUNCTION_MAP: Record<string, string[]> = {
  "Anti-aging": ["Retinoids", "Antioxidants"],
  Hydration: ["Hydration", "Barrier Support"],
  "Acne / Breakouts": ["Acne Treatment", "Exfoliation (BHA)"],
  Brightening: ["Pigment Correction", "Antioxidants"],
  Texture: ["Exfoliation (AHA)", "Exfoliation (BHA)"],
  Sensitivity: ["Soothing", "Barrier Support"],
};

// ─── helpers ──────────────────────────────────────────────────────────

/** Get all functional categories the user's goals require. */
function getRequiredFunctions(goals: string[]): Set<string> {
  const required = new Set<string>();
  for (const goal of goals) {
    const functions = GOAL_FUNCTION_MAP[goal];
    if (functions) {
      for (const fn of functions) {
        required.add(fn);
      }
    }
  }
  return required;
}

/** Get all functional categories currently covered by active lineup. */
function getCoveredFunctions(lineup: CabinetItem[]): Set<string> {
  const covered = new Set<string>();
  for (const item of lineup) {
    for (const fn of item.product.primary_functions) {
      covered.add(fn);
    }
    for (const fn of item.product.secondary_functions) {
      covered.add(fn);
    }
  }
  return covered;
}

/** Check structural weaknesses in the lineup. */
function detectStructuralWeaknesses(
  lineup: CabinetItem[]
): string[] {
  const warnings: string[] = [];

  const skincareItems = lineup.filter((i) => i.product.category === "skincare");
  if (skincareItems.length === 0) return warnings;

  // All treatment, no support
  const hasSupport = skincareItems.some(
    (i) => i.product.treatment_or_support === "Support"
  );
  const hasTreatment = skincareItems.some(
    (i) => i.product.treatment_or_support === "Treatment"
  );

  if (hasTreatment && !hasSupport) {
    warnings.push(
      "Your lineup is all treatment products with no support \u2014 a hydrator or barrier product may help."
    );
  }

  // Using actives but no SPF
  const hasActives = skincareItems.some((i) =>
    i.product.primary_functions.some((fn) =>
      ["Retinoids", "Exfoliation (AHA)", "Exfoliation (BHA)", "Pigment Correction"].includes(fn)
    )
  );
  const hasSPF = skincareItems.some((i) =>
    i.product.primary_functions.includes("SPF")
  );

  if (hasActives && !hasSPF) {
    warnings.push(
      "You\u2019re using actives but have no SPF in your lineup \u2014 sun protection may help protect results."
    );
  }

  return warnings;
}

// ─── public API ───────────────────────────────────────────────────────

export function analyzeCoverage(
  candidate: Product,
  profile: UserProfile,
  lineup: CabinetItem[]
): CoverageResult {
  const required = getRequiredFunctions(profile.skincare_goals);
  const covered = getCoveredFunctions(lineup);

  // Which required functions does the candidate provide?
  const candidateFunctions = new Set([
    ...candidate.primary_functions,
    ...candidate.secondary_functions,
  ]);

  const gapsFilled: string[] = [];
  for (const fn of candidateFunctions) {
    if (required.has(fn) && !covered.has(fn)) {
      gapsFilled.push(fn);
    }
  }

  // Check structural weaknesses
  const structuralWarnings = detectStructuralWeaknesses(lineup);

  // Does the candidate address a structural weakness?
  let addressesStructural = false;

  // If lineup lacks support and candidate is support
  if (
    structuralWarnings.some((w) => w.includes("no support")) &&
    candidate.treatment_or_support === "Support"
  ) {
    addressesStructural = true;
  }

  // If lineup lacks SPF and candidate provides SPF
  if (
    structuralWarnings.some((w) => w.includes("no SPF")) &&
    candidate.primary_functions.includes("SPF")
  ) {
    addressesStructural = true;
  }

  // Score
  let score: number;
  let explanation: string;

  if (gapsFilled.length > 0) {
    score = 0.8;
    explanation = `Fills a coverage gap: ${gapsFilled.join(", ")}. ${structuralWarnings.join(" ")}`.trim();
  } else if (addressesStructural) {
    score = 0.8;
    explanation = `Addresses a structural weakness in your lineup. ${structuralWarnings.join(" ")}`.trim();
  } else if (candidateFunctions.size > 0 && required.size > 0) {
    // Candidate has relevant functions but they're already covered
    const partiallyUseful = [...candidateFunctions].some((fn) => required.has(fn));
    if (partiallyUseful) {
      score = 0.5;
      explanation = `Supports goals you already have coverage for \u2014 may strengthen your routine. ${structuralWarnings.join(" ")}`.trim();
    } else {
      score = 0.2;
      explanation = `Doesn\u2019t directly address your stated goals but may still be useful. ${structuralWarnings.join(" ")}`.trim();
    }
  } else {
    score = 0.2;
    explanation = `Limited direct coverage contribution based on your current goals. ${structuralWarnings.join(" ")}`.trim();
  }

  return {
    expandsCoverage: gapsFilled.length > 0 || addressesStructural,
    gapsFilled,
    explanation,
    score,
  };
}
