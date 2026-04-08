"use client";

import { useEffect, useState } from "react";

interface AlignmentBarProps {
  tier: "Low" | "Moderate" | "High";
  score: number; // 0-1 from engine
  summary: string;
  riskPreview?: string | null;
  children?: React.ReactNode; // For collapsed details
}

export function AlignmentBar({ tier, score, summary, riskPreview, children }: AlignmentBarProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Map 0-1 score to bar percentage (10-90 range to keep dot visible)
  const barPercent = 10 + score * 80;
  const tierColor = tier === "Low" ? "text-risk" : tier === "Moderate" ? "text-warm" : "text-sage";
  const dotColor = tier === "Low" ? "bg-risk" : tier === "Moderate" ? "bg-warm" : "bg-sage";
  const fillColor = tier === "Low" ? "bg-risk/30" : tier === "Moderate" ? "bg-warm/30" : "bg-sage/30";

  return (
    <div className="bg-cream rounded-[10px] border border-parchment p-4">
      <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-3">
        Alignment
      </div>

      {/* Bar labels */}
      <div className="flex justify-between mb-1.5">
        {["Low", "Moderate", "High"].map((l) => (
          <span key={l} className="font-sans text-[8px] text-sand">{l}</span>
        ))}
      </div>

      {/* Animated bar */}
      <div className="h-[3px] bg-parchment rounded-full relative mb-3.5">
        {/* Fill */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${fillColor}`}
          style={{ width: animated ? `${barPercent}%` : "0%" }}
        />
        {/* Dot */}
        <div
          className={`absolute -top-[5px] w-[13px] h-[13px] rounded-full border-[2.5px] border-vela-white shadow-sm -translate-x-1/2 transition-all duration-700 ease-out ${dotColor}`}
          style={{ left: animated ? `${barPercent}%` : "0%" }}
        />
      </div>

      {/* Tier label — fades in after bar animation */}
      <div
        className={`transition-opacity duration-300 ${animated ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "700ms" }}
      >
        <div className={`font-sans text-sm font-medium mb-1 ${tierColor}`}>{tier}</div>
      </div>

      {/* Summary */}
      <div className="font-sans text-xs text-clay font-light leading-relaxed">{summary}</div>

      {/* Risk preview (collapsed) */}
      {riskPreview && (
        <div className="mt-3 pt-3 border-t border-parchment">
          <p className="font-sans text-xs text-risk font-light leading-relaxed">
            {riskPreview}
          </p>
        </div>
      )}

      {/* Expandable details (Overlap / Coverage / Compatibility) */}
      {children}
    </div>
  );
}
