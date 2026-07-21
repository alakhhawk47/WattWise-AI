// Shared TypeScript types for WattWise AI

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
}

// Dashboard types — Phase 2A

export type ClassroomStatus = "normal" | "warning" | "high-usage";

export interface Classroom {
  id: string;
  name: string;
  occupancy: number;
  temperature: number;
  humidity: number;
  lightsOn: boolean;
  fansOn: boolean;
  currentPower: number;
  expectedPower: number;
  riskScore: number;
  status: ClassroomStatus;
}

export interface Alert {
  id: string;
  roomName: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  message: string;
  type: "optimization" | "alert" | "positive";
}

export interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
  color: string;
}

export interface EnergyDataPoint {
  hour: string;
  actual: number;
  predicted: number;
}

export interface PowerDistributionPoint {
  zone: string;
  power: number;
  fill: string;
}

export interface ConsumptionBreakdownPoint {
  name: string;
  value: number;
  fill: string;
}

export interface ChartData {
  dailyEnergy: EnergyDataPoint[];
  powerDistribution: PowerDistributionPoint[];
  consumptionBreakdown: ConsumptionBreakdownPoint[];
}
