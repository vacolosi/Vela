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

      const brandPattern = `%${detected.brand}%`;
      const stopWords = new Set(["the", "for", "and", "with", "from", "that", "this", "your", "our"]);
      const words = detected.product_name
        .split(/\s+/)
        .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
        .filter((w) => w.length > 2 && !stopWords.has(w));

      // Strategy 1: Exact phrase match (brand + full name)
      const { data: exactMatch } = await supabase
        .from("products")
        .select("product_id, brand, product_name, category, subcategory, price")
        .ilike("brand", brandPattern)
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

      // Strategy 2: Brand + ALL key words (any order)
      // e.g. "Fine Hair Conditioner" matches "Conditioner for Fine Hair"
      let allWordsMatch = null;
      if (words.length > 0) {
        let query = supabase
          .from("products")
          .select("product_id, brand, product_name, category, subcategory, price")
          .ilike("brand", brandPattern);
        for (const word of words) {
          query = query.ilike("product_name", `%${word}%`);
        }
        const { data } = await query.limit(5);
        if (data && data.length > 0) {
          allWordsMatch = data;
        }
      }

      if (allWordsMatch && allWordsMatch.length > 0) {
        // Score by how many words match — pick the best
        const scored = allWordsMatch.map((p) => {
          const nameLower = p.product_name.toLowerCase();
          const matchCount = words.filter((w) => nameLower.includes(w)).length;
          return { ...p, score: matchCount };
        });
        scored.sort((a, b) => b.score - a.score);
        const best = scored[0];
        results.push({
          detected_name: searchTerm,
          matched_product: { product_id: best.product_id, brand: best.brand, product_name: best.product_name, category: best.category, subcategory: best.subcategory, price: best.price },
          confidence: best.score === words.length ? "high" : "low",
        });
        continue;
      }

      // Strategy 3: Brand + any single key word
      let singleWordMatch = null;
      for (const word of words) {
        const { data } = await supabase
          .from("products")
          .select("product_id, brand, product_name, category, subcategory, price")
          .ilike("brand", brandPattern)
          .ilike("product_name", `%${word}%`)
          .limit(3);
        if (data && data.length > 0) {
          singleWordMatch = data;
          break;
        }
      }

      if (singleWordMatch && singleWordMatch.length > 0) {
        results.push({
          detected_name: searchTerm,
          matched_product: singleWordMatch[0],
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
