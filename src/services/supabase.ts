import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/clerk-react";
import { useMemo } from "react";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const useSupabaseClient = () => {
  const { session } = useSession();

  return useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => session?.getToken() ?? null,
    }) as SupabaseClient<Database>;
  }, [session]);
};
