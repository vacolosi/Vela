import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const supabase = await createClient();

  // Split query into individual words for flexible matching
  // "pro vit" → ["pro", "vit"] will match "Pro-Vit", "Pro Vit B5", etc.
  const words = query
    .trim()
    .split(/[\s\-]+/)
    .filter((w) => w.length >= 2);

  if (words.length === 0) {
    return NextResponse.json({ products: [] });
  }

  // First try: exact phrase match (highest relevance)
  const { data: exactData } = await supabase
    .from("products")
    .select("*")
    .or(`product_name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(20);

  // Second try: all words must appear in product_name OR brand (any order)
  // Build filter: each word must be in product_name or brand
  let fuzzyQuery = supabase.from("products").select("*");
  for (const word of words) {
    fuzzyQuery = fuzzyQuery.or(
      `product_name.ilike.%${word}%,brand.ilike.%${word}%`
    );
  }
  const { data: fuzzyData } = await fuzzyQuery.limit(40);

  // Filter fuzzy results: all words must appear somewhere in brand + product_name
  const fuzzyFiltered = (fuzzyData ?? []).filter((product) => {
    const combined =
      `${product.brand} ${product.product_name}`.toLowerCase().replace(/[-]/g, " ");
    return words.every((word) => combined.includes(word.toLowerCase()));
  });

  // Merge: exact matches first, then fuzzy (deduplicated), limit 20
  const seen = new Set<string>();
  const merged = [];

  for (const product of [...(exactData ?? []), ...fuzzyFiltered]) {
    if (!seen.has(product.product_id)) {
      seen.add(product.product_id);
      merged.push(product);
    }
    if (merged.length >= 20) break;
  }

  return NextResponse.json({ products: merged });
}
