"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { useQueryClient } from "@tanstack/react-query";

const DEPTHS = ["Fair", "Light", "Light-Medium", "Medium", "Medium-Deep", "Deep", "Deep-Dark"];
const UNDERTONES = ["Warm", "Cool", "Neutral", "Olive"];

interface ShadeProfilePromptProps {
  onClose: () => void;
  /** If a foundation shade was auto-detected, pass it here */
  autoDetected?: { depth: string; undertone: string } | null;
}

export function ShadeProfilePrompt({ onClose, autoDetected }: ShadeProfilePromptProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"auto" | "search" | "manual">(
    autoDetected ? "auto" : "manual"
  );
  const [searchInput, setSearchInput] = useState("");
  const [depth, setDepth] = useState(autoDetected?.depth ?? "");
  const [undertone, setUndertone] = useState(autoDetected?.undertone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user || !depth || !undertone) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ shade_depth: depth, shade_undertone: undertone })
      .eq("id", user.id);

    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-ink/30 z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-vela-white rounded-t-2xl p-6 pb-8">
        <div className="w-10 h-1 bg-sand rounded-full mx-auto mb-5" />

        <h2 className="font-serif text-lg text-ink mb-1">Set your shade profile</h2>
        <p className="font-sans text-xs text-clay font-light mb-5">
          This helps us match face products to your skin tone.
        </p>

        {/* Auto-detected confirmation */}
        {mode === "auto" && autoDetected && (
          <div className="mb-5">
            <div className="bg-cream rounded-lg border border-parchment p-4 mb-3">
              <p className="font-sans text-xs text-stone mb-1">Based on your foundation, you&apos;re approximately:</p>
              <p className="font-sans text-sm text-ink font-medium">
                {autoDetected.depth}, {autoDetected.undertone}
              </p>
            </div>
            <p className="font-sans text-xs text-clay mb-3">Does this look right?</p>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-ink rounded-lg py-2.5 font-sans text-sm text-cream"
              >
                Yes, that&apos;s me
              </button>
              <button
                onClick={() => setMode("manual")}
                className="flex-1 border border-sand rounded-lg py-2.5 font-sans text-sm text-clay"
              >
                Let me adjust
              </button>
            </div>
          </div>
        )}

        {/* Search mode — enter a foundation shade */}
        {mode === "search" && (
          <div className="mb-5">
            <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
              Enter a foundation shade you wear
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. Fenty 250W, MAC NC30"
              className="w-full bg-cream rounded-lg border border-parchment py-2.5 px-4 font-sans text-sm text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone mb-3"
            />
            <button
              onClick={() => setMode("manual")}
              className="font-sans text-[11px] text-clay"
            >
              Or select manually instead
            </button>
          </div>
        )}

        {/* Manual selection */}
        {mode === "manual" && (
          <>
            <div className="mb-4">
              <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
                Depth
              </label>
              <div className="flex flex-wrap gap-2">
                {DEPTHS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={`rounded-full px-3 py-1.5 font-sans text-[11px] transition-colors ${
                      depth === d
                        ? "bg-ink text-cream"
                        : "border border-sand text-clay"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2 block">
                Undertone
              </label>
              <div className="flex flex-wrap gap-2">
                {UNDERTONES.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUndertone(u)}
                    className={`rounded-full px-3 py-1.5 font-sans text-[11px] transition-colors ${
                      undertone === u
                        ? "bg-ink text-cream"
                        : "border border-sand text-clay"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab to switch to shade search */}
            <button
              onClick={() => setMode("search")}
              className="font-sans text-[11px] text-clay mb-5 block"
            >
              Or enter a foundation shade instead
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !depth || !undertone}
              className="w-full bg-ink rounded-lg py-3 font-sans text-sm text-cream disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Save Shade Profile"}
            </button>
          </>
        )}

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full text-center font-sans text-[11px] text-stone mt-3"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
