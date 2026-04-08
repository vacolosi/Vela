"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAlignment } from "@/lib/hooks/use-alignment";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { ProductDot } from "@/components/product/product-dot";
import { AlignmentBar } from "@/components/product/alignment-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Product } from "@/lib/engine/types";
import { useProfile } from "@/lib/hooks/use-profile";
import { ShadeProfilePrompt } from "@/components/cabinet/shade-profile-prompt";

const supabase = createClient();

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialShade = searchParams.get("shade");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCabinet, setAddedToCabinet] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [riskDetailsOpen, setRiskDetailsOpen] = useState(false);
  const [shopSheetOpen, setShopSheetOpen] = useState(false);
  const [showShadePrompt, setShowShadePrompt] = useState(false);
  const [shades, setShades] = useState<{
    shade_id: string;
    shade_name: string;
    shade_description: string | null;
    undertone: string | null;
    skin_depth_match: string | null;
    swatch_image_url: string | null;
    product_image_url: string | null;
  }[]>([]);
  const [selectedShade, setSelectedShade] = useState<string | null>(initialShade);

  const alignment = useAlignment();
  const addToCabinet = useAddToCabinet();
  const { data: profile } = useProfile();

  // Face product subcategories that trigger shade prompt
  const FACE_SUBCATEGORIES = ["Foundation", "Concealer", "Bronzer", "Contour", "Powder", "Primer"];
  const isFaceProduct = product?.zone === "Face" || FACE_SUBCATEGORIES.includes(product?.subcategory ?? "");
  const hasShadeProfile = !!(profile?.shade_depth && profile?.shade_undertone);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      alignment.mutate(id as string);
    }
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  function handleAddToCabinet() {
    if (!product) return;
    addToCabinet.mutate(
      { productId: product.product_id, shadeId: selectedShade || undefined },
      {
        onSuccess: () => {
          setAddedToCabinet(true);
          // Trigger shade profile prompt on first face product if no shade profile set
          if (isFaceProduct && !hasShadeProfile) {
            setShowShadePrompt(true);
          }
        },
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
  const activeShadeData = shades.find((s) => s.shade_id === selectedShade);
  const displayImage = activeShadeData?.product_image_url || product.image_url;

  // Build buy URL
  function getBuyUrl() {
    if (!product?.source_url) return null;
    const shadeImageUrl = activeShadeData?.product_image_url;
    if (!shadeImageUrl) return product.source_url;
    const skuMatch = shadeImageUrl.match(/\/ulta\/(\d+)/);
    if (skuMatch) {
      const baseUrl = product.source_url.replace(/[?&]sku=\d+/, "");
      return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}sku=${skuMatch[1]}`;
    }
    return product.source_url;
  }

  // Risk preview — one-line summary
  const riskPreview =
    reasoning?.risk.hasConflict && reasoning.risk.conflicts.length > 0
      ? reasoning.risk.conflicts[0].explanation
      : null;

  return (
    <>
      <div className="px-5 pt-4 pb-40">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="font-sans text-[13px] text-stone mb-6 block"
        >
          &larr; Back
        </button>

        {/* Product image */}
        <div className="flex justify-center mb-5">
          <div className="shadow-sm rounded-lg">
            <ProductDot size={180} imageUrl={displayImage} />
          </div>
        </div>

        {/* Brand */}
        <div className="font-sans text-[11px] uppercase text-stone tracking-[0.1em] mb-1">
          {product.brand}
        </div>

        {/* Product name */}
        <h1 className="font-serif text-[22px] text-ink mb-1">{product.product_name}</h1>

        {/* Price + Badges inline */}
        <div className="flex items-center gap-2 mb-4">
          {product.price !== null && (
            <span className="font-sans text-sm text-walnut font-light">
              ${product.price.toFixed(2)}
            </span>
          )}
          {product.badges && product.badges.length > 0 && (
            <div className="flex gap-1">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="font-sans text-[8px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-sage/10 text-sage"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

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
                    // eslint-disable-next-line @next/next/no-img-element
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
            {activeShadeData && (
              <div className="bg-cream rounded-lg border border-parchment p-3">
                <p className="font-sans text-sm text-ink font-medium">{activeShadeData.shade_name}</p>
                {activeShadeData.shade_description && (
                  <p className="font-sans text-xs text-clay font-light mt-0.5">{activeShadeData.shade_description}</p>
                )}
                <div className="flex gap-2 mt-1.5">
                  {activeShadeData.undertone && (
                    <span className="font-sans text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border border-sand text-clay">
                      {activeShadeData.undertone}
                    </span>
                  )}
                  {activeShadeData.skin_depth_match && (
                    <span className="font-sans text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded border border-sand text-clay">
                      {activeShadeData.skin_depth_match}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alignment card — contains risk + reasoning collapsed inside */}
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
            <AlignmentBar
              tier={result.tier}
              score={result.score}
              summary={reasoning?.compatibility.explanation ?? ""}
              riskPreview={riskPreview}
            >
              {/* Risk details — collapsed, expand on tap */}
              {riskPreview && (
                <div className="mt-2">
                  <button
                    onClick={() => setRiskDetailsOpen(!riskDetailsOpen)}
                    className="font-sans text-[11px] text-clay"
                  >
                    {riskDetailsOpen ? "Hide details" : "Details"}
                  </button>
                  {riskDetailsOpen && reasoning?.risk.conflicts.map((c, i) => (
                    <div key={i} className="mt-2">
                      <p className="font-sans text-xs text-risk font-light leading-relaxed">
                        {c.explanation}
                      </p>
                      {c.resolutions.length > 0 && (
                        <p className="font-sans text-[11px] text-stone font-light mt-1">
                          {c.resolutions[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Full analysis — collapsed */}
              {reasoning && (
                <div className="mt-3 pt-3 border-t border-parchment">
                  <button
                    onClick={() => setAnalysisOpen(!analysisOpen)}
                    className="font-sans text-[11px] text-clay"
                  >
                    {analysisOpen ? "Hide analysis" : "See full analysis \u203A"}
                  </button>
                  {analysisOpen && (
                    <div className="mt-3 space-y-3">
                      {/* Overlap */}
                      <div>
                        <p className="font-sans text-xs font-medium text-ink mb-0.5">Overlap</p>
                        <p className="font-sans text-[11px] text-clay font-light leading-relaxed">
                          {reasoning.overlap.hasOverlap && reasoning.overlap.overlappingProducts.length > 0
                            ? reasoning.overlap.overlappingProducts[0].explanation
                            : "No significant overlap with your current products."}
                        </p>
                      </div>
                      {/* Coverage */}
                      <div>
                        <p className="font-sans text-xs font-medium text-ink mb-0.5">Coverage</p>
                        <p className="font-sans text-[11px] text-clay font-light leading-relaxed">
                          {reasoning.coverage.explanation || "No coverage data available."}
                        </p>
                      </div>
                      {/* Compatibility */}
                      <div>
                        <p className="font-sans text-xs font-medium text-ink mb-0.5">Compatibility</p>
                        <p className="font-sans text-[11px] text-clay font-light leading-relaxed">
                          {reasoning.compatibility.explanation || "No compatibility data available."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AlignmentBar>
          ) : alignment.isError ? (
            <div className="bg-cream rounded-[10px] border border-parchment p-4">
              <div className="font-sans text-xs text-clay font-light">
                Unable to analyze alignment.
              </div>
            </div>
          ) : null}
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
      </div>

      {/* Sticky bottom action bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-vela-white border-t border-parchment px-5 py-4 z-50">
        <div className="flex gap-3 max-w-md mx-auto">
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
          {getBuyUrl() && (
            <button
              onClick={() => setShopSheetOpen(true)}
              className="border border-sand rounded-lg text-clay font-sans text-sm px-6 py-3"
            >
              Shop
            </button>
          )}
        </div>
      </div>

      {/* Shade profile prompt */}
      {showShadePrompt && (
        <ShadeProfilePrompt onClose={() => setShowShadePrompt(false)} />
      )}

      {/* Shop bottom sheet */}
      {shopSheetOpen && (
        <div
          className="fixed inset-0 bg-ink/30 z-50"
          onClick={() => setShopSheetOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-vela-white rounded-t-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-sand rounded-full mx-auto mb-5" />
            <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-4">
              Available at
            </p>
            <a
              href={getBuyUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-cream rounded-lg border border-parchment"
            >
              <div>
                <p className="font-sans text-sm text-ink">Ulta Beauty</p>
                {product.price !== null && (
                  <p className="font-sans text-xs text-clay font-light mt-0.5">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </div>
              <span className="font-sans text-xs text-clay">&rsaquo;</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
