// Telemetry Simulator Engine for WattWise AI
// Provides a reusable, stateful telemetry simulation service with realistic gradual drift.
// Designed behind a modular TelemetryProvider interface for easy future swapping with ESP32 / MQTT / REST hardware providers.

import type { ChartData } from "@/types";

export interface RoomTelemetry {
  roomId: string;
  occupancy: number;
  temperature: number;
  humidity: number;
  lightsOn: boolean;
  fansOn: boolean;
  currentPower: number;
  expectedPower: number;
  riskScore: number;
}

export interface TelemetryMetrics {
  todayEnergy: number; // in kWh
  carbonSaved: number; // in kg CO2
  aiHealthScore: number; // percentage
  activeAlertsCount: number;
}

export interface TelemetryProvider {
  /** Get live telemetry for a specific classroom */
  getRoomTelemetry(roomId: string, dbMeta?: { capacity?: number; status?: string }): RoomTelemetry;
  /** Get telemetry map for all classrooms */
  getAllTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): Map<string, RoomTelemetry>;
  /** Step the simulation forward realistically (gradual evolution) */
  stepTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): void;
  /** Get overall metrics summary (Energy, Carbon, AI Health) */
  getSummaryMetrics(): TelemetryMetrics;
  /** Get chart telemetry history */
  getChartTelemetry(): ChartData;
  /** Update device states (lights/fans) for a room */
  updateDeviceState(roomId: string, device: "lightsOn" | "fansOn", newState?: boolean): RoomTelemetry;
}

