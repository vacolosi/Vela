import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Paginate through all products to get every brand
  // Supabase defaults to 1000 rows per request
  const brandMap = new Map<string, number>();
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .order("brand")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const row of data ?? []) {
      if (row.brand) {
        brandMap.set(row.brand, (brandMap.get(row.brand) ?? 0) + 1);
      }
    }

    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  const brands = Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ brands });
}
