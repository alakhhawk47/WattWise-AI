// Mock data service for WattWise AI Dashboard
// Generates realistic simulated data for classroom monitoring

import type {
  Classroom,
  ClassroomStatus,
  Alert,
  Recommendation,
  SummaryCardData,
  EnergyDataPoint,
  PowerDistributionPoint,
  ConsumptionBreakdownPoint,
  ChartData,
} from "@/types";

// --- Helpers ---

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Classrooms ---

const ROOM_NAMES = Array.from({ length: 20 }, (_, i) => {
  const floor = Math.floor(i / 5) + 1;
  const room = (i % 5) + 1;
  return `Room ${floor}${String(room).padStart(2, "0")}`;
});

function deriveStatus(currentPower: number, expectedPower: number, riskScore: number): ClassroomStatus {
  if (riskScore > 70 || currentPower > expectedPower * 1.4) return "high-usage";
  if (riskScore > 40 || currentPower > expectedPower * 1.15) return "warning";
  return "normal";
}

export function generateClassrooms(): Classroom[] {
  return ROOM_NAMES.map((name, i) => {
    const occupancy = randomInt(0, 45);
    const expectedPower = randomBetween(0.8, 3.5);
    const currentPower = randomBetween(
      expectedPower * 0.6,
      expectedPower * 1.6
    );
    const riskScore = randomInt(5, 95);
    const status = deriveStatus(currentPower, expectedPower, riskScore);

    return {
      id: `room-${101 + i}`,
      name,
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
}

// --- Alerts ---

const ALERT_MESSAGES: { message: string; severity: Alert["severity"] }[] = [
  { message: "High Power Usage", severity: "critical" },
  { message: "Low Occupancy — Devices Still On", severity: "warning" },
  { message: "Lights Still ON After Hours", severity: "warning" },
  { message: "Temperature Above Threshold", severity: "critical" },
  { message: "Unusual Energy Spike Detected", severity: "critical" },
  { message: "HVAC Running in Empty Room", severity: "warning" },
  { message: "Optimal Energy Usage", severity: "info" },
  { message: "Fan Speed Abnormally High", severity: "warning" },
];

export function generateAlerts(): Alert[] {
  const count = randomInt(4, 7);
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const template = pickRandom(ALERT_MESSAGES);
    return {
      id: `alert-${i}-${now}`,
      roomName: pickRandom(ROOM_NAMES),
      message: template.message,
      severity: template.severity,
      timestamp: new Date(now - randomInt(1, 60) * 60 * 1000),
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// --- Recommendations ---

const RECOMMENDATION_POOL: { message: string; type: Recommendation["type"] }[] = [
  { message: "Energy usage is higher than expected in Room 103. Consider reducing HVAC intensity.", type: "optimization" },
  { message: "Reduce lighting after classroom hours to save up to 15% energy.", type: "optimization" },
  { message: "Room 115 is operating efficiently. Keep current settings.", type: "positive" },
  { message: "Room 108 has had 3 alerts in the last hour. Investigate power supply.", type: "alert" },
  { message: "Switching to LED in Room 204 could cut lighting energy by 40%.", type: "optimization" },
  { message: "Room 112 fans are running at full speed with low occupancy.", type: "alert" },
  { message: "Room 119 achieved the best energy score this week. Great job!", type: "positive" },
  { message: "Consider scheduling HVAC shutdown during weekends for Rooms 101–105.", type: "optimization" },
];

export function generateRecommendations(): Recommendation[] {
  // Pick 4–5 unique recommendations
  const shuffled = [...RECOMMENDATION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, randomInt(4, 5)).map((r, i) => ({
    id: `rec-${i}`,
    message: r.message,
    type: r.type,
  }));
}

// --- Summary Cards ---

export function getSummaryCards(): SummaryCardData[] {
  const totalEnergy = randomBetween(42, 56);
  const carbonSaved = randomBetween(4.5, 7.2);
  const activeAlerts = randomInt(1, 6);
  const aiHealth = randomInt(88, 98);

  return [
    {
      title: "Today's Energy",
      value: `${totalEnergy} kWh`,
      change: `+${randomInt(2, 8)}%`,
      changeLabel: "vs yesterday",
      changeType: "negative" as const,
      icon: "Zap",
      color: "emerald",
    },
    {
      title: "Carbon Saved",
      value: `${carbonSaved} kg`,
      change: `+${randomInt(8, 18)}%`,
      changeLabel: "this week",
      changeType: "positive" as const,
      icon: "Leaf",
      color: "green",
    },
    {
      title: "Active Alerts",
      value: String(activeAlerts),
      change: activeAlerts > 3 ? "High Priority" : "Moderate",
      changeLabel: "",
      changeType: activeAlerts > 3 ? "negative" as const : "neutral" as const,
      icon: "AlertTriangle",
      color: "amber",
    },
    {
      title: "AI Health Score",
      value: `${aiHealth}%`,
      change: aiHealth >= 90 ? "Excellent" : "Good",
      changeLabel: "",
      changeType: "positive" as const,
      icon: "Brain",
      color: "violet",
    },
  ];
}

// --- Chart Data ---

export function generateDailyEnergyData(): EnergyDataPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
    // Simulate realistic campus pattern: low at night, peak during day
    const base = i >= 8 && i <= 17 ? randomBetween(3, 6) : randomBetween(0.5, 2);
    const predicted = i >= 8 && i <= 17 ? randomBetween(2.8, 5.5) : randomBetween(0.4, 1.8);
    return { hour, actual: base, predicted };
  });
}

export function generatePowerDistribution(): PowerDistributionPoint[] {
  const zones = [
    { zone: "Block A", fill: "hsl(142, 55%, 42%)" },
    { zone: "Block B", fill: "hsl(80, 75%, 50%)" },
    { zone: "Block C", fill: "hsl(200, 70%, 50%)" },
    { zone: "Block D", fill: "hsl(280, 60%, 55%)" },
    { zone: "Labs", fill: "hsl(30, 80%, 55%)" },
    { zone: "Library", fill: "hsl(350, 65%, 55%)" },
  ];

  return zones.map((z) => ({
    ...z,
    power: randomBetween(5, 18),
  }));
}

export function generateConsumptionBreakdown(): ConsumptionBreakdownPoint[] {
  return [
    { name: "Lighting", value: randomBetween(20, 35), fill: "hsl(45, 90%, 55%)" },
    { name: "HVAC", value: randomBetween(25, 40), fill: "hsl(200, 70%, 50%)" },
    { name: "Equipment", value: randomBetween(15, 25), fill: "hsl(280, 60%, 55%)" },
    { name: "Fans", value: randomBetween(10, 20), fill: "hsl(142, 55%, 42%)" },
    { name: "Other", value: randomBetween(5, 12), fill: "hsl(0, 0%, 55%)" },
  ];
}

export function generateChartData(): ChartData {
  return {
    dailyEnergy: generateDailyEnergyData(),
    powerDistribution: generatePowerDistribution(),
    consumptionBreakdown: generateConsumptionBreakdown(),
  };
}
