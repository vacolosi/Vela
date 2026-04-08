// Hardcoded influencer data for MVP
// Products reference real product names — we'll look them up in the DB by name

export interface Influencer {
  handle: string;
  name: string;
  bio: string;
  products: number;
  looks: number;
  saves: string;
  cabinet: {
    brand: string;
    productName: string;
    category: string;
  }[];
}

export const INFLUENCERS: Influencer[] = [
  {
    handle: "alixearle",
    name: "Alix Earle",
    bio: "Full glam enthusiast. Skincare-first. Loves a dewy base and bold lip.",
    products: 47,
    looks: 6,
    saves: "12.4k",
    cabinet: [
      { brand: "Charlotte Tilbury", productName: "Airbrush Flawless Foundation", category: "makeup" },
      { brand: "Charlotte Tilbury", productName: "Hollywood Flawless Filter", category: "makeup" },
      { brand: "Rare Beauty", productName: "Soft Pinch Liquid Blush", category: "makeup" },
      { brand: "Fenty Beauty", productName: "Gloss Bomb Universal Lip Luminizer", category: "makeup" },
      { brand: "Tarte", productName: "Shape Tape Concealer", category: "makeup" },
      { brand: "MAC", productName: "Lip Liner", category: "makeup" },
      { brand: "Too Faced", productName: "Better Than Sex Mascara", category: "makeup" },
      { brand: "Supergoop!", productName: "Unseen Sunscreen SPF 40", category: "skincare" },
      { brand: "CeraVe", productName: "Hydrating Facial Cleanser", category: "skincare" },
      { brand: "Drunk Elephant", productName: "Protini Polypeptide Cream", category: "skincare" },
      { brand: "Summer Fridays", productName: "Jet Lag Mask", category: "skincare" },
      { brand: "Olaplex", productName: "No.3 Hair Perfector", category: "hair" },
      { brand: "Moroccanoil", productName: "Treatment Oil", category: "hair" },
    ],
  },
  {
    handle: "hyram",
    name: "Hyram",
    bio: "Skincare specialist. Science-backed, no-nonsense recommendations.",
    products: 23,
    looks: 3,
    saves: "8.2k",
    cabinet: [
      { brand: "CeraVe", productName: "Hydrating Facial Cleanser", category: "skincare" },
      { brand: "CeraVe", productName: "Moisturizing Cream", category: "skincare" },
      { brand: "Paula's Choice", productName: "Skin Perfecting 2% BHA Liquid Exfoliant", category: "skincare" },
      { brand: "The Ordinary", productName: "Niacinamide 10% + Zinc 1%", category: "skincare" },
      { brand: "The Ordinary", productName: "Hyaluronic Acid 2% + B5", category: "skincare" },
      { brand: "Supergoop!", productName: "Unseen Sunscreen SPF 40", category: "skincare" },
      { brand: "La Roche-Posay", productName: "Toleriane Double Repair Face Moisturizer", category: "skincare" },
      { brand: "COSRX", productName: "Advanced Snail 96 Mucin Power Essence", category: "skincare" },
    ],
  },
  {
    handle: "mikaylanogueira",
    name: "Mikayla Nogueira",
    bio: "Makeup artist & beauty creator. All about full coverage and bold looks.",
    products: 35,
    looks: 8,
    saves: "5.9k",
    cabinet: [
      { brand: "Estee Lauder", productName: "Double Wear Stay-in-Place Foundation", category: "makeup" },
      { brand: "Too Faced", productName: "Better Than Sex Mascara", category: "makeup" },
      { brand: "Urban Decay", productName: "All Nighter Long-Lasting Makeup Setting Spray", category: "makeup" },
      { brand: "NYX Professional Makeup", productName: "Butter Gloss", category: "makeup" },
      { brand: "Rare Beauty", productName: "Soft Pinch Liquid Blush", category: "makeup" },
      { brand: "Fenty Beauty", productName: "Pro Filt'r Soft Matte Longwear Foundation", category: "makeup" },
      { brand: "CeraVe", productName: "Hydrating Facial Cleanser", category: "skincare" },
      { brand: "Tatcha", productName: "The Dewy Skin Cream", category: "skincare" },
      { brand: "OGX", productName: "Biotin & Collagen Shampoo", category: "hair" },
    ],
  },
];

export function getInfluencer(handle: string): Influencer | undefined {
  return INFLUENCERS.find((i) => i.handle === handle);
}
