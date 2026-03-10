"use client";

import Link from "next/link";
import { ProductDot } from "@/components/product/product-dot";

interface CabinetItemProps {
  productId: string;
  brand: string;
  name: string;
  tag: string;
  isActive: boolean;
  onToggleLineup: () => void;
}

export function CabinetItem({
  productId,
  brand,
  name,
  tag,
  isActive,
  onToggleLineup,
}: CabinetItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-parchment">
      <Link href={`/product/${productId}`} className="flex items-center gap-3 flex-1 min-w-0">
        <ProductDot size={36} />
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[8px] text-stone uppercase tracking-[0.06em]">
            {brand}
          </div>
          <div className="font-sans text-xs text-ink leading-snug truncate">
            {name}
          </div>
        </div>
      </Link>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-sans text-[8px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border border-sand text-clay">
          {tag}
        </span>
        {isActive && (
          <button
            onClick={onToggleLineup}
            className="font-mono text-[8px] text-sage"
          >
            In lineup
          </button>
        )}
      </div>
    </div>
  );
}
