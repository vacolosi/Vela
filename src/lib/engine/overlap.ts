// ─── Overlap Detection ────────────────────────────────────────────────
// Determines whether a candidate product duplicates something the user
// already owns. Sensitivity varies by category and makeup identity tier.

import type { Product, UserProfile, CabinetItem, OverlapResult } from "./types";
import type { IdentityTier } from "@/lib/utils/constants";

// ─── helpers ──────────────────────────────────────────────────────────

interface OverlapHit {
  product: Product;
  overlapType: string;
  explanation: string;
}

function skincareOverlap(
  candidate: Product,
  cabinetItems: CabinetItem[]
): OverlapHit[] {
  const hits: OverlapHit[] = [];

  for (const item of cabinetItems) {
    const existing = item.product;
    if (existing.category !== "skincare") continue;

    const sharedFunctions = candidate.primary_functions.filter((fn) =>
      existing.primary_functions.includes(fn)
    );

    if (sharedFunctions.length > 0) {
      hits.push({
        product: existing,
        overlapType: "shared-function",
        explanation: `Overlaps with ${existing.product_name} \u2014 both serve a ${sharedFunctions[0]} role.`,
      });
    }
  }

  return hits;
}

function makeupOverlap(
  candidate: Product,
  cabinetItems: CabinetItem[],
  identityTier: IdentityTier | null
): OverlapHit[] {
  const hits: OverlapHit[] = [];
  const tier = identityTier ?? "Curator"; // default to middle-ground

  for (const item of cabinetItems) {
    const existing = item.product;
    if (existing.category !== "makeup") continue;

    const sameSubcategory = candidate.subcategory === existing.subcategory;
    const sameZone = candidate.zone === existing.zone;

    switch (tier) {
      case "Essentialist":
        // Flag ANY duplicate subcategory — Essentialists keep it minimal
        if (sameSubcategory) {
          hits.push({
            product: existing,
            overlapType: "duplicate-subcategory",
            explanation: `Overlaps with ${existing.product_name} \u2014 both are ${candidate.subcategory} products.`,
          });
        }
        break;

      case "Curator":
        // Flag duplicate subcategory, note as potential upgrade
        if (sameSubcategory && sameZone) {
          hits.push({
            product: existing,
            overlapType: "potential-upgrade",
            explanation: `Overlaps with ${existing.product_name} \u2014 this may be an upgrade for your ${candidate.subcategory}.`,
          });
        }
        break;

      case "Enthusiast":
        // Flag only same subcategory + same finish (via formula_notes as proxy)
        if (
          sameSubcategory &&
          candidate.formula_notes &&
          existing.formula_notes &&
          candidate.formula_notes === existing.formula_notes
        ) {
          hits.push({
            product: existing,
            overlapType: "same-finish",
            explanation: `Overlaps with ${existing.product_name} \u2014 both are ${candidate.subcategory} with a similar finish.`,
          });
        }
        break;

      case "Creative":
        // Flag only near-identical: same brand + same subcategory
        if (sameSubcategory && candidate.brand === existing.brand) {
          hits.push({
            product: existing,
            overlapType: "near-identical",
            explanation: `Very similar to ${existing.product_name} \u2014 same brand and subcategory.`,
          });
        }
        break;
    }
  }

  return hits;
}

function hairBodyOverlap(
  candidate: Product,
  cabinetItems: CabinetItem[]
): OverlapHit[] {
  const hits: OverlapHit[] = [];

  for (const item of cabinetItems) {
    const existing = item.product;
    if (existing.category !== candidate.category) continue;

    if (candidate.subcategory === existing.subcategory) {
      hits.push({
        product: existing,
        overlapType: "duplicate-subcategory",
        explanation: `Overlaps with ${existing.product_name} \u2014 both are ${candidate.subcategory} products.`,
      });
    }
  }

  return hits;
}

// ─── scoring ──────────────────────────────────────────────────────────

function scoreOverlap(hits: OverlapHit[]): number {
  if (hits.length === 0) return 0;
  if (hits.length === 1) return 0.3;
  if (hits.length === 2) return 0.6;
  return 0.8; // 3+ = heavy duplication
}

// ─── public API ───────────────────────────────────────────────────────

export function detectOverlap(
  candidate: Product,
  profile: UserProfile,
  cabinetItems: CabinetItem[]
): OverlapResult {
  let hits: OverlapHit[];

  switch (candidate.category) {
    case "skincare":
      hits = skincareOverlap(candidate, cabinetItems);
      break;
    case "makeup":
      hits = makeupOverlap(
        candidate,
        cabinetItems,
        profile.makeup_identity as IdentityTier | null
      );
      break;
    case "hair":
    case "body":
      hits = hairBodyOverlap(candidate, cabinetItems);
      break;
    default:
      hits = [];
  }

  return {
    hasOverlap: hits.length > 0,
    overlappingProducts: hits,
    score: scoreOverlap(hits),
  };
}
