"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

const IDENTITIES = [
  {
    id: "essentialist",
    title: "Essentialist",
    description:
      "I keep it simple. A few go-to products that work and I'm out the door.",
  },
  {
    id: "curator",
    title: "Curator",
    description:
      "I want one of everything — and I want each one to be the best choice for me.",
  },
  {
    id: "enthusiast",
    title: "Enthusiast",
    description:
      "I have my full kit dialed in, and I love building options within my favorites.",
  },
  {
    id: "creative",
    title: "Creative",
    description:
      "Makeup is my medium. I collect, experiment, and express.",
  },
];

type Frequency = "active" | "occasional";

export default function MakeupPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<Frequency>("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!user || !selectedIdentity) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        makeup_identity: selectedIdentity,
        makeup_frequency: frequency,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/onboarding/preferences");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
        Step 3 of 4
      </p>
      <h1 className="mt-3 font-serif text-[26px] text-ink">
        How do you approach makeup?
      </h1>
      <p className="mt-2 font-sans text-[13px] font-light text-clay">
        No right answer. This helps the engine understand you.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {IDENTITIES.map((identity) => {
          const selected = selectedIdentity === identity.id;
          return (
            <button
              key={identity.id}
              onClick={() => setSelectedIdentity(identity.id)}
              className={`rounded-[10px] px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "bg-ink"
                  : "border border-parchment bg-cream"
              }`}
            >
              <p
                className={`font-sans text-sm font-medium ${
                  selected ? "text-cream" : "text-ink"
                }`}
              >
                {identity.title}
              </p>
              <p
                className={`mt-1 font-sans text-[12px] leading-relaxed ${
                  selected ? "text-sand" : "text-clay"
                }`}
              >
                {identity.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Frequency */}
      <div className="mt-8">
        <p className="mb-3 font-sans text-xs uppercase tracking-wide text-stone">
          How often?
        </p>
        <div className="flex gap-2">
          {(["active", "occasional"] as Frequency[]).map((level) => {
            const selected = frequency === level;
            return (
              <button
                key={level}
                onClick={() => setFrequency(level)}
                className={`rounded-full px-3 py-1.5 font-sans text-[10px] capitalize transition-colors ${
                  selected
                    ? "bg-ink text-cream"
                    : "border border-sand bg-transparent text-clay"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-8">
        {error && (
          <p className="font-sans text-sm text-risk text-center">{error}</p>
        )}
        <button
          onClick={handleContinue}
          disabled={saving || !selectedIdentity}
          className="w-full rounded-lg bg-ink py-3 font-sans text-sm text-cream transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
