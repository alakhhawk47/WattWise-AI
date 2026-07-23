import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Alert, Classroom } from "@/types";
import { generateAlerts } from "@/services/mockData";

export const alertService = {
  /**
   * Fetch alerts from Supabase alerts table joined with classrooms.
   * Fallback to generated alerts if Supabase is offline or empty.
   */
  async getAlerts(classrooms: Classroom[] = []): Promise<Alert[]> {
    if (!isSupabaseConfigured) {
      return generateAlerts(classrooms);
    }

    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*, classrooms(room_code)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        if (error) console.warn("⚠️ Alert fetch notice:", error.message);
        return generateAlerts(classrooms);
      }

      return data.map((row: any) => {
        const roomName = row.classrooms?.room_code || `Room ${row.classroom_id?.slice(0, 4) || ""}`;
        return {
          id: row.id,
          roomId: row.classroom_id || "",
          roomName,
          message: `${row.title}: ${row.description}`,
          severity: row.severity as "info" | "warning" | "critical",
          timestamp: new Date(row.created_at),
          isRead: Boolean(row.resolved),
        };
      });
    } catch (err) {
      console.warn("⚠️ Exception fetching alerts:", err);
      return generateAlerts(classrooms);
    }
  },
};
