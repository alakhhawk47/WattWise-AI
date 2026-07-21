import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://placeholder.supabase.co"
);

// Flag to bypass authentication during development or when Supabase keys are missing
export const IS_DEV_AUTH_BYPASS =
  import.meta.env.DEV ||
  !isSupabaseConfigured ||
  import.meta.env.VITE_BYPASS_AUTH === "true";

const MOCK_DEV_USER: User = {
  id: "dev-user-001",
  app_metadata: { provider: "development" },
  user_metadata: { full_name: "Demo Admin" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "admin@wattwise.ai",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    IS_DEV_AUTH_BYPASS ? MOCK_DEV_USER : null
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!IS_DEV_AUTH_BYPASS);

  useEffect(() => {
    if (IS_DEV_AUTH_BYPASS) {
      setUser(MOCK_DEV_USER);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (IS_DEV_AUTH_BYPASS) {
      setUser(MOCK_DEV_USER);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (IS_DEV_AUTH_BYPASS) {
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

