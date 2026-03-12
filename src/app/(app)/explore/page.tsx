"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductSearch } from "@/lib/hooks/use-products";
import { useFeaturedProducts, useBrands } from "@/lib/hooks/use-featured-products";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductDot } from "@/components/product/product-dot";

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Hair" },
  { key: "body", label: "Body" },
];

function ProductRow({
  product,
  onNavigate,
  onAdd,
  added,
}: {
  product: { product_id: string; brand: string; product_name: string; price: number | null; image_url: string | null; subcategory?: string; category?: string };
  onNavigate: () => void;
  onAdd: () => void;
  added: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-parchment">
      <button
        onClick={onNavigate}
        className="flex items-center gap-3 flex-1 text-left min-w-0"
      >
        <ProductDot size={36} imageUrl={product.image_url} />
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">{product.brand}</p>
          <p className="text-ink text-sm leading-snug">{product.product_name}</p>
          <div className="flex gap-2 mt-0.5">
            {product.subcategory && (
              <span className="font-sans text-[10px] text-stone capitalize">{product.subcategory}</span>
            )}
            {product.price != null && (
              <span className="text-clay text-[10px]">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </button>
      <button
        onClick={onAdd}
        disabled={added}
        className="flex-shrink-0 w-8 h-8 rounded-full border border-sand flex items-center justify-center transition-colors disabled:bg-sage disabled:border-sage"
      >
        {added ? (
          <Check size={14} className="text-cream" />
        ) : (
          <Plus size={16} className="text-clay" />
        )}
      </button>
    </div>
  );
}

type SearchMode = "products" | "brands";

export default function ExplorePage() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<SearchMode>("products");
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const isSearching = searchMode === "products" && debouncedQuery.length >= 2;
  const { data: searchResults, isLoading: searchLoading } = useProductSearch(
    isSearching ? debouncedQuery : ""
  );
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts(
    selectedCategory,
    selectedBrand ?? undefined
  );
  const { data: allBrandProducts } = useFeaturedProducts(
    undefined,
    selectedBrand ?? undefined
  );
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const brandCategories = selectedBrand && allBrandProducts
    ? CATEGORIES.filter((cat) =>
        allBrandProducts.some((p) => p.category?.toLowerCase() === cat.key)
      )
    : CATEGORIES;

  const addToCabinet = useAddToCabinet();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

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

  // Filter brands by search input
  const filteredBrands = brands?.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Switch between product/brand tabs
  const handleModeSwitch = (mode: SearchMode) => {
    setSearchMode(mode);
    setInputValue("");
    setDebouncedQuery("");
    setBrandSearch("");
  };

  // ── Brand detail view ─────────────────────────────────────────────
  if (selectedBrand) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <button
            onClick={() => {
              setSelectedBrand(null);
              setSelectedCategory(undefined);
            }}
            className="flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-stone" />
          </button>
          <h1 className="font-serif text-[26px] italic text-ink">{selectedBrand}</h1>
        </div>

        {brandCategories.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] whitespace-nowrap transition-colors ${
                !selectedCategory ? "bg-ink text-cream" : "border border-sand text-clay"
              }`}
            >
              All
            </button>
            {brandCategories.map((cat) => (
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
        )}

        {featuredLoading ? (
          <LoadingSpinner className="py-8" />
        ) : featured && featured.length === 0 ? (
          <EmptyState
            title="No products in this category"
            description={`${selectedBrand} doesn't have products in this category yet.`}
          />
        ) : (
          <div className="flex flex-col gap-1">
            {featured?.map((product) => (
              <ProductRow
                key={product.product_id}
                product={product}
                onNavigate={() => router.push(`/product/${product.product_id}`)}
                onAdd={() => handleAdd(product.product_id)}
                added={addedIds.has(product.product_id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main explore view ─────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="font-serif text-[26px] italic text-ink">Explore</h1>
      </div>

      {/* Products / Brands toggle */}
      <div className="flex mb-4 border-b border-parchment">
        <button
          onClick={() => handleModeSwitch("products")}
          className={`flex-1 pb-2.5 font-sans text-[11px] uppercase tracking-[0.1em] text-center transition-colors ${
            searchMode === "products"
              ? "text-ink font-medium border-b-2 border-ink"
              : "text-stone font-light"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => handleModeSwitch("brands")}
          className={`flex-1 pb-2.5 font-sans text-[11px] uppercase tracking-[0.1em] text-center transition-colors ${
            searchMode === "brands"
              ? "text-ink font-medium border-b-2 border-ink"
              : "text-stone font-light"
          }`}
        >
          Brands
        </button>
      </div>

      {/* ── Products mode ──────────────────────────────────────────── */}
      {searchMode === "products" && (
        <>
          <div className="relative mb-5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products..."
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
                <ProductRow
                  key={product.product_id}
                  product={product}
                  onNavigate={() => router.push(`/product/${product.product_id}`)}
                  onAdd={() => handleAdd(product.product_id)}
                  added={addedIds.has(product.product_id)}
                />
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
                    <ProductRow
                      key={product.product_id}
                      product={product}
                      onNavigate={() => router.push(`/product/${product.product_id}`)}
                      onAdd={() => handleAdd(product.product_id)}
                      added={addedIds.has(product.product_id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Brands mode ────────────────────────────────────────────── */}
      {searchMode === "brands" && (
        <>
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full bg-cream rounded-lg border border-parchment py-2.5 pl-9 pr-4 font-sans text-base text-ink placeholder:text-sand focus:outline-none focus:ring-1 focus:ring-stone"
            />
          </div>

          {brandsLoading ? (
            <LoadingSpinner className="py-8" />
          ) : filteredBrands && filteredBrands.length === 0 ? (
            <EmptyState title="No brands found" description="Try a different search term." />
          ) : (
            <div className="flex-1 overflow-y-auto">
              {filteredBrands?.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => {
                    setSelectedBrand(brand.name);
                    setSelectedCategory(undefined);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3.5 border-b border-parchment text-left"
                >
                  <div>
                    <p className="font-sans text-sm text-ink">{brand.name}</p>
                    <p className="font-sans text-[10px] text-stone mt-0.5">
                      {brand.count} product{brand.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-sand flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
