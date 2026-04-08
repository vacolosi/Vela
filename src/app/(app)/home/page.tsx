"use client";

import { useState } from "react";
import { useCabinet } from "@/lib/hooks/use-cabinet";
import { useProfile } from "@/lib/hooks/use-profile";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Haircare" },
  { key: "body", label: "Body" },
  { key: "fragrance", label: "Fragrance" },
  { key: "nails", label: "Nails" },
  { key: "tools", label: "Tools" },
  { key: "accessories", label: "Accessories" },
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

function getAlignmentTier(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "HIGH", color: "text-sage" };
  if (score >= 40) return { label: "MODERATE", color: "text-warm" };
  return { label: "LOW", color: "text-risk" };
}

export default function HomePage() {
  const { data: cabinet, isLoading: cabinetLoading } = useCabinet();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [changeLogOpen, setChangeLogOpen] = useState(false);

  const loading = cabinetLoading || profileLoading;

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const items = (cabinet ?? []) as Array<{
    product: { category: string; brand: string; product_name: string; product_id: string };
    is_active: boolean;
  }>;
  const profileData = (profile ?? {}) as Record<string, unknown>;

  // Personalized greeting
  const displayName = (profileData.display_name as string) ?? "there";
  const firstName = displayName.split(" ")[0];

  // Calculate alignment score
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

  const tier = alignmentScore !== null ? getAlignmentTier(alignmentScore) : null;

  // New user = fewer than 3 products in routine and no scan history
  const isNewUser = totalActive < 3;

  // Only show categories user has enabled
  const enabledCategories = CATEGORIES.filter(
    (c) => getProfileCategoryField(profileData, c.key) !== "inactive"
  );

  // MVP placeholders for Products For You — High and Moderate only
  const productsForYou = [
    { brand: "Kiehl's", name: "Ultra Facial Cream", id: "rec-1", tier: "High" as const },
    { brand: "Tatcha", name: "Dewy Skin Cream", id: "rec-2", tier: "High" as const },
    { brand: "Paula's Choice", name: "2% BHA Exfoliant", id: "rec-3", tier: "Moderate" as const },
  ];

  return (
    <div className="px-6 pb-8 pt-6">
      {/* Header — personalized greeting */}
      <h1 className="font-serif text-[26px] italic text-ink">
        Hi {firstName}
      </h1>

      {/* Alignment Section */}
      <div className="mt-8">
        <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
          Alignment{tier ? ` \u00B7 ${tier.label}` : ""}
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-5xl font-light text-ink">
            {alignmentScore !== null ? alignmentScore : "\u2014"}
          </span>
          {alignmentScore !== null && (
            <span className="font-serif text-2xl font-light text-stone">/100</span>
          )}
          {alignmentScore !== null && (
            <button
              onClick={() => setChangeLogOpen(!changeLogOpen)}
              className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 font-sans text-xs text-sage"
            >
              +3
            </button>
          )}
        </div>
        {changeLogOpen && alignmentScore !== null && (
          <div className="mt-2 rounded-lg border border-parchment bg-cream p-3">
            <p className="font-sans text-[11px] text-clay">
              Added SPF to morning routine (+5)
            </p>
            <p className="font-sans text-[11px] text-clay">
              Marked moisturizer as finished (-2)
            </p>
          </div>
        )}
        {alignmentScore === null && (
          <p className="mt-1 font-sans text-xs font-light text-stone">
            Add products to your cabinet to see your alignment score
          </p>
        )}
      </div>

      {/* Scan Prompt (new users) or Recent Scans (returning users) */}
      <div className="mt-8">
        {isNewUser ? (
          <Link
            href="/scan"
            className="block rounded-[10px] border border-parchment bg-cream p-4"
          >
            <p className="font-sans text-sm text-ink">
              Scan your first product
            </p>
            <p className="mt-1 font-sans text-[11px] font-light text-clay">
              Show the front label and we&apos;ll identify it for you.
            </p>
          </Link>
        ) : (
          <div>
            <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
              Recent Scans
            </p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {items.slice(0, 4).map((item) => (
                <Link
                  key={item.product.product_id}
                  href={`/product/${item.product.product_id}`}
                  className="flex w-[80px] flex-shrink-0 flex-col items-center gap-1.5"
                >
                  <ProductDot size={40} />
                  <p className="line-clamp-2 text-center font-sans text-[10px] leading-tight text-ink">
                    {item.product.product_name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products For You */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
            Products For You
          </p>
          <Link
            href="/explore"
            className="font-sans text-[11px] text-clay"
          >
            See all &rsaquo;
          </Link>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {productsForYou.map((product) => (
            <div
              key={product.id}
              className="flex w-[100px] flex-shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative">
                <ProductDot size={48} />
                {/* Tier dot */}
                <div
                  className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                    product.tier === "High" ? "bg-sage" : "bg-warm"
                  }`}
                />
              </div>
              <p className="font-sans text-[9px] text-stone">{product.brand}</p>
              <p className="line-clamp-2 text-center font-sans text-[11px] leading-tight text-ink">
                {product.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Cards — only enabled categories */}
      <div className="mt-8 flex flex-col gap-3">
        {enabledCategories.map((cat) => {
          const catItems = getCategoryItems(items, cat.key);
          const activeCount = catItems.filter((i) => i.is_active).length;
          const totalCount = catItems.length;

          let statusText: string;
          let statusColor: string;
          if (activeCount > 0) {
            statusText = `${activeCount} in routine`;
            statusColor = "text-sage";
          } else if (totalCount > 0) {
            statusText = "No active products";
            statusColor = "text-warm";
          } else {
            statusText = "Get started";
            statusColor = "text-clay";
          }

          return (
            <Link
              key={cat.key}
              href="/cabinet"
              className="block rounded-[10px] border border-parchment bg-cream p-4"
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
                    {activeCount} in routine · {totalCount} total
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
