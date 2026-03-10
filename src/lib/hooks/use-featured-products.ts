"use client";

import { useQuery } from "@tanstack/react-query";

interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  category: string;
  subcategory: string;
  price: number | null;
}

export function useFeaturedProducts(category?: string) {
  return useQuery({
    queryKey: ["products", "featured", category ?? "all"],
    queryFn: async () => {
      const params = category ? `?category=${category}` : "";
      const res = await fetch(`/api/products/featured${params}`);
      const data = await res.json();
      return data.products as Product[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
