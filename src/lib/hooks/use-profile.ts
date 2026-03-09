"use client";

import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/providers/supabase-provider";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
