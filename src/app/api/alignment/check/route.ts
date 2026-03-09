import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateAlignment } from "@/lib/engine/alignment";
import type {
  Product,
  UserProfile,
  CabinetItem,
  ConflictRule,
} from "@/lib/engine/types";

const RequestBody = z.object({
  product_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // ── Parse body ────────────────────────────────────────────────────
  let body: z.infer<typeof RequestBody>;
  try {
    const json = await request.json();
    body = RequestBody.parse(json);
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Provide a valid product_id." },
      { status: 400 }
    );
  }

  // ── Auth ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parallel fetches ──────────────────────────────────────────────
  const [profileRes, productRes, cabinetRes, rulesRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("products")
      .select("*")
      .eq("product_id", body.product_id)
      .single(),

    supabase
      .from("cabinet_items")
      .select("*, product:products(*)")
      .eq("user_id", user.id),

    supabase.from("conflict_rules").select("*"),
  ]);

  // ── Validate fetches ──────────────────────────────────────────────
  if (profileRes.error || !profileRes.data) {
    return NextResponse.json(
      { error: "User profile not found. Complete onboarding first." },
      { status: 404 }
    );
  }

  if (productRes.error || !productRes.data) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 }
    );
  }

  if (cabinetRes.error) {
    return NextResponse.json(
      { error: "Could not load cabinet." },
      { status: 500 }
    );
  }

  if (rulesRes.error) {
    return NextResponse.json(
      { error: "Could not load conflict rules." },
      { status: 500 }
    );
  }

  // ── Normalize data ────────────────────────────────────────────────
  const profile: UserProfile = {
    skincare_goals: profileRes.data.skincare_goals ?? [],
    skincare_concerns: profileRes.data.skincare_concerns ?? [],
    makeup_identity: profileRes.data.makeup_identity ?? null,
    makeup_frequency: profileRes.data.makeup_frequency ?? null,
    shade_depth: profileRes.data.shade_depth ?? null,
    shade_undertone: profileRes.data.shade_undertone ?? null,
    category_skincare: profileRes.data.category_skincare ?? "inactive",
    category_makeup: profileRes.data.category_makeup ?? "inactive",
    category_hair: profileRes.data.category_hair ?? "inactive",
    category_body: profileRes.data.category_body ?? "inactive",
    preferences: profileRes.data.preferences ?? {},
  };

  const candidate = productRes.data as Product;

  const cabinetItems = (cabinetRes.data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    product_id: row.product_id as string,
    is_active: row.is_active as boolean,
    product: row.product as Product,
  })) as CabinetItem[];

  const conflictRules = (rulesRes.data ?? []).map((row: Record<string, unknown>) => ({
    rule_id: row.rule_id as string,
    category_a: row.category_a as string,
    category_b: row.category_b as string,
    severity: row.severity as ConflictRule["severity"],
    condition: (row.condition as string) ?? null,
    max_alignment: (row.max_alignment as string) ?? null,
    explanation: row.explanation as string,
    resolutions: (row.resolutions ?? []) as ConflictRule["resolutions"],
  })) as ConflictRule[];

  // ── Run engine ────────────────────────────────────────────────────
  const result = calculateAlignment(
    candidate,
    profile,
    cabinetItems,
    conflictRules
  );

  // ── Store in alignment_history (fire-and-forget) ──────────────────
  supabase
    .from("alignment_history")
    .insert({
      user_id: user.id,
      product_id: body.product_id,
      tier: result.tier,
      score: result.score,
      reasoning: result.reasoning,
    })
    .then(() => {
      // intentionally ignored — history is best-effort
    });

  return NextResponse.json(result);
}
