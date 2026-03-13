"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getInfluencer } from "@/lib/data/influencers";
import { useCabinet } from "@/lib/hooks/use-cabinet";
import { createClient } from "@/lib/supabase/client";
import { ProductDot } from "@/components/product/product-dot";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const supabase = createClient();

const CATEGORIES = [
  { key: "skincare", label: "Skincare" },
  { key: "makeup", label: "Makeup" },
  { key: "hair", label: "Hair" },
  { key: "body", label: "Body" },
  { key: "fragrance", label: "Fragrance" },
  { key: "nails", label: "Nails" },
  { key: "tools", label: "Tools" },
  { key: "accessories", label: "Accessories" },
];

interface MatchedProduct {
  product_id: string;
  brand: string;
  product_name: string;
  category: string;
  subcategory: string;
  price: number | null;
  image_url: string | null;
}

export default function InfluencerCabinetPage() {
  const { handle } = useParams<{ handle: string }>();
  const router = useRouter();
  const influencer = getInfluencer(handle);
  const { data: userCabinet } = useCabinet();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<MatchedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Look up influencer's products in the DB by brand + name
  useEffect(() => {
    if (!influencer) return;

    async function fetchProducts() {
      setLoading(true);
      const matched: MatchedProduct[] = [];

      // Search for each product in the influencer's cabinet
      for (const item of influencer!.cabinet) {
        const { data } = await supabase
          .from("products")
          .select("product_id, brand, product_name, category, subcategory, price, image_url")
          .ilike("brand", `%${item.brand}%`)
          .ilike("product_name", `%${item.productName.split(" ").slice(0, 3).join("%")}%`)
          .limit(1);

        if (data && data.length > 0) {
          matched.push(data[0] as MatchedProduct);
        } else {
          // Fallback: create a placeholder entry
          matched.push({
            product_id: `placeholder-${item.brand}-${item.productName}`,
            brand: item.brand,
            product_name: item.productName,
            category: item.category,
            subcategory: "",
            price: null,
            image_url: null,
          });
        }
      }

      setProducts(matched);
      setLoading(false);
    }

    fetchProducts();
  }, [influencer]);

  if (!influencer) {
    return (
      <div className="px-5 pt-4 pb-28">
        <button onClick={() => router.back()} className="font-sans text-[13px] text-stone mb-6 block">
          &larr; Back
        </button>
        <p className="font-sans text-sm text-clay">Influencer not found.</p>
      </div>
    );
  }

  // Which categories does this influencer actually have products in?
  const availableCategories = CATEGORIES.filter((cat) =>
    products.some((p) => p.category?.toLowerCase() === cat.key)
  );

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?.toLowerCase() === selectedCategory)
    : products;

  // Find which products the user has in common
  const userProductIds = new Set(
    (userCabinet ?? []).map((item: { product_id: string }) => item.product_id)
  );
  const inCommonCount = products.filter((p) => userProductIds.has(p.product_id)).length;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white px-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 pb-2">
        <button onClick={() => router.back()} className="flex-shrink-0">
          <ChevronLeft size={20} className="text-stone" />
        </button>
        <div className="font-serif text-lg italic text-ink">Cabinet</div>
      </div>

      {/* Profile */}
      <div className="text-center py-5">
        <div className="w-16 h-16 rounded-full bg-clay mx-auto mb-3 flex items-center justify-center border-2 border-warm">
          <span className="font-serif text-[22px] text-cream italic">
            {influencer.name[0]}
          </span>
        </div>
        <h1 className="font-serif text-xl text-ink">{influencer.name}</h1>
        <p className="font-sans text-[11px] text-stone font-light">@{influencer.handle}</p>
        <p className="font-sans text-[11px] text-clay font-light leading-relaxed max-w-[240px] mx-auto mt-2">
          {influencer.bio}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-7 mt-4">
          {[
            { value: String(influencer.products), label: "Products" },
            { value: String(influencer.edits), label: "Edits" },
            { value: influencer.saves, label: "Saves" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-lg text-ink">{stat.value}</div>
              <div className="font-sans text-[8px] uppercase tracking-[0.1em] text-stone">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In common callout */}
      {inCommonCount > 0 && (
        <div className="mx-0 mb-4 p-3 bg-vela-blue/10 rounded-lg flex items-center gap-2.5">
          <div className="w-[7px] h-[7px] rounded-full bg-vela-blue flex-shrink-0" />
          <p className="font-sans text-[11px] text-vela-blue font-light leading-snug">
            You share {inCommonCount} product{inCommonCount !== 1 ? "s" : ""}. See how your routines compare.
          </p>
        </div>
      )}

      {/* Category tabs */}
      {availableCategories.length > 1 && (
        <div className="flex border-b border-parchment mb-3">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`py-2 px-3.5 font-sans text-[10px] uppercase tracking-[0.06em] transition-colors ${
              !selectedCategory
                ? "text-ink font-medium border-b-2 border-ink -mb-px"
                : "text-stone font-light"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`py-2 px-3.5 font-sans text-[10px] uppercase tracking-[0.06em] transition-colors ${
                selectedCategory === cat.key
                  ? "text-ink font-medium border-b-2 border-ink -mb-px"
                  : "text-stone font-light"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <LoadingSpinner className="py-8" />
      ) : (
        <div>
          {filteredProducts.map((product) => {
            const isInUserCabinet = userProductIds.has(product.product_id);
            return (
              <button
                key={product.product_id}
                onClick={() => {
                  if (!product.product_id.startsWith("placeholder-")) {
                    router.push(`/product/${product.product_id}`);
                  }
                }}
                className="w-full flex items-center gap-2.5 py-3 border-b border-parchment text-left"
              >
                <ProductDot size={32} imageUrl={product.image_url} />
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[8px] text-stone uppercase tracking-[0.06em]">
                    {product.brand}
                  </div>
                  <div className="font-sans text-xs text-ink leading-snug truncate">
                    {product.product_name}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {product.subcategory && (
                    <span className="font-sans text-[7px] uppercase px-1.5 py-0.5 rounded border border-warm/20 bg-warm/10 text-warm">
                      {product.subcategory}
                    </span>
                  )}
                  {isInUserCabinet && (
                    <span className="font-mono text-[7px] text-sage">In your cabinet</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
