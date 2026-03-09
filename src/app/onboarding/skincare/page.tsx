"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

const GOALS = [
  "Anti-aging",
  "Hydration",
  "Acne / Breakouts",
  "Brightening",
  "Texture",
  "Sensitivity",
];

const CONCERNS = [
  "Fine lines",
  "Dryness",
  "Oiliness",
  "Dark spots",
  "Redness",
  "Large pores",
  "Dullness",
  "Not sure",
];

export default function SkincarePage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [makupActive, setMakeupActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("category_makeup")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const m = data.category_makeup;
          setMakeupActive(m === "active" || m === "occasional");
        }
      });
  }, [user]);

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal);
      if (prev.length >= 2) return prev;
      return [...prev, goal];
    });
  }

  function toggleConcern(concern: string) {
    setSelectedConcerns((prev) => {
      if (prev.includes(concern)) return prev.filter((c) => c !== concern);
      if (prev.length >= 3) return prev;
      return [...prev, concern];
    });
  }

  async function handleContinue() {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        skincare_goals: selectedGoals,
        skincare_concerns: selectedConcerns,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      setSaving(false);
      return;
    }

    if (makupActive) {
      router.push("/onboarding/makeup");
    } else {
      router.push("/onboarding/preferences");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
        Step 2 of 4
      </p>
      <h1 className="mt-3 font-serif text-[26px] text-ink">
        What are your skincare goals?
      </h1>
      <p className="mt-2 font-sans text-[13px] font-light text-clay">
        Select up to 2 goals and up to 3 concerns.
      </p>

      {/* Goals */}
      <div className="mt-8">
        <p className="mb-3 font-sans text-xs uppercase tracking-wide text-stone">
          Goals
        </p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => {
            const selected = selectedGoals.includes(goal);
            return (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`rounded-full px-3 py-1.5 font-sans text-[12px] transition-colors ${
                  selected
                    ? "bg-ink text-cream"
                    : "border border-sand bg-transparent text-clay"
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concerns */}
      <div className="mt-8">
        <p className="mb-3 font-sans text-xs uppercase tracking-wide text-stone">
          Concerns
        </p>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((concern) => {
            const selected = selectedConcerns.includes(concern);
            return (
              <button
                key={concern}
                onClick={() => toggleConcern(concern)}
                className={`rounded-full px-3 py-1.5 font-sans text-[12px] transition-colors ${
                  selected
                    ? "bg-ink text-cream"
                    : "border border-sand bg-transparent text-clay"
                }`}
              >
                {concern}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-8">
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
