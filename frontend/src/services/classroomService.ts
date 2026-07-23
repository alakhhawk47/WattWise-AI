import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbClassroom } from "@/types/database";
import type { Classroom, ClassroomStatus } from "@/types";
import { generateClassrooms } from "@/services/mockData";

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deriveStatus(currentPower: number, expectedPower: number, riskScore: number): ClassroomStatus {
  if (riskScore > 70 || currentPower > expectedPower * 1.4) return "high-usage";
  if (riskScore > 40 || currentPower > expectedPower * 1.15) return "warning";
  return "normal";
}

export const classroomService = {
  /**
   * Fetch classrooms from Supabase with live telemetry overlay.
   * Fallback to generated mock data if Supabase is offline or empty.
   */
  async getClassrooms(): Promise<Classroom[]> {
    if (!isSupabaseConfigured) {
      return generateClassrooms();
    }

    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .order("room_code", { ascending: true });

      if (error || !data || data.length === 0) {
        if (error) console.warn("⚠️ Classroom fetch notice:", error.message);
        return generateClassrooms();
      }

      // Map database classrooms to UI model with dynamic telemetry layer
      return (data as DbClassroom[]).map((dbRoom) => {
        const occupancy = randomInt(0, 45);
        const expectedPower = randomBetween(0.8, 3.5);
        const currentPower = dbRoom.status === "high-usage"
          ? randomBetween(expectedPower * 1.3, expectedPower * 1.7)
          : dbRoom.status === "warning"
          ? randomBetween(expectedPower * 1.1, expectedPower * 1.35)
          : randomBetween(expectedPower * 0.6, expectedPower * 1.0);
        const riskScore = dbRoom.status === "high-usage"
          ? randomInt(72, 95)
          : dbRoom.status === "warning"
          ? randomInt(42, 68)
          : randomInt(5, 38);
        const status = deriveStatus(currentPower, expectedPower, riskScore);

        return {
          id: dbRoom.id,
          name: dbRoom.room_code,
          occupancy,
          temperature: randomBetween(22, 32),
          humidity: randomBetween(35, 75),
          lightsOn: Math.random() > 0.25,
          fansOn: Math.random() > 0.3,
          currentPower,
          expectedPower,
          riskScore,
          status,
        };
      });
    } catch (err) {
      console.warn("⚠️ Exception fetching classrooms:", err);
      return generateClassrooms();
    }
  },
};
