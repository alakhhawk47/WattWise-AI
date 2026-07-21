// Custom hook for dashboard data with auto-refresh

import { useState, useEffect, useCallback } from "react";
import type { Classroom, Alert, Recommendation, SummaryCardData, ChartData } from "@/types";
import {
  generateClassrooms,
  generateAlerts,
  generateRecommendations,
  getSummaryCards,
  generateChartData,
} from "@/services/mockData";

const REFRESH_INTERVAL_MS = 5000;

interface DashboardData {
  classrooms: Classroom[];
  alerts: Alert[];
  recommendations: Recommendation[];
  summaryCards: SummaryCardData[];
  chartData: ChartData;
  isLoading: boolean;
  lastUpdated: Date;
  refresh: () => void;
}

function loadAllData() {
  return {
    classrooms: generateClassrooms(),
    alerts: generateAlerts(),
    recommendations: generateRecommendations(),
    summaryCards: getSummaryCards(),
    chartData: generateChartData(),
  };
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState(() => loadAllData());
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = useCallback(() => {
    setData(loadAllData());
    setLastUpdated(new Date());
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(loadAllData());
      setLastUpdated(new Date());
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    isLoading,
    lastUpdated,
    refresh,
  };
}
