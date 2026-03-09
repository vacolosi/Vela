"use client";

interface AlignmentBarProps {
  tier: "Low" | "Moderate" | "High";
  summary: string;
}

export function AlignmentBar({ tier, summary }: AlignmentBarProps) {
  const position = tier === "Low" ? "left-[15%]" : tier === "Moderate" ? "left-[50%]" : "left-[85%]";
  const tierColor = tier === "Low" ? "text-risk" : tier === "Moderate" ? "text-warm" : "text-sage";

  return (
    <div className="bg-cream rounded-[10px] border border-parchment p-4">
      <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-3">Alignment</div>
      <div className="flex justify-between mb-1.5">
        {["Low", "Moderate", "High"].map((l) => (
          <span key={l} className="font-sans text-[8px] text-sand">{l}</span>
        ))}
      </div>
      <div className="h-[3px] bg-parchment rounded-full relative mb-3.5">
        <div className={`absolute ${position} -top-[5px] w-[13px] h-[13px] rounded-full border-[2.5px] border-vela-white shadow-sm -translate-x-1/2 ${
          tier === "Low" ? "bg-risk" : tier === "Moderate" ? "bg-warm" : "bg-sage"
        }`} />
      </div>
      <div className={`font-sans text-sm font-medium mb-1 ${tierColor}`}>{tier}</div>
      <div className="font-sans text-xs text-clay font-light leading-relaxed">{summary}</div>
    </div>
  );
}
