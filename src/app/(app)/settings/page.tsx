"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone pt-6 pb-2">
      {children}
    </p>
  );
}

function Row({
  label,
  value,
  chevron = true,
  valueClassName,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-parchment">
      <span className="font-sans text-[13px] text-ink">{label}</span>
      <span className="flex items-center gap-1">
        {value && (
          <span
            className={
              valueClassName ?? "font-sans text-xs text-clay font-light"
            }
          >
            {value}
          </span>
        )}
        {chevron && <span className="text-sand text-sm">›</span>}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-parchment">
      <span className="font-sans text-[13px] text-ink">{label}</span>
      <Switch checked={checked} onCheckedChange={onToggle} size="sm" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Participation color                                               */
/* ------------------------------------------------------------------ */

function participationColor(level: string | undefined | null): string {
  if (!level) return "font-sans text-xs text-stone font-light";
  const l = level.toLowerCase();
  if (l === "active") return "font-sans text-xs text-sage font-light";
  if (l === "occasional") return "font-sans text-xs text-warm font-light";
  return "font-sans text-xs text-stone font-light";
}

function participationLabel(level: string | undefined | null): string {
  if (!level) return "Not a user";
  const l = level.toLowerCase();
  if (l === "active") return "Active";
  if (l === "occasional") return "Occasional";
  if (l === "inactive" || l === "not a user") return "Not a user";
  // Capitalize first letter for anything else
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  /* -- preference toggle handler ----------------------------------- */
  const handlePreferenceToggle = useCallback(
    async (key: string, value: boolean) => {
      if (!user) return;

      const current =
        (profile?.preferences as Record<string, boolean> | null) ?? {};
      const updated = { ...current, [key]: value };

      await supabase
        .from("profiles")
        .update({ preferences: updated })
        .eq("id", user.id);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["profile", user.id],
        (old: Record<string, unknown> | undefined) =>
          old ? { ...old, preferences: updated } : old
      );
    },
    [user, profile, supabase, queryClient]
  );

  /* -- sign out ---------------------------------------------------- */
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [supabase, router]);

  /* -- derived values --------------------------------------------- */
  const prefs = (profile?.preferences as Record<string, boolean> | null) ?? {};

  const shadeValue = [profile?.shade_depth, profile?.shade_undertone]
    .filter(Boolean)
    .join(", ");

  const goalsValue = Array.isArray(profile?.skincare_goals)
    ? (profile.skincare_goals as string[]).join(", ")
    : "";

  const concernsValue = Array.isArray(profile?.concerns)
    ? (profile.concerns as string[]).join(", ")
    : "";

  const categories = profile?.categories as
    | Record<string, string>
    | null
    | undefined;

  if (profileLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="px-6 pb-28">
      {/* Header */}
      <h1 className="font-serif text-[26px] italic text-ink pt-6 pb-2">
        Settings
      </h1>

      {/* PROFILE */}
      <SectionLabel>Profile</SectionLabel>
      <Row label="Shade Profile" value={shadeValue || "Not set"} />
      <Row label="Skincare Goals" value={goalsValue || "Not set"} />
      <Row label="Concerns" value={concernsValue || "Not set"} />

      {/* MAKEUP */}
      <SectionLabel>Makeup</SectionLabel>
      <Row
        label="Identity"
        value={(profile?.makeup_identity as string) || "Not set"}
      />
      <Row
        label="Frequency"
        value={(profile?.makeup_frequency as string) || "Not set"}
      />

      {/* CATEGORIES */}
      <SectionLabel>Categories</SectionLabel>
      {(["skincare", "makeup", "hair", "body", "fragrance", "nails", "tools", "accessories"] as const).map((cat) => {
        const level = categories?.[cat] ?? null;
        return (
          <Row
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            value={participationLabel(level)}
            valueClassName={participationColor(level)}
            chevron={false}
          />
        );
      })}

      {/* PREFERENCES */}
      <SectionLabel>Preferences</SectionLabel>
      <ToggleRow
        label="Clean beauty"
        checked={!!prefs.clean_beauty}
        onToggle={(v) => handlePreferenceToggle("clean_beauty", v)}
      />
      <ToggleRow
        label="Fragrance-free"
        checked={!!prefs.fragrance_free}
        onToggle={(v) => handlePreferenceToggle("fragrance_free", v)}
      />
      <ToggleRow
        label="Vegan"
        checked={!!prefs.vegan}
        onToggle={(v) => handlePreferenceToggle("vegan", v)}
      />
      <ToggleRow
        label="Cruelty-free"
        checked={!!prefs.cruelty_free}
        onToggle={(v) => handlePreferenceToggle("cruelty_free", v)}
      />

      {/* ACCOUNT */}
      <SectionLabel>Account</SectionLabel>
      <Row label="Subscription" />
      <Row label="Reset Profile" />
      <div className="flex justify-between items-center py-3 border-b border-parchment">
        <span className="font-sans text-[13px] text-risk">Clear Cabinet</span>
        <span className="text-sand text-sm">›</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex justify-between items-center py-3 border-b border-parchment w-full text-left"
      >
        <span className="font-sans text-[13px] text-risk">Sign Out</span>
        <span className="text-sand text-sm">›</span>
      </button>
    </div>
  );
}
