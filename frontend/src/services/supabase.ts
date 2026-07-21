import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
  console.info(
    "ℹ️ Missing or placeholder Supabase credentials. Running in Development Auth Bypass mode."
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

