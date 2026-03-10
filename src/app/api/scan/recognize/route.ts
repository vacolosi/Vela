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
  try {
    const { image, mediaType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Detect media type from base64 header or use provided value
    let resolvedMediaType = mediaType || "image/jpeg";
    if (image.startsWith("iVBOR")) resolvedMediaType = "image/png";
    else if (image.startsWith("/9j/")) resolvedMediaType = "image/jpeg";
    else if (image.startsWith("UklGR")) resolvedMediaType = "image/webp";

    // Step 1: Send image to Claude for product name extraction
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
                media_type: resolvedMediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
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
      // Handle case where Claude wraps JSON in markdown code blocks
      const cleaned = responseText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      detectedProducts = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude response:", responseText);
      detectedProducts = [];
    }

    if (detectedProducts.length === 0) {
      return NextResponse.json({ results: [], debug: { claudeResponse: responseText } });
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

      // Try fuzzy match — split product name into key words
      const words = detected.product_name.split(/\s+/).filter((w) => w.length > 3);
      const brandPattern = `%${detected.brand}%`;
      let fuzzyMatch = null;

      // Try brand + each significant word
      for (const word of words) {
        const { data } = await supabase
          .from("products")
          .select("product_id, brand, product_name, category, subcategory, price")
          .ilike("brand", brandPattern)
          .ilike("product_name", `%${word}%`)
          .limit(3);

        if (data && data.length > 0) {
          fuzzyMatch = data;
          break;
        }
      }

      // Fallback: brand-only match
      if (!fuzzyMatch) {
        const { data } = await supabase
          .from("products")
          .select("product_id, brand, product_name, category, subcategory, price")
          .ilike("brand", brandPattern)
          .limit(3);
        if (data && data.length > 0) {
          fuzzyMatch = data;
        }
      }

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
  } catch (err) {
    console.error("Scan recognize error:", err);
    return NextResponse.json(
      { error: "Failed to process image. Please try again.", results: [] },
      { status: 500 }
    );
  }
}
