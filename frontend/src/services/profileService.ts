import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, ProfileUpdate } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export const profileService = {
  /**
   * Fetch a user profile by user ID.
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("⚠️ Failed to fetch profile from Supabase:", error.message);
        return null;
      }

      return data as Profile | null;
    } catch (err) {
      console.warn("⚠️ Error fetching profile:", err);
      return null;
    }
  },

  /**
   * Ensure user profile exists and is synchronized with Google OAuth user_metadata.
   * Creates profile record if missing; updates if email, name, or avatar changed.
   */
  async syncProfileWithOAuth(user: User): Promise<Profile | null> {
    if (!isSupabaseConfigured || !user?.id) return null;

    const metadataName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email ||
      "";
    const metadataAvatar =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      "";
    const userEmail = user.email || "";

    try {
      // 1. Fetch existing profile
      const existing = await this.getProfile(user.id);

      if (!existing) {
        // 2. Profile does not exist -> Insert new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: metadataName,
            email: userEmail,
            avatar_url: metadataAvatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (error) {
          console.warn("⚠️ Profile creation insert notice:", error.message);
          return null;
        }
        return data as Profile;
      }

      // 3. Check if OAuth metadata differs from existing profile to perform sync
      const needsSync =
        (metadataAvatar && existing.avatar_url !== metadataAvatar && !existing.avatar_url) ||
        (metadataName && existing.full_name !== metadataName && !existing.full_name) ||
        (userEmail && existing.email !== userEmail);

      if (needsSync) {
        const updates: ProfileUpdate = {
          updated_at: new Date().toISOString(),
        };
        if (userEmail && existing.email !== userEmail) updates.email = userEmail;
        if (metadataName && !existing.full_name) updates.full_name = metadataName;
        if (metadataAvatar && !existing.avatar_url) updates.avatar_url = metadataAvatar;

        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)
          .select("*")
          .single();

        if (error) {
          console.warn("⚠️ Profile sync update notice:", error.message);
          return existing;
        }
        return data as Profile;
      }

      return existing;
    } catch (err) {
      console.warn("⚠️ Exception during profile synchronization:", err);
      return null;
    }
  },

  /**
   * Update profile fields for a user.
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    if (!isSupabaseConfigured || !userId) {
      throw new Error("Supabase is not configured or user ID is invalid.");
    }

    const payload: ProfileUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("❌ Failed to update user profile:", error.message);
      throw new Error(error.message);
    }

    return data as Profile;
  },
};
