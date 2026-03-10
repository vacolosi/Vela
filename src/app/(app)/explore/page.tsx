"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Check } from "lucide-react";
import { useProductSearch } from "@/lib/hooks/use-products";
import { useFeaturedProducts } from "@/lib/hooks/use-featured-products";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Hair" },
  { key: "body", label: "Body" },
];

export default function ExplorePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchResults, isLoading: searchLoading } = useProductSearch(debouncedQuery);
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(selectedCategory);
  const addToCabinet = useAddToCabinet();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const isSearching = debouncedQuery.length >= 2;

  const handleAdd = (productId: string) => {
    addToCabinet.mutate(
      { productId },
      {
        onSuccess: () => {
          setAddedIds((prev) => new Set(prev).add(productId));
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="font-serif text-[26px] italic text-ink">Explore</h1>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products or brands..."
          className="w-full bg-cream rounded-lg border border-parchment py-2.5 pl-9 pr-4 font-sans text-base text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
        />
      </div>

      {isSearching ? (
        <div className="flex-1 overflow-y-auto">
          {searchLoading && <LoadingSpinner className="py-8" />}
          {!searchLoading && searchResults && searchResults.length === 0 && (
            <EmptyState title="No products found" description="Try a different search term." />
          )}
          {searchResults?.map((product) => (
            <div
              key={product.product_id}
              className="flex items-center gap-3 px-3 py-3 border-b border-parchment"
            >
              <button
                onClick={() => router.push(`/product/${product.product_id}`)}
                className="flex-1 text-left min-w-0"
              >
                <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">{product.brand}</p>
                <p className="text-ink text-sm leading-snug">{product.product_name}</p>
                {product.price != null && (
                  <p className="text-clay text-[11px] mt-0.5">${product.price.toFixed(2)}</p>
                )}
              </button>
              <button
                onClick={() => handleAdd(product.product_id)}
                disabled={addedIds.has(product.product_id)}
                className="flex-shrink-0 w-8 h-8 rounded-full border border-sand flex items-center justify-center transition-colors disabled:bg-sage disabled:border-sage"
              >
                {addedIds.has(product.product_id) ? (
                  <Check size={14} className="text-cream" />
                ) : (
                  <Plus size={16} className="text-clay" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] whitespace-nowrap transition-colors ${
                !selectedCategory ? "bg-ink text-cream" : "border border-sand text-clay"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-3 py-1.5 font-sans text-[11px] whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key ? "bg-ink text-cream" : "border border-sand text-clay"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {featuredLoading ? (
            <LoadingSpinner className="py-8" />
          ) : featured && featured.length === 0 ? (
            <EmptyState title="No products yet" description="Products are being added. Check back soon!" />
          ) : (
            <div className="flex flex-col gap-1">
              {featured?.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-3 px-3 py-3 border-b border-parchment"
                >
                  <button
                    onClick={() => router.push(`/product/${product.product_id}`)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">{product.brand}</p>
                    <p className="text-ink text-sm leading-snug">{product.product_name}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="font-sans text-[10px] text-stone capitalize">{product.subcategory}</span>
                      {product.price != null && (
                        <span className="text-clay text-[10px]">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => handleAdd(product.product_id)}
                    disabled={addedIds.has(product.product_id)}
                    className="flex-shrink-0 w-8 h-8 rounded-full border border-sand flex items-center justify-center transition-colors disabled:bg-sage disabled:border-sage"
                  >
                    {addedIds.has(product.product_id) ? (
                      <Check size={14} className="text-cream" />
                    ) : (
                      <Plus size={16} className="text-clay" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
