import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Recommendation, Classroom } from "@/types";
import { generateRecommendations } from "@/services/mockData";

export const recommendationService = {
  /**
   * Fetch AI recommendations from Supabase ai_recommendations table.
   * Fallback to generated recommendations if Supabase is offline or empty.
   */
  async getRecommendations(classrooms: Classroom[] = []): Promise<Recommendation[]> {
    if (!isSupabaseConfigured) {
      return generateRecommendations(classrooms);
    }

    try {
      const { data, error } = await supabase
        .from("ai_recommendations")
        .select("*, classrooms(room_code)")
        .order("created_at", { ascending: false })
        .limit(15);

      if (error || !data || data.length === 0) {
        if (error) console.warn("⚠️ Recommendation fetch notice:", error.message);
        return generateRecommendations(classrooms);
      }

      return data.map((row: any) => {
        const roomName = row.classrooms?.room_code || "Classroom";
        const priority = row.priority as "Low" | "Medium" | "High" | "Critical";
        const recType =
          priority === "Critical" || priority === "High"
            ? "alert"
            : priority === "Low"
            ? "positive"
            : "optimization";

        return {
          id: row.id,
          message: row.recommendation,
          type: recType,
          problem: `Identified efficiency opportunity in ${roomName}.`,
          reason: `High energy draw relative to classroom capacity and occupancy schedule.`,
          suggestedAction: row.recommendation,
          estimatedSaving: row.estimated_savings || "1.5 kWh/day",
          priority,
          expectedImpact: `Reduce energy waste and optimize building operations for ${roomName}.`,
        };
      });
    } catch (err) {
      console.warn("⚠️ Exception fetching recommendations:", err);
      return generateRecommendations(classrooms);
    }
  },
};
