// Mock data service for WattWise AI
// Generates realistic simulated data for classrooms, analytics, reports, recommendations, and alerts

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
  ReportItem,
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

// --- Realistic Alerts Generator ---

export function generateAlerts(classrooms: Classroom[] = generateClassrooms()): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  classrooms.forEach((room, index) => {
    if (room.status === "high-usage") {
      alerts.push({
        id: `alert-high-${room.id}-${now}`,
        roomName: room.name,
        message: `High Power Usage detected (${room.currentPower} kW vs ${room.expectedPower} kW expected)`,
        severity: "critical",
        timestamp: new Date(now - (index + 1) * 3 * 60 * 1000),
        isRead: false,
      });
    } else if (room.status === "warning") {
      if (room.occupancy < 5 && room.lightsOn) {
        alerts.push({
          id: `alert-empty-${room.id}-${now}`,
          roomName: room.name,
          message: `Lights Left ON with low occupancy (${room.occupancy} students)`,
          severity: "warning",
          timestamp: new Date(now - (index + 2) * 5 * 60 * 1000),
          isRead: false,
        });
      } else if (room.temperature > 28) {
        alerts.push({
          id: `alert-temp-${room.id}-${now}`,
          roomName: room.name,
          message: `Temperature High (${room.temperature}°C) — HVAC overworking`,
          severity: "warning",
          timestamp: new Date(now - (index + 1) * 8 * 60 * 1000),
          isRead: false,
        });
      }
    } else if (index % 4 === 0) {
      alerts.push({
        id: `alert-info-${room.id}-${now}`,
        roomName: room.name,
        message: `Normal operating efficiency restored`,
        severity: "info",
        timestamp: new Date(now - (index + 1) * 12 * 60 * 1000),
        isRead: true,
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
}

// --- Dynamic AI Recommendations ---

export function generateRecommendations(classrooms: Classroom[] = generateClassrooms()): Recommendation[] {
  const recs: Recommendation[] = [];

  classrooms.forEach((room) => {
    if (room.currentPower > room.expectedPower * 1.3 && room.occupancy < 10) {
      recs.push({
        id: `rec-high-low-${room.id}`,
        message: `High power with low occupancy in ${room.name}. Turn off unused lights & fans.`,
        type: "alert",
      });
    } else if (room.temperature > 28) {
      recs.push({
        id: `rec-hvac-${room.id}`,
        message: `High temperature (${room.temperature}°C) in ${room.name}. Reduce HVAC runtime.`,
        type: "optimization",
      });
    } else if (room.status === "normal" && room.riskScore < 25) {
      recs.push({
        id: `rec-normal-${room.id}`,
        message: `${room.name} is operating efficiently (${room.currentPower} kW).`,
        type: "positive",
      });
    }
  });

  // Ensure fallback options if dynamic ones are few
  if (recs.length < 4) {
    recs.push(
      {
        id: "rec-gen-1",
        message: "Reduce overall lighting after classroom hours to save up to 15% energy.",
        type: "optimization",
      },
      {
        id: "rec-gen-2",
        message: "Room 101 achieved top energy efficiency score today.",
        type: "positive",
      }
    );
  }

  return recs.slice(0, 5);
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
      changeType: "negative",
      icon: "Zap",
      color: "emerald",
    },
    {
      title: "Carbon Saved",
      value: `${carbonSaved} kg`,
      change: `+${randomInt(8, 18)}%`,
      changeLabel: "this week",
      changeType: "positive",
      icon: "Leaf",
      color: "green",
    },
    {
      title: "Active Alerts",
      value: String(activeAlerts),
      change: activeAlerts > 3 ? "High Priority" : "Moderate",
      changeLabel: "",
      changeType: activeAlerts > 3 ? "negative" : "neutral",
      icon: "AlertTriangle",
      color: "amber",
    },
    {
      title: "AI Health Score",
      value: `${aiHealth}%`,
      change: aiHealth >= 90 ? "Excellent" : "Good",
      changeLabel: "",
      changeType: "positive",
      icon: "Brain",
      color: "violet",
    },
  ];
}

// --- Chart Data ---

export function generateDailyEnergyData(): EnergyDataPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
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

// --- Analytics Data Generator ---

export function generateAnalyticsData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = days.map((day) => ({
    day,
    actual: randomBetween(120, 240),
    target: randomBetween(110, 200),
  }));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((month) => ({
    month,
    consumption: randomBetween(3200, 4800),
    saved: randomBetween(400, 900),
  }));

  const riskDistribution = [
    { name: "Normal (Low)", value: randomInt(11, 15), fill: "hsl(142, 55%, 42%)" },
    { name: "Warning (Med)", value: randomInt(3, 6), fill: "hsl(45, 90%, 55%)" },
    { name: "High Risk", value: randomInt(1, 4), fill: "hsl(0, 84%, 60%)" },
  ];

  const wasteBreakdown = [
    { category: "After-hours Lighting", value: randomBetween(35, 65) },
    { category: "Empty Room HVAC", value: randomBetween(50, 90) },
    { category: "Unused Fan Speed", value: randomBetween(20, 45) },
    { category: "Standby Equipment", value: randomBetween(15, 30) },
  ];

  return {
    weeklyData,
    monthlyData,
    riskDistribution,
    wasteBreakdown,
    carbonSavedTotal: 148.5,
    avgOccupancy: 28,
  };
}

// --- Reports Generator ---

export function getReportsList(): ReportItem[] {
  return [
    {
      id: "rep-001",
      title: "Weekly Energy Consumption Report",
      description: "Detailed breakdown of weekly energy usage, peak hours, and classroom usage trends.",
      generatedDate: "July 21, 2026",
      category: "Weekly",
      fileSize: "2.4 MB",
    },
    {
      id: "rep-002",
      title: "Monthly Sustainability & Carbon Summary",
      description: "Comprehensive monthly report on carbon offset, efficiency gains, and eco impact.",
      generatedDate: "July 01, 2026",
      category: "Monthly",
      fileSize: "4.8 MB",
    },
    {
      id: "rep-003",
      title: "Campus Carbon Footprint Assessment",
      description: "Detailed analysis of CO₂ emissions avoided across Block A–D classrooms.",
      generatedDate: "June 15, 2026",
      category: "Carbon",
      fileSize: "3.1 MB",
    },
    {
      id: "rep-004",
      title: "Automated Energy Audit & Anomaly Log",
      description: "Full audit trail of detected anomalies, high usage alerts, and resolution times.",
      generatedDate: "May 31, 2026",
      category: "Audit",
      fileSize: "1.9 MB",
    },
  ];
}
