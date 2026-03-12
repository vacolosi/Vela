"use client";

import { useQuery } from "@tanstack/react-query";

interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  category: string;
  subcategory: string;
  price: number | null;
  image_url: string | null;
}

export function useFeaturedProducts(category?: string, brand?: string) {
  return useQuery({
    queryKey: ["products", "featured", category ?? "all", brand ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      const qs = params.toString();
      const res = await fetch(`/api/products/featured${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      return data.products as Product[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["products", "brands"],
    queryFn: async () => {
      const res = await fetch("/api/products/brands");
      const data = await res.json();
      return data.brands as { name: string; count: number }[];
    },
    staleTime: 30 * 60 * 1000,
  });
}
