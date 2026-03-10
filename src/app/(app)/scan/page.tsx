"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Image, Search, Check, Loader2 } from "lucide-react";
import { useAddToCabinet } from "@/lib/hooks/use-cabinet";
import { useProductSearch } from "@/lib/hooks/use-products";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

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

type Phase = "camera" | "processing" | "results" | "manual-search";

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

  // Manual search state
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const { data: searchResults } = useProductSearch(editingIndex !== null ? searchQuery : manualSearchQuery);

  const addToCabinet = useAddToCabinet();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setError(null);
    } catch {
      setError("Unable to access camera. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const recognizeImage = useCallback(async (base64: string) => {
    setPhase("processing");
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
        setPhase("camera");
        return;
      }

      const scanResults: ScanResult[] = (data.results || []).map(
        (r: Omit<ScanResult, "confirmed">) => ({
          ...r,
          confirmed: r.confidence === "high",
        })
      );

      setResults(scanResults);
      setPhase("results");
    } catch {
      setError("Failed to process image. Please try again.");
      setPhase("camera");
    }
  }, []);

  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    stopCamera();

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    recognizeImage(base64);
  }, [stopCamera, recognizeImage]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      recognizeImage(base64);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  }, [recognizeImage]);

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

    // Request unmatched products
    const unmatched = results.filter((r) => !r.matched_product);
    for (const item of unmatched) {
      await requestProduct(item.detected_name);
    }

    // Add confirmed products to cabinet
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

  const confirmedCount = results.filter(
    (r) => r.confirmed && r.matched_product
  ).length;

  // ── Camera phase ──
  if (phase === "camera") {
    // Live camera mode
    if (cameraActive) {
      return (
        <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col relative">
          <button
            onClick={() => { stopCamera(); }}
            className="absolute top-4 left-4 text-stone z-20"
          >
            <X size={22} />
          </button>

          {/* Full-screen viewfinder */}
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

            {/* Capture button overlay at bottom */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={captureAndRecognize}
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
      <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-stone z-10"
        >
          <X size={22} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone mb-8">
            Add products by photo
          </p>

          {error && (
            <p className="text-risk text-xs text-center mb-4">{error}</p>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
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
              <Image size={20} />
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

          <p className="text-clay text-[10px] text-center mt-6 max-w-xs">
            Take or upload a photo of one or more products to identify them.
          </p>

          <button
            onClick={() => setPhase("manual-search")}
            className="mt-6 font-sans text-[11px] text-vela-blue"
          >
            Or search by name instead
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ── Processing phase ──
  if (phase === "processing") {
    return (
      <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-6">
        <Loader2 size={32} className="text-cream animate-spin mb-4" />
        <p className="text-cream font-sans text-sm">Identifying products...</p>
        <p className="text-stone text-xs mt-2">This may take a few seconds</p>
      </div>
    );
  }

  // ── Manual search phase ──
  if (phase === "manual-search") {
    return (
      <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col">
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
              className="w-full bg-espresso rounded-lg py-3 pl-10 pr-4 text-cream text-sm placeholder:text-clay focus:outline-none focus:ring-1 focus:ring-walnut"
            />
          </div>

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
    <div className="bg-ink min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => { setPhase("camera"); setResults([]); setAdded(false); }} className="text-stone">
          <X size={22} />
        </button>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone">
          {results.length} product{results.length !== 1 ? "s" : ""} detected
        </p>
        <div className="w-[22px]" />
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-5">
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
                    className="w-full bg-espresso rounded-lg py-2 pl-8 pr-3 text-cream text-sm placeholder:text-clay focus:outline-none"
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

      {/* Manual search link */}
      <div className="px-5 pt-2">
        <button
          onClick={() => setPhase("manual-search")}
          className="w-full text-center font-sans text-[11px] text-vela-blue py-2"
        >
          + Search and add manually
        </button>
      </div>

      {/* Bottom action */}
      <div className="px-5 pb-6 pt-3">
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
