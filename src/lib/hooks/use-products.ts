"use client";

import { useQuery } from "@tanstack/react-query";

interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  category: string;
  subcategory: string;
  price: number | null;
  primary_functions: string[];
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      return data.products as Product[];
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
