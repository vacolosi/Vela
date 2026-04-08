"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

const ACTIVE_INGREDIENTS = [
  "Tretinoin",
  "Adapalene",
  "Hydroquinone",
  "Azelaic Acid",
  "Clindamycin",
  "BP Rx",
  "Dapsone",
  "Spironolactone",
  "Other",
];

export default function PrescriptionEntryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeIngredient, setActiveIngredient] = useState("");
  const [concentration, setConcentration] = useState("");
  const [brandProvider, setBrandProvider] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!user || !activeIngredient) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Create a prescription product entry
    const productId = `RX-${activeIngredient.toUpperCase().replace(/\s+/g, "")}-${Date.now()}`;
    const productName = [activeIngredient, concentration].filter(Boolean).join(" ");

    const { error: insertError } = await supabase.from("products").upsert({
      product_id: productId,
      brand: brandProvider || "Prescription",
      product_name: productName,
      category: "skincare",
      subcategory: "Prescription",
      concentration_tier: "High",
      treatment_or_support: "Treatment",
      primary_functions: [activeIngredient],
      status: "Complete",
    });

    if (insertError) {
      setError("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    // Add to cabinet as inactive
    const { error: cabinetError } = await supabase.from("cabinet_items").insert({
      user_id: user.id,
      product_id: productId,
      is_active: false,
    });

    if (cabinetError) {
      setError("Failed to add to cabinet.");
      setSaving(false);
      return;
    }

    router.push("/cabinet");
  }

  return (
    <div className="px-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-2 pt-6 pb-4">
        <button onClick={() => router.back()} className="flex-shrink-0">
          <ChevronLeft size={18} className="text-stone" />
        </button>
        <p className="font-sans text-xs text-stone">
          Cabinet &rsaquo; <span className="text-ink">Add Prescription</span>
        </p>
      </div>

      <h1 className="font-serif text-xl text-ink mb-1">Add a prescription product</h1>
      <p className="font-sans text-xs text-clay font-light mb-6">
        Prescription products are automatically set to high concentration for the alignment engine.
      </p>

      {/* Active ingredient */}
      <div className="mb-5">
        <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
          Active Ingredient
        </label>
        <div className="flex flex-wrap gap-2">
          {ACTIVE_INGREDIENTS.map((ingredient) => (
            <button
              key={ingredient}
              onClick={() => setActiveIngredient(ingredient)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] transition-colors ${
                activeIngredient === ingredient
                  ? "bg-ink text-cream"
                  : "border border-sand text-clay"
              }`}
            >
              {ingredient}
            </button>
          ))}
        </div>
      </div>

      {/* Concentration */}
      <div className="mb-5">
        <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
          Concentration (optional)
        </label>
        <input
          type="text"
          value={concentration}
          onChange={(e) => setConcentration(e.target.value)}
          placeholder="e.g. 0.025%, 0.05%"
          className="w-full bg-cream rounded-lg border border-parchment py-2.5 px-4 font-sans text-sm text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
        />
      </div>

      {/* Brand / Provider */}
      <div className="mb-8">
        <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
          Brand / Provider (optional)
        </label>
        <input
          type="text"
          value={brandProvider}
          onChange={(e) => setBrandProvider(e.target.value)}
          placeholder="e.g. Curology, Apostrophe, Dermatologist"
          className="w-full bg-cream rounded-lg border border-parchment py-2.5 px-4 font-sans text-sm text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
        />
      </div>

      {error && (
        <p className="font-sans text-sm text-risk text-center mb-4">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !activeIngredient}
        className="w-full rounded-lg bg-ink py-3 font-sans text-sm text-cream transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add to Cabinet"}
      </button>
    </div>
  );
}
