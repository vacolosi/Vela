"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";

const supabase = createClient();

export function useCabinet() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["cabinet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cabinet_items")
        .select(`*, product:products(*), shade:shades(*)`)
        .eq("user_id", user!.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAddToCabinet() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      shadeId,
    }: {
      productId: string;
      shadeId?: string;
    }) => {
      const { data, error } = await supabase
        .from("cabinet_items")
        .upsert(
          {
            user_id: user!.id,
            product_id: productId,
            shade_id: shadeId || null,
            is_active: false,
          },
          { onConflict: "user_id,product_id", ignoreDuplicates: true }
        )
        .select()
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}

export function useToggleLineup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("cabinet_items")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}

export function useRemoveFromCabinet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cabinet_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cabinet"] });
    },
  });
}
