"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAlignment } from "@/lib/hooks/use-alignment";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { ProductDot } from "@/components/product/product-dot";
import { AlignmentBar } from "@/components/product/alignment-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Product } from "@/lib/engine/types";

const supabase = createClient();

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCabinet, setAddedToCabinet] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [shades, setShades] = useState<{
    shade_id: string;
    shade_name: string;
    shade_description: string | null;
    undertone: string | null;
    skin_depth_match: string | null;
    swatch_image_url: string | null;
    product_image_url: string | null;
  }[]>([]);
  const [selectedShade, setSelectedShade] = useState<string | null>(null);

  const alignment = useAlignment();
  const addToCabinet = useAddToCabinet();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch product and trigger alignment on mount
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", id)
        .single();

      if (fetchError) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      setProduct(data as Product);
      setLoading(false);

      // Trigger alignment check
      alignment.mutate(id as string);
    }

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch shades for this product
  useEffect(() => {
    if (!id) return;
    async function fetchShades() {
      const { data } = await supabase
        .from("shades")
        .select("shade_id, shade_name, shade_description, undertone, skin_depth_match, swatch_image_url, product_image_url")
        .eq("product_id", id)
        .order("shade_name");
      if (data && data.length > 0) {
        setShades(data);
      }
    }
    fetchShades();
  }, [id]);

  const activeShade = shades.find((s) => s.shade_id === selectedShade);

  function handleAddToCabinet() {
    if (!product) return;
    addToCabinet.mutate(
      { productId: product.product_id },
      {
        onSuccess: () => setAddedToCabinet(true),
      }
    );
  }

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-5 pt-4 pb-28 animate-pulse">
        <div className="h-4 w-16 bg-parchment rounded mb-6" />
        <div className="flex justify-center mb-6">
          <div className="w-20 h-25 bg-parchment rounded-md" />
        </div>
        <div className="h-3 w-24 bg-parchment rounded mb-2" />
        <div className="h-6 w-48 bg-parchment rounded mb-2" />
        <div className="h-4 w-16 bg-parchment rounded mb-6" />
        <div className="h-32 bg-parchment rounded-[10px]" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="px-5 pt-4 pb-28">
        <button
          onClick={() => router.back()}
          className="font-sans text-[13px] text-stone mb-6 block"
        >
          &larr; Back
        </button>
        <div className="bg-risk-wash rounded-lg border border-risk/20 p-4 text-center">
          <p className="font-sans text-sm text-risk">{error ?? "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  const result = alignment.data;
  const reasoning = result?.reasoning;

  // ── Build alignment summary ─────────────────────────────────────────
  function buildSummary() {
    if (!reasoning) return "";
    const parts: string[] = [];
    if (reasoning.compatibility.explanation) parts.push(reasoning.compatibility.explanation);
    if (reasoning.coverage.explanation) parts.push(reasoning.coverage.explanation);
    return parts[0] ?? "";
  }

  return (
    <div className="px-5 pt-4 pb-28">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="font-sans text-[13px] text-stone mb-6 block"
      >
        &larr; Back
      </button>

      {/* Product image area */}
      <div className="flex justify-center mb-5">
        <div className="shadow-sm rounded-lg">
          <ProductDot size={180} imageUrl={product.image_url} />
        </div>
      </div>

      {/* Brand */}
      <div className="font-sans text-[11px] uppercase text-stone tracking-[0.1em] mb-1">
        {product.brand}
      </div>

      {/* Product name */}
      <h1 className="font-serif text-[22px] text-ink mb-1">{product.product_name}</h1>

      {/* Price */}
      {product.price !== null && (
        <div className="font-sans text-sm text-walnut font-light mb-3">
          ${product.price.toFixed(2)}
        </div>
      )}

      {/* Badges */}
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.badges.map((badge) => (
            <span
              key={badge}
              className="font-sans text-[9px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full bg-sage/15 text-sage border border-sage/20"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Shade picker */}
      {shades.length > 0 && (
        <div className="mb-5">
          <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-3">
            {shades.length} Shade{shades.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {shades.map((shade) => (
              <button
                key={shade.shade_id}
                onClick={() => setSelectedShade(
                  selectedShade === shade.shade_id ? null : shade.shade_id
                )}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                  selectedShade === shade.shade_id
                    ? "border-ink scale-110"
                    : "border-parchment"
                }`}
                title={shade.shade_name}
              >
                {shade.swatch_image_url ? (
                  <img
                    src={shade.swatch_image_url}
                    alt={shade.shade_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cream flex items-center justify-center">
                    <span className="text-[7px] text-clay">{shade.shade_name.charAt(0)}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {activeShade && (
            <div className="bg-cream rounded-lg border border-parchment p-3">
              <p className="font-sans text-sm text-ink font-medium">{activeShade.shade_name}</p>
              {activeShade.shade_description && (
                <p className="font-sans text-xs text-clay font-light mt-0.5">{activeShade.shade_description}</p>
              )}
              <div className="flex gap-2 mt-1.5">
                {activeShade.undertone && (
                  <span className="font-sans text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border border-sand text-clay">
                    {activeShade.undertone}
                  </span>
                )}
                {activeShade.skin_depth_match && (
                  <span className="font-sans text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border border-sand text-clay">
                    {activeShade.skin_depth_match}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alignment card */}
      <div className="mb-4">
        {alignment.isPending ? (
          <div className="bg-cream rounded-[10px] border border-parchment p-4">
            <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-3">
              Alignment
            </div>
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              <span className="font-sans text-xs text-clay font-light">
                Analyzing alignment...
              </span>
            </div>
          </div>
        ) : result ? (
          <AlignmentBar tier={result.tier} summary={buildSummary()} />
        ) : alignment.isError ? (
          <div className="bg-cream rounded-[10px] border border-parchment p-4">
            <div className="font-sans text-xs text-clay font-light">
              Unable to analyze alignment.
            </div>
          </div>
        ) : null}
      </div>

      {/* Risk block */}
      {reasoning?.risk.hasConflict && reasoning.risk.conflicts.length > 0 && (
        <div className="bg-risk-wash rounded-lg border border-risk/20 p-4 mb-4">
          <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-risk mb-2">
            Risk
          </div>
          <p className="font-sans text-xs text-clay leading-relaxed mb-2">
            {reasoning.risk.conflicts[0].explanation}
          </p>
          {reasoning.risk.conflicts[0].resolutions.length > 0 && (
            <p className="font-sans text-xs text-stone font-light leading-relaxed">
              {reasoning.risk.conflicts[0].resolutions[0]}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddToCabinet}
          disabled={addToCabinet.isPending || addedToCabinet}
          className="flex-1 bg-ink rounded-lg text-cream font-sans text-sm py-3 disabled:opacity-60 transition-opacity"
        >
          {addedToCabinet
            ? "Added!"
            : addToCabinet.isPending
              ? "Adding..."
              : "Add to Cabinet"}
        </button>
        {product.source_url && (
          <a
            href={product.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-sand rounded-lg text-clay font-sans text-sm px-6 py-3 text-center"
          >
            Buy
          </a>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-4">
          <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-2">
            Description
          </div>
          <p className="font-sans text-xs text-clay font-light leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <div className="mb-6 border-t border-parchment pt-4">
          <button
            onClick={() => setIngredientsOpen(!ingredientsOpen)}
            className="w-full flex items-center justify-between"
          >
            <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone">
              Ingredients ({product.ingredients.length})
            </span>
            <span
              className={`text-stone transition-transform ${ingredientsOpen ? "rotate-45" : ""}`}
              style={{ fontSize: 18, lineHeight: 1 }}
            >
              +
            </span>
          </button>
          {ingredientsOpen && (
            <p className="font-sans text-xs text-clay font-light leading-relaxed mt-3">
              {product.ingredients.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Reasoning sections */}
      {reasoning && (
        <div>
          <div className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-4">
            Details
          </div>

          {/* Overlap */}
          <div className="border-b border-parchment pb-4 mb-4">
            <div className="font-sans text-xs font-medium text-ink mb-1">Overlap</div>
            <p className="font-sans text-xs text-clay font-light leading-relaxed">
              {reasoning.overlap.hasOverlap && reasoning.overlap.overlappingProducts.length > 0
                ? reasoning.overlap.overlappingProducts[0].explanation
                : "No significant overlap with your current products."}
            </p>
            {reasoning.overlap.hasOverlap && reasoning.overlap.overlappingProducts.length > 0 && (
              <button className="font-sans text-xs text-vela-blue mt-1.5">
                See swap logic &rarr;
              </button>
            )}
          </div>

          {/* Coverage */}
          <div className="border-b border-parchment pb-4 mb-4">
            <div className="font-sans text-xs font-medium text-ink mb-1">Coverage</div>
            <p className="font-sans text-xs text-clay font-light leading-relaxed">
              {reasoning.coverage.explanation || "No coverage data available."}
            </p>
          </div>

          {/* Compatibility */}
          <div className="pb-4">
            <div className="font-sans text-xs font-medium text-ink mb-1">Compatibility</div>
            <p className="font-sans text-xs text-clay font-light leading-relaxed">
              {reasoning.compatibility.explanation || "No compatibility data available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
