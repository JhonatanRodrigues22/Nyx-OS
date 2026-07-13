import { createNyxSupabaseClient, readSupabaseEnvironment } from "@nyx-os/database";

const supabaseEnvironment = readSupabaseEnvironment();

export function createSupabaseClient() {
  if (!supabaseEnvironment) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createNyxSupabaseClient(supabaseEnvironment);
}

export const supabase = supabaseEnvironment ? createNyxSupabaseClient(supabaseEnvironment) : null;
