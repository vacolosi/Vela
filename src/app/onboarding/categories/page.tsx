"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

type CategoryLevel = "active" | "occasional" | "inactive";

const CATEGORIES = ["Skincare", "Makeup", "Hair", "Body"] as const;
const LEVELS: { label: string; value: CategoryLevel }[] = [
  { label: "Active", value: "active" },
  { label: "Occasional", value: "occasional" },
  { label: "Not a user", value: "inactive" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selections, setSelections] = useState<Record<string, CategoryLevel>>({
    skincare: "inactive",
    makeup: "inactive",
    hair: "inactive",
    body: "inactive",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setCategory(category: string, level: CategoryLevel) {
    setSelections((prev) => ({ ...prev, [category]: level }));
  }

  async function handleContinue() {
    if (!user) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        category_skincare: selections.skincare,
        category_makeup: selections.makeup,
        category_hair: selections.hair,
        category_body: selections.body,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    const skincare = selections.skincare;
    const makeup = selections.makeup;

    if (skincare === "active" || skincare === "occasional") {
      router.push("/onboarding/skincare");
    } else if (makeup === "active" || makeup === "occasional") {
      router.push("/onboarding/makeup");
    } else {
      router.push("/onboarding/preferences");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
        Step 1 of 4
      </p>
      <h1 className="mt-3 font-serif text-[26px] text-ink">
        Which categories are you active in?
      </h1>
      <p className="mt-2 font-sans text-[13px] font-light text-clay">
        This helps us personalize your experience.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {CATEGORIES.map((cat) => {
          const key = cat.toLowerCase();
          return (
            <div
              key={key}
              className="rounded-[10px] border border-parchment bg-cream p-4"
            >
              <p className="mb-3 font-sans text-sm text-ink">{cat}</p>
              <div className="flex gap-2">
                {LEVELS.map((level) => {
                  const selected = selections[key] === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setCategory(key, level.value)}
                      className={`rounded-full px-3 py-1.5 font-sans text-[10px] transition-colors ${
                        selected
                          ? "bg-ink text-cream"
                          : "border border-sand bg-transparent text-clay"
                      }`}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        {error && (
          <p className="font-sans text-sm text-risk text-center">{error}</p>
        )}
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full rounded-lg bg-ink py-3 font-sans text-sm text-cream transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