// Internal helper for smooth rounding
function round1Decimal(val: number): number {
  return Math.round(val * 10) / 10;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export class SimulatorProvider implements TelemetryProvider {
  private roomStates: Map<string, RoomTelemetry> = new Map();
  private todayEnergyAccumulator = 48.5; // base kWh
  private carbonSavedAccumulator = 6.4; // base kg CO2
  private aiHealthScore = 94; // percentage
  private chartDataCache: ChartData | null = null;

  constructor() {
    this.initChartData();
  }

  private initChartData() {
    this.chartDataCache = {
      dailyEnergy: Array.from({ length: 24 }, (_, i) => {
        const hour = `${String(i).padStart(2, "0")}:00`;
        const base = i >= 8 && i <= 17 ? 3.5 + (i % 3) * 0.4 : 1.0 + (i % 2) * 0.2;
        const predicted = i >= 8 && i <= 17 ? 3.2 + (i % 3) * 0.3 : 0.9 + (i % 2) * 0.15;
        return { hour, actual: round1Decimal(base), predicted: round1Decimal(predicted) };
      }),
      powerDistribution: [
        { zone: "Block A", power: 12.4, fill: "hsl(142, 55%, 42%)" },
        { zone: "Block B", power: 15.8, fill: "hsl(80, 75%, 50%)" },
        { zone: "Block C", power: 9.6, fill: "hsl(200, 70%, 50%)" },
        { zone: "Block D", power: 18.2, fill: "hsl(280, 60%, 55%)" },
        { zone: "Labs", power: 14.1, fill: "hsl(30, 80%, 55%)" },
        { zone: "Library", power: 7.3, fill: "hsl(350, 65%, 55%)" },
      ],
      consumptionBreakdown: [
        { name: "Lighting", value: 28, fill: "hsl(45, 90%, 55%)" },
        { name: "HVAC", value: 36, fill: "hsl(200, 70%, 50%)" },
        { name: "Equipment", value: 18, fill: "hsl(280, 60%, 55%)" },
        { name: "Fans", value: 12, fill: "hsl(142, 55%, 42%)" },
        { name: "Other", value: 6, fill: "hsl(0, 0%, 55%)" },
      ],
    };
  }

  private createInitialRoomTelemetry(roomId: string, dbMeta?: { capacity?: number; status?: string }): RoomTelemetry {
    const capacity = dbMeta?.capacity || 40;
    const status = dbMeta?.status || "normal";

    const isHigh = status === "high-usage";
    const isWarn = status === "warning";

    const occupancy = isHigh ? Math.min(capacity, 38) : isWarn ? Math.min(capacity, 25) : 18;
    const expectedPower = round1Decimal(1.2 + (capacity / 50) * 1.0);
    const currentPower = isHigh
      ? round1Decimal(expectedPower * 1.5)
      : isWarn
      ? round1Decimal(expectedPower * 1.2)
      : round1Decimal(expectedPower * 0.85);

    const temperature = isHigh ? 29.2 : isWarn ? 27.6 : 24.5;
    const humidity = isHigh ? 68 : isWarn ? 58 : 48;
    const riskScore = isHigh ? 82 : isWarn ? 54 : 18;

    return {
      roomId,
      occupancy,
      temperature,
      humidity,
      lightsOn: true,
      fansOn: occupancy > 0,
      currentPower,
      expectedPower,
      riskScore,
    };
  }

  public getRoomTelemetry(roomId: string, dbMeta?: { capacity?: number; status?: string }): RoomTelemetry {
    if (!this.roomStates.has(roomId)) {
      const initial = this.createInitialRoomTelemetry(roomId, dbMeta);
      this.roomStates.set(roomId, initial);
    }
    return this.roomStates.get(roomId)!;
  }

  public getAllTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): Map<string, RoomTelemetry> {
    if (dbRooms && dbRooms.length > 0) {
      for (const room of dbRooms) {
        if (!this.roomStates.has(room.id)) {
          this.roomStates.set(room.id, this.createInitialRoomTelemetry(room.id, room));
        }
      }
    }
    return new Map(this.roomStates);
  }

  /**
   * Step the telemetry simulation forward realistically.
   * Values evolve gradually (e.g. Temp: 24.5 -> 24.7 -> 24.8 -> 24.6), avoid wild jumps.
   */
  public stepTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): void {
    // Ensure all dbRooms are initialized
    this.getAllTelemetry(dbRooms);

    let totalPower = 0;
    let totalExpected = 0;

    this.roomStates.forEach((telemetry, roomId) => {
      // 1. Temperature: gradual evolution (-0.3 to +0.3 °C)
      const tempDelta = round1Decimal((Math.random() - 0.48) * 0.5);
      const newTemp = round1Decimal(clamp(telemetry.temperature + tempDelta, 21.0, 32.5));

      // 2. Humidity: gradual evolution (-0.6 to +0.6 %)
      const humDelta = round1Decimal((Math.random() - 0.48) * 1.2);
      const newHum = round1Decimal(clamp(telemetry.humidity + humDelta, 35.0, 78.0));

      // 3. Occupancy: small fluctuations (-2 to +2)
      const maxCap = dbRooms?.find((r) => r.id === roomId)?.capacity || 50;
      const occDelta = Math.floor((Math.random() - 0.47) * 3);
      const newOcc = Math.max(0, Math.min(maxCap, telemetry.occupancy + occDelta));

      // 4. Power calculation with subtle random load spikes for realism
      const isSpike = Math.random() < 0.06; // 6% chance of temporary power spike
      const isCoolingDown = Math.random() < 0.12; // 12% chance of recovery

      const lightsLoad = telemetry.lightsOn ? 0.4 : 0.05;
      const fansLoad = telemetry.fansOn ? 0.6 : 0.1;
      const occLoad = (newOcc / maxCap) * 0.9;
      const spikeFactor = isSpike ? 1.45 : isCoolingDown ? 0.85 : 1.0;
      const noise = (Math.random() - 0.48) * 0.15;

      const rawPower = (telemetry.expectedPower * 0.45 + lightsLoad + fansLoad + occLoad + noise) * spikeFactor;
      const newPower = round1Decimal(clamp(rawPower, 0.2, telemetry.expectedPower * 1.95));

      // 5. Risk score derivation
      const overratio = newPower / telemetry.expectedPower;
      const rawRisk = Math.round(
        (overratio > 1.35 ? 65 : overratio > 1.15 ? 40 : 12) +
          (newTemp > 28.2 ? 22 : 0) +
          (newOcc === 0 && telemetry.lightsOn ? 15 : 0)
      );
      const newRisk = Math.max(5, Math.min(95, rawRisk));

      this.roomStates.set(roomId, {
        ...telemetry,
        occupancy: newOcc,
        temperature: newTemp,
        humidity: newHum,
        currentPower: newPower,
        riskScore: newRisk,
      });

      totalPower += newPower;
      totalExpected += telemetry.expectedPower;
    });

    // Step summary metrics smoothly
    this.todayEnergyAccumulator = round1Decimal(this.todayEnergyAccumulator + (totalPower * 0.03));
    this.carbonSavedAccumulator = round1Decimal(this.carbonSavedAccumulator + 0.015);

    // AI Health Score subtle drift (91-98%)
    const healthDelta = Math.floor((Math.random() - 0.48) * 2);
    this.aiHealthScore = clamp(this.aiHealthScore + healthDelta, 91, 98);

    // Evolve historical chart data smoothly & maintain rolling history
    if (this.chartDataCache) {
      const now = new Date();
      const currentHourIndex = now.getHours();

      // Update actual power in daily energy point for current hour
      if (this.chartDataCache.dailyEnergy[currentHourIndex]) {
        const actualAvg = round1Decimal(clamp((totalPower / Math.max(1, this.roomStates.size)) * 2.2, 1.2, 7.5));
        this.chartDataCache.dailyEnergy[currentHourIndex].actual = actualAvg;
      }

      // Evolve zone power distribution
      this.chartDataCache.powerDistribution = this.chartDataCache.powerDistribution.map((pt) => ({
        ...pt,
        power: round1Decimal(clamp(pt.power + (Math.random() - 0.48) * 0.6, 3.5, 23.0)),
      }));

      // Evolve consumption breakdown percentages dynamically
      const hvacVal = clamp(Math.round(36 + (Math.random() - 0.48) * 3), 28, 44);
      const lightVal = clamp(Math.round(28 + (Math.random() - 0.48) * 3), 20, 34);
      const equipVal = clamp(Math.round(18 + (Math.random() - 0.48) * 2), 12, 24);
      const fansVal = clamp(Math.round(12 + (Math.random() - 0.48) * 2), 8, 18);
      const otherVal = Math.max(2, 100 - (hvacVal + lightVal + equipVal + fansVal));

      this.chartDataCache.consumptionBreakdown = [
        { name: "Lighting", value: lightVal, fill: "hsl(45, 90%, 55%)" },
        { name: "HVAC", value: hvacVal, fill: "hsl(200, 70%, 50%)" },
        { name: "Equipment", value: equipVal, fill: "hsl(280, 60%, 55%)" },
        { name: "Fans", value: fansVal, fill: "hsl(142, 55%, 42%)" },
        { name: "Other", value: otherVal, fill: "hsl(0, 0%, 55%)" },
      ];
    }
  }

  public getSummaryMetrics(): TelemetryMetrics {
    let activeAlerts = 0;
    this.roomStates.forEach((room) => {
      if (room.riskScore > 40 || room.currentPower > room.expectedPower * 1.15) {
        activeAlerts += 1;
      }
    });

    return {
      todayEnergy: round1Decimal(this.todayEnergyAccumulator),
      carbonSaved: round1Decimal(this.carbonSavedAccumulator),
      aiHealthScore: this.aiHealthScore,
      activeAlertsCount: activeAlerts,
    };
  }

  public getChartTelemetry(): ChartData {
    if (!this.chartDataCache) {
      this.initChartData();
    }
    return this.chartDataCache!;
  }

  public updateDeviceState(roomId: string, device: "lightsOn" | "fansOn", newState?: boolean): RoomTelemetry {
    const room = this.getRoomTelemetry(roomId);
    const updatedState = newState !== undefined ? newState : !room[device];
    const powerDelta = device === "lightsOn" ? (updatedState ? 0.35 : -0.35) : updatedState ? 0.55 : -0.55;

    const newPower = round1Decimal(Math.max(0.2, room.currentPower + powerDelta));

    const updatedRoom: RoomTelemetry = {
      ...room,
      [device]: updatedState,
      currentPower: newPower,
    };

    this.roomStates.set(roomId, updatedRoom);
    return updatedRoom;
  }
}

// Export singleton instance of the Telemetry Simulator Provider
export const telemetrySimulator = new SimulatorProvider();
