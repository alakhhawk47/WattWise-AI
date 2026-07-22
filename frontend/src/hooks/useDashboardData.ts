// Dashboard data hook connecting to global AppContext

import { useApp } from "@/context/AppContext";

export function useDashboardData() {
  const {
    classrooms,
    alerts,
    recommendations,
    summaryCards,
    chartData,
    lastUpdated,
    refreshData,
  } = useApp();

  return {
    classrooms,
    alerts,
    recommendations,
    summaryCards,
    chartData,
    isLoading: false,
    lastUpdated,
    refresh: refreshData,
  };
}
