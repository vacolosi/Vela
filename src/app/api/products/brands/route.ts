import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Get distinct brands with product count, sorted alphabetically
  const { data, error } = await supabase.rpc("get_brands_with_counts");

  if (error) {
    // Fallback: simple distinct query if RPC doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("products")
      .select("brand")
      .order("brand");

    if (fallbackError) {
      return NextResponse.json(
        { error: fallbackError.message },
        { status: 500 }
      );
    }

    // Deduplicate and count client-side
    const brandMap = new Map<string, number>();
    for (const row of fallbackData ?? []) {
      if (row.brand) {
        brandMap.set(row.brand, (brandMap.get(row.brand) ?? 0) + 1);
      }
    }

    const brands = Array.from(brandMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ brands });
  }

  return NextResponse.json({
    brands: (data ?? []).map((r: { brand: string; count: number }) => ({
      name: r.brand,
      count: r.count,
    })),
  });
}
