import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, ProfileUpdate } from "@/types/database";
import { profileService } from "@/services/profileService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updates: ProfileUpdate) => Promise<Profile | null>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Turn a Supabase AuthError into a human-readable message suitable for a
 * toast notification.
 */
function friendlyAuthError(error: AuthError | Error): string {
  const msg = error.message.toLowerCase();

  if (msg.includes("popup") || msg.includes("closed")) {
    return "Sign-in popup was closed. Please try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error — please check your connection and try again.";
  }
  if (msg.includes("expired") || msg.includes("refresh_token")) {
    return "Your session has expired. Please sign in again.";
  }
  if (msg.includes("invalid") && msg.includes("callback")) {
    return "Invalid authentication callback. Please try signing in again.";
  }
  if (msg.includes("oauth")) {
    return "OAuth authentication failed. Please try again.";
  }

  return error.message || "An unexpected authentication error occurred.";
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Sync and load profile for the given user.
   */
  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const synced = await profileService.syncProfileWithOAuth(currentUser);
      setProfile(synced);
    } catch (err) {
      console.warn("⚠️ Non-blocking profile load error:", err);
      setProfile(null);
    }
  }, []);

  /**
   * Manually refresh profile from Supabase.
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const updated = await profileService.getProfile(user.id);
      if (updated) {
        setProfile(updated);
      }
    }
  }, [user]);

  /**
   * Update profile in Supabase and update local profile state.
   */
  const updateProfileState = useCallback(
    async (updates: ProfileUpdate): Promise<Profile | null> => {
      if (!user?.id) {
        throw new Error("No active authenticated user session.");
      }

      const updated = await profileService.updateProfile(user.id, updates);
      if (updated) {
        setProfile(updated);
      }
      return updated;
    },
    [user]
  );

  // -----------------------------------------------------------------------
  // Session restoration & auth state listener
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Without valid credentials we can't restore a session.
      setLoading(false);
      return;
    }

    // 1. Restore existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for future auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // -----------------------------------------------------------------------
  // Sign in with Google OAuth
  // -----------------------------------------------------------------------
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
      );
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      throw error;
    }
  }, []);

  // -----------------------------------------------------------------------
  // Sign out
  // -----------------------------------------------------------------------
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
      throw error;
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Re-export the helper so LoginPage (or others) can produce user-friendly
// error messages without duplicating the mapping.
export { friendlyAuthError };
