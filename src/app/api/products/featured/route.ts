import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const brand = request.nextUrl.searchParams.get("brand");
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("product_id, brand, product_name, category, subcategory, price, image_url")
    .order("created_at", { ascending: false })
    .limit(50);

  if (category) {
    query = query.eq("category", category);
  }

  if (brand) {
    query = query.eq("brand", brand);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
