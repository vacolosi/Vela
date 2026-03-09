"use client";

import { useState } from "react";
import Link from "next/link";
import { useCabinet, useToggleLineup } from "@/lib/hooks/use-cabinet";
import { CabinetItem } from "@/components/cabinet/cabinet-item";

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
  const { data: items, isLoading } = useCabinet();
  const toggleLineup = useToggleLineup();

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
        <Link
          href="/cabinet"
          className="font-sans text-xs text-vela-blue"
        >
          Edit
        </Link>
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
        <div className="py-12 text-center">
          <span className="font-sans text-xs text-stone">Loading...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-sans text-sm text-stone mb-2">
            Your cabinet is empty.
          </p>
          <p className="font-sans text-xs text-stone">
            <Link href="/scan" className="text-vela-blue underline">
              Scan or search
            </Link>{" "}
            to add your first product.
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <CabinetItem
              key={item.id}
              brand={item.product?.brand ?? ""}
              name={item.product?.product_name ?? ""}
              tag={
                item.product
                  ? getTag(item.product)
                  : ""
              }
              isActive={item.is_active}
              onToggleLineup={() =>
                toggleLineup.mutate({
                  id: item.id,
                  isActive: !item.is_active,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
