"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { Switch } from "@/components/ui/switch";

const PREFERENCE_OPTIONS = [
  { key: "clean", label: "Clean beauty" },
  { key: "fragrance_free", label: "Fragrance-free" },
  { key: "vegan", label: "Vegan" },
  { key: "cruelty_free", label: "Cruelty-free" },
] as const;

type PreferenceKey = (typeof PREFERENCE_OPTIONS)[number]["key"];

export default function PreferencesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>({
    clean: false,
    fragrance_free: false,
    vegan: false,
    cruelty_free: false,
  });
  const [saving, setSaving] = useState(false);

  function togglePreference(key: PreferenceKey) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        preferences,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      setSaving(false);
      return;
    }

    router.push("/home");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
        Step 4 of 4
      </p>
      <h1 className="mt-3 font-serif text-[26px] text-ink">
        Any preferences?
      </h1>
      <p className="mt-2 font-sans text-[13px] font-light text-clay">
        We&apos;ll factor these into your recommendations.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {PREFERENCE_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center justify-between">
            <span className="font-sans text-[13px] text-ink">
              {option.label}
            </span>
            <Switch
              checked={preferences[option.key]}
              onCheckedChange={() => togglePreference(option.key)}
            />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full rounded-lg bg-ink py-3 font-sans text-sm text-cream transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Start Exploring"}
        </button>
      </div>
    </div>
  );
}
