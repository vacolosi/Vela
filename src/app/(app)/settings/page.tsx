"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

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
        {chevron && <span className="text-sand text-sm">&rsaquo;</span>}
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

function CategoryToggleRow({
  label,
  level,
  onToggle,
}: {
  label: string;
  level: string;
  onToggle: (v: boolean) => void;
}) {
  const isActive = level === "active" || level === "occasional";
  return (
    <div className="flex justify-between items-center py-3 border-b border-parchment">
      <span className="font-sans text-[13px] text-ink">{label}</span>
      <Switch checked={isActive} onCheckedChange={onToggle} size="sm" />
    </div>
  );
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

      queryClient.setQueryData(
        ["profile", user.id],
        (old: Record<string, unknown> | undefined) =>
          old ? { ...old, preferences: updated } : old
      );
    },
    [user, profile, supabase, queryClient]
  );

  const handleCategoryToggle = useCallback(
    async (cat: string, value: boolean) => {
      if (!user) return;

      const field = `category_${cat}`;
      const newLevel = value ? "active" : "inactive";

      await supabase
        .from("profiles")
        .update({ [field]: newLevel })
        .eq("id", user.id);

      queryClient.setQueryData(
        ["profile", user.id],
        (old: Record<string, unknown> | undefined) =>
          old ? { ...old, [field]: newLevel } : old
      );
    },
    [user, supabase, queryClient]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [supabase, router]);

  const prefs = (profile?.preferences as Record<string, boolean> | null) ?? {};

  const shadeValue = [profile?.shade_depth, profile?.shade_undertone]
    .filter(Boolean)
    .join(", ");

  const goalsValue = Array.isArray(profile?.skincare_goals)
    ? (profile.skincare_goals as string[]).join(", ")
    : "";

  const concernsValue = Array.isArray(profile?.skincare_concerns)
    ? (profile.skincare_concerns as string[]).join(", ")
    : "";

  const bio = (profile?.bio as string) ?? "";

  if (profileLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="px-6 pb-28">
      {/* Header — breadcrumb: Cabinet › Settings */}
      <div className="flex items-center gap-2 pt-6 pb-4">
        <button onClick={() => router.push("/cabinet")} className="flex-shrink-0">
          <ChevronLeft size={18} className="text-stone" />
        </button>
        <p className="font-sans text-xs text-stone">
          Cabinet &rsaquo; <span className="text-ink">Settings</span>
        </p>
      </div>

      {/* PROFILE */}
      <SectionLabel>Profile</SectionLabel>
      <Row label="Shade Profile" value={shadeValue || "Not set"} />
      <Row label="Skin Type" value="Not set" />
      <Row label="Skincare Concerns" value={concernsValue || "Not set"} />
      <Row label="Haircare Concerns" value="Not set" />
      <Row label="Bio" value={bio || "Edit"} />

      {/* MAKEUP */}
      <SectionLabel>Makeup</SectionLabel>
      <Row
        label="Identity"
        value={(profile?.makeup_identity as string) || "Not set"}
      />

      {/* CATEGORIES — toggle switches */}
      <SectionLabel>Categories</SectionLabel>
      {([
        { key: "skincare", label: "Skincare" },
        { key: "makeup", label: "Makeup" },
        { key: "hair", label: "Haircare" },
      ] as const).map((cat) => {
        const level = (profile?.[`category_${cat.key}`] as string) ?? "inactive";
        return (
          <CategoryToggleRow
            key={cat.key}
            label={cat.label}
            level={level}
            onToggle={(v) => handleCategoryToggle(cat.key, v)}
          />
        );
      })}

      {/* PREFERENCES */}
      <SectionLabel>Preferences</SectionLabel>
      <ToggleRow
        label="Clean beauty"
        checked={!!prefs.clean}
        onToggle={(v) => handlePreferenceToggle("clean", v)}
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
        <span className="text-sand text-sm">&rsaquo;</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex justify-between items-center py-3 border-b border-parchment w-full text-left"
      >
        <span className="font-sans text-[13px] text-risk">Sign Out</span>
        <span className="text-sand text-sm">&rsaquo;</span>
      </button>
    </div>
  );
}
