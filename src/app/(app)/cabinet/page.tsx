"use client";

import { useState } from "react";
import Link from "next/link";
import { useCabinet, useToggleLineup, useRemoveFromCabinet } from "@/lib/hooks/use-cabinet";
import { CabinetItem } from "@/components/cabinet/cabinet-item";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

const TABS = ["All", "Skincare", "Makeup", "Hair", "Body"] as const;
type Tab = (typeof TABS)[number];

function getTag(product: {
  category: string;
  subcategory: string;
  primary_functions: string[] | null;
}): string {
  if (
    product.category === "skincare" &&
    product.primary_functions?.length
  ) {
    return product.primary_functions[0];
  }
  return product.subcategory || product.category;
}

export default function CabinetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [editMode, setEditMode] = useState(false);
  const { data: items, isLoading } = useCabinet();
  const toggleLineup = useToggleLineup();
  const removeFromCabinet = useRemoveFromCabinet();

  const filtered =
    items?.filter((item) => {
      if (activeTab === "All") return true;
      return (
        item.product?.category?.toLowerCase() === activeTab.toLowerCase()
      );
    }) ?? [];

  const totalCount = items?.length ?? 0;
  const lineupCount =
    items?.filter((item) => item.is_active).length ?? 0;

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-2xl italic text-ink">Cabinet</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="font-sans text-xs text-vela-blue"
        >
          {editMode ? "Done" : "Edit"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-parchment">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-sans text-[10px] uppercase tracking-[0.06em] transition-colors ${
              activeTab === tab
                ? "text-ink font-medium border-b-2 border-ink"
                : "text-stone font-light"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base text-ink">{totalCount}</span>
          <span className="font-sans text-[10px] text-stone">total</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base text-sage">{lineupCount}</span>
          <span className="font-sans text-[10px] text-stone">in lineup</span>
        </div>
      </div>

      {/* Product list */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Your cabinet is empty"
          description="Scan or search to add your first product."
          actionLabel="Add a product"
          actionHref="/scan"
        />
      ) : (
        <div>
          {filtered.map((item) => (
            <CabinetItem
              key={item.id}
              productId={item.product_id}
              brand={item.product?.brand ?? ""}
              name={item.product?.product_name ?? ""}
              tag={
                item.product
                  ? getTag(item.product)
                  : ""
              }
              isActive={item.is_active}
              editMode={editMode}
              onToggleLineup={() =>
                toggleLineup.mutate({
                  id: item.id,
                  isActive: !item.is_active,
                })
              }
              onRemove={() => removeFromCabinet.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
