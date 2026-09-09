/**
 * Supabase client — single shared instance for the app.
 *
 * Credentials come from Vite env vars (VITE_ prefix so they're exposed to the
 * browser bundle). The anon/publishable key is safe client-side; access is
 * governed by Row Level Security policies defined in Supabase.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in dev so a missing .env is obvious rather than silently broken.
  console.error(
    "Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
