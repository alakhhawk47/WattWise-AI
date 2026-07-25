import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbClassroom } from "@/types/database";
import type { Classroom, ClassroomStatus } from "@/types";
import { telemetrySimulator } from "@/services/telemetrySimulator";
import { generateClassrooms } from "@/services/mockData";

export const classroomService = {
  /**
   * Fetch classrooms from Supabase database joined with reusable telemetry simulator.
   * Supabase loads: room_code (name), building, floor, capacity, status.
   * Telemetry simulator loads: temperature, occupancy, power, humidity, riskScore, device states.
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

      const dbRooms = data as DbClassroom[];

      // Map database classrooms to UI model using telemetry simulator service
      return dbRooms.map((dbRoom) => {
        const telemetry = telemetrySimulator.getRoomTelemetry(dbRoom.id, {
          capacity: dbRoom.capacity,
          status: dbRoom.status,
        });

        // Determine derived status (incorporating DB status baseline & live telemetry)
        let derivedStatus: ClassroomStatus = (dbRoom.status as ClassroomStatus) || "normal";
        if (telemetry.riskScore > 75 || telemetry.currentPower > telemetry.expectedPower * 1.4) {
          derivedStatus = "high-usage";
        } else if (telemetry.riskScore > 40 || telemetry.currentPower > telemetry.expectedPower * 1.15) {
          derivedStatus = "warning";
        }

        return {
          id: dbRoom.id,
          name: dbRoom.room_code,
          building: dbRoom.building,
          floor: dbRoom.floor,
          capacity: dbRoom.capacity,
          occupancy: telemetry.occupancy,
          temperature: telemetry.temperature,
          humidity: telemetry.humidity,
          lightsOn: telemetry.lightsOn,
          fansOn: telemetry.fansOn,
          currentPower: telemetry.currentPower,
          expectedPower: telemetry.expectedPower,
          riskScore: telemetry.riskScore,
          status: derivedStatus,
        };
      });
    } catch (err) {
      console.warn("⚠️ Exception fetching classrooms:", err);
      return generateClassrooms();
    }
  },
};
