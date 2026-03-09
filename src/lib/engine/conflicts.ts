// ─── Conflict Detection ───────────────────────────────────────────────
// Checks a candidate product against the user's active lineup for
// ingredient-level conflicts using the conflict_rules table.
//
// Advisory language: "may increase" — never "will cause".

import type { Product, CabinetItem, ConflictRule, RiskResult } from "./types";

/** Severity weights — we take the MAX, not the sum. */
const SEVERITY_WEIGHTS: Record<ConflictRule["severity"], number> = {
  soft: 0.15,
  moderate: 0.3,
  severe: 0.6,
  critical: 0.9,
};

/**
 * Returns true when a product's functions include the given category.
 * Checks both primary and secondary functions for completeness.
 */
function productMatchesCategory(product: Product, category: string): boolean {
  return (
    product.primary_functions.includes(category) ||
    product.secondary_functions.includes(category)
  );
}

/**
 * Checks whether a rule's concentration condition is met.
 *
 * Condition strings from the DB look like:
 *   "Moderate+" — means the candidate (or lineup product) must be Moderate or High
 *   "High"     — means it must be High
 *
 * If the rule has no condition, it always applies.
 */
function conditionMet(
  rule: ConflictRule,
  candidateTier: Product["concentration_tier"],
  lineupTier: Product["concentration_tier"]
): boolean {
  if (!rule.condition) return true;

  const normalized = rule.condition.trim();

  // "Moderate+" means either product is Moderate or High
  if (normalized.includes("Moderate+")) {
    const qualifying = ["Moderate", "High"];
    return (
      (candidateTier !== null && qualifying.includes(candidateTier)) ||
      (lineupTier !== null && qualifying.includes(lineupTier))
    );
  }

  // "High" means either product is High concentration
  if (normalized.includes("High")) {
    return candidateTier === "High" || lineupTier === "High";
  }

  // Unknown condition format — default to applying the rule
  return true;
}

/**
 * Detect conflicts between a candidate product and every active
 * product in the user's lineup.
 */
export function detectConflicts(
  candidate: Product,
  lineup: CabinetItem[],
  rules: ConflictRule[]
): RiskResult {
  const conflicts: RiskResult["conflicts"] = [];

  for (const rule of rules) {
    for (const item of lineup) {
      const lineupProduct = item.product;

      // Check both directions: candidate=A & lineup=B, or candidate=B & lineup=A
      const matchAB =
        productMatchesCategory(candidate, rule.category_a) &&
        productMatchesCategory(lineupProduct, rule.category_b);

      const matchBA =
        productMatchesCategory(candidate, rule.category_b) &&
        productMatchesCategory(lineupProduct, rule.category_a);

      if (!matchAB && !matchBA) continue;

      // Check concentration condition
      if (
        !conditionMet(
          rule,
          candidate.concentration_tier,
          lineupProduct.concentration_tier
        )
      ) {
        continue;
      }

      // Build advisory explanation (never "will cause")
      const explanation = rule.explanation.replace(/will cause/gi, "may increase");

      conflicts.push({
        rule,
        conflictingProduct: lineupProduct,
        explanation,
        resolutions: rule.resolutions.map((r) => r.message),
      });
    }
  }

  // Score = max severity weight across all detected conflicts
  const score =
    conflicts.length === 0
      ? 0
      : Math.max(...conflicts.map((c) => SEVERITY_WEIGHTS[c.rule.severity]));

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    score,
  };
}
