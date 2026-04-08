"use client";

import { useState } from "react";
import { useCabinet, useToggleLineup, useRemoveFromCabinet } from "@/lib/hooks/use-cabinet";
import { useProfile } from "@/lib/hooks/use-profile";
import { CabinetItem } from "@/components/cabinet/cabinet-item";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Settings } from "lucide-react";

const CATEGORY_TABS = [
  { key: "all", label: "All" },
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Haircare" },
] as const;

type CategoryTab = (typeof CATEGORY_TABS)[number]["key"];

function getTag(product: {
  category: string;
  subcategory: string;
  primary_functions: string[] | null;
}): string {
  if (product.category === "skincare" && product.primary_functions?.length) {
    return product.primary_functions[0];
  }
  return product.subcategory || product.category;
}

export default function CabinetPage() {
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [showAllCollection, setShowAllCollection] = useState(false);
  const { data: items, isLoading: cabinetLoading } = useCabinet();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const toggleLineup = useToggleLineup();
  const removeFromCabinet = useRemoveFromCabinet();

  const loading = cabinetLoading || profileLoading;

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const allItems = items ?? [];
  const profileData = (profile ?? {}) as Record<string, unknown>;

  const displayName = (profileData.display_name as string) ?? "You";
  const username = (profileData.username as string) ?? null;
  const bio = (profileData.bio as string) ?? null;

  // Stats
  const totalProducts = allItems.length;
  const routineItems = allItems.filter((item) => item.is_active);
  const routineCount = routineItems.length;

  // Alignment score (same calc as home)
  const alignmentScore =
    totalProducts > 0 && routineCount > 0
      ? Math.min(100, Math.round((routineCount / Math.max(totalProducts, 1)) * 100))
      : null;
  const tier =
    alignmentScore !== null
      ? alignmentScore >= 70
        ? "High"
        : alignmentScore >= 40
          ? "Moderate"
          : "Low"
      : null;
  const tierColor =
    tier === "High" ? "text-sage" : tier === "Moderate" ? "text-warm" : "text-risk";

  // Collection = non-routine items
  const collectionItems = allItems.filter((item) => !item.is_active);

  // Filter by category tab
  function filterByCategory<T extends { product?: { category?: string } }>(list: T[]): T[] {
    if (categoryTab === "all") return list;
    return list.filter(
      (item) => item.product?.category?.toLowerCase() === categoryTab
    );
  }

  const filteredRoutine = filterByCategory(routineItems);
  const filteredCollection = filterByCategory(collectionItems);
  const displayCollection = showAllCollection
    ? filteredCollection
    : filteredCollection.slice(0, 5);

  return (
    <div className="p-6 pb-24">
      {/* Header — gear icon for settings */}
      <div className="flex items-center justify-end mb-2">
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-parchment bg-cream"
        >
          <Settings size={14} className="text-stone" />
        </Link>
      </div>

      {/* Centered profile */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-clay flex items-center justify-center mb-3">
          <span className="font-serif text-2xl text-cream italic">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-serif text-xl text-ink">{displayName}</h1>

        {/* Username */}
        {username && (
          <p className="font-sans text-xs text-stone font-light">@{username}</p>
        )}

        {/* Bio */}
        {bio && (
          <p className="font-sans text-xs text-clay font-light mt-1.5 max-w-[250px]">
            {bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="font-mono text-base text-ink">{totalProducts}</p>
            <p className="font-sans text-[9px] text-stone uppercase tracking-wide">Products</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-base text-ink">{routineCount}</p>
            <p className="font-sans text-[9px] text-stone uppercase tracking-wide">In Routine</p>
          </div>
        </div>
      </div>

      {/* Alignment card — tappable, links to routine */}
      {alignmentScore !== null && (
        <Link
          href="#routine"
          className="block rounded-[10px] border border-parchment bg-cream p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
                Alignment
              </p>
              <p className={`font-sans text-sm font-medium mt-0.5 ${tierColor}`}>
                {tier}
              </p>
            </div>
            <span className="font-serif text-3xl font-light text-ink">
              {alignmentScore}<span className="text-lg text-stone">/100</span>
            </span>
          </div>
        </Link>
      )}

      {/* Category tabs — always show all three, disabled ones dimmed */}
      <div className="flex gap-4 mb-6 border-b border-parchment overflow-x-auto scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryTab(tab.key)}
            className={`pb-2 font-sans text-[10px] uppercase tracking-[0.06em] whitespace-nowrap transition-colors ${
              categoryTab === tab.key
                ? "text-ink font-medium border-b-2 border-ink"
                : "text-stone font-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {allItems.length === 0 ? (
        <EmptyState
          title="Your cabinet is empty"
          description="Scan or search to add your first product."
          actionLabel="Add a product"
          actionHref="/scan"
        />
      ) : (
        <>
          {/* My Routine — horizontal swipe cards */}
          <div id="routine" className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
                My routine &middot; {filteredRoutine.length} product{filteredRoutine.length !== 1 ? "s" : ""}
              </p>
              {filteredRoutine.length > 0 && (
                <Link href="/cabinet/routine" className="font-sans text-[11px] text-clay">
                  Full view &rsaquo;
                </Link>
              )}
            </div>

            {filteredRoutine.length === 0 ? (
              <p className="font-sans text-xs text-stone font-light">
                No products in your routine yet. Tap a product to add it.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {filteredRoutine.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product_id}${item.shade_id ? `?shade=${item.shade_id}` : ""}`}
                    className="flex-shrink-0 w-[100px] flex flex-col items-center gap-1.5"
                  >
                    <div className="relative">
                      <ProductDot
                        size={48}
                        imageUrl={item.shade?.product_image_url || item.product?.image_url}
                      />
                      {/* AM/PM badge */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex">
                        <span className="font-sans text-[7px] px-1 py-0.5 rounded-l bg-warm/80 text-white leading-none">
                          AM
                        </span>
                        <span className="font-sans text-[7px] px-1 py-0.5 rounded-r bg-blue-400/80 text-white leading-none">
                          PM
                        </span>
                      </div>
                    </div>
                    <p className="font-sans text-[8px] text-stone uppercase tracking-wide mt-1">
                      {item.product?.brand}
                    </p>
                    <p className="line-clamp-2 text-center font-sans text-[10px] leading-tight text-ink">
                      {item.product?.product_name}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Collection — vertical list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
                Collection
              </p>
              {filteredCollection.length > 5 && !showAllCollection && (
                <button
                  onClick={() => setShowAllCollection(true)}
                  className="font-sans text-[11px] text-clay"
                >
                  See all {filteredCollection.length} &rsaquo;
                </button>
              )}
            </div>

            {filteredCollection.length === 0 ? (
              <p className="font-sans text-xs text-stone font-light">
                Products not in your routine will appear here.
              </p>
            ) : (
              <div>
                {displayCollection.map((item) => (
                  <CabinetItem
                    key={item.id}
                    productId={item.product_id}
                    shadeId={item.shade_id}
                    brand={item.product?.brand ?? ""}
                    name={item.product?.product_name ?? ""}
                    shadeName={item.shade?.shade_name}
                    imageUrl={item.shade?.product_image_url || item.product?.image_url}
                    tag={item.product ? getTag(item.product) : ""}
                    isActive={item.is_active}
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

            {/* Add prescription link */}
            <Link
              href="/cabinet/prescription"
              className="block mt-4 font-sans text-[11px] text-clay text-center"
            >
              + Add prescription
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
