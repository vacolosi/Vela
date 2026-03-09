"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProductSearch } from "@/lib/hooks/use-products";
import { X, Search } from "lucide-react";

type Mode = "check" | "add";

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("check");
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: products, isLoading } = useProductSearch(debouncedQuery);
  const hasQuery = debouncedQuery.length >= 2;

  return (
    <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col relative">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 text-stone z-10"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Label */}
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone mb-4">
          Search by name or brand
        </p>

        {/* Mode toggle */}
        <div className="bg-espresso rounded-lg flex p-1 mb-3 w-full max-w-xs">
          <button
            onClick={() => setMode("check")}
            className={`flex-1 py-2 text-[11px] font-sans uppercase tracking-wider rounded-md transition-colors ${
              mode === "check"
                ? "bg-walnut text-cream"
                : "text-stone"
            }`}
          >
            Scan to Check
          </button>
          <button
            onClick={() => setMode("add")}
            className={`flex-1 py-2 text-[11px] font-sans uppercase tracking-wider rounded-md transition-colors ${
              mode === "add"
                ? "bg-walnut text-cream"
                : "text-stone"
            }`}
          >
            Scan to Add
          </button>
        </div>

        {/* Explanation text */}
        <p className="text-clay text-[10px] text-center mb-8 max-w-xs">
          Check: see alignment before buying. Add: batch-add at home.
        </p>

        {/* Viewfinder (decorative) — hidden when results showing */}
        {!hasQuery && (
          <div className="relative w-56 h-56 mb-8">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-stone rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-stone rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-stone rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-stone rounded-br-sm" />

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-stone text-[10px] font-sans uppercase tracking-[0.18em]">
                Point at product barcode
              </p>
            </div>
          </div>
        )}

        {/* Search results */}
        {hasQuery && (
          <div className="w-full max-w-xs flex-1 overflow-y-auto max-h-[40vh] mb-4">
            {isLoading && (
              <p className="text-stone text-xs text-center py-4">
                Searching...
              </p>
            )}
            {!isLoading && products && products.length === 0 && (
              <p className="text-stone text-xs text-center py-4">
                No products found
              </p>
            )}
            {products &&
              products.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => router.push(`/product/${product.product_id}`)}
                  className="w-full text-left px-3 py-3 border-b border-espresso hover:bg-espresso/50 transition-colors"
                >
                  <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-stone">
                    {product.brand}
                  </p>
                  <p className="text-cream text-sm leading-snug">
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
      </div>

      {/* Search input at bottom */}
      <div className="px-6 pb-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-clay"
          />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search product name or brand..."
            className="w-full bg-espresso rounded-lg py-3 pl-10 pr-4 text-cream text-sm placeholder:text-clay focus:outline-none focus:ring-1 focus:ring-walnut"
          />
        </div>
      </div>
    </div>
  );
}
