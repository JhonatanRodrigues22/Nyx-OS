import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseEnvironment = {
  url: string;
  key: string;
};

export function readSupabaseEnvironment(): SupabaseEnvironment | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function createNyxSupabaseClient(environment: SupabaseEnvironment): SupabaseClient {
  return createClient(environment.url, environment.key);
}

export function createSupabaseClientFromEnv(): SupabaseClient {
  const environment = readSupabaseEnvironment();

  if (!environment) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createNyxSupabaseClient(environment);
}
