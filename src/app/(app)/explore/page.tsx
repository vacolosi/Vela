"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProductSearch } from "@/lib/hooks/use-products";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

/* ── hardcoded MVP data ─────────────────────────────── */

const selectedProducts = [
  { id: "supergoop-unseen", brand: "Supergoop", name: "Unseen SPF 50", price: "$38" },
  { id: "ordinary-ha", brand: "The Ordinary", name: "HA 2% + B5", price: "$9" },
  { id: "rhode-barrier", brand: "Rhode", name: "Barrier Butter", price: "$36" },
];

const trendingEdits = [
  {
    name: "Summer Glow",
    creator: "Alix Earle",
    saves: "2.1k",
    gradientFrom: "from-warm-light",
    gradientTo: "to-cream",
  },
  {
    name: "Glass Skin",
    creator: "Nikki",
    saves: "1.8k",
    gradientFrom: "from-blue-wash",
    gradientTo: "to-cream",
  },
  {
    name: "90s Brown Lip",
    creator: "Maya",
    saves: "943",
    gradientFrom: "from-walnut",
    gradientTo: "to-espresso",
    dark: true,
  },
];

const cabinets = [
  {
    name: "Alix Earle",
    handle: "@alixearle",
    products: 47,
    common: 8,
    desc: "Full glam \u00b7 Dewy base \u00b7 Bold lip",
    initial: "A",
  },
  {
    name: "Hyram",
    handle: "@hyram",
    products: 23,
    common: 12,
    desc: "Skincare-focused \u00b7 Minimal makeup",
    initial: "H",
  },
];

/* ── component ──────────────────────────────────────── */

export default function ExplorePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: products, isLoading } = useProductSearch(debouncedQuery);
  const isSearching = debouncedQuery.length >= 2;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="font-serif text-[26px] italic text-ink">Explore</h1>
        <div className="h-8 w-8 rounded-full bg-parchment" />
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sand"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products, brands, people..."
          className="w-full bg-cream rounded-lg border border-parchment py-2.5 pl-9 pr-4 font-sans text-xs text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
        />
      </div>

      {/* ── Search results ── */}
      {isSearching && (
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <LoadingSpinner className="py-8" />
          )}
          {!isLoading && products && products.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try a different search term or browse our curated selections below."
            />
          )}
          {products &&
            products.map((product) => (
              <button
                key={product.product_id}
                onClick={() => router.push(`/product/${product.product_id}`)}
                className="w-full text-left px-3 py-3 border-b border-parchment hover:bg-cream/50 transition-colors"
              >
                <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">
                  {product.brand}
                </p>
                <p className="text-ink text-sm leading-snug">
                  {product.product_name}
                </p>
                {product.price != null && (
                  <p className="text-clay text-[11px] mt-0.5">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </button>
            ))}
        </div>
      )}

      {/* ── Browse sections (hidden while searching) ── */}
      {!isSearching && (
        <>
          {/* Selected */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
                Selected
              </p>
              <button className="font-sans text-[10px] text-vela-blue">
                See all &rarr;
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="min-w-[105px] rounded-lg border border-parchment flex-shrink-0"
                >
                  <div className="bg-cream rounded-t-lg flex items-center justify-center py-4">
                    <ProductDot size={36} />
                  </div>
                  <div className="px-2 py-2">
                    <p className="font-sans text-[9px] uppercase tracking-[0.12em] text-stone leading-tight">
                      {p.brand}
                    </p>
                    <p className="font-sans text-[11px] text-ink leading-snug mt-0.5">
                      {p.name}
                    </p>
                    <p className="font-sans text-[11px] text-clay mt-0.5">
                      {p.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Edits */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
                Trending Edits
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {trendingEdits.map((edit) => (
                <div
                  key={edit.name}
                  className="min-w-[130px] rounded-lg border border-parchment flex-shrink-0"
                >
                  <div
                    className={`h-24 rounded-t-lg bg-gradient-to-b ${edit.gradientFrom} ${edit.gradientTo} flex items-end p-3`}
                  >
                    <p
                      className={`font-serif text-sm italic leading-tight ${
                        edit.dark ? "text-cream" : "text-ink"
                      }`}
                    >
                      {edit.name}
                    </p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="font-sans text-[11px] text-ink">
                      {edit.creator}
                    </p>
                    <p className="font-sans text-[10px] text-stone">
                      {edit.saves} saves
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cabinets to Explore */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
                Cabinets to Explore
              </p>
              <button className="font-sans text-[10px] text-vela-blue">
                See all &rarr;
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {cabinets.map((cab) => (
                <div
                  key={cab.handle}
                  className="bg-cream rounded-[10px] border border-parchment p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-parchment flex items-center justify-center">
                      <span className="font-serif text-sm text-ink">
                        {cab.initial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-sans text-sm text-ink font-medium">
                        {cab.name}
                      </p>
                      <p className="font-sans text-[11px] text-stone">
                        {cab.handle}
                      </p>
                    </div>
                    <button className="font-sans text-[11px] text-vela-blue border border-vela-blue rounded-full px-3 py-1">
                      View
                    </button>
                  </div>
                  <p className="font-sans text-[11px] text-clay mb-2">
                    {cab.desc}
                  </p>
                  <div className="flex gap-4">
                    <p className="font-sans text-[10px] text-stone">
                      <span className="text-ink font-medium">{cab.products}</span>{" "}
                      products
                    </p>
                    <p className="font-sans text-[10px] text-stone">
                      <span className="text-ink font-medium">{cab.common}</span>{" "}
                      in common
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
