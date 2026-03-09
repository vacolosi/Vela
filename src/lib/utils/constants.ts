// Alignment engine weights (locked)
export const ENGINE_WEIGHTS = {
  risk: 0.45,
  goal: 0.35,
  balance: 0.20,
} as const;

// Alignment tiers (locked — no numeric scores shown to users)
export const ALIGNMENT_TIERS = ["Low", "Moderate", "High"] as const;
export type AlignmentTier = (typeof ALIGNMENT_TIERS)[number];

// Makeup zones
export const MAKEUP_ZONES = ["Face", "Cheek", "Lip", "Eye"] as const;
export type MakeupZone = (typeof MAKEUP_ZONES)[number];

// Color purposes
export const COLOR_PURPOSES = ["Staple", "Warm", "Cool", "Deep", "Statement"] as const;
export type ColorPurpose = (typeof COLOR_PURPOSES)[number];

// Identity tiers
export const IDENTITY_TIERS = ["Essentialist", "Curator", "Enthusiast", "Creative"] as const;
export type IdentityTier = (typeof IDENTITY_TIERS)[number];

// Category participation levels
export const PARTICIPATION_LEVELS = ["active", "occasional", "inactive"] as const;
export type ParticipationLevel = (typeof PARTICIPATION_LEVELS)[number];

// Skincare functional categories
export const SKINCARE_FUNCTIONS = [
  "Hydration", "Barrier Support", "Exfoliation (AHA)", "Exfoliation (BHA)",
  "Exfoliation (PHA)", "Retinoids", "Antioxidants", "Pigment Correction",
  "Acne Treatment", "SPF", "Soothing", "Oil Regulation",
] as const;

// Shade depths
export const SHADE_DEPTHS = [
  "Fair", "Light", "Light-Medium", "Medium",
  "Medium-Deep", "Deep", "Deep-Dark",
] as const;

// Undertones
export const UNDERTONES = ["Warm", "Cool", "Neutral", "Olive"] as const;

// Product categories
export const PRODUCT_CATEGORIES = ["skincare", "makeup", "body", "hair"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Conflict severity levels
export const CONFLICT_SEVERITIES = ["soft", "moderate", "severe", "critical"] as const;
