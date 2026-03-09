"use client";

import { useMutation } from "@tanstack/react-query";
import type { AlignmentResult } from "@/lib/engine/types";

export function useAlignment() {
  return useMutation({
    mutationFn: async (productId: string): Promise<AlignmentResult> => {
      const res = await fetch("/api/alignment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error("Alignment check failed");
      return res.json();
    },
  });
}
