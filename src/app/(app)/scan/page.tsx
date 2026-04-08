"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Image as ImageIcon, Search, Check, Loader2 } from "lucide-react";
import { useAddToCabinet, useCabinet } from "@/lib/hooks/use-cabinet";
import { useProductSearch } from "@/lib/hooks/use-products";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { ProductDot } from "@/components/product/product-dot";
import Link from "next/link";

interface ScanResult {
  detected_name: string;
  matched_product: {
    product_id: string;
    brand: string;
    product_name: string;
    category: string;
    subcategory: string;
    price: number | null;
  } | null;
  confidence: "high" | "low" | "none";
  confirmed: boolean;
}

type Phase = "camera" | "processing" | "results" | "manual-search" | "bulk";

export default function ScanPage() {
  const router = useRouter();
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk add state
  const [bulkItems, setBulkItems] = useState<ScanResult[]>([]);
  const [bulkAdding, setBulkAdding] = useState(false);

  // Manual search state
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const { data: searchResults } = useProductSearch(editingIndex !== null ? searchQuery : manualSearchQuery);

  // Recent scans — pull from cabinet (most recent additions)
  const { data: cabinetItems } = useCabinet();
  const recentScans = (cabinetItems ?? []).slice(0, 6);

  const addToCabinet = useAddToCabinet();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setError(null);
    } catch {
      setError("Unable to access camera. Please allow camera permissions.");
    }
  }, []);

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const recognizeImage = useCallback(async (base64: string, isBulk = false) => {
    if (!isBulk) setPhase("processing");
    setError(null);

    try {
      const res = await fetch("/api/scan/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        if (!isBulk) setPhase("camera");
        return;
      }

      const scanResults: ScanResult[] = (data.results || []).map(
        (r: Omit<ScanResult, "confirmed">) => ({
          ...r,
          confirmed: r.confidence === "high",
        })
      );

      if (isBulk) {
        // In bulk mode, add to running list
        setBulkItems((prev) => [...prev, ...scanResults]);
      } else {
        setResults(scanResults);
        setPhase("results");
      }
    } catch {
      setError("Failed to process image. Please try again.");
      if (!isBulk) setPhase("camera");
    }
  }, []);

  const captureAndRecognize = useCallback(async (isBulk = false) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    if (!isBulk) stopCamera();

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    recognizeImage(base64, isBulk);
  }, [stopCamera, recognizeImage]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      recognizeImage(base64, phase === "bulk");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [recognizeImage, phase]);

  const toggleConfirm = (index: number) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, confirmed: !r.confirmed } : r
      )
    );
  };

  const replaceWithSearchResult = (
    index: number,
    product: ScanResult["matched_product"]
  ) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, matched_product: product, confidence: "high", confirmed: true }
          : r
      )
    );
    setEditingIndex(null);
    setSearchQuery("");
  };

  const addManualProduct = (product: ScanResult["matched_product"]) => {
    if (!product) return;
    setResults((prev) => [
      ...prev,
      {
        detected_name: `${product.brand} ${product.product_name}`,
        matched_product: product,
        confidence: "high",
        confirmed: true,
      },
    ]);
    setManualSearchQuery("");
  };

  const requestProduct = async (detectedName: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("product_requests").insert({
      detected_name: detectedName,
      user_id: user.id,
    });
  };

  const handleAddAll = async () => {
    const confirmed = results.filter(
      (r) => r.confirmed && r.matched_product
    );
    if (confirmed.length === 0) return;

    setAdding(true);

    const unmatched = results.filter((r) => !r.matched_product);
    for (const item of unmatched) {
      await requestProduct(item.detected_name);
    }

    for (const item of confirmed) {
      try {
        await addToCabinet.mutateAsync({
          productId: item.matched_product!.product_id,
        });
      } catch {
        // Skip duplicates silently
      }
    }

    setAdding(false);
    setAdded(true);
    setTimeout(() => router.push("/cabinet"), 1500);
  };

  // Bulk add: add all confirmed items
  const handleBulkDone = async () => {
    const confirmed = bulkItems.filter((r) => r.confirmed && r.matched_product);
    if (confirmed.length === 0) {
      setPhase("camera");
      setBulkItems([]);
      return;
    }

    setBulkAdding(true);
    for (const item of confirmed) {
      try {
        await addToCabinet.mutateAsync({
          productId: item.matched_product!.product_id,
        });
      } catch {
        // Skip duplicates
      }
    }
    setBulkAdding(false);
    setBulkItems([]);
    stopCamera();
    router.push("/cabinet");
  };

  const confirmedCount = results.filter(
    (r) => r.confirmed && r.matched_product
  ).length;

  // ── Bulk add mode — camera stays hot ──
  if (phase === "bulk") {
    if (!cameraActive && bulkItems.length === 0) {
      startCamera();
    }

    return (
      <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col relative">
        <button
          onClick={() => { stopCamera(); setPhase("camera"); setBulkItems([]); }}
          className="absolute top-4 left-4 text-stone z-20"
        >
          <X size={22} />
        </button>

        <p className="absolute top-4 left-1/2 -translate-x-1/2 font-sans text-[10px] uppercase tracking-[0.18em] text-stone z-20">
          Bulk Add
        </p>

        {/* Camera viewfinder */}
        <div className="flex-1 relative overflow-hidden bg-espresso">
          {cameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Capture button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={() => captureAndRecognize(true)}
              className="bg-cream text-ink rounded-full p-5 shadow-lg"
            >
              <Camera size={28} />
            </button>
          </div>
        </div>

        {/* Running list at bottom */}
        {bulkItems.length > 0 && (
          <div className="flex-shrink-0 bg-espresso border-t border-walnut/30 px-5 py-3 max-h-[200px] overflow-y-auto">
            {bulkItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className={`w-2 h-2 rounded-full ${item.matched_product ? "bg-sage" : "bg-stone"}`} />
                <p className="text-cream text-xs truncate flex-1">
                  {item.matched_product
                    ? `${item.matched_product.brand} ${item.matched_product.product_name}`
                    : item.detected_name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Done button */}
        <div className="flex-shrink-0 px-5 py-4 bg-ink">
          <button
            onClick={handleBulkDone}
            disabled={bulkAdding}
            className="w-full bg-cream rounded-lg py-3 font-sans text-sm text-ink disabled:opacity-40"
          >
            {bulkAdding
              ? "Adding..."
              : `Done — add ${bulkItems.filter((r) => r.confirmed && r.matched_product).length} product${bulkItems.filter((r) => r.confirmed && r.matched_product).length !== 1 ? "s" : ""} to cabinet`}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ── Camera phase ──
  if (phase === "camera") {
    if (cameraActive) {
      return (
        <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col relative">
          <button
            onClick={() => { stopCamera(); }}
            className="absolute top-4 left-4 text-stone z-20"
          >
            <X size={22} />
          </button>

          <div className="flex-1 relative overflow-hidden bg-espresso">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cream/50 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cream/50 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cream/50 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cream/50 rounded-br-sm" />

            {/* Instruction */}
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="font-sans text-xs text-cream/80">Show the front label</p>
            </div>

            {/* Capture button */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={() => captureAndRecognize()}
                className="bg-cream text-ink rounded-full p-5 shadow-lg"
              >
                <Camera size={28} />
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      );
    }

    // Choose mode: Take Photo or Upload
    return (
      <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-stone z-10"
        >
          <X size={22} />
        </button>

        <div className="flex-1 flex flex-col px-6 pt-16">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone mb-8 text-center">
            Show the front label
          </p>

          {error && (
            <p className="text-risk text-xs text-center mb-4">{error}</p>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={startCamera}
              className="flex items-center justify-center gap-3 bg-cream text-ink rounded-lg py-4 font-sans text-sm"
            >
              <Camera size={20} />
              Take a Photo
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 bg-espresso text-cream rounded-lg py-4 font-sans text-sm border border-walnut/30"
            >
              <ImageIcon size={20} />
              Upload from Camera Roll
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Bulk add link — always visible */}
          <button
            onClick={() => { setPhase("bulk"); startCamera(); }}
            className="mt-6 font-sans text-[11px] text-vela-blue text-center"
          >
            Bulk add &rsaquo;
          </button>

          <button
            onClick={() => setPhase("manual-search")}
            className="mt-3 font-sans text-[11px] text-clay text-center"
          >
            Or search by name instead
          </button>

          {/* Recent scans row */}
          {recentScans.length > 0 && (
            <div className="mt-8">
              <p className="font-sans text-[9px] uppercase tracking-[0.18em] text-stone mb-3">
                Recent Scans
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentScans.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product_id}`}
                    className="flex-shrink-0 w-[70px] flex flex-col items-center gap-1.5"
                  >
                    <div className="rounded-md bg-espresso border border-walnut/30 p-1">
                      <ProductDot
                        size={32}
                        imageUrl={item.shade?.product_image_url || item.product?.image_url}
                      />
                    </div>
                    <p className="line-clamp-2 text-center font-sans text-[9px] leading-tight text-stone">
                      {item.product?.product_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ── Processing phase ──
  if (phase === "processing") {
    return (
      <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col items-center justify-center px-6">
        <Loader2 size={32} className="text-cream animate-spin mb-4" />
        <p className="text-cream font-sans text-sm">Identifying products...</p>
        <p className="text-stone text-xs mt-2">This may take a few seconds</p>
      </div>
    );
  }

  // ── Manual search phase ──
  if (phase === "manual-search") {
    return (
      <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (results.length > 0) {
                setPhase("results");
              } else {
                setPhase("camera");
              }
              setManualSearchQuery("");
            }}
            className="text-stone"
          >
            <X size={22} />
          </button>
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
            Search Products
          </p>
          <div className="w-[22px]" />
        </div>

        <div className="px-5">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
            <input
              type="text"
              value={manualSearchQuery}
              onChange={(e) => setManualSearchQuery(e.target.value)}
              placeholder="Search product name or brand..."
              autoFocus
              className="w-full bg-espresso rounded-lg py-3 pl-10 pr-4 text-cream text-base placeholder:text-clay focus:outline-none focus:ring-1 focus:ring-walnut"
            />
          </div>

          {/* Bulk add link */}
          <button
            onClick={() => { setPhase("bulk"); startCamera(); }}
            className="w-full text-center font-sans text-[11px] text-vela-blue mb-4"
          >
            Bulk add &rsaquo;
          </button>

          {manualSearchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
            <p className="text-stone text-xs text-center py-4">No products found</p>
          )}

          {searchResults?.map((p) => (
            <button
              key={p.product_id}
              onClick={() => {
                addManualProduct(p as ScanResult["matched_product"]);
                setPhase("results");
              }}
              className="w-full text-left px-3 py-3 border-b border-espresso hover:bg-espresso/50 transition-colors"
            >
              <p className="text-stone text-[9px] uppercase tracking-[0.15em]">{p.brand}</p>
              <p className="text-cream text-sm">{p.product_name}</p>
              {p.price != null && (
                <p className="text-clay text-[10px] mt-0.5">${p.price.toFixed(2)}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Results phase ──
  return (
    <div className="bg-ink h-[calc(100dvh-60px)] flex flex-col">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between flex-shrink-0">
        <button onClick={() => { setPhase("camera"); setResults([]); setAdded(false); }} className="text-stone">
          <X size={22} />
        </button>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
          {results.length} product{results.length !== 1 ? "s" : ""} detected
        </p>
        <div className="w-[22px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 min-h-0">
        {results.map((result, index) => (
          <div key={index} className="border-b border-espresso py-4">
            {editingIndex === index ? (
              <div>
                <p className="text-stone text-[10px] mb-2">
                  Searching for: {result.detected_name}
                </p>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-clay" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type product name..."
                    autoFocus
                    className="w-full bg-espresso rounded-lg py-2 pl-8 pr-3 text-cream text-base placeholder:text-clay focus:outline-none"
                  />
                </div>
                {searchResults?.map((p) => (
                  <button
                    key={p.product_id}
                    onClick={() => replaceWithSearchResult(index, p as ScanResult["matched_product"])}
                    className="w-full text-left px-2 py-2 hover:bg-espresso/50 rounded"
                  >
                    <p className="text-stone text-[9px] uppercase">{p.brand}</p>
                    <p className="text-cream text-sm">{p.product_name}</p>
                  </button>
                ))}
                <button
                  onClick={() => { setEditingIndex(null); setSearchQuery(""); }}
                  className="text-stone text-xs mt-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <button
                  onClick={() => result.matched_product && toggleConfirm(index)}
                  className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                    result.confirmed ? "bg-sage border-sage" : "border-stone"
                  }`}
                >
                  {result.confirmed && <Check size={12} className="text-cream" />}
                </button>

                <div className="flex-1">
                  {result.matched_product ? (
                    <>
                      <p className="text-stone text-[9px] uppercase tracking-[0.15em]">
                        {result.matched_product.brand}
                      </p>
                      <p className="text-cream text-sm">
                        {result.matched_product.product_name}
                      </p>
                      {result.confidence === "low" && (
                        <p className="text-warm text-[10px] mt-0.5">
                          Partial match — is this right?
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-cream text-sm">{result.detected_name}</p>
                      <p className="text-stone text-[10px] mt-0.5">
                        Not found in database
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!result.matched_product) {
                      requestProduct(result.detected_name);
                    } else {
                      setEditingIndex(index);
                    }
                  }}
                  className="text-vela-blue text-[11px] font-sans mt-1"
                >
                  {result.matched_product ? "Edit" : "Request"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 px-5 pb-4 pt-2 bg-ink">
        <button
          onClick={() => setPhase("manual-search")}
          className="w-full text-center font-sans text-[11px] text-vela-blue py-2"
        >
          + Search and add manually
        </button>

        {added ? (
          <div className="bg-sage rounded-lg py-3 text-center">
            <p className="text-cream font-sans text-sm">
              Added {confirmedCount} product{confirmedCount !== 1 ? "s" : ""}!
            </p>
          </div>
        ) : (
          <button
            onClick={handleAddAll}
            disabled={adding || confirmedCount === 0}
            className="w-full bg-cream rounded-lg py-3 font-sans text-sm text-ink disabled:opacity-40 transition-opacity"
          >
            {adding
              ? "Adding..."
              : `Add ${confirmedCount} Product${confirmedCount !== 1 ? "s" : ""} to Cabinet`}
          </button>
        )}
      </div>
    </div>
  );
}
