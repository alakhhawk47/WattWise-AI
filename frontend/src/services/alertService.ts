import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Alert, Classroom } from "@/types";
import { generateAlerts } from "@/services/mockData";

export const alertService = {
  /**
   * Fetch alerts from Supabase alerts table joined with classrooms.
   * Dynamic telemetry correlation: Severity updates based on live telemetry metrics.
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
        const room = classrooms.find((c) => c.id === row.classroom_id);
        const roomName = row.classrooms?.room_code || room?.name || "Classroom";

        let severity: "info" | "warning" | "critical" = row.severity as "info" | "warning" | "critical";

        // Dynamic telemetry correlation: Upgrade severity if telemetry shows extreme risk/power draw
        if (room) {
          if (room.riskScore > 75 || room.currentPower > room.expectedPower * 1.4) {
            severity = "critical";
          } else if (room.riskScore > 45 && severity === "info") {
            severity = "warning";
          }
        }

        return {
          id: row.id,
          roomId: row.classroom_id || "",
          roomName,
          message: `${row.title}: ${row.description}`,
          severity,
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
