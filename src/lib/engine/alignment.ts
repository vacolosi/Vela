// ─── Alignment Calculator ─────────────────────────────────────────────
// The core scoring function. Combines risk, coverage, and overlap into
// a single alignment tier (Low / Moderate / High).
//
// Locked weights: Risk 45% | Goal (coverage) 35% | Balance (overlap) 20%
// Locked caps:
//   - severe conflict  → max Moderate (score capped at 0.5)
//   - critical conflict → force Low   (score capped at 0.33)

import { ENGINE_WEIGHTS } from "@/lib/utils/constants";
import { detectConflicts } from "./conflicts";
import { detectOverlap } from "./overlap";
import { analyzeCoverage } from "./coverage";
import type {
  Product,
  UserProfile,
  CabinetItem,
  ConflictRule,
  AlignmentResult,
  CompatibilityResult,
} from "./types";

// ─── tier mapping ─────────────────────────────────────────────────────

function scoreToTier(score: number): AlignmentResult["tier"] {
  if (score >= 0.66) return "High";
  if (score >= 0.33) return "Moderate";
  return "Low";
}

// ─── compatibility summary ────────────────────────────────────────────

function buildCompatibility(
  tier: AlignmentResult["tier"],
  hasConflict: boolean,
  expandsCoverage: boolean,
  hasOverlap: boolean
): CompatibilityResult {
  const parts: string[] = [];

  if (hasConflict) {
    parts.push("This product may interact with something in your lineup.");
  }
  if (expandsCoverage) {
    parts.push("It fills a gap in your routine.");
  }
  if (hasOverlap) {
    parts.push("It overlaps with a product you already own.");
  }

  if (parts.length === 0) {
    parts.push(
      tier === "High"
        ? "This product fits well with your lineup and goals."
        : "Review the details below to see how this product fits."
    );
  }

  return {
    explanation: parts.join(" "),
    score: tier === "High" ? 1 : tier === "Moderate" ? 0.5 : 0,
  };
}

// ─── public API ───────────────────────────────────────────────────────

export function calculateAlignment(
  candidate: Product,
  profile: UserProfile,
  cabinetItems: CabinetItem[],
  conflictRules: ConflictRule[]
): AlignmentResult {
  // 1. Filter to active lineup
  const activeLineup = cabinetItems.filter((item) => item.is_active);

  // 2. Run sub-analyses
  const riskResult = detectConflicts(candidate, activeLineup, conflictRules);
  const coverageResult = analyzeCoverage(candidate, profile, activeLineup);
  const overlapResult = detectOverlap(candidate, profile, activeLineup);

  // 3. Weighted score
  const riskScore = (1 - riskResult.score) * ENGINE_WEIGHTS.risk;
  const coverageScore = coverageResult.score * ENGINE_WEIGHTS.goal;
  const balanceScore = (1 - overlapResult.score) * ENGINE_WEIGHTS.balance;

  let total = riskScore + coverageScore + balanceScore;

  // 4. Conflict caps (locked rules)
  const hasCritical = riskResult.conflicts.some(
    (c) => c.rule.severity === "critical"
  );
  const hasSevere = riskResult.conflicts.some(
    (c) => c.rule.severity === "severe"
  );

  if (hasCritical) {
    total = Math.min(total, 0.33);
  } else if (hasSevere) {
    total = Math.min(total, 0.5);
  }

  // 5. Map to tier
  const tier = scoreToTier(total);

  // 6. Compatibility summary
  const compatibility = buildCompatibility(
    tier,
    riskResult.hasConflict,
    coverageResult.expandsCoverage,
    overlapResult.hasOverlap
  );

  return {
    tier,
    score: Math.round(total * 100) / 100,
    reasoning: {
      risk: riskResult,
      overlap: overlapResult,
      coverage: coverageResult,
      compatibility,
    },
  };
}
