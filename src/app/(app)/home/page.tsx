"use client";

import { useCabinet } from "@/lib/hooks/use-cabinet";
import { useProfile } from "@/lib/hooks/use-profile";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Hair" },
  { key: "body", label: "Body" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

function getProfileCategoryField(
  profile: Record<string, unknown>,
  key: CategoryKey
): string {
  const field = `category_${key}`;
  return (profile[field] as string) ?? "inactive";
}

function getCategoryItems(
  items: Array<{ product: { category: string }; is_active: boolean }>,
  category: string
) {
  return items.filter(
    (item) => item.product?.category?.toLowerCase() === category
  );
}

export default function HomePage() {
  const { data: cabinet, isLoading: cabinetLoading } = useCabinet();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const loading = cabinetLoading || profileLoading;

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const items = (cabinet ?? []) as Array<{
    product: { category: string; brand: string; product_name: string; product_id: string };
    is_active: boolean;
  }>;
  const profileData = (profile ?? {}) as Record<string, unknown>;

  // Calculate overall alignment score as count of active products across active categories
  const activeCategories = CATEGORIES.filter(
    (c) => getProfileCategoryField(profileData, c.key) !== "inactive"
  );
  const totalActive = items.filter((i) => i.is_active).length;
  const alignmentScore =
    activeCategories.length > 0 && totalActive > 0
      ? Math.min(
          100,
          Math.round(
            (totalActive / (activeCategories.length * 3)) * 100
          )
        )
      : null;

  // "Selected for you" — products not already in cabinet
  // For MVP, show up to 3 placeholder recommendations
  const cabinetProductIds = new Set(
    items.map((i) => i.product?.product_id).filter(Boolean)
  );

  // MVP placeholders for selected-for-you
  const selectedForYou = [
    { brand: "Kiehl's", name: "Ultra Facial Cream", id: "rec-1" },
    { brand: "Tatcha", name: "Dewy Skin Cream", id: "rec-2" },
    { brand: "Paula's Choice", name: "2% BHA Exfoliant", id: "rec-3" },
  ].filter((p) => !cabinetProductIds.has(p.id));

  return (
    <div className="px-6 pb-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[26px] italic text-ink">Home</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-parchment bg-cream">
          <span className="font-sans text-[10px] text-stone">
            {(profileData.full_name as string)?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
        </div>
      </div>

      {/* Alignment Section */}
      <div className="mt-8">
        <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
          Alignment
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-5xl font-light text-ink">
            {alignmentScore !== null ? alignmentScore : "—"}
          </span>
          {alignmentScore !== null && (
            <span className="font-sans text-sm text-sage">+3</span>
          )}
        </div>
        <p className="mt-1 font-sans text-xs font-light text-stone">
          {alignmentScore !== null
            ? `Based on ${totalActive} active product${totalActive !== 1 ? "s" : ""} across ${activeCategories.length} categor${activeCategories.length !== 1 ? "ies" : "y"}`
            : "Add products to your cabinet to see your alignment score"}
        </p>
      </div>

      {/* Selected For You */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
            Selected For You
          </p>
          <Link
            href="/explore"
            className="font-sans text-[11px] text-vela-blue"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {selectedForYou.map((product) => (
            <div
              key={product.id}
              className="flex w-[100px] flex-shrink-0 flex-col items-center gap-1.5"
            >
              <ProductDot size={48} />
              <p className="font-sans text-[9px] text-stone">{product.brand}</p>
              <p className="line-clamp-2 text-center font-sans text-[11px] leading-tight text-ink">
                {product.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div className="mt-8 flex flex-col gap-3">
        {CATEGORIES.map((cat) => {
          const level = getProfileCategoryField(profileData, cat.key);
          const isActive = level !== "inactive";
          const catItems = getCategoryItems(items, cat.key);
          const activeCount = catItems.filter((i) => i.is_active).length;
          const totalCount = catItems.length;

          if (!isActive) {
            return (
              <div
                key={cat.key}
                className="rounded-[10px] border border-dashed border-sand p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm text-stone">{cat.label}</p>
                    <p className="mt-0.5 font-sans text-[11px] font-light text-stone">
                      Add 1 product to unlock
                    </p>
                  </div>
                  <Link
                    href="/cabinet"
                    className="font-sans text-[11px] text-vela-blue"
                  >
                    + Add
                  </Link>
                </div>
              </div>
            );
          }

          // Status descriptor
          let statusText: string;
          let statusColor: string;
          if (activeCount > 0) {
            statusText = `${activeCount} active`;
            statusColor = "text-sage";
          } else if (totalCount > 0) {
            statusText = "No active products";
            statusColor = "text-warm";
          } else {
            statusText = "Add products to unlock";
            statusColor = "text-risk";
          }

          return (
            <div
              key={cat.key}
              className="rounded-[10px] border border-parchment bg-cream p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-ink">{cat.label}</p>
                  <p
                    className={`mt-0.5 font-sans text-[11px] font-light ${statusColor}`}
                  >
                    {statusText}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-[22px] text-ink">
                    {totalCount}
                  </p>
                  <p className="font-mono text-[9px] text-stone">
                    {activeCount} active · {totalCount} total
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
