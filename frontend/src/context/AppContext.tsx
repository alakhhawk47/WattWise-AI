// Global Application Context for WattWise AI
// Manages shared mock data, settings, notifications, search, and device toggles

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Classroom, Alert, Recommendation, SummaryCardData, ChartData, AppSettings } from "@/types";
import {
  generateClassrooms,
  generateAlerts,
  generateRecommendations,
  getSummaryCards,
  generateChartData,
} from "@/services/mockData";

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  autoRefreshEnabled: true,
  refreshInterval: 5,
  devMode: true,
};

interface AppContextType {
  classrooms: Classroom[];
  alerts: Alert[];
  recommendations: Recommendation[];
  summaryCards: SummaryCardData[];
  chartData: ChartData;
  settings: AppSettings;
  searchQuery: string;
  lastUpdated: Date;
  isRefreshing: boolean;
  setSearchQuery: (query: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  refreshData: () => void;
  markAllAlertsRead: () => void;
  clearAllAlerts: () => void;
  toggleDevice: (roomId: string, device: "lightsOn" | "fansOn") => void;
  getClassroomById: (id: string) => Classroom | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => generateClassrooms());
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts(classrooms));
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => generateRecommendations(classrooms));
  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>(() => getSummaryCards());
  const [chartData, setChartData] = useState<ChartData>(() => generateChartData());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wattwise-settings");
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
          console.error("Failed to parse stored settings:", e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("wattwise-settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    // Small delay to show spinner for visual feedback
    setTimeout(() => {
      const newRooms = generateClassrooms();
      setClassrooms(newRooms);
      setAlerts(generateAlerts(newRooms));
      setRecommendations(generateRecommendations(newRooms));
      setSummaryCards(getSummaryCards());
      setChartData(generateChartData());
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 500);
  }, []);

  // Auto-refresh timer based on settings
  useEffect(() => {
    if (!settings.autoRefreshEnabled) return;

    const intervalMs = settings.refreshInterval * 1000;
    const timer = setInterval(() => {
      const newRooms = generateClassrooms();
      setClassrooms(newRooms);
      setAlerts(generateAlerts(newRooms));
      setRecommendations(generateRecommendations(newRooms));
      setSummaryCards(getSummaryCards());
      setChartData(generateChartData());
      setLastUpdated(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.autoRefreshEnabled, settings.refreshInterval]);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const toggleDevice = useCallback((roomId: string, device: "lightsOn" | "fansOn") => {
    setClassrooms((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          const updatedState = !room[device];
          let powerChange = 0;
          if (device === "lightsOn") powerChange = updatedState ? 0.4 : -0.4;
          if (device === "fansOn") powerChange = updatedState ? 0.6 : -0.6;

          const newPower = Math.max(0.2, Math.round((room.currentPower + powerChange) * 10) / 10);
          return {
            ...room,
            [device]: updatedState,
            currentPower: newPower,
          };
        }
        return room;
      })
    );
  }, []);

  const getClassroomById = useCallback(
    (id: string) => classrooms.find((c) => c.id === id),
    [classrooms]
  );

  return (
    <AppContext.Provider
      value={{
        classrooms,
        alerts,
        recommendations,
        summaryCards,
        chartData,
        settings,
        searchQuery,
        lastUpdated,
        isRefreshing,
        setSearchQuery,
        updateSettings,
        refreshData,
        markAllAlertsRead,
        clearAllAlerts,
        toggleDevice,
        getClassroomById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
