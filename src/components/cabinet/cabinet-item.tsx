"use client";

import Link from "next/link";
import { Minus } from "lucide-react";
import { ProductDot } from "@/components/product/product-dot";

interface CabinetItemProps {
  productId: string;
  shadeId?: string | null;
  brand: string;
  name: string;
  tag: string;
  isActive: boolean;
  editMode?: boolean;
  imageUrl?: string | null;
  shadeName?: string | null;
  onToggleLineup: () => void;
  onRemove?: () => void;
}

export function CabinetItem({
  productId,
  shadeId,
  brand,
  name,
  tag,
  isActive,
  editMode,
  imageUrl,
  shadeName,
  onToggleLineup,
  onRemove,
}: CabinetItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-parchment">
      {editMode && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-risk flex items-center justify-center"
        >
          <Minus size={14} className="text-cream" />
        </button>
      )}
      <Link href={`/product/${productId}${shadeId ? `?shade=${shadeId}` : ""}`} className="flex items-center gap-3 flex-1 min-w-0">
        <ProductDot size={36} imageUrl={imageUrl} />
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[8px] text-stone uppercase tracking-[0.06em]">
            {brand}
          </div>
          <div className="font-sans text-xs text-ink leading-snug truncate">
            {name}
          </div>
          {shadeName && (
            <div className="font-sans text-[9px] text-clay truncate">
              {shadeName}
            </div>
          )}
        </div>
      </Link>
      {!editMode && (
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
      )}
    </div>
  );
}
