import { createClient as createServerClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const { image } = await request.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Step 1: Send image to Claude Haiku for product name extraction
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: image,
            },
          },
          {
            type: "text",
            text: `Look at this image of beauty/skincare/makeup/hair products. List every product you can identify. For each product, extract the brand name and product name as accurately as possible.

Return ONLY valid JSON in this exact format, no other text:
[{"brand": "Brand Name", "product_name": "Product Name"}, ...]

If you cannot identify any products, return an empty array: []`,
          },
        ],
      },
    ],
  });

  // Parse Claude's response
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  let detectedProducts: { brand: string; product_name: string }[];
  try {
    detectedProducts = JSON.parse(responseText);
  } catch {
    detectedProducts = [];
  }

  if (detectedProducts.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Step 2: Match each detected product against the database
  const supabase = getSupabaseAdmin();
  const results = [];

  for (const detected of detectedProducts) {
    const searchTerm = `${detected.brand} ${detected.product_name}`;

    // Try exact-ish match first (brand + name)
    const { data: exactMatch } = await supabase
      .from("products")
      .select("product_id, brand, product_name, category, subcategory, price")
      .ilike("brand", `%${detected.brand}%`)
      .ilike("product_name", `%${detected.product_name}%`)
      .limit(1);

    if (exactMatch && exactMatch.length > 0) {
      results.push({
        detected_name: searchTerm,
        matched_product: exactMatch[0],
        confidence: "high",
      });
      continue;
    }

    // Try fuzzy match on product name only
    const { data: fuzzyMatch } = await supabase
      .from("products")
      .select("product_id, brand, product_name, category, subcategory, price")
      .or(
        `product_name.ilike.%${detected.product_name}%,brand.ilike.%${detected.brand}%`
      )
      .limit(3);

    if (fuzzyMatch && fuzzyMatch.length > 0) {
      results.push({
        detected_name: searchTerm,
        matched_product: fuzzyMatch[0],
        confidence: "low",
      });
    } else {
      results.push({
        detected_name: searchTerm,
        matched_product: null,
        confidence: "none",
      });
    }
  }

  return NextResponse.json({ results });
}
