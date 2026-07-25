// Global Application Context for WattWise AI
// Manages database entities (Supabase), live telemetry (telemetrySimulator), settings, and user interactions

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Classroom, Alert, Recommendation, SummaryCardData, ChartData, AppSettings } from "@/types";
import {
  generateClassrooms,
  generateAlerts,
  generateRecommendations,
  getSummaryCards,
  generateChartData,
} from "@/services/mockData";
import { classroomService } from "@/services/classroomService";
import { alertService } from "@/services/alertService";
import { recommendationService } from "@/services/recommendationService";
import { telemetrySimulator } from "@/services/telemetrySimulator";

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

  // Async loader: Load persistent metadata from Supabase database combined with telemetry engine
  const loadDatabaseData = useCallback(async () => {
    try {
      const rooms = await classroomService.getClassrooms();
      setClassrooms(rooms);

      const dbAlerts = await alertService.getAlerts(rooms);
      setAlerts(dbAlerts);

      const dbRecs = await recommendationService.getRecommendations(rooms);
      setRecommendations(dbRecs);

      setSummaryCards(getSummaryCards(dbAlerts.filter((a) => !a.isRead).length));
      setChartData(generateChartData());
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("⚠️ Database state load exception:", err);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Helper to derive classroom status based on live telemetry metrics
  const deriveRoomStatus = (currentPower: number, expectedPower: number, riskScore: number): "normal" | "warning" | "high-usage" => {
    if (riskScore > 70 || currentPower > expectedPower * 1.35) return "high-usage";
    if (riskScore > 40 || currentPower > expectedPower * 1.12) return "warning";
    return "normal";
  };

  // Step telemetry ONLY — Regenerates telemetry values without touching or overwriting database records
  const stepTelemetryData = useCallback(() => {
    telemetrySimulator.stepTelemetry(classrooms);
    const updatedTelemetryMap = telemetrySimulator.getAllTelemetry(classrooms);
    const now = new Date();

    let updatedRoomsList: Classroom[] = [];

    setClassrooms((prevRooms) => {
      updatedRoomsList = prevRooms.map((room) => {
        const live = updatedTelemetryMap.get(room.id);
        if (!live) return room;

        const nextStatus = deriveRoomStatus(live.currentPower, room.expectedPower, live.riskScore);

        return {
          ...room,
          occupancy: live.occupancy,
          temperature: live.temperature,
          humidity: live.humidity,
          currentPower: live.currentPower,
          riskScore: live.riskScore,
          status: nextStatus,
        };
      });
      return updatedRoomsList;
    });

    // Dynamic realtime alerts generation & resolution (Requirements 5 & 6)
    setAlerts((prevAlerts) => {
      const newAlerts: Alert[] = [];

      updatedRoomsList.forEach((room) => {
        const activeAlert = prevAlerts.find(
          (a) => a.roomId === room.id && !a.isRead && (a.severity === "critical" || a.severity === "warning")
        );

        if (room.status === "high-usage" && !activeAlert) {
          newAlerts.push({
            id: `alert-high-${room.id}-${Date.now()}`,
            roomId: room.id,
            roomName: room.name,
            message: `${room.name} exceeded power threshold (${room.currentPower} kW vs ${room.expectedPower} kW expected)`,
            severity: "critical",
            timestamp: now,
            isRead: false,
          });
        } else if (room.status === "warning" && !activeAlert) {
          if (room.temperature > 28.0) {
            newAlerts.push({
              id: `alert-temp-${room.id}-${Date.now()}`,
              roomId: room.id,
              roomName: room.name,
              message: `Temperature anomaly detected (${room.temperature}°C) — HVAC overworking`,
              severity: "warning",
              timestamp: now,
              isRead: false,
            });
          } else if (room.occupancy === 0 && room.lightsOn) {
            newAlerts.push({
              id: `alert-empty-${room.id}-${Date.now()}`,
              roomId: room.id,
              roomName: room.name,
              message: `Lighting left ON after hours with 0 occupancy`,
              severity: "warning",
              timestamp: now,
              isRead: false,
            });
          } else {
            newAlerts.push({
              id: `alert-warn-${room.id}-${Date.now()}`,
              roomId: room.id,
              roomName: room.name,
              message: `HVAC consumption increased in ${room.name}`,
              severity: "warning",
              timestamp: now,
              isRead: false,
            });
          }
        }
      });

      // Auto-resolve: mark previous alerts as read if room status recovered to normal
      const autoResolved = prevAlerts.map((alert) => {
        const currentRoom = updatedRoomsList.find((r) => r.id === alert.roomId);
        if (currentRoom && currentRoom.status === "normal" && alert.severity !== "info") {
          return { ...alert, isRead: true };
        }
        return alert;
      });

      const combined = [...newAlerts, ...autoResolved];
      return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
    });

    setSummaryCards(getSummaryCards());
    setChartData(generateChartData());
    if (updatedRoomsList.length > 0) {
      setRecommendations(generateRecommendations(updatedRoomsList));
    }
    setLastUpdated(now);
  }, [classrooms]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("wattwise-settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Refresh button action: Steps telemetry without overwriting database records
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    stepTelemetryData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [stepTelemetryData]);

  // Auto-refresh timer steps telemetry overlay based on interval settings
  useEffect(() => {
    if (!settings.autoRefreshEnabled) return;

    const intervalMs = settings.refreshInterval * 1000;
    const timer = setInterval(() => {
      stepTelemetryData();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.autoRefreshEnabled, settings.refreshInterval, stepTelemetryData]);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Device control: Mutates live telemetry simulator state
  const toggleDevice = useCallback((roomId: string, device: "lightsOn" | "fansOn") => {
    const updatedTelemetry = telemetrySimulator.updateDeviceState(roomId, device);
    setClassrooms((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            [device]: updatedTelemetry[device],
            currentPower: updatedTelemetry.currentPower,
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
