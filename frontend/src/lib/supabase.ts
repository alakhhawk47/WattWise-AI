import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether real Supabase credentials have been provided.
 * Used by AuthProvider to decide whether to attempt real authentication.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your_supabase_project_url" &&
    supabaseAnonKey !== "your_supabase_publishable_key"
);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase credentials are missing or still set to placeholder values.\n" +
      "Authentication will not work until you provide valid credentials in frontend/.env:\n" +
      "  VITE_SUPABASE_URL=https://<your-project>.supabase.co\n" +
      "  VITE_SUPABASE_ANON_KEY=<your-anon-key>"
  );
}

/**
 * Singleton Supabase client instance.
 * Falls back to placeholder values when credentials are missing so the app
 * can still render without crashing — auth calls will simply fail gracefully.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
